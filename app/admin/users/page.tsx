import { createAdminClient } from "@/lib/supabase/admin";
import UsersClient from "./UsersClient";

const PAGE_SIZE = 10;

interface Props {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const search = params.search?.trim() ?? "";

  const supabase = createAdminClient();

  let query = supabase
    .from("profiles")
    .select("id, full_name, email, balance, created_at", { count: "exact" })
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const { data: profiles, count, error } = await query;

  if (error) {
    return (
      <div className="text-sm text-red-400 bg-red-500/10 rounded-lg p-4">
        Failed to load users: {error.message}
      </div>
    );
  }

  const userIds = (profiles ?? []).map((p) => p.id);

  const [rolesResult, copyingResult] = await Promise.all([
    userIds.length
      ? supabase.from("user_roles").select("user_id, role").in("user_id", userIds)
      : Promise.resolve({ data: [] }),
    userIds.length
      ? supabase
          .from("user_copy_trading")
          .select("user_id")
          .in("user_id", userIds)
          .eq("is_copying", true)
      : Promise.resolve({ data: [] }),
  ]);

  const roleMap = Object.fromEntries(
    ((rolesResult as { data: { user_id: string; role: string }[] | null }).data ?? []).map((r) => [r.user_id, r.role])
  );
  const copyingSet = new Set(
    ((copyingResult as { data: { user_id: string }[] | null }).data ?? []).map((r) => r.user_id)
  );

  const users = (profiles ?? []).map((p) => ({
    id: p.id,
    full_name: p.full_name as string | null,
    email: p.email as string | null,
    balance: p.balance as number,
    created_at: p.created_at as string | null,
    role: roleMap[p.id] ?? "user",
    is_copying: copyingSet.has(p.id),
  }));

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <UsersClient
      users={users}
      totalCount={count ?? 0}
      page={page}
      totalPages={totalPages}
      search={search}
    />
  );
}
