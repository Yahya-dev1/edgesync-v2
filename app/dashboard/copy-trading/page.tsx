import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TraderGrid from "@/components/dashboard/TraderGrid";

export default async function CopyTradingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: traders } = await supabase
    .from("traders")
    .select("id, name, followers, win_rate, roi, drawdown, trades_taken, stars, risk_level, is_available, flag")
    .order("is_available", { ascending: false })
    .order("followers", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Choose a master trader</h1>
        <p className="text-sm text-slate-400 mt-1">
          Select a trader to automatically copy their strategy
        </p>
      </div>

      {/* Country restriction banner */}
      <div
        className="flex items-start gap-3 rounded-xl px-4 py-3.5 mb-7"
        style={{ background: "#0d1a2e", border: "0.5px solid #1e3a5f" }}
      >
        <svg
          className="shrink-0 mt-0.5"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <circle cx="8" cy="8" r="7" stroke="#3B82F6" strokeWidth="1.4" />
          <path d="M8 7v4" stroke="#3B82F6" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="8" cy="5" r="0.75" fill="#3B82F6" />
        </svg>
        <p className="text-[13px] text-blue-300 leading-relaxed">
          <span className="font-semibold text-blue-200">Country restriction applies.</span>{" "}
          You can only copy trade traders from your own country. Traders outside your region
          are marked as geo restricted.
        </p>
      </div>

      <TraderGrid traders={traders ?? []} userId={user.id} />
    </div>
  );
}
