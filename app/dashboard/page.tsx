import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import LiveDashboard from "@/components/dashboard/LiveDashboard";

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
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const firstName = (profile?.full_name || "Trader").split(" ")[0];
  const balanceNum = Number(profile?.balance ?? 0);

  if (!copyTrade) {
    return <State1 firstName={firstName} balance={`$${balanceNum.toFixed(2)}`} />;
  }

  const { count: tradesTaken } = await supabase
    .from("master_trades")
    .select("id", { count: "exact", head: true })
    .eq("trader_name", copyTrade.trader_name);

  return (
    <State2
      firstName={firstName}
      userBalance={balanceNum}
      copyId={copyTrade.id}
      traderName={copyTrade.trader_name}
      tradesTaken={tradesTaken ?? 0}
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
  userBalance,
  copyId,
  traderName,
  tradesTaken,
  userId,
}: {
  firstName: string;
  userBalance: number;
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

      <LiveDashboard
        userBalance={userBalance}
        copyId={copyId}
        traderName={traderName}
        tradesTaken={tradesTaken}
        userId={userId}
      />
    </div>
  );
}
