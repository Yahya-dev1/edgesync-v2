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

// Called BEFORE setting is_active = false on a trade. Snapshots the current
// profiles.balance into original_deposit for every eligible copying user,
// so that when the trigger re-fires after the close the new baseline is correct
// and the closed trade is no longer included in the compounding set.
async function lockBaselineForUsers(
  supabase: ReturnType<typeof createAdminClient>,
  traderName: string,
  openedAt: string
): Promise<void> {
  const { data: users } = await supabase
    .from("user_copy_trading")
    .select("user_id, started_at")
    .eq("trader_name", traderName)
    .eq("is_copying", true);

  if (!users?.length) return;

  const eligible = users.filter((u) => !u.started_at || u.started_at <= openedAt);
  if (!eligible.length) return;

  await Promise.all(
    eligible.map(async (u) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", u.user_id)
        .single();
      if (profile?.balance == null) return;
      return supabase
        .from("user_copy_trading")
        .update({ original_deposit: Number(profile.balance) })
        .eq("user_id", u.user_id)
        .eq("is_copying", true);
    })
  );
}

// Used only when a trade is inserted directly as closed (backdating). Advances
// original_deposit by the trade's factor, then marks is_settled = true to fire
// the trigger and sync profiles.balance to the new baseline.
async function advanceBaselineForUsers(
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

  // Updating is_settled re-fires the trigger, which syncs profiles.balance
  // from the new original_deposit.
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
        close_price: payload.status === "closed" ? payload.close_price : null,
        closed_at: payload.status === "closed" ? openedAt : null,
        opened_at: openedAt,
      })
      .select("id")
      .single();

    if (error) return { error: error.message };

    if (payload.status === "closed" && inserted) {
      await advanceBaselineForUsers(supabase, inserted.id, traderName, payload.pnl_percentage, openedAt);
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
      .select("is_active, closed_at, opened_at, trader_name")
      .eq("id", id)
      .single();

    const wasOpen = current?.is_active === true;
    const transitioningToClosed = isClosing && wasOpen;
    const shouldSetClosedAt = isClosing && (wasOpen || !current?.closed_at);

    // Lock original_deposit = profiles.balance for all copying users BEFORE
    // the trade row is set to is_active = false. This ensures the trigger fires
    // with the correct baseline and the closed trade is excluded going forward.
    if (transitioningToClosed && current?.trader_name) {
      await lockBaselineForUsers(
        supabase,
        current.trader_name,
        current.opened_at ?? new Date().toISOString()
      );
    }

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
