"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function approveWithdrawal(
  withdrawalId: string,
  userId: string,
  amount: number
): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();

    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", userId)
      .single();

    if (fetchError) return { error: fetchError.message };

    const currentBalance = (profile?.balance as number) ?? 0;
    if (currentBalance < amount) {
      return { error: "Insufficient balance to approve this withdrawal." };
    }

    const newBalance = currentBalance - amount;

    // The post-withdrawal balance becomes the new baseline, so every trade that
    // currently compounds into it must be settled — otherwise the next trade
    // event would re-inflate the balance off the lowered original_deposit.
    // Settle ALL unsettled trades (open and closed) in this user's copy window,
    // not just the open ones.
    const { data: copyRow } = await supabase
      .from("user_copy_trading")
      .select("trader_name, started_at, deposit_base")
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

    // Withdrawing reduces the true principal (deposits − withdrawals), floored at
    // zero, so trade-delete rebuilds recompound from the right base afterwards.
    const copyUpdate: { original_deposit: number; deposit_base?: number } = {
      original_deposit: newBalance,
    };
    if (copyRow) copyUpdate.deposit_base = Math.max(Number(copyRow.deposit_base ?? 0) - amount, 0);

    const [statusResult, balanceResult, copyResult] = await Promise.all([
      supabase
        .from("withdrawals")
        .update({ status: "approved" })
        .eq("id", withdrawalId),
      supabase
        .from("profiles")
        .update({ balance: newBalance })
        .eq("id", userId),
      supabase
        .from("user_copy_trading")
        .update(copyUpdate)
        .eq("user_id", userId)
        .eq("is_copying", true),
    ]);

    if (statusResult.error) return { error: statusResult.error.message };
    if (balanceResult.error) return { error: balanceResult.error.message };
    if (copyResult.error) return { error: copyResult.error.message };

    revalidatePath("/admin/withdrawals");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function rejectWithdrawal(withdrawalId: string): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("withdrawals")
      .update({ status: "rejected" })
      .eq("id", withdrawalId);
    if (error) return { error: error.message };
    revalidatePath("/admin/withdrawals");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function saveProfitTarget(value: number): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("platform_settings")
      .upsert({ key: "profit_target_percentage", value: String(value) }, { onConflict: "key" });
    if (error) return { error: error.message };
    revalidatePath("/admin/withdrawals");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}
