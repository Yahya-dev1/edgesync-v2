"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// ─── Name pools ───────────────────────────────────────────────────

const SOMALI_FIRST = [
  "Abdi", "Farah", "Hodan", "Ifrah", "Liban", "Nimo", "Saado", "Xamdi",
  "Yusuf", "Faadumo", "Bile", "Deeqa", "Fowsia", "Guled", "Hibo", "Idiris",
  "Khadar", "Luul", "Mahad", "Nasra", "Osman", "Qali", "Rahma", "Sahra",
  "Timiro", "Ubah", "Warsan", "Xasan", "Zahra", "Aamina", "Barkhad", "Cawo",
  "Dalmar", "Ebyan", "Feisal", "Gacalo", "Hamdi", "Ilays", "Jama", "Kiin",
];

const SOMALI_LAST = [
  "Abdi", "Ahmed", "Ali", "Bashir", "Duale", "Elmi", "Farah", "Garad",
  "Hassan", "Ibrahim", "Jama", "Khalif", "Liban", "Mohamed", "Noor", "Omar",
  "Qasim", "Rage", "Salah", "Warsame", "Xirsi", "Yusuf", "Adan", "Barre",
  "Diriye", "Egal", "Hirsi", "Ismail", "Jirdeh", "Khayre", "Muse", "Nur",
  "Roble", "Sheikh", "Waris",
];

const KENYAN_FIRST = [
  "Wanjiru", "Kamau", "Akinyi", "Otieno", "Wambui", "Kipchoge", "Zawadi",
  "Baraka", "Imani", "Makena", "Njoroge", "Adhiambo", "Chebet", "Mutua",
  "Wangari", "Odhiambo", "Nyambura", "Kariuki", "Awino", "Muthoni",
  "Kipkoech", "Zuri", "Amani", "Nduta", "Ochieng", "Waweru", "Jelimo",
  "Kimani", "Auma", "Ng'ang'a",
];

const KENYAN_LAST = [
  "Kamau", "Otieno", "Waweru", "Mwangi", "Njoroge", "Odhiambo", "Kariuki",
  "Mutua", "Kimani", "Achieng", "Koech", "Wangari", "Omondi", "Njenga",
  "Kipchoge", "Mugo", "Owino", "Gathoni", "Ndungu", "Chege",
];

// ─── Helpers ─────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function bigPnl() {
  return Math.round((Math.random() * 19000 + 1000) * 100) / 100;
}

function normalPnl() {
  return Math.round((Math.random() * 550 - 50) * 100) / 100;
}

const COLORS = ["green", "blue", "amber", "purple"] as const;

// ─── Generate action ─────────────────────────────────────────────

export async function generateMarketingAccounts(): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();

    await supabase.from("marketing_accounts").delete().not("id", "is", null);

    const accounts = Array.from({ length: 10 }, (_, i) => {
      // Randomly pick nationality for this account — never mixed
      const isSomali   = Math.random() < 0.5;
      const firstName  = isSomali ? pick(SOMALI_FIRST) : pick(KENYAN_FIRST);
      const lastName   = isSomali ? pick(SOMALI_LAST)  : pick(KENYAN_LAST);
      const fullName   = `${firstName} ${lastName}`;
      const initials   = `${firstName[0]}${lastName[0]}`.toUpperCase();

      // Even indices → big P&L, odd → normal
      const isBig      = i % 2 === 0;
      const tradeCount = Math.floor(Math.random() * 3) + 1;

      const trades = Array.from({ length: tradeCount }, () => ({
        symbol:     "XAUUSD",
        direction:  Math.random() < 0.5 ? "BUY" : "SELL",
        pnl_amount: isBig ? bigPnl() : normalPnl(),
      }));

      const total_pnl =
        Math.round(trades.reduce((s, t) => s + t.pnl_amount, 0) * 100) / 100;

      return {
        full_name:    fullName,
        initials,
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
