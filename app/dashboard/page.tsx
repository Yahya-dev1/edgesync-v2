import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import LiveDashboard from "@/components/dashboard/LiveDashboard";
import KycBanner from "@/components/dashboard/KycBanner";
import { ArrowDownToLine, ArrowUpFromLine, Users, BarChart2 } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: copyTrade }] = await Promise.all([
    supabase.from("profiles").select("full_name, balance").eq("id", user!.id).single(),
    supabase
      .from("user_copy_trading")
      .select("id, trader_name, original_deposit")
      .eq("user_id", user!.id)
      .eq("is_copying", true)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  let kycApproved = false;
  try {
    const { data: kyc } = await supabase
      .from("kyc_submissions")
      .select("status")
      .eq("user_id", user!.id)
      .maybeSingle();
    kycApproved = kyc?.status === "approved";
  } catch {
    // default false
  }

  const firstName = (profile?.full_name || "Trader").split(" ")[0];
  const balanceNum = Number(profile?.balance ?? 0);

  if (!copyTrade) {
    return <State1 firstName={firstName} balance={`$${balanceNum.toFixed(2)}`} showKycBanner={!kycApproved} />;
  }

  return (
    <State2
      firstName={firstName}
      userBalance={balanceNum}
      originalDeposit={copyTrade.original_deposit != null ? Number(copyTrade.original_deposit) : null}
      copyId={copyTrade.id}
      traderName={copyTrade.trader_name}
      userId={user!.id}
      showKycBanner={!kycApproved}
    />
  );
}

// ─── State 1: No active copy trade ────────────────────────────

function State1({ firstName, balance, showKycBanner }: { firstName: string; balance: string; showKycBanner: boolean }) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          Welcome, <span className="text-primary">{firstName}</span>!
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Here&apos;s your trading overview.</p>
      </div>

      {showKycBanner && <KycBanner />}

      {/* Balance card */}
      <div className="rounded-xl border border-border bg-card p-5 md:p-6 mb-5 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 60% at 0% 0%, var(--teal-glow-subtle) 0%, transparent 70%)" }}
        />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Account Balance</p>
          <p className="text-3xl font-bold text-foreground tabular-nums mb-5">{balance}</p>
          <div className="flex gap-3">
            <Link
              href="/dashboard/deposit"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
            >
              <ArrowDownToLine className="w-4 h-4" strokeWidth={2} />
              Deposit
            </Link>
            <Link
              href="/dashboard/withdraw"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border border-border text-muted-foreground hover:bg-overlay hover:text-foreground transition-colors"
            >
              <ArrowUpFromLine className="w-4 h-4" strokeWidth={2} />
              Withdraw
            </Link>
          </div>
        </div>
      </div>

      {/* Option cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Copy Trading */}
        <div className="rounded-xl border border-primary/30 bg-card p-5 md:p-6 flex flex-col relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 80% 60% at 0% 0%, var(--teal-glow-subtle) 0%, transparent 70%)" }}
          />
          <div className="relative flex flex-col flex-1">
            <div className="flex items-center justify-between mb-5">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Live
              </span>
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center">
                <Users className="w-4.5 h-4.5 text-primary" strokeWidth={1.5} />
              </div>
            </div>
            <h3 className="text-base font-bold text-foreground mb-2">Copy Trading</h3>
            <p className="text-sm text-muted-foreground mb-6 flex-1">
              Automatically mirror trades from verified expert traders.
            </p>
            <Link
              href="/dashboard/copy-trading"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
            >
              Browse Traders
            </Link>
          </div>
        </div>

        {/* Self Trading — disabled */}
        <div className="rounded-xl border border-border bg-card/50 p-5 md:p-6 flex flex-col opacity-50">
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs font-semibold text-muted-foreground bg-overlay px-2.5 py-1 rounded-full border border-border">
              Coming Soon
            </span>
            <div className="w-9 h-9 rounded-xl bg-overlay border border-border flex items-center justify-center">
              <BarChart2 className="w-4.5 h-4.5 text-muted-foreground" strokeWidth={1.5} />
            </div>
          </div>
          <h3 className="text-base font-bold text-muted-foreground mb-2">Self Trading</h3>
          <p className="text-sm text-muted-foreground mb-6 flex-1">
            Take full control and execute your own trades manually.
          </p>
          <button
            disabled
            className="w-full py-2.5 rounded-xl text-sm font-semibold border border-border/50 text-muted-foreground/50 cursor-not-allowed"
            aria-disabled="true"
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
  firstName, userBalance, originalDeposit, copyId, traderName, userId, showKycBanner,
}: {
  firstName: string;
  userBalance: number;
  originalDeposit: number | null;
  copyId: string;
  traderName: string;
  userId: string;
  showKycBanner: boolean;
}) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          Welcome back, <span className="text-primary">{firstName}</span>!
        </h1>
      </div>
      {showKycBanner && <KycBanner />}
      <LiveDashboard
        userBalance={userBalance}
        originalDeposit={originalDeposit}
        copyId={copyId}
        traderName={traderName}
        userId={userId}
      />
    </div>
  );
}
