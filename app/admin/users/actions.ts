"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateBalance(userId: string, balance: number): Promise<{ error?: string }> {
  const auth = await requireAdmin();
  if (auth.error) return auth;
  try {
    const supabase = createAdminClient();

    // An admin balance edit is a settlement event: the new balance becomes the
    // baseline, so P&L recalculates to $0.00. Settle every unsettled trade in
    // the user's copy window first — otherwise the next trade event would
    // re-inflate the balance off the freshly reset original_deposit.
    const { data: copyRow } = await supabase
      .from("user_copy_trading")
      .select("trader_name, started_at")
      .eq("user_id", userId)
      .eq("is_copying", true)
      .maybeSingle();

    if (copyRow?.trader_name) {
      let tradesQuery = supabase
        .from("master_trades")
        .select("id")
        .eq("trader_name", copyRow.trader_name);
      if (copyRow.started_at) tradesQuery = tradesQuery.gte("opened_at", copyRow.started_at);

      const { data: trades, error: tradesError } = await tradesQuery;
      if (tradesError) return { error: tradesError.message };

      if (trades && trades.length > 0) {
        const settlements = trades.map((t) => ({ user_id: userId, trade_id: t.id }));
        const { error: settlementError } = await supabase
          .from("user_trade_settlements")
          .upsert(settlements, { onConflict: "user_id,trade_id", ignoreDuplicates: true });
        if (settlementError) return { error: settlementError.message };
      }
    }

    // Run both writes concurrently to minimise the realtime race window. The
    // override becomes the new baseline for everything, including the true
    // principal (deposit_base) used to rebuild balance on trade deletion.
    const [profileResult, copyResult] = await Promise.all([
      supabase.from("profiles").update({ balance }).eq("id", userId),
      supabase
        .from("user_copy_trading")
        .update({ original_deposit: balance, deposit_base: balance })
        .eq("user_id", userId)
        .eq("is_copying", true),
    ]);

    if (profileResult.error) return { error: profileResult.error.message };
    if (copyResult.error) return { error: copyResult.error.message };

    revalidatePath("/admin/users");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}
