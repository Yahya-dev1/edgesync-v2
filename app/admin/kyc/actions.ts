"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function approveKyc(
  submissionId: string,
  userId: string
): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();

    const { error: updateError } = await supabase
      .from("kyc_submissions")
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .eq("id", submissionId);

    if (updateError) return { error: updateError.message };

    const { error: notifError } = await supabase.from("notifications").insert({
      user_id: userId,
      type: "kyc_approved",
      message: "Your identity verification has been approved.",
    });

    if (notifError) return { error: notifError.message };

    revalidatePath("/admin/kyc");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function rejectKyc(
  submissionId: string,
  userId: string
): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();

    const { error: updateError } = await supabase
      .from("kyc_submissions")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", submissionId);

    if (updateError) return { error: updateError.message };

    const { error: notifError } = await supabase.from("notifications").insert({
      user_id: userId,
      type: "kyc_rejected",
      message:
        "Your identity verification was rejected. Please resubmit with clearer documents.",
    });

    if (notifError) return { error: notifError.message };

    revalidatePath("/admin/kyc");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}
