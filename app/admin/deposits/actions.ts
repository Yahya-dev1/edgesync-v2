"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function approveDeposit(
  depositId: string,
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
    const newBalance = currentBalance + amount;

    const [statusResult, balanceResult, copyResult] = await Promise.all([
      supabase
        .from("deposits")
        .update({ status: "approved" })
        .eq("id", depositId),
      supabase
        .from("profiles")
        .update({ balance: newBalance })
        .eq("id", userId),
      supabase
        .from("user_copy_trading")
        .update({ original_deposit: newBalance })
        .eq("user_id", userId)
        .eq("is_copying", true),
    ]);

    if (statusResult.error) return { error: statusResult.error.message };
    if (balanceResult.error) return { error: balanceResult.error.message };
    if (copyResult.error) return { error: copyResult.error.message };

    revalidatePath("/admin/deposits");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function rejectDeposit(
  depositId: string,
  userId: string,
  amount: number
): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("deposits")
      .update({ status: "rejected" })
      .eq("id", depositId);

    if (error) return { error: error.message };

    await supabase.from("notifications").insert({
      user_id: userId,
      type: "deposit_rejected",
      message: `Your deposit of $${Number(amount).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} was rejected. Please contact support if you have questions.`,
    });

    revalidatePath("/admin/deposits");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}
