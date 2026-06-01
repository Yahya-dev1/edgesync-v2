"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateMarketingAccounts } from "./actions";
import type { MarketingAccount, Trade } from "./page";

const AVATAR_CLASSES: Record<string, string> = {
  green:  "bg-emerald-500",
  blue:   "bg-blue-500",
  amber:  "bg-amber-500",
  purple: "bg-purple-500",
};

function fmt(n: number) {
  const abs = Math.abs(n).toFixed(2);
  return n >= 0 ? `+$${abs}` : `-$${abs}`;
}

function TradeRow({ trade }: { trade: Trade }) {
  const positive = trade.pnl_amount >= 0;
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] font-medium text-foreground">XAUUSD</span>
      <span
        className={cn(
          "text-[9px] font-bold px-1.5 py-0.5 rounded",
          trade.direction === "BUY"
            ? "bg-emerald-500/15 text-emerald-500"
            : "bg-red-500/15 text-red-500"
        )}
      >
        {trade.direction}
      </span>
      <span
        className={cn(
          "text-[11px] font-semibold ml-auto",
          positive ? "text-emerald-500" : "text-red-500"
        )}
      >
        {fmt(trade.pnl_amount)}
      </span>
    </div>
  );
}

function AccountCard({ account }: { account: MarketingAccount }) {
  const avatarBg = AVATAR_CLASSES[account.avatar_color] ?? "bg-slate-500";
  const pnlPositive = account.total_pnl >= 0;

  return (
    <div
      className="bg-surface rounded-xl p-4 flex flex-col gap-3"
      style={{ border: "0.5px solid var(--surface-border)" }}
    >
      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0",
            avatarBg
          )}
        >
          {account.initials}
        </div>
        <p className="text-sm font-semibold text-foreground leading-tight">
          {account.full_name}
        </p>
      </div>

      <hr style={{ borderColor: "var(--surface-border)" }} />

      {/* Trades */}
      <div className="flex flex-col gap-1.5">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
          Copied trades
        </p>
        {account.trades.map((trade, i) => (
          <TradeRow key={i} trade={trade} />
        ))}
      </div>

      <hr style={{ borderColor: "var(--surface-border)" }} />

      {/* Total P&L */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">Total P&L</span>
        <div className="flex items-center gap-1">
          {pnlPositive ? (
            <TrendingUp className="w-3 h-3 text-emerald-500" strokeWidth={2} />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-500" strokeWidth={2} />
          )}
          <span
            className={cn(
              "text-sm font-bold",
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

      {/* Grid */}
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
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))" }}
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
