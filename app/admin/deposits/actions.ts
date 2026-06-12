"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// USDT TRC20 addresses are Base58, start with 'T', and are exactly 34 chars.
const TRC20_ADDRESS_RE = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;

export async function saveDepositWalletAddress(address: string): Promise<{ error?: string }> {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth;

    const trimmed = address.trim();
    if (!TRC20_ADDRESS_RE.test(trimmed)) {
      return { error: "Enter a valid USDT TRC20 address (starts with T, 34 characters)." };
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("platform_settings")
      .upsert({ key: "deposit_wallet_address", value: trimmed }, { onConflict: "key" });

    if (error) return { error: error.message };

    revalidatePath("/admin/deposits");
    revalidatePath("/dashboard/deposit");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function approveDeposit(
  depositId: string,
  userId: string,
  amount: number
): Promise<{ error?: string }> {
  const auth = await requireAdmin();
  if (auth.error) return auth;
  try {
    const supabase = createAdminClient();

    const [{ data: profile, error: fetchError }, { data: copyRow }] = await Promise.all([
      supabase.from("profiles").select("balance").eq("id", userId).single(),
      supabase
        .from("user_copy_trading")
        .select("deposit_base")
        .eq("user_id", userId)
        .eq("is_copying", true)
        .maybeSingle(),
    ]);

    if (fetchError) return { error: fetchError.message };

    const currentBalance = (profile?.balance as number) ?? 0;
    const newBalance = currentBalance + amount;

    // A deposit raises the user's true principal, so trade-delete rebuilds (which
    // recompound from deposit_base) stay correct after the deposit.
    const copyUpdate: { original_deposit: number; deposit_base?: number } = {
      original_deposit: newBalance,
    };
    if (copyRow) copyUpdate.deposit_base = Number(copyRow.deposit_base ?? 0) + amount;

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
        .update(copyUpdate)
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
  const auth = await requireAdmin();
  if (auth.error) return auth;
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
