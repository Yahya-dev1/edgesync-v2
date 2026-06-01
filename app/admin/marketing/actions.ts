"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const FIRST_NAMES = [
  "Kofi", "Amara", "Fatima", "Omar", "Hassan",
  "Yusuf", "Aisha", "Tariq", "Moussa", "Kwame",
  "Nadia", "Ibrahim", "Rania", "Ahmed", "Layla",
  "Abena", "Chidi", "Zara", "Malik", "Sana",
];

const LAST_NAMES = [
  "Osei", "Mensah", "Diallo", "Kamara", "Al-Rashid",
  "Mansour", "Khalil", "Traore", "Asante", "Haddad",
  "Boateng", "Sesay", "Farouk", "Nkrumah", "Al-Hassan",
  "Owusu", "Qasim", "Conteh", "Nasser", "Bah",
];

const COLORS = ["green", "blue", "amber", "purple"] as const;

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPnl(): number {
  // -50 to +500, rounded to 2 dp
  return Math.round((Math.random() * 550 - 50) * 100) / 100;
}

export async function generateMarketingAccounts(): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();

    // Delete all existing rows
    await supabase.from("marketing_accounts").delete().not("id", "is", null);

    const accounts = Array.from({ length: 10 }, (_, i) => {
      const firstName = pick(FIRST_NAMES);
      const lastName  = pick(LAST_NAMES);
      const tradeCount = Math.floor(Math.random() * 3) + 1; // 1-3
      const trades = Array.from({ length: tradeCount }, () => ({
        symbol:     "XAUUSD",
        direction:  Math.random() < 0.5 ? "BUY" : "SELL",
        pnl_amount: randomPnl(),
      }));
      const total_pnl =
        Math.round(trades.reduce((s, t) => s + t.pnl_amount, 0) * 100) / 100;

      return {
        full_name:    `${firstName} ${lastName}`,
        initials:     `${firstName[0]}${lastName[0]}`,
        avatar_color: COLORS[i % COLORS.length],
        trades,
        total_pnl,
      };
    });

    const { error } = await supabase.from("marketing_accounts").insert(accounts);
    if (error) return { error: error.message };

    revalidatePath("/admin/marketing");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}
