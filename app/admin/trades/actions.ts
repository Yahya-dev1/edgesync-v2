"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export type TradeStatus = "open" | "closed";

export interface TradePayload {
  symbol: string;
  direction: string;
  open_price: number;
  pnl_percentage: number;
  status: TradeStatus;
  close_price?: number | null;
  lot_size?: number | null;
}

async function getAmiinFxName(): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("traders")
    .select("name")
    .eq("name", "AmiinFx")
    .single();
  if (error || !data) throw new Error("Trader AmiinFx not found");
  return data.name;
}

// Advances each eligible user's original_deposit by (1 + tradePnl/100), then
// marks the trade as is_settled = true. Must be called AFTER the trade row has
// been written with is_settled = false so the trigger has already applied the
// final P&L to profiles.balance.
//
// Only users whose started_at <= openedAt (i.e. the trade was in scope for
// them) receive the baseline advance; others are unaffected.
//
// Why multiply original_deposit instead of reading profiles.balance?
// Because balance = original_deposit × ∏(unsettled trades). Settling one
// trade T means new_original_deposit = old_original_deposit × (1 + T%).
// Multiplication is commutative so the order of other open trades doesn't
// matter — the trigger re-derives the same balance from the new baseline.
async function settleTrade(
  supabase: ReturnType<typeof createAdminClient>,
  tradeId: string,
  traderName: string,
  tradePnl: number,
  openedAt: string
): Promise<void> {
  const { data: users } = await supabase
    .from("user_copy_trading")
    .select("user_id, original_deposit, started_at")
    .eq("trader_name", traderName)
    .eq("is_copying", true)
    .not("original_deposit", "is", null);

  if (users && users.length > 0) {
    const factor = 1 + tradePnl / 100;
    await Promise.all(
      users
        .filter((u) => !u.started_at || u.started_at <= openedAt)
        .map((u) =>
          supabase
            .from("user_copy_trading")
            .update({ original_deposit: Number(u.original_deposit) * factor })
            .eq("user_id", u.user_id)
            .eq("is_copying", true)
        )
    );
  }

  await supabase
    .from("master_trades")
    .update({ is_settled: true })
    .eq("id", tradeId);
}

export async function insertTrade(payload: TradePayload): Promise<{ error?: string }> {
  try {
    const traderName = await getAmiinFxName();
    const supabase = createAdminClient();
    const openedAt = new Date().toISOString();

    const { data: inserted, error } = await supabase
      .from("master_trades")
      .insert({
        trader_name: traderName,
        symbol: payload.symbol.toUpperCase().trim(),
        direction: payload.direction,
        open_price: payload.open_price,
        pnl_percentage: payload.pnl_percentage,
        lot_size: payload.lot_size ?? null,
        is_active: payload.status === "open",
        is_settled: false,
        close_price: payload.status === "closed" ? payload.close_price : null,
        closed_at: payload.status === "closed" ? openedAt : null,
        opened_at: openedAt,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };

    // Trades inserted directly as closed are settled immediately so their
    // P&L is baked into original_deposit before future trigger runs.
    if (payload.status === "closed" && inserted) {
      await settleTrade(supabase, inserted.id, traderName, payload.pnl_percentage, openedAt);
    }

    revalidatePath("/admin/trades");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function updateTrade(id: string, payload: TradePayload): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();
    const isClosing = payload.status === "closed";

    const { data: current } = await supabase
      .from("master_trades")
      .select("is_active, is_settled, closed_at, opened_at, trader_name")
      .eq("id", id)
      .single();

    const wasOpen = current?.is_active === true;
    const transitioningToClosed = isClosing && wasOpen;
    const shouldSetClosedAt = isClosing && (wasOpen || !current?.closed_at);

    // When transitioning open→closed we write is_settled = false first so the
    // trigger picks up this trade's final pnl_percentage in its run. We call
    // settleTrade() afterwards to advance original_deposit and flip is_settled.
    // For all other transitions (open edits, closed edits) we leave is_settled
    // unchanged so we don't disturb already-settled baselines.
    const updatePayload: Record<string, unknown> = {
      symbol: payload.symbol.toUpperCase().trim(),
      direction: payload.direction,
      open_price: payload.open_price,
      pnl_percentage: payload.pnl_percentage,
      lot_size: payload.lot_size ?? null,
      is_active: !isClosing,
      close_price: isClosing ? payload.close_price : null,
      closed_at: isClosing
        ? shouldSetClosedAt
          ? new Date().toISOString()
          : current?.closed_at
        : null,
    };

    if (transitioningToClosed) {
      updatePayload.is_settled = false;
    }

    const { error } = await supabase
      .from("master_trades")
      .update(updatePayload)
      .eq("id", id);

    if (error) return { error: error.message };

    if (transitioningToClosed && current?.trader_name) {
      await settleTrade(
        supabase,
        id,
        current.trader_name,
        payload.pnl_percentage,
        current.opened_at ?? new Date().toISOString()
      );
    }

    revalidatePath("/admin/trades");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteTrade(id: string): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("master_trades").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin/trades");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}
