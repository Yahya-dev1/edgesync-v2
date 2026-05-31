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
    .select("id, name, followers, win_rate, roi, drawdown, trades_taken, stars, risk_level, is_available")
    .order("followers", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Choose a master trader</h1>
        <p className="text-sm text-slate-400 mt-1">
          Select a trader to automatically copy their strategy
        </p>
      </div>
      <TraderGrid traders={traders ?? []} userId={user.id} />
    </div>
  );
}
