"use server";

import { createAdminClient } from "@/lib/supabase/admin";

const WELCOME_MESSAGES = [
  "👋 Welcome to EdgeSync Markets support! How can we help you today?",
  "For deposit issues, please allow up to 15 minutes for automated processing.",
  "For account or withdrawal queries, our team typically responds within 1-2 hours.",
];

export async function initSupportConversation(
  userId: string
): Promise<{ conversationId: string }> {
  const supabase = createAdminClient();

  const { data: conv, error } = await supabase
    .from("support_conversations")
    .insert({ user_id: userId, status: "open" })
    .select("id")
    .single();

  if (error || !conv) throw new Error(error?.message ?? "Failed to create conversation");

  await supabase.from("support_messages").insert(
    WELCOME_MESSAGES.map((message) => ({
      conversation_id: conv.id,
      sender_id: userId,
      is_admin: true,
      message,
    }))
  );

  return { conversationId: conv.id };
}
