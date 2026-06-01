"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateMarketingAccounts } from "./actions";
import type { MarketingAccount, Trade } from "./page";

// ─── Color maps ────────────────────────────────────────────────────
const ACCENT: Record<string, string> = {
  green:  "bg-emerald-500",
  blue:   "bg-blue-500",
  amber:  "bg-amber-500",
  purple: "bg-purple-500",
};

const AVATAR_BG: Record<string, string> = {
  green:  "bg-emerald-500",
  blue:   "bg-blue-500",
  amber:  "bg-amber-500",
  purple: "bg-purple-500",
};

// ─── Helpers ───────────────────────────────────────────────────────
function fmt(n: number) {
  const abs = Math.abs(n).toFixed(2);
  return n >= 0 ? `+$${abs}` : `-$${abs}`;
}

// ─── Trade row ─────────────────────────────────────────────────────
function TradeRow({ trade }: { trade: Trade }) {
  const pos = trade.pnl_amount >= 0;
  const isBuy = trade.direction === "BUY";
  return (
    <div className="flex items-center gap-1.5 bg-overlay rounded-lg px-2.5 py-[5px]">
      <span className="text-[10px] font-mono font-semibold text-foreground tracking-tight">
        XAUUSD
      </span>
      <span
        className={cn(
          "text-[8px] font-bold px-1.5 py-[2px] rounded uppercase tracking-wide",
          isBuy
            ? "bg-emerald-500/15 text-emerald-500"
            : "bg-red-500/15 text-red-500"
        )}
      >
        {trade.direction}
      </span>
      <span
        className={cn(
          "text-[10px] font-semibold ml-auto tabular-nums",
          pos ? "text-emerald-500" : "text-red-500"
        )}
      >
        {fmt(trade.pnl_amount)}
      </span>
    </div>
  );
}

// ─── Card ──────────────────────────────────────────────────────────
function AccountCard({ account }: { account: MarketingAccount }) {
  const accentClass  = ACCENT[account.avatar_color]    ?? "bg-slate-500";
  const avatarClass  = AVATAR_BG[account.avatar_color] ?? "bg-slate-500";
  const pnlPositive  = account.total_pnl >= 0;
  const winCount     = account.trades.filter((t) => t.pnl_amount > 0).length;
  const winRate      = account.trades.length
    ? Math.round((winCount / account.trades.length) * 100)
    : 0;

  return (
    <div
      className="bg-surface rounded-xl overflow-hidden flex flex-col"
      style={{ border: "0.5px solid var(--surface-border)" }}
    >
      {/* Colored top accent */}
      <div className={cn("h-[3px] w-full flex-shrink-0", accentClass)} />

      <div className="p-4 flex flex-col gap-3 flex-1">

        {/* ── Header: avatar + name ─────────────────────────────── */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-shrink-0">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold text-white",
                avatarClass
              )}
            >
              {account.initials}
            </div>
            {/* Online dot */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-surface" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-foreground leading-tight truncate">
              {account.full_name}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Auto Trader</p>
          </div>
        </div>

        {/* ── Stats: Win Rate | Trades ──────────────────────────── */}
        <div
          className="grid grid-cols-2 rounded-lg overflow-hidden"
          style={{ border: "0.5px solid var(--surface-border)" }}
        >
          <div className="flex flex-col items-center py-2 bg-overlay">
            <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
              Win Rate
            </span>
            <span
              className={cn(
                "text-sm font-bold mt-0.5 tabular-nums",
                winRate >= 50 ? "text-emerald-500" : "text-red-500"
              )}
            >
              {winRate}%
            </span>
          </div>
          <div
            className="flex flex-col items-center py-2 bg-overlay"
            style={{ borderLeft: "0.5px solid var(--surface-border)" }}
          >
            <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
              Trades
            </span>
            <span className="text-sm font-bold text-foreground mt-0.5 tabular-nums">
              {account.trades.length}
            </span>
          </div>
        </div>

        {/* ── Recent activity ───────────────────────────────────── */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            Recent Activity
          </p>
          {account.trades.map((trade, i) => (
            <TradeRow key={i} trade={trade} />
          ))}
        </div>

        {/* ── Total P&L block ───────────────────────────────────── */}
        <div
          className={cn(
            "flex items-center justify-between rounded-lg px-3 py-2 mt-auto",
            pnlPositive ? "bg-emerald-500/[0.08]" : "bg-red-500/[0.08]"
          )}
          style={{
            border: `0.5px solid ${
              pnlPositive ? "rgb(16 185 129 / 0.25)" : "rgb(239 68 68 / 0.25)"
            }`,
          }}
        >
          <span className="text-[10px] font-medium text-muted-foreground">
            Total P&L
          </span>
          <span
            className={cn(
              "text-sm font-bold tabular-nums",
              pnlPositive ? "text-emerald-500" : "text-red-500"
            )}
          >
            {fmt(account.total_pnl)}
          </span>
        </div>

      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────
interface Props {
  accounts: MarketingAccount[];
}

export default function MarketingClient({ accounts }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleGenerate = () => {
    startTransition(async () => {
      await generateMarketingAccounts();
      router.refresh();
    });
  };

  return (
    <div className="max-w-5xl mx-auto">

      {/* Page header */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-lg font-bold text-foreground">Marketing Accounts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Sample trader profiles for marketing use
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/80 transition-colors disabled:opacity-50 flex-shrink-0"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" strokeWidth={2} />
          )}
          {isPending ? "Generating…" : "Generate"}
        </button>
      </div>

      {/* Grid / empty state */}
      {accounts.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-xl py-20 text-center bg-surface"
          style={{ border: "0.5px solid var(--surface-border)" }}
        >
          <RefreshCw className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
          <p className="text-sm font-medium text-foreground">No accounts yet</p>
          <p className="text-xs text-muted-foreground">
            Click Generate to create 10 sample marketing profiles
          </p>
        </div>
      ) : (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))" }}
        >
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      )}

      {/* Admin note */}
      <p className="mt-6 text-center text-[11px] text-muted-foreground italic">
        Strictly admin-only. Never visible to real users.
      </p>
    </div>
  );
}
