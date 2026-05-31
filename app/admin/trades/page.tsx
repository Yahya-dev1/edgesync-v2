import { createAdminClient } from "@/lib/supabase/admin";
import TradesClient from "./TradesClient";

const PAGE_SIZE = 10;

interface Props {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function AdminTradesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const status = params.status === "closed" ? "closed" : params.status === "open" ? "open" : "all";

  const supabase = createAdminClient();

  let query = supabase
    .from("master_trades")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status === "open") query = query.eq("is_active", true);
  if (status === "closed") query = query.eq("is_active", false);

  query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const { data: trades, count, error } = await query;

  if (error) {
    return (
      <div className="text-sm text-red-400 bg-red-500/10 rounded-lg p-4">
        Failed to load trades: {error.message}
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <TradesClient
      trades={trades ?? []}
      totalCount={count ?? 0}
      page={page}
      totalPages={totalPages}
      status={status}
    />
  );
}
