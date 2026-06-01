"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function sendAdminMessage(
  conversationId: string,
  adminId: string,
  message: string
): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("support_messages").insert({
      conversation_id: conversationId,
      sender_id: adminId,
      is_admin: true,
      message,
    });
    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function setConversationStatus(
  conversationId: string,
  status: "open" | "closed"
): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("support_conversations")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", conversationId);
    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}
