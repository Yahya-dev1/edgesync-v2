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

export async function insertTrade(payload: TradePayload): Promise<{ error?: string }> {
  try {
    const traderName = await getAmiinFxName();
    const supabase = createAdminClient();

    const { error } = await supabase.from("master_trades").insert({
      trader_name: traderName,
      symbol: payload.symbol.toUpperCase().trim(),
      direction: payload.direction,
      open_price: payload.open_price,
      pnl_percentage: payload.pnl_percentage,
      lot_size: payload.lot_size ?? null,
      is_active: payload.status === "open",
      close_price: payload.status === "closed" ? payload.close_price : null,
      closed_at: payload.status === "closed" ? new Date().toISOString() : null,
      opened_at: new Date().toISOString(),
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

    // Fetch current trade to detect open→closed transition
    const { data: current } = await supabase
      .from("master_trades")
      .select("is_active, closed_at")
      .eq("id", id)
      .single();

    const wasOpen = current?.is_active === true;
    const nowClosed = !isClosing ? false : true;
    const shouldSetClosedAt = nowClosed && (wasOpen || !current?.closed_at);

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
