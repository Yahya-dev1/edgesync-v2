import { createAdminClient } from "@/lib/supabase/admin";
import DepositsClient from "./DepositsClient";

const PAGE_SIZE = 10;

type DepositStatus = "all" | "pending" | "approved" | "rejected";

interface Props {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function AdminDepositsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const status = (params.status ?? "all") as DepositStatus;

  const supabase = createAdminClient();

  let query = supabase
    .from("deposits")
    .select("id, user_id, amount, status, method, screenshot_url, created_at", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const { data: rows, count, error } = await query;

  if (error) {
    return (
      <div className="text-sm text-red-400 bg-red-500/10 rounded-lg p-4">
        Failed to load deposits: {error.message}
      </div>
    );
  }

  const userIds = [...new Set((rows ?? []).map((r) => r.user_id as string))];

  const profilesResult = userIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds)
    : { data: [] };

  const profileMap = Object.fromEntries(
    (
      (profilesResult as { data: { id: string; full_name: string | null; email: string | null }[] | null }).data ?? []
    ).map((p) => [p.id, { full_name: p.full_name, email: p.email }])
  );

  // Generate signed URLs for all screenshots in a single batch request
  const screenshotPaths = (rows ?? [])
    .map((r) => r.screenshot_url as string | null)
    .filter((p): p is string => !!p);

  let signedUrlMap: Record<string, string> = {};
  if (screenshotPaths.length > 0) {
    const { data: signedUrls } = await supabase.storage
      .from("deposit-screenshots")
      .createSignedUrls(screenshotPaths, 3600);

    if (signedUrls) {
      signedUrlMap = Object.fromEntries(
        signedUrls
          .filter((u) => u.signedUrl)
          .map((u) => [u.path, u.signedUrl])
      );
    }
  }

  const deposits = (rows ?? []).map((r) => ({
    id: r.id as string,
    user_id: r.user_id as string,
    amount: r.amount as number,
    status: r.status as string,
    method: (r.method as string) ?? "USDT TRC20",
    screenshot_url: (r.screenshot_url as string | null) ?? null,
    screenshot_signed_url: r.screenshot_url
      ? (signedUrlMap[r.screenshot_url as string] ?? null)
      : null,
    created_at: r.created_at as string,
    full_name: profileMap[r.user_id as string]?.full_name ?? null,
    email: profileMap[r.user_id as string]?.email ?? null,
  }));

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <DepositsClient
      deposits={deposits}
      totalCount={count ?? 0}
      page={page}
      totalPages={totalPages}
      status={status}
    />
  );
}
