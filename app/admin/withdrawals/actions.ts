"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function approveWithdrawal(
  withdrawalId: string,
  userId: string,
  amount: number
): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();

    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", userId)
      .single();

    if (fetchError) return { error: fetchError.message };

    const currentBalance = (profile?.balance as number) ?? 0;
    if (currentBalance < amount) {
      return { error: "Insufficient balance to approve this withdrawal." };
    }

    const [statusResult, balanceResult] = await Promise.all([
      supabase
        .from("withdrawals")
        .update({ status: "approved" })
        .eq("id", withdrawalId),
      supabase
        .from("profiles")
        .update({ balance: currentBalance - amount })
        .eq("id", userId),
    ]);

    if (statusResult.error) return { error: statusResult.error.message };
    if (balanceResult.error) return { error: balanceResult.error.message };

    revalidatePath("/admin/withdrawals");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function rejectWithdrawal(withdrawalId: string): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("withdrawals")
      .update({ status: "rejected" })
      .eq("id", withdrawalId);
    if (error) return { error: error.message };
    revalidatePath("/admin/withdrawals");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function saveProfitTarget(value: number): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("platform_settings")
      .upsert({ key: "profit_target_percentage", value: String(value) }, { onConflict: "key" });
    if (error) return { error: error.message };
    revalidatePath("/admin/withdrawals");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}
