"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import StopCopyingButton from "./StopCopyingButton";

// Single stable client — createBrowserClient creates a new WebSocket each call,
// so we keep one at module level to avoid missing events during connection setup.
const supabase = createClient();

// ─── Asset SVG Icons ───────────────────────────────────────────

function XAUUSDIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-label="XAUUSD">
      <rect x="4" y="20" width="24" height="7" rx="2" fill="#F59E0B" />
      <rect x="4" y="20" width="24" height="2.5" rx="0" fill="#92400E" opacity="0.4" />
      <rect x="6" y="13" width="20" height="8" rx="2" fill="#FBBF24" />
      <rect x="6" y="13" width="20" height="2.5" rx="0" fill="#92400E" opacity="0.3" />
      <rect x="8" y="6" width="16" height="8" rx="2" fill="#FCD34D" />
      <rect x="8" y="6" width="16" height="2.5" rx="0" fill="#92400E" opacity="0.2" />
    </svg>
  );
}

function EURUSDIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-label="EURUSD">
      <circle cx="16" cy="16" r="14" fill="#1D4ED8" />
      <text
        x="16"
        y="22"
        textAnchor="middle"
        fontSize="17"
        fontWeight="700"
        fill="#FCD34D"
        fontFamily="Georgia, serif"
      >
        €
      </text>
    </svg>
  );
}

function GBPUSDIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-label="GBPUSD">
      <defs>
        <clipPath id="gbp-c">
          <circle cx="16" cy="16" r="14" />
        </clipPath>
      </defs>
      <g clipPath="url(#gbp-c)">
        <rect width="32" height="32" fill="#012169" />
        <line x1="-2" y1="-2" x2="34" y2="34" stroke="white" strokeWidth="8" />
        <line x1="34" y1="-2" x2="-2" y2="34" stroke="white" strokeWidth="8" />
        <line x1="-2" y1="-2" x2="34" y2="34" stroke="#C8102E" strokeWidth="4.5" />
        <line x1="34" y1="-2" x2="-2" y2="34" stroke="#C8102E" strokeWidth="4.5" />
        <rect x="0" y="12.5" width="32" height="7" fill="white" />
        <rect x="12.5" y="0" width="7" height="32" fill="white" />
        <rect x="0" y="14" width="32" height="4" fill="#C8102E" />
        <rect x="14" y="0" width="4" height="32" fill="#C8102E" />
      </g>
    </svg>
  );
}

function USDJPYIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-label="USDJPY">
      <circle cx="16" cy="16" r="14" fill="#DC2626" />
      <circle cx="16" cy="16" r="5.5" fill="white" />
    </svg>
  );
}

function GenericIcon() {
  return (
    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="3" width="16" height="14" rx="2" stroke="#94a3b8" strokeWidth="1.5" />
        <path
          d="M3 14.5l4-4 3 3 4-4.5 3 2.5"
          stroke="#94a3b8"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function AssetIcon({ symbol }: { symbol: string | null }) {
  switch (symbol) {
    case "XAUUSD": return <XAUUSDIcon />;
    case "EURUSD": return <EURUSDIcon />;
    case "GBPUSD": return <GBPUSDIcon />;
    case "USDJPY": return <USDJPYIcon />;
    default:       return <GenericIcon />;
  }
}

// ─── Types ────────────────────────────────────────────────────

type Trade = {
  id: string;
  symbol: string | null;
  direction: string | null;
  pnl_percentage: number;
};

// ─── Component ────────────────────────────────────────────────

export default function LiveDashboard({
  userBalance,
  copyId,
  traderName,
  tradesTaken,
  userId,
}: {
  userBalance: number;
  copyId: string;
  traderName: string;
  tradesTaken: number;
  userId: string;
}) {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    async function fetchTrades() {
      const { data } = await supabase
        .from("master_trades")
        .select("id, symbol, direction, pnl_percentage")
        .eq("is_active", true);
      if (data) setTrades(data as Trade[]);
    }

    fetchTrades();

    const channel = supabase
      .channel("master_trades_live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "master_trades" }, fetchTrades)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "master_trades" }, fetchTrades)
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "master_trades" }, fetchTrades)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const totalPnl = trades.reduce(
    (sum, t) => sum + (userBalance * Number(t.pnl_percentage)) / 100,
    0
  );
  const pnlPositive = totalPnl >= 0;
  const formattedPnl =
    (pnlPositive ? "+" : "-") + "$" + Math.abs(totalPnl).toFixed(2);

  return (
    <>
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div
          className="p-[16px] md:p-5 rounded-xl bg-surface"
          style={{ border: "0.5px solid var(--surface-border)" }}
        >
          <p className="text-sm text-muted-foreground mb-1.5">Account Balance</p>
          <p className="text-2xl font-bold text-foreground">
            ${userBalance.toFixed(2)}
          </p>
        </div>
        <div
          className="p-[16px] md:p-5 rounded-xl bg-surface"
          style={{ border: "0.5px solid var(--surface-border)" }}
        >
          <p className="text-sm text-muted-foreground mb-1.5">Total P&L</p>
          <p
            className={`text-2xl font-bold ${
              pnlPositive ? "text-primary" : "text-red-400"
            }`}
          >
            {formattedPnl}
          </p>
        </div>
        <div
          className="p-[16px] md:p-5 rounded-xl bg-surface"
          style={{ border: "0.5px solid var(--surface-border)" }}
        >
          <p className="text-sm text-muted-foreground mb-1.5">Open Trades</p>
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
                ["Trades taken", String(tradesTaken)],
                ["Today's P&L", "$0.00"],
                ["This week", "$0.00"],
                ["Floating P&L", formattedPnl],
              ] as [string, string][]
            ).map(([label, value]) => (
              <div key={label} className="flex items-center justify-between text-base">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-semibold text-foreground">{value}</span>
              </div>
            ))}
          </div>

          <StopCopyingButton copyId={copyId} userId={userId} traderName={traderName} />
        </div>

        {/* Right: Running trades */}
        <div
          className="rounded-xl bg-surface p-[16px] md:p-6"
          style={{ border: "0.5px solid var(--surface-border)" }}
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">
            Running Trades
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
              <p className="text-base font-medium text-muted-foreground">No active positions</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                Trades will appear here when {traderName} opens positions
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {trades.map((trade) => {
                const tradePnl = (userBalance * Number(trade.pnl_percentage)) / 100;
                const positive = tradePnl >= 0;
                const pnlStr =
                  (positive ? "+" : "-") + "$" + Math.abs(tradePnl).toFixed(2);
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
                      <p className="text-base font-semibold text-foreground">
                        {trade.symbol ?? "—"}
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          trade.direction === "BUY" ? "text-primary" : "text-red-400"
                        }`}
                      >
                        {trade.direction ?? "—"}
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
