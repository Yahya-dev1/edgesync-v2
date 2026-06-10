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

// Inserting a trade — open OR closed — never settles. The balance trigger
// (update_user_balances_from_trades) compounds every unsettled trade into the
// user's balance, so the gain shows up as floating P&L and stays visible until
// the trade is settled (closed via update, withdrawal, or admin balance edit).
export async function insertTrade(payload: TradePayload): Promise<{ error?: string }> {
  try {
    const traderName = await getAmiinFxName();
    const supabase = createAdminClient();
    const openedAt = new Date().toISOString();

    const { error } = await supabase
      .from("master_trades")
      .insert({
        trader_name: traderName,
        symbol: payload.symbol.toUpperCase().trim(),
        direction: payload.direction,
        open_price: payload.open_price,
        pnl_percentage: payload.pnl_percentage,
        lot_size: payload.lot_size ?? null,
        is_active: payload.status === "open",
        close_price: payload.status === "closed" ? payload.close_price : null,
        closed_at: payload.status === "closed" ? openedAt : null,
        opened_at: openedAt,
      });

    if (error) return { error: error.message };

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
      .select("is_active, closed_at")
      .eq("id", id)
      .single();

    const wasOpen = current?.is_active === true;
    const shouldSetClosedAt = isClosing && (wasOpen || !current?.closed_at);

    // Flipping is_active from true to false here is the settlement event — the
    // balance trigger detects the open→closed transition, locks the trade's
    // profit into each copying user's original_deposit, and resets their P&L.
    const { error } = await supabase
      .from("master_trades")
      .update({
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
      })
      .eq("id", id);

    if (error) return { error: error.message };

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
