"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import * as Flags from "country-flag-icons/react/3x2";

type Trader = {
  id: string;
  name: string;
  followers: number;
  win_rate: number;
  roi: number;
  drawdown: number;
  trades_taken: number;
  stars: number;
  risk_level: string;
  is_available: boolean;
  flag: string | null;
};

function FlagIcon({ code }: { code: string }) {
  const Flag = Flags[code as keyof typeof Flags];
  if (!Flag) return null;
  return <Flag title={code} style={{ width: 18, height: "auto", borderRadius: 3, display: "block", flexShrink: 0 }} />;
}

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24">
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            style={{ fill: i < stars ? "#BA7517" : "var(--border)" }}
          />
        </svg>
      ))}
    </div>
  );
}

const RISK_CONFIG: Record<string, { color: string; fill: string; label: string; bg: string }> = {
  low:  { color: "#00C896", fill: "25%", label: "Low Risk",  bg: "bg-primary/10"   },
  mid:  { color: "#F59E0B", fill: "55%", label: "Mid Risk",  bg: "bg-amber-500/10" },
  high: { color: "#EF4444", fill: "85%", label: "High Risk", bg: "bg-red-500/10"   },
};

function RiskBar({ level }: { level: string }) {
  const cfg = RISK_CONFIG[level] ?? RISK_CONFIG.mid;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Risk</span>
        <span className="text-[11px] font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden bg-border">
        <div className="h-full rounded-full transition-all" style={{ width: cfg.fill, background: cfg.color }} />
      </div>
    </div>
  );
}

// Stat box colors per metric
const STAT_STYLE: Record<string, { valueClass: string }> = {
  "Win Rate": { valueClass: "text-primary" },
  "ROI":      { valueClass: "text-primary" },
  "Drawdown": { valueClass: "text-red-400" },
  "Trades":   { valueClass: "text-foreground" },
};

function TraderCard({ trader, onCopy, copying }: { trader: Trader; onCopy: (name: string) => void; copying: boolean }) {
  const isTopTrader = trader.name === "AmiinFx";

  return (
    <div className={`flex flex-col gap-4 p-5 rounded-xl border bg-card ${isTopTrader ? "border-primary/30" : "border-border"} relative overflow-hidden`}>
      {/* Gradient accent for top trader */}
      {isTopTrader && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 50% at 0% 0%, var(--teal-glow-subtle) 0%, transparent 70%)" }}
        />
      )}

      <div className="relative">
        {/* Top performer badge */}
        {isTopTrader && (
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Top Performer
            </span>
          </div>
        )}

        {/* Name + followers + stars */}
        <div className="mb-3">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              {trader.flag && <FlagIcon code={trader.flag} />}
              <span className="font-bold text-foreground text-base leading-tight truncate">{trader.name}</span>
            </div>
            <span className="text-[11px] text-muted-foreground whitespace-nowrap tabular-nums shrink-0">
              {trader.followers.toLocaleString()} followers
            </span>
          </div>
          <StarRating stars={trader.stars} />
        </div>

        {/* Stat boxes */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { label: "Win Rate", value: `${trader.win_rate}%`                },
            { label: "ROI",      value: `${trader.roi}%`                     },
            { label: "Drawdown", value: `${trader.drawdown}%`                },
            { label: "Trades",   value: trader.trades_taken.toLocaleString() },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl p-3 bg-background border border-border">
              <p className="text-[11px] text-muted-foreground mb-0.5">{label}</p>
              <p className={`text-sm font-bold tabular-nums ${STAT_STYLE[label]?.valueClass ?? "text-foreground"}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Risk bar */}
        <div className="mb-4">
          <RiskBar level={trader.risk_level} />
        </div>

        {/* CTA */}
        {!trader.is_available && (
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="5" width="10" height="7" rx="1.5" stroke="#EF4444" strokeWidth="1.2" />
              <path d="M3.5 5V3.5a2.5 2.5 0 015 0V5" stroke="#EF4444" strokeWidth="1.2" />
            </svg>
            <span className="text-xs font-semibold text-red-400">Geo restricted</span>
          </div>
        )}

        {trader.is_available ? (
          <button
            onClick={() => onCopy(trader.name)}
            disabled={copying}
            className="w-full py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-primary/20"
          >
            {copying ? "Starting…" : `Copy ${trader.name}`}
          </button>
        ) : (
          <button
            disabled
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-muted-foreground/50 border border-border/50 cursor-not-allowed"
            aria-disabled="true"
          >
            Not available
          </button>
        )}
      </div>
    </div>
  );
}

export default function TraderGrid({ traders: initialTraders, userId }: { traders: Trader[]; userId: string }) {
  const [traders, setTraders] = useState<Trader[]>(initialTraders);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("traders-followers")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "traders" }, (payload) => {
        const updated = payload.new as Trader;
        setTraders((prev) => prev.map((t) => t.name === updated.name ? { ...t, followers: updated.followers } : t));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleCopy = async (traderName: string) => {
    setCopying(true);
    const supabase = createClient();

    const { error: rpcError } = await supabase.rpc("increment_followers", { p_trader_name: traderName });
    if (rpcError) console.error("[copy] increment_followers failed:", rpcError);

    const { data: depositRows } = await supabase
      .from("deposits")
      .select("amount")
      .eq("user_id", userId)
      .eq("status", "approved");
    const depositSum = depositRows?.reduce((sum, d) => sum + Number(d.amount), 0) ?? 0;

    let originalDeposit = depositSum;
    if (!originalDeposit) {
      const { data: profile } = await supabase.from("profiles").select("balance").eq("id", userId).single();
      originalDeposit = Number(profile?.balance ?? 0);
    }

    await supabase.from("user_copy_trading").update({ is_copying: false }).eq("user_id", userId).eq("is_copying", true);

    const { error: insertError } = await supabase.from("user_copy_trading").insert({
      user_id: userId,
      trader_name: traderName,
      is_copying: true,
      started_at: new Date().toISOString(),
      original_deposit: originalDeposit,
    });
    if (insertError) { console.error("[copy] insert failed:", insertError); setCopying(false); return; }

    window.location.href = "/dashboard";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {traders.map((trader) => (
        <TraderCard key={trader.id} trader={trader} onCopy={handleCopy} copying={copying} />
      ))}
    </div>
  );
}
