"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { ChevronRight, Clock, Percent, ArrowUpDown, ArrowLeft } from "lucide-react";

// ─── USDT icon ────────────────────────────────────────────────

function UsdtIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill="#00C896" fillOpacity="0.12" />
      <circle cx="20" cy="20" r="19.5" stroke="#00C896" strokeOpacity="0.35" />
      <text
        x="20" y="21" dominantBaseline="middle" textAnchor="middle"
        fill="#00C896" fontSize="18" fontWeight="700" fontFamily="system-ui, sans-serif"
      >
        ₮
      </text>
    </svg>
  );
}

// ─── Lock icon ────────────────────────────────────────────────

function LockIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect x="8" y="18" width="24" height="18" rx="4" stroke="currentColor" strokeWidth="2" />
      <path d="M13 18v-5a7 7 0 0 1 14 0v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="27" r="2.5" fill="currentColor" />
      <line x1="20" y1="29.5" x2="20" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ─── Progress bar ─────────────────────────────────────────────

function ProgressBar({ current, target }: { current: number; target: number }) {
  const pct = Math.min((current / target) * 100, 100);
  return (
    <div className="w-full">
      <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: "var(--primary)" }}
        />
      </div>
      <div className="flex justify-between mt-2 text-sm text-muted-foreground">
        <span>
          Current profit:{" "}
          <span className="font-semibold text-foreground">{current.toFixed(2)}%</span>
        </span>
        <span>
          Target:{" "}
          <span className="font-semibold text-foreground">{target}%</span>
        </span>
      </div>
    </div>
  );
}

// ─── Method selection step ────────────────────────────────────

