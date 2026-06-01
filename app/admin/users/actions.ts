"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateBalance(userId: string, balance: number): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("profiles")
      .update({ balance })
      .eq("id", userId);
    if (error) return { error: error.message };
    revalidatePath("/admin/users");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}
