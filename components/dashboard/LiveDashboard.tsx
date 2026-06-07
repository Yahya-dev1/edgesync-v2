"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import StopCopyingButton from "./StopCopyingButton";
import { AssetIcon } from "./AssetIcon";
import { Wallet, TrendingUp, BarChart2, ChevronDown } from "lucide-react";

const supabase = createClient();

type Trade = {
  id: string;
  symbol: string | null;
  direction: string | null;
  pnl_percentage: number;
  lot_size: number | null;
  is_active: boolean | null;
  opened_at: string | null;
};

export default function LiveDashboard({
  userBalance, originalDeposit, copyId, traderName, userId, startedAt, amiinfxAccountSize,
}: {
  userBalance: number;
  originalDeposit: number | null;
  copyId: string;
  traderName: string;
  userId: string;
  startedAt: string | null;
  amiinfxAccountSize: number | null;
}) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [liveBalance, setLiveBalance] = useState(userBalance);
  const [showHistory, setShowHistory] = useState(false);

  const base = originalDeposit ?? liveBalance;

  const cutoff48h = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const recentTrades = trades.filter((t) => t.opened_at && new Date(t.opened_at) >= cutoff48h);
  const historyTrades = trades.filter((t) => !t.opened_at || new Date(t.opened_at) < cutoff48h);

  useEffect(() => {
    async function fetchTrades() {
      let query = supabase
        .from("master_trades")
        .select("id, symbol, direction, pnl_percentage, lot_size, is_active, opened_at")
        .eq("trader_name", traderName)
        .order("created_at", { ascending: false });

      if (startedAt) {
        query = query.gte("opened_at", startedAt);
      }

      const { data } = await query;
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
  }, [traderName, userId, startedAt]);

  const floatingPnl = originalDeposit != null
    ? liveBalance - originalDeposit
    : trades.filter((t) => t.is_active).reduce((sum, t) => sum + (base * Number(t.pnl_percentage)) / 100, 0);

  const pnlPositive = floatingPnl >= 0;
  const formattedPnl = (pnlPositive ? "+" : "-") + "$" + Math.abs(floatingPnl).toFixed(2);

  function tradePnlAmount(pnl: number) {
    return (base * pnl) / 100;
  }

  const statCards = [
    {
      label: "Account Balance",
      value: "$" + liveBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      sub: originalDeposit != null ? formattedPnl : null,
      subPositive: pnlPositive,
      icon: Wallet,
      iconClass: "text-primary",
      iconBg: "bg-primary/10 border-primary/15",
    },
    {
      label: "P&L",
      value: formattedPnl,
      valueClass: pnlPositive ? "text-primary" : "text-red-400",
      icon: TrendingUp,
      iconClass: pnlPositive ? "text-primary" : "text-red-400",
      iconBg: pnlPositive ? "bg-primary/10 border-primary/15" : "bg-red-500/10 border-red-500/15",
    },
    {
      label: "Copied Trades",
      value: String(trades.length),
      icon: BarChart2,
      iconClass: "text-blue-400",
      iconBg: "bg-blue-500/10 border-blue-500/15",
    },
  ];

  return (
    <>
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="p-5 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{card.label}</p>
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg border ${card.iconBg}`}>
                  <Icon className={`w-4 h-4 ${card.iconClass}`} strokeWidth={1.5} />
                </div>
              </div>
              <p className={`text-2xl font-bold tabular-nums ${card.valueClass ?? "text-foreground"}`}>
                {card.value}
              </p>
              {card.sub && (
                <p className={`text-sm font-semibold mt-1 ${card.subPositive ? "text-primary" : "text-red-400"}`}>
                  {card.sub}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Two-column panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Copying panel */}
        <div className="rounded-xl border border-border bg-card p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-5">Copying</p>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">
                {traderName.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{traderName}</p>
              <p className="text-xs text-muted-foreground">Verified Master Trader</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
            <span className="text-xs font-semibold text-primary">Live — copying active</span>
          </div>

          <div className="space-y-3 mb-5 p-3.5 rounded-xl border border-border bg-background">
            {([["Trades taken", String(trades.length)], ["P&L", formattedPnl]] as [string, string][]).map(([label, value]) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className={`font-semibold tabular-nums ${label === "P&L" ? (pnlPositive ? "text-primary" : "text-red-400") : "text-foreground"}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          <StopCopyingButton copyId={copyId} userId={userId} traderName={traderName} />
        </div>

        {/* Right: Copied trades */}
        <div className="rounded-xl border border-border bg-card p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-5">Copied Trades</p>

          {recentTrades.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-11 h-11 rounded-full bg-overlay border border-border flex items-center justify-center mb-3">
                <BarChart2 className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No trades yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Trades appear here when {traderName} enters positions
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentTrades.map((trade) => (
                <TradeCard
                  key={trade.id}
                  trade={trade}
                  pnlAmount={tradePnlAmount(Number(trade.pnl_percentage))}
                  liveBalance={liveBalance}
                  amiinfxAccountSize={amiinfxAccountSize}
                />
              ))}
            </div>
          )}

          {/* Trade History — collapsible, only shown if older trades exist */}
          {historyTrades.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <button
                onClick={() => setShowHistory((v) => !v)}
                className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors w-full"
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${showHistory ? "rotate-180" : ""}`}
                  strokeWidth={2.5}
                />
                <span className="uppercase tracking-widest">
                  {showHistory ? "Hide history" : "Show history"}
                </span>
                <span className="ml-auto font-normal text-muted-foreground/60">
                  {historyTrades.length} trade{historyTrades.length !== 1 ? "s" : ""}
                </span>
              </button>

              {showHistory && (
                <div className="space-y-2.5 mt-3">
                  {historyTrades.map((trade) => (
                    <TradeCard
                      key={trade.id}
                      trade={trade}
                      pnlAmount={tradePnlAmount(Number(trade.pnl_percentage))}
                      liveBalance={liveBalance}
                      amiinfxAccountSize={amiinfxAccountSize}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function TradeCard({
  trade,
  pnlAmount,
  liveBalance,
  amiinfxAccountSize,
}: {
  trade: Trade;
  pnlAmount: number;
  liveBalance: number;
  amiinfxAccountSize: number | null;
}) {
  const positive = pnlAmount >= 0;
  const pnlStr = (positive ? "+" : "-") + "$" + Math.abs(pnlAmount).toFixed(2);
  const isOpen = trade.is_active === true;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background">
      <div className="flex-shrink-0">
        <AssetIcon symbol={trade.symbol} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{trade.symbol ?? "—"}</p>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${isOpen ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
            {isOpen ? "Open" : "Closed"}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-xs font-medium ${trade.direction?.toUpperCase() === "BUY" ? "text-primary" : "text-red-400"}`}>
            {trade.direction?.toUpperCase() ?? "—"}
          </p>
          {(() => {
            const lotNum = Number(trade.lot_size);
            if (!(lotNum > 0) || !amiinfxAccountSize) return null;
            const displayedLot = (liveBalance / amiinfxAccountSize) * lotNum;
            return (
              <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
                {displayedLot.toFixed(2)} lots
              </span>
            );
          })()}
        </div>
      </div>
      <span className={`text-sm font-semibold tabular-nums ${positive ? "text-primary" : "text-red-400"}`}>
        {pnlStr}
      </span>
    </div>
  );
}
