"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateBalance(userId: string, balance: number): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();

    // Run both writes concurrently to minimise the realtime race window.
    // Resetting original_deposit to the new balance means P&L recalculates to
    // $0.00 — the admin adjustment is treated as a new baseline, not profit.
    const [profileResult, copyResult] = await Promise.all([
      supabase.from("profiles").update({ balance }).eq("id", userId),
      supabase
        .from("user_copy_trading")
        .update({ original_deposit: balance })
        .eq("user_id", userId)
        .eq("is_copying", true),
    ]);

    if (profileResult.error) return { error: profileResult.error.message };
    if (copyResult.error) return { error: copyResult.error.message };

    revalidatePath("/admin/users");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}
