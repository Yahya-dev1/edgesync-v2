import { createAdminClient } from "@/lib/supabase/admin";
import KycClient from "./KycClient";

const PAGE_SIZE = 20;

type KycStatus = "all" | "pending" | "approved" | "rejected";

interface Props {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function AdminKycPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const VALID_STATUSES: KycStatus[] = ["pending", "approved", "rejected", "all"];
  const rawStatus = params.status ?? "pending";
  const status: KycStatus = VALID_STATUSES.includes(rawStatus as KycStatus)
    ? (rawStatus as KycStatus)
    : "all";

  const supabase = createAdminClient();

  let query = supabase
    .from("kyc_submissions")
    .select("id, user_id, id_front_url, id_back_url, status, created_at, updated_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const [{ data: rows, count, error }, { count: pendingCount }] = await Promise.all([
    query,
    supabase
      .from("kyc_submissions")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  if (error) {
    return (
      <div className="text-sm text-red-400 bg-red-500/10 rounded-lg p-4">
        Failed to load KYC submissions: {error.message}
      </div>
    );
  }

  const userIds = [...new Set((rows ?? []).map((r) => r.user_id as string))];

  const profilesResult = userIds.length
    ? await supabase.from("profiles").select("id, full_name, email").in("id", userIds)
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

  const submissions = (rows ?? []).map((r) => ({
    id: r.id as string,
    user_id: r.user_id as string,
    id_front_url: r.id_front_url as string,
    id_back_url: r.id_back_url as string,
    status: r.status as string,
    created_at: r.created_at as string,
    updated_at: r.updated_at as string,
    full_name: profileMap[r.user_id as string]?.full_name ?? null,
    email: profileMap[r.user_id as string]?.email ?? null,
  }));

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <KycClient
      submissions={submissions}
      totalCount={count ?? 0}
      pendingCount={pendingCount ?? 0}
      page={page}
      totalPages={totalPages}
      status={status}
    />
  );
}
