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

// ─── Flag Icon ────────────────────────────────────────────────

function FlagIcon({ code }: { code: string }) {
  const Flag = Flags[code as keyof typeof Flags];
  if (!Flag) return null;
  return (
    <Flag
      title={code}
      style={{ width: 20, height: "auto", borderRadius: 3, display: "block", flexShrink: 0 }}
    />
  );
}

// ─── Star Rating ───────────────────────────────────────────────

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24">
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            style={{ fill: i < stars ? "#BA7517" : "var(--surface-border)" }}
          />
        </svg>
      ))}
    </div>
  );
}

// ─── Risk Bar ─────────────────────────────────────────────────

const RISK_CONFIG: Record<string, { color: string; fill: string; label: string }> = {
  low:  { color: "#00C896", fill: "25%",  label: "Low Risk"  },
  mid:  { color: "#F59E0B", fill: "55%",  label: "Mid Risk"  },
  high: { color: "#EF4444", fill: "85%",  label: "High Risk" },
};

function RiskBar({ level }: { level: string }) {
  const cfg = RISK_CONFIG[level] ?? RISK_CONFIG.mid;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">Risk</span>
        <span className="text-xs font-semibold" style={{ color: cfg.color }}>
          {cfg.label}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden bg-surface-border"
        style={{ background: "var(--surface-border)" }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: cfg.fill, background: cfg.color }}
        />
      </div>
    </div>
  );
}

// ─── Lock icon ────────────────────────────────────────────────

function LockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <rect x="1" y="5" width="10" height="7" rx="1.5" stroke="#EF4444" strokeWidth="1.2" />
      <path d="M3.5 5V3.5a2.5 2.5 0 015 0V5" stroke="#EF4444" strokeWidth="1.2" />
    </svg>
  );
}

// ─── Trader Card ──────────────────────────────────────────────

function TraderCard({
  trader,
  onCopy,
  copying,
}: {
  trader: Trader;
  onCopy: (name: string) => void;
  copying: boolean;
}) {
  const isAmiinFx = trader.name === "AmiinFx";

  return (
    <div
      className="flex flex-col gap-4 p-4 bg-surface"
      style={{
        border: isAmiinFx ? "1.5px solid #00C896" : "0.5px solid var(--surface-border)",
        borderRadius: "12px",
      }}
    >
      {/* Top performer badge */}
      {isAmiinFx && (
        <div>
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            Top performer
          </span>
        </div>
      )}

      {/* Name + followers + stars */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            {trader.flag && <FlagIcon code={trader.flag} />}
            <span className="font-semibold text-foreground text-base leading-tight truncate">{trader.name}</span>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums shrink-0">
            {trader.followers.toLocaleString()} followers
          </span>
        </div>
        <StarRating stars={trader.stars} />
      </div>

      {/* Stat boxes */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Win Rate", value: `${trader.win_rate}%`                  },
          { label: "ROI",      value: `${trader.roi}%`                       },
          { label: "Drawdown", value: `${trader.drawdown}%`                  },
          { label: "Trades",   value: trader.trades_taken.toLocaleString()   },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-lg p-3 bg-card-nested"
            style={{ border: "0.5px solid var(--surface-border)" }}
          >
            <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
            <p className="text-base font-semibold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* Risk bar */}
      <RiskBar level={trader.risk_level} />

      {/* Button */}
      <div className="mt-auto">
        {!trader.is_available && (
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <LockIcon />
            <span className="text-xs font-semibold text-red-400">Geo restricted</span>
          </div>
        )}

        {trader.is_available ? (
          <button
            onClick={() => onCopy(trader.name)}
            disabled={copying}
            className="w-full py-2.5 rounded-lg text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {copying ? "Starting…" : `Copy ${trader.name}`}
          </button>
        ) : (
          <button
            disabled
            className="w-full py-2.5 rounded-lg text-base font-semibold text-muted-foreground cursor-not-allowed bg-card-nested"
            style={{ border: "0.5px solid var(--surface-border)" }}
          >
            Not available
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Grid ─────────────────────────────────────────────────────

export default function TraderGrid({
  traders: initialTraders,
  userId,
}: {
  traders: Trader[];
  userId: string;
}) {
  const [traders, setTraders] = useState<Trader[]>(initialTraders);
  const [copying, setCopying] = useState(false);

  // Realtime follower updates
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("traders-followers")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "traders" },
        (payload) => {
          const updated = payload.new as Trader;
          setTraders((prev) =>
            prev.map((t) =>
              t.name === updated.name ? { ...t, followers: updated.followers } : t
            )
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleCopy = async (traderName: string) => {
    setCopying(true);
    const supabase = createClient();

    const { error: rpcError } = await supabase.rpc("increment_followers", { p_trader_name: traderName });
    if (rpcError) console.error("[copy] increment_followers failed:", rpcError);

    // Snapshot the user's current approved-deposit total as their baseline
    const { data: depositRows } = await supabase
      .from("deposits")
      .select("amount")
      .eq("user_id", userId)
      .eq("status", "approved");
    const originalDeposit = depositRows?.reduce((sum, d) => sum + Number(d.amount), 0) ?? 0;

    // Deactivate any existing active rows before inserting to prevent duplicate true rows
    const { error: deactivateError } = await supabase
      .from("user_copy_trading")
      .update({ is_copying: false })
      .eq("user_id", userId)
      .eq("is_copying", true);
    if (deactivateError) console.error("[copy] deactivate existing failed:", deactivateError);

    const { error: insertError } = await supabase.from("user_copy_trading").insert({
      user_id: userId,
      trader_name: traderName,
      is_copying: true,
      started_at: new Date().toISOString(),
      original_deposit: originalDeposit,
    });
    if (insertError) {
      console.error("[copy] user_copy_trading insert failed:", insertError);
      setCopying(false);
      return;
    }

    // Hard navigate to bust the Next.js Router Cache so the dashboard re-renders fresh
    window.location.href = "/dashboard";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {traders.map((trader) => (
        <TraderCard
          key={trader.id}
          trader={trader}
          onCopy={handleCopy}
          copying={copying}
        />
      ))}
    </div>
  );
}
