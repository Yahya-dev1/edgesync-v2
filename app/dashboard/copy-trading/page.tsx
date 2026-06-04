import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TraderGrid from "@/components/dashboard/TraderGrid";
import { Info } from "lucide-react";

export default async function CopyTradingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: traders } = await supabase
    .from("traders")
    .select("id, name, followers, win_rate, roi, drawdown, trades_taken, stars, risk_level, is_available, flag")
    .order("is_available", { ascending: false })
    .order("followers", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Choose a Master Trader</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select a trader to automatically copy their strategy
        </p>
      </div>

      {/* Country restriction banner */}
      <div className="flex items-start gap-3 rounded-xl px-4 py-3.5 mb-7 border border-blue-500/20 bg-blue-500/[0.05]">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/15 flex-shrink-0 mt-0.5">
          <Info className="w-3.5 h-3.5 text-blue-400" strokeWidth={1.5} />
        </div>
        <p className="text-sm text-blue-400 leading-relaxed">
          <span className="font-semibold text-blue-300">Country restriction applies.</span>{" "}
          You can only copy trade traders from your own country. Traders outside your region are marked as geo restricted.
        </p>
      </div>

      <TraderGrid traders={traders ?? []} userId={user.id} />
    </div>
  );
}
