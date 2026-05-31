import { createClient } from "@/lib/supabase/server";
import {
  DollarSign,
  ArrowDownToLine,
  Users,
  TrendingUp,
} from "lucide-react";

const statCards = [
  {
    label: "Account Balance",
    value: "$0.00",
    icon: DollarSign,
    change: null,
    description: "Total available balance",
  },
  {
    label: "Total Deposits",
    value: "$0.00",
    icon: ArrowDownToLine,
    change: null,
    description: "Cumulative deposits",
  },
  {
    label: "Active Copies",
    value: "0",
    icon: Users,
    change: null,
    description: "Currently copying traders",
  },
  {
    label: "Profit / Loss",
    value: "$0.00",
    icon: TrendingUp,
    change: null,
    description: "All-time P&L",
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch profile balance (will be 0 for new accounts)
  const { data: profile } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", user!.id)
    .single();

  const balance = profile?.balance ?? 0;
  const formattedBalance = `$${Number(balance).toFixed(2)}`;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Your trading overview at a glance.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          const displayValue = i === 0 ? formattedBalance : card.value;

          return (
            <div
              key={card.label}
              className="p-5 rounded-xl border border-white/6 bg-[#0d1526]"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-slate-500">
                  {card.label}
                </span>
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5">
                  <Icon
                    className="w-4 h-4 text-slate-400"
                    strokeWidth={1.5}
                  />
                </div>
              </div>

              <p className="text-2xl font-bold text-white">{displayValue}</p>
              <p className="text-xs text-slate-600 mt-1">{card.description}</p>
            </div>
          );
        })}
      </div>

      {/* Empty state panel */}
      <div className="rounded-xl border border-white/6 bg-[#0d1526] p-8 text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 mx-auto mb-4">
          <TrendingUp className="w-6 h-6 text-slate-500" strokeWidth={1.5} />
        </div>
        <h3 className="text-sm font-semibold text-white mb-2">
          No activity yet
        </h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto mb-5">
          Make your first deposit and start copying top traders to see your
          activity here.
        </p>
        <a
          href="/dashboard/deposit"
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-[#00C896] text-[#080d1a] hover:bg-[#00b084] transition-colors"
        >
          Make a Deposit
        </a>
      </div>
    </div>
  );
}
