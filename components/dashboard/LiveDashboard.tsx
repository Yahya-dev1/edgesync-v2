"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import StopCopyingButton from "./StopCopyingButton";
import { AssetIcon } from "./AssetIcon";

const supabase = createClient();

// ─── Types ────────────────────────────────────────────────────

type Trade = {
  id: string;
  symbol: string | null;
  direction: string | null;
  pnl_percentage: number;
  is_active: boolean | null;
};

// ─── Component ────────────────────────────────────────────────

export default function LiveDashboard({
  userBalance,
  originalDeposit,
  copyId,
  traderName,
  userId,
}: {
  userBalance: number;
  originalDeposit: number | null;
  copyId: string;
  traderName: string;
  userId: string;
}) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [liveBalance, setLiveBalance] = useState(userBalance);

  const base = originalDeposit ?? liveBalance;

  useEffect(() => {
    async function fetchTrades() {
      const { data } = await supabase
        .from("master_trades")
        .select("id, symbol, direction, pnl_percentage, is_active")
        .eq("trader_name", traderName)
        .order("created_at", { ascending: false });
      if (data) setTrades(data as Trade[]);
    }

    fetchTrades();

    const tradesChannel = supabase
      .channel("master_trades_live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "master_trades" }, fetchTrades)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "master_trades" }, fetchTrades)
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "master_trades" }, fetchTrades)
      .subscribe();

    const profileChannel = supabase
      .channel("profile_balance")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${userId}` },
        (payload) => {
          const updated = payload.new as { balance: number };
          if (updated?.balance !== undefined) setLiveBalance(Number(updated.balance));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tradesChannel);
      supabase.removeChannel(profileChannel);
    };
  }, [traderName, userId]);

  // P&L calculated from active trades against the original deposit
  const floatingPnl = originalDeposit != null
    ? liveBalance - originalDeposit
    : trades
        .filter((t) => t.is_active)
        .reduce((sum, t) => sum + (base * Number(t.pnl_percentage)) / 100, 0);

  const pnlPositive = floatingPnl >= 0;
  const formattedPnl = (pnlPositive ? "+" : "-") + "$" + Math.abs(floatingPnl).toFixed(2);

  // Per-trade P&L uses original deposit as the base (not compounding)
  function tradePnlAmount(pnl: number) {
    return (base * pnl) / 100;
  }

  return (
    <>
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {/* Balance */}
        <div
          className="p-[16px] md:p-5 rounded-xl bg-surface"
          style={{ border: "0.5px solid var(--surface-border)" }}
        >
          <p className="text-sm text-muted-foreground mb-1.5">Account Balance</p>
          <p className="text-2xl font-bold text-foreground">
            ${liveBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          {originalDeposit != null && (
            <p className={`text-sm font-semibold mt-1 ${pnlPositive ? "text-primary" : "text-red-400"}`}>
              {formattedPnl}
            </p>
          )}
        </div>

        {/* Floating P&L */}
        <div
          className="p-[16px] md:p-5 rounded-xl bg-surface"
          style={{ border: "0.5px solid var(--surface-border)" }}
        >
          <p className="text-sm text-muted-foreground mb-1.5">P&L</p>
          <p className={`text-2xl font-bold ${pnlPositive ? "text-primary" : "text-red-400"}`}>
            {formattedPnl}
          </p>
        </div>

        {/* Copied trades count */}
        <div
          className="p-[16px] md:p-5 rounded-xl bg-surface"
          style={{ border: "0.5px solid var(--surface-border)" }}
        >
          <p className="text-sm text-muted-foreground mb-1.5">Copied Trades</p>
          <p className="text-2xl font-bold text-foreground">{trades.length}</p>
        </div>
      </div>

      {/* Two-column panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Copying panel */}
        <div
          className="rounded-xl bg-surface p-[16px] md:p-6"
          style={{ border: "0.5px solid var(--surface-border)" }}
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">
            Copying
          </p>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">AF</span>
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">{traderName}</p>
              <p className="text-sm text-muted-foreground">Verified Master Trader</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
            <span className="text-sm font-semibold text-primary">Live — copying active</span>
          </div>

          <div className="space-y-3.5 mb-6">
            {(
              [
                ["Trades taken", String(trades.length)],
                ["P&L", formattedPnl],
              ] as [string, string][]
            ).map(([label, value]) => (
              <div key={label} className="flex items-center justify-between text-base">
                <span className="text-muted-foreground">{label}</span>
                <span
                  className={`font-semibold ${
                    label === "P&L"
                      ? pnlPositive
                        ? "text-primary"
                        : "text-red-400"
                      : "text-foreground"
                  }`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

          <StopCopyingButton copyId={copyId} userId={userId} traderName={traderName} />
        </div>

        {/* Right: Copied trades */}
        <div
          className="rounded-xl bg-surface p-[16px] md:p-6"
          style={{ border: "0.5px solid var(--surface-border)" }}
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">
            Copied Trades
          </p>

          {trades.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="3" width="16" height="14" rx="2" stroke="#94a3b8" strokeWidth="1.5" />
                  <path
                    d="M3 14l4-4 3 3 4-5 3 2.5"
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-base font-medium text-muted-foreground">No trades yet</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                Trades will appear here when {traderName} enters positions
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {trades.map((trade) => {
                const pnl = tradePnlAmount(Number(trade.pnl_percentage));
                const positive = pnl >= 0;
                const pnlStr = (positive ? "+" : "-") + "$" + Math.abs(pnl).toFixed(2);
                const isOpen = trade.is_active === true;
                return (
                  <div
                    key={trade.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-subtle"
                    style={{ border: "0.5px solid var(--surface-border)" }}
                  >
                    <div className="flex-shrink-0">
                      <AssetIcon symbol={trade.symbol} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-base font-semibold text-foreground">
                          {trade.symbol ?? "—"}
                        </p>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            isOpen
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {isOpen ? "Open" : "Closed"}
                        </span>
                      </div>
                      <p
                        className={`text-sm font-medium ${
                          trade.direction?.toUpperCase() === "BUY" ? "text-primary" : "text-red-400"
                        }`}
                      >
                        {trade.direction?.toUpperCase() ?? "—"}
                      </p>
                    </div>
                    <span
                      className={`text-base font-semibold tabular-nums ${
                        positive ? "text-primary" : "text-red-400"
                      }`}
                    >
                      {pnlStr}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