function MethodStep({ onSelect }: { onSelect: () => void }) {
  return (
    <div className="max-w-xl mx-auto pt-4">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-foreground">Withdraw Funds</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select a withdrawal method to continue.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        <button
          onClick={onSelect}
          className="w-full text-left rounded-xl border border-border bg-card transition-colors duration-150 flex items-center gap-4 px-4 py-4 hover:border-primary/25 hover:bg-overlay cursor-pointer group"
        >
          <div className="flex-shrink-0">
            <UsdtIcon />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-sm font-semibold text-foreground leading-tight">
                Tether (USDT TRC20)
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 flex-shrink-0" />
                1-3 business days
              </span>
              <span className="text-muted-foreground/40">·</span>
              <span className="flex items-center gap-1">
                <Percent className="w-3 h-3 flex-shrink-0" />
                0% fee
              </span>
              <span className="text-muted-foreground/40">·</span>
              <span className="flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3 flex-shrink-0" />
                $10 minimum
              </span>
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        </button>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-6 leading-relaxed">
        All withdrawals are processed securely within 1–3 business days.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────

export default function WithdrawPage() {
  const [step, setStep] = useState<"method" | "form">("method");

  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [totalDeposited, setTotalDeposited] = useState(0);
  const [profitTarget, setProfitTarget] = useState(10);
  const [currentProfit, setCurrentProfit] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [noDeposit, setNoDeposit] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  // Form state
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: profile }, { data: deposits }, { data: settings }, { data: copyTrade }] =
        await Promise.all([
          supabase.from("profiles").select("balance").eq("id", user.id).single(),
          supabase.from("deposits").select("amount").eq("user_id", user.id).eq("status", "approved"),
          supabase.from("platform_settings").select("key, value").in("key", ["profit_target_percentage"]),
          supabase.from("user_copy_trading").select("id").eq("user_id", user.id).eq("is_copying", true).maybeSingle(),
        ]);

      const bal = Number(profile?.balance ?? 0);
      const deposited = (deposits ?? []).reduce((sum, d) => sum + Number(d.amount), 0);
      const targetPct =
        Number(settings?.find((s) => s.key === "profit_target_percentage")?.value) || 10;

      setBalance(bal);
      setTotalDeposited(deposited);
      setProfitTarget(targetPct);
      setIsCopying(!!copyTrade);

      if (deposited === 0) {
        setNoDeposit(true);
        setCurrentProfit(0);
        setUnlocked(false);
      } else {
        const profit = ((bal - deposited) / deposited) * 100;
        setCurrentProfit(profit);
        setUnlocked(profit >= targetPct);
      }

      setLoading(false);
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (amt > balance) {
      setError("Amount exceeds your available balance.");
      return;
    }
    if (!wallet.trim()) {
      setError("Please enter your USDT TRC20 wallet address.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error: insertErr } = await supabase.from("withdrawals").insert({
      user_id: user!.id,
      amount: amt,
      wallet_address: wallet.trim(),
    });

    if (insertErr) {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setSubmitting(false);
  }

  // ── Method selection step ──────────────────────────────────

  if (step === "method") {
    return <MethodStep onSelect={() => setStep("form")} />;
  }

  // ── Loading skeleton ───────────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => setStep("method")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5"
        >
          <ArrowLeft className="w-4 h-4" />
          Change method
        </button>
        <div className="mb-6">
          <div className="h-7 w-48 rounded-xl bg-muted animate-pulse mb-2" />
          <div className="h-5 w-72 rounded-xl bg-muted animate-pulse" />
        </div>
        <div className="rounded-xl border border-border bg-card p-[16px] md:p-8 space-y-4">
          <div className="h-12 w-12 rounded-full bg-muted animate-pulse mx-auto" />
          <div className="h-6 w-40 rounded-lg bg-muted animate-pulse mx-auto" />
          <div className="h-4 w-full rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-3/4 rounded-lg bg-muted animate-pulse mx-auto" />
          <div className="h-3 w-full rounded-full bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────

  if (success) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="rounded-xl border border-border bg-card p-[16px] md:p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <circle cx="14" cy="14" r="13" stroke="#00C896" strokeWidth="2" />
              <path d="M8 14.5l4 4 8-8" stroke="#00C896" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Request Submitted</h2>
          <p className="text-base text-muted-foreground">
            Withdrawal request submitted. Processed within 24 hours.
          </p>
        </div>
      </div>
    );
  }

  // Four-way render decision:
  // 1. noDeposit                        → no funds empty state
  // 2. !noDeposit && isCopying && !unlocked → locked with progress bar
  // 3. !noDeposit && (!isCopying || unlocked) → withdrawal form
  //    showBadge = isCopying && unlocked (profit target reached context)

  const showNoFunds = noDeposit;
  const showLocked  = !noDeposit && isCopying && !unlocked;
  const showBadge   = !noDeposit && isCopying && unlocked;

  return (
    <div className="max-w-lg mx-auto">
      {/* Back to method selection */}
      <button
        onClick={() => setStep("method")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Change method
      </button>

      {/* Selected method indicator */}
      <div className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl border border-border bg-card">
        <UsdtIcon />
        <div>
          <p className="text-sm font-semibold text-foreground">Tether (USDT TRC20)</p>
          <p className="text-xs text-muted-foreground mt-0.5">1-3 business days · 0% fee · $10 minimum</p>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Withdraw Funds</h1>
        <p className="text-base text-muted-foreground mt-1">USDT TRC20 withdrawals only.</p>
      </div>

      {/* Balance pill */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-[16px] py-4 mb-5">
        <span className="text-sm text-muted-foreground">Available balance</span>
        <span className="text-lg font-bold text-foreground">${balance.toFixed(2)}</span>
      </div>

      {showNoFunds ? (
        /* ── No funds empty state ──────────────────────────── */
        <div className="rounded-xl border border-border bg-card p-[16px] md:p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect x="4" y="9" width="24" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
              <path d="M4 14h24" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="10" cy="20" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">No Funds to Withdraw</h2>
          <p className="text-base text-muted-foreground mb-6 max-w-sm">
            You don&apos;t have any approved deposits yet. Make a deposit to fund your account.
          </p>
          <a
            href="/dashboard/deposit"
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
          >
            Make a Deposit
          </a>
        </div>
      ) : showLocked ? (
        /* ── Locked state (copying, profit target not reached) ─ */
        <div className="rounded-xl border border-border bg-card p-[16px] md:p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
            <LockIcon />
          </div>

          <h2 className="text-xl font-bold text-foreground mb-3">Withdrawals Locked</h2>

          <p className="text-base text-muted-foreground mb-6 max-w-sm">
            Your withdrawal will be available once your copy trading profit reaches the target set by AmiinFx.
          </p>

          <div className="w-full">
            <ProgressBar current={Math.max(currentProfit, 0)} target={profitTarget} />
          </div>

          <p className="text-sm text-muted-foreground/70 mt-6 max-w-sm">
            This ensures you benefit fully from AmiinFx&apos;s strategy before withdrawing.
          </p>
        </div>
      ) : (
        /* ── Withdrawal form (free or copy-trade unlocked) ──── */
        <div className="rounded-xl border border-border bg-card p-[16px] md:p-8">
          {showBadge && (
            <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <circle cx="9" cy="9" r="8" stroke="#00C896" strokeWidth="1.5" />
                <path d="M5.5 9.5l2.5 2.5 4.5-5" stroke="#00C896" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm font-semibold text-primary">
                Profit target reached — withdrawals unlocked
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-foreground mb-2">
                Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium select-none">
                  $
                </span>
                <input
                  id="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  max={balance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full pl-7 pr-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 outline-none border border-border bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={() => setAmount(String(balance))}
                className="mt-1.5 text-xs font-medium text-primary hover:underline"
              >
                Use max (${balance.toFixed(2)})
              </button>
            </div>

            {/* Wallet address */}
            <div>
              <label htmlFor="wallet" className="block text-sm font-medium text-foreground mb-2">
                USDT TRC20 Wallet Address
              </label>
              <input
                id="wallet"
                type="text"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                placeholder="T..."
                required
                className="w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 outline-none border border-border bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-colors"
              />
            </div>

            {/* Error */}
            {error && <p className="text-sm text-red-400 font-medium">{error}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm shadow-primary/20"
            >
              {submitting ? "Submitting…" : "Request Withdrawal"}
            </button>

            <p className="text-sm text-muted-foreground/70 text-center">
              Withdrawals are processed within 24 hours.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
