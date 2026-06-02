import { createAdminClient } from "@/lib/supabase/admin";
import KYCClient from "./KYCClient";

const PAGE_SIZE = 10;

type KYCStatus = "all" | "pending" | "approved" | "rejected";

interface Props {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function AdminKYCPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const status = (params.status ?? "all") as KYCStatus;

  const supabase = createAdminClient();

  let query = supabase
    .from("kyc_submissions")
    .select("id, user_id, status, created_at", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const { data: submissions, count, error } = await query;

  if (error) {
    return (
      <div className="text-sm text-red-400 bg-red-500/10 rounded-lg p-4">
        Failed to load KYC submissions: {error.message}
      </div>
    );
  }

  const userIds = [...new Set((submissions ?? []).map((r) => r.user_id as string))];

  const profilesResult = userIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds)
    : { data: [] };

  const profileMap = Object.fromEntries(
    (
      (
        profilesResult as {
          data: { id: string; full_name: string | null; email: string | null }[] | null;
        }
      ).data ?? []
    ).map((p) => [p.id, { full_name: p.full_name, email: p.email }])
  );

  const rows = (submissions ?? []).map((r) => ({
    id: r.id as string,
    user_id: r.user_id as string,
    status: r.status as string,
    created_at: r.created_at as string,
    full_name: profileMap[r.user_id as string]?.full_name ?? null,
    email: profileMap[r.user_id as string]?.email ?? null,
  }));

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <KYCClient
      rows={rows}
      totalCount={count ?? 0}
      page={page}
      totalPages={totalPages}
      status={status}
    />
  );
}
