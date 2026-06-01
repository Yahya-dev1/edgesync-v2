"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// Kenyan first names (Kikuyu, Luo, Kalenjin, Kamba, Luhya)
const KENYAN_FIRST = [
  "Wanjiru", "Kamau", "Njeri", "Akinyi", "Otieno",
  "Wanjiku", "Adhiambo", "Muthoni", "Chebet", "Ochieng",
  "Nyambura", "Kimani", "Kipchoge", "Auma", "Waweru",
];

// Somali first names
const SOMALI_FIRST = [
  "Fadumo", "Hodan", "Ilhan", "Faisal", "Sagal",
  "Deeqa", "Ayan", "Fartuun", "Najma", "Haybe",
  "Ifrah", "Hamdi", "Zahra", "Mahad", "Abdi",
];

// Kenyan surnames
const KENYAN_LAST = [
  "Kamau", "Mwangi", "Njoroge", "Otieno", "Ochieng",
  "Waweru", "Kariuki", "Mutua", "Kiprotich", "Wambua",
  "Ndungu", "Njenga", "Kimani", "Koech", "Rotich",
];

// Somali surnames
const SOMALI_LAST = [
  "Hassan", "Osman", "Farah", "Jama", "Warsame",
  "Nur", "Hirsi", "Omar", "Aden", "Ibrahim",
  "Mohamud", "Salah", "Ahmed", "Ali", "Abdi",
];

const FIRST_NAMES = [...KENYAN_FIRST, ...SOMALI_FIRST];
const LAST_NAMES  = [...KENYAN_LAST,  ...SOMALI_LAST];

const COLORS = ["green", "blue", "amber", "purple"] as const;

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Normal accounts: -$50 to +$500
function normalPnl(): number {
  return Math.round((Math.random() * 550 - 50) * 100) / 100;
}

// Big accounts: +$1,000 to +$20,000 (always positive — these are the star traders)
function bigPnl(): number {
  return Math.round((Math.random() * 19000 + 1000) * 100) / 100;
}

export async function generateMarketingAccounts(): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();

    // Delete all existing rows
    await supabase.from("marketing_accounts").delete().not("id", "is", null);

    // Indices 0-4 → big P&L, indices 5-9 → normal P&L
    const accounts = Array.from({ length: 10 }, (_, i) => {
      const isBig = i < 5;
      const firstName = pick(FIRST_NAMES);
      const lastName  = pick(LAST_NAMES);
      const tradeCount = Math.floor(Math.random() * 3) + 1; // 1-3
      const trades = Array.from({ length: tradeCount }, () => ({
        symbol:     "XAUUSD",
        direction:  Math.random() < 0.5 ? "BUY" : "SELL",
        pnl_amount: isBig ? bigPnl() : normalPnl(),
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
