import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import SupportClient from "./SupportClient";

export interface Conversation {
  id: string;
  user_id: string;
  status: "open" | "closed";
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
  last_message: string | null;
  last_is_admin: boolean;
  last_message_at: string;
}

export default async function AdminSupportPage() {
  const [serverClient, adminClient] = [await createClient(), createAdminClient()];

  const {
    data: { user },
  } = await serverClient.auth.getUser();

  const { data: convRows } = await adminClient
    .from("support_conversations")
    .select("id, user_id, status, created_at, updated_at")
    .order("updated_at", { ascending: false });

  const convIds = (convRows ?? []).map((c) => c.id);
  const userIds = [...new Set((convRows ?? []).map((c) => c.user_id as string))];

  const [profilesRes, msgsRes] = await Promise.all([
    userIds.length
      ? adminClient.from("profiles").select("id, full_name, email").in("id", userIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string | null; email: string | null }[] }),
    convIds.length
      ? adminClient
          .from("support_messages")
          .select("conversation_id, message, is_admin, created_at")
          .in("conversation_id", convIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({
          data: [] as {
            conversation_id: string;
            message: string;
            is_admin: boolean;
            created_at: string;
          }[],
        }),
  ]);

  const profileMap = Object.fromEntries(
    ((profilesRes.data ?? []) as { id: string; full_name: string | null; email: string | null }[]).map(
      (p) => [p.id, p]
    )
  );

  const lastMsgMap: Record<
    string,
    { message: string; is_admin: boolean; created_at: string }
  > = {};
  for (const msg of (msgsRes.data ?? []) as {
    conversation_id: string;
    message: string;
    is_admin: boolean;
    created_at: string;
  }[]) {
    if (!lastMsgMap[msg.conversation_id]) {
      lastMsgMap[msg.conversation_id] = msg;
    }
  }

  const conversations: Conversation[] = (convRows ?? []).map((c) => ({
    id: c.id as string,
    user_id: c.user_id as string,
    status: (c.status as string) === "closed" ? "closed" : "open",
    created_at: c.created_at as string,
    updated_at: c.updated_at as string,
    user_name:
      profileMap[c.user_id as string]?.full_name ??
      profileMap[c.user_id as string]?.email ??
      "Unknown",
    user_email: profileMap[c.user_id as string]?.email ?? "",
    last_message: lastMsgMap[c.id as string]?.message ?? null,
    last_is_admin: lastMsgMap[c.id as string]?.is_admin ?? false,
    last_message_at: lastMsgMap[c.id as string]?.created_at ?? (c.created_at as string),
  }));

  return (
    <SupportClient
      initialConversations={conversations}
      adminUserId={user?.id ?? ""}
    />
  );
}
