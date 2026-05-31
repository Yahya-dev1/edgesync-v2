import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import StopCopyingButton from "@/components/dashboard/StopCopyingButton";

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

// ─── Placeholder trades ────────────────────────────────────────

const PLACEHOLDER_TRADES = [
  { symbol: "XAUUSD", direction: "BUY",  pnl: "+$0.00", Icon: XAUUSDIcon },
  { symbol: "EURUSD", direction: "SELL", pnl: "+$0.00", Icon: EURUSDIcon },
  { symbol: "GBPUSD", direction: "BUY",  pnl: "+$0.00", Icon: GBPUSDIcon },
  { symbol: "USDJPY", direction: "SELL", pnl: "+$0.00", Icon: USDJPYIcon },
];

// ─── Page ─────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: copyTrade }] = await Promise.all([
    supabase.from("profiles").select("full_name, balance").eq("id", user!.id).single(),
    supabase
      .from("user_copy_trading")
      .select("id, trader_name")
      .eq("user_id", user!.id)
      .eq("is_copying", true)
      .maybeSingle(),
  ]);

  const firstName = (profile?.full_name || "Trader").split(" ")[0];
  const balance = `$${Number(profile?.balance ?? 0).toFixed(2)}`;

  if (!copyTrade) {
    return <State1 firstName={firstName} balance={balance} />;
  }

  const { data: trader } = await supabase
    .from("traders")
    .select("trades_taken")
    .eq("name", copyTrade.trader_name)
    .single();

  return (
    <State2
      firstName={firstName}
      balance={balance}
      copyId={copyTrade.id}
      traderName={copyTrade.trader_name}
      tradesTaken={trader?.trades_taken ?? 0}
      userId={user!.id}
    />
  );
}

// ─── State 1: No active copy trade ────────────────────────────

function State1({ firstName, balance }: { firstName: string; balance: string }) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          Welcome, <span className="text-primary">{firstName}</span>!
        </h1>
        <p className="text-base text-muted-foreground mt-1">Here&apos;s your trading overview.</p>
      </div>

      {/* Balance card */}
      <div
        className="rounded-xl p-[16px] md:p-6 mb-5 bg-surface"
        style={{ border: "0.5px solid var(--surface-border)" }}
      >
        <p className="text-sm font-medium text-muted-foreground mb-1">Account Balance</p>
        <p className="text-3xl font-bold text-foreground mb-5">{balance}</p>
        <div className="flex gap-3">
          <Link
            href="/dashboard/deposit"
            className="flex-1 py-2.5 text-center rounded-lg text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
          >
            Deposit
          </Link>
          <Link
            href="/dashboard/withdraw"
            className="flex-1 py-2.5 text-center rounded-lg text-base font-semibold border border-border text-muted-foreground hover:bg-overlay hover:text-foreground transition-colors"
          >
            Withdraw
          </Link>
        </div>
      </div>

      {/* Option cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Copy Trading — active */}
        <div
          className="rounded-xl bg-surface p-[16px] md:p-6 flex flex-col"
          style={{ border: "1.5px solid var(--primary)" }}
        >
          <div className="flex items-center justify-between mb-3 md:mb-5">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              Active
            </span>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <circle cx="7" cy="11" r="3.5" stroke="#00C896" strokeWidth="1.5" />
                <circle cx="14" cy="7" r="3" stroke="#00C896" strokeWidth="1.5" />
                <path
                  d="M10.5 9.5C11.5 10 12.5 11 12.5 12.5"
                  stroke="#00C896"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Copy Trading</h3>
          <p className="text-base text-muted-foreground mb-4 md:mb-6 flex-1">
            Automatically mirror trades from verified expert traders.
          </p>
          <Link
            href="/dashboard/copy-trading"
            className="block py-2.5 text-center rounded-lg text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
          >
            Browse traders
          </Link>
        </div>

        {/* Self Trading — disabled */}
        <div
          className="rounded-xl bg-surface p-[16px] md:p-6 flex flex-col opacity-50"
          style={{ border: "0.5px solid var(--surface-border)" }}
        >
          <div className="flex items-center justify-between mb-3 md:mb-5">
            <span className="text-xs font-semibold text-muted-foreground bg-overlay px-2.5 py-1 rounded-full">
              Coming Soon
            </span>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-overlay flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="3" width="16" height="14" rx="2" stroke="#64748B" strokeWidth="1.5" />
                <path
                  d="M3 14.5l4-4 3 3 4-4.5 3 2.5"
                  stroke="#64748B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Self Trading</h3>
          <p className="text-base text-muted-foreground mb-4 md:mb-6 flex-1">
            Take full control and execute your own trades manually.
          </p>
          <button
            disabled
            className="w-full py-2.5 text-center rounded-lg text-base font-semibold border border-border text-muted-foreground cursor-not-allowed"
          >
            Under Maintenance
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── State 2: Active copy trade ────────────────────────────────

function State2({
  firstName,
  balance,
  copyId,
  traderName,
  tradesTaken,
  userId,
}: {
  firstName: string;
  balance: string;
  copyId: string;
  traderName: string;
  tradesTaken: number;
  userId: string;
}) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          Welcome back, <span className="text-primary">{firstName}</span>!
        </h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div
          className="p-[16px] md:p-5 rounded-xl bg-surface"
          style={{ border: "0.5px solid var(--surface-border)" }}
        >
          <p className="text-sm text-muted-foreground mb-1.5">Account Balance</p>
          <p className="text-2xl font-bold text-foreground">{balance}</p>
        </div>
        <div
          className="p-[16px] md:p-5 rounded-xl bg-surface"
          style={{ border: "0.5px solid var(--surface-border)" }}
        >
          <p className="text-sm text-muted-foreground mb-1.5">Total P&L</p>
          <p className="text-2xl font-bold text-primary">+$0.00</p>
        </div>
        <div
          className="p-[16px] md:p-5 rounded-xl bg-surface"
          style={{ border: "0.5px solid var(--surface-border)" }}
        >
          <p className="text-sm text-muted-foreground mb-1.5">Open Trades</p>
          <p className="text-2xl font-bold text-foreground">0</p>
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

          {/* Trader header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">AF</span>
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">{traderName}</p>
              <p className="text-sm text-muted-foreground">Verified Master Trader</p>
            </div>
          </div>

          {/* Live pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
            <span className="text-sm font-semibold text-primary">Live — copying active</span>
          </div>

          {/* Stats */}
          <div className="space-y-3.5 mb-6">
            {(
              [
                ["Trades taken", String(tradesTaken)],
                ["Today's P&L",  "$0.00"],
                ["This week",    "$0.00"],
                ["Floating P&L", "$0.00"],
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

          <div className="space-y-3">
            {PLACEHOLDER_TRADES.map(({ symbol, direction, pnl, Icon }) => (
              <div
                key={symbol}
                className="flex items-center gap-3 p-3 rounded-lg bg-subtle"
                style={{ border: "0.5px solid var(--surface-border)" }}
              >
                <Icon />
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-foreground">{symbol}</p>
                  <p
                    className={`text-sm font-medium ${
                      direction === "BUY" ? "text-primary" : "text-red-400"
                    }`}
                  >
                    {direction}
                  </p>
                </div>
                <span className="text-base font-semibold text-muted-foreground tabular-nums">{pnl}</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground text-center mt-5">
            Trades update when {traderName} opens positions
          </p>
        </div>
      </div>
    </div>
  );
}
