import { createClient } from "@/lib/supabase/server";

/**
 * Authorizes the caller as an admin for use inside Server Actions.
 *
 * Server Actions are public POST endpoints — middleware/layout protection is not
 * sufficient, so every privileged action must call this itself. It reads the
 * caller's identity from their own session cookie (never a client-supplied id)
 * and checks the role under RLS, where a user may only read their own
 * user_roles row. Returns `{ error }` on failure so actions can short-circuit.
 */
export async function requireAdmin(): Promise<{ error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleRow) return { error: "Forbidden" };
  return {};
}
