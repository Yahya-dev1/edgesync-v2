"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function assertAdmin(): Promise<{ error?: string }> {
  const authClient = await createClient();
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();
  if (authError || !user) return { error: "Unauthorized" };
  const { data: roleData } = await authClient
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();
  if (roleData?.role !== "admin") return { error: "Forbidden" };
  return {};
}

export async function approveKyc(submissionId: string): Promise<{ error?: string }> {
  const authCheck = await assertAdmin();
  if (authCheck.error) return authCheck;
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("kyc_submissions")
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .eq("id", submissionId);
    if (error) return { error: error.message };
    revalidatePath("/admin/kyc");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function rejectKyc(submissionId: string): Promise<{ error?: string }> {
  const authCheck = await assertAdmin();
  if (authCheck.error) return authCheck;
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("kyc_submissions")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", submissionId);
    if (error) return { error: error.message };
    revalidatePath("/admin/kyc");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function getDocumentUrls(
  frontPath: string,
  backPath: string
): Promise<{ frontUrl?: string; backUrl?: string; error?: string }> {
  const authCheck = await assertAdmin();
  if (authCheck.error) return authCheck;
  try {
    const supabase = createAdminClient();
    const [frontResult, backResult] = await Promise.all([
      supabase.storage.from("kyc-documents").createSignedUrl(frontPath, 120),
      supabase.storage.from("kyc-documents").createSignedUrl(backPath, 120),
    ]);
    if (frontResult.error) return { error: frontResult.error.message };
    if (backResult.error) return { error: backResult.error.message };
    return {
      frontUrl: frontResult.data.signedUrl,
      backUrl: backResult.data.signedUrl,
    };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
