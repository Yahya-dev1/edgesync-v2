import { createAdminClient } from "@/lib/supabase/admin";
import MarketingClient from "./MarketingClient";

export interface Trade {
  symbol: string;
  direction: "BUY" | "SELL";
  pnl_amount: number;
}

export interface MarketingAccount {
  id: string;
  full_name: string;
  initials: string;
  avatar_color: string;
  trades: Trade[];
  total_pnl: number;
  created_at: string;
}

export default async function AdminMarketingPage() {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("marketing_accounts")
    .select("id, full_name, initials, avatar_color, trades, total_pnl, created_at")
    .order("created_at", { ascending: true });

  const accounts = (data ?? []) as MarketingAccount[];

  return <MarketingClient accounts={accounts} />;
}
