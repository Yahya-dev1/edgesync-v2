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

const ARAB_FIRST = [
  "Omar", "Khalid", "Tariq", "Faisal", "Mansour", "Nasser", "Saeed", "Walid",
  "Bilal", "Hamza", "Layla", "Fatima", "Noura", "Rania", "Hessa", "Mona",
  "Dina", "Sara", "Lina", "Amira", "Yousef", "Salim", "Ziad", "Adel",
  "Karim", "Mariam", "Hind", "Ghada", "Rana", "Amal",
];

const ARAB_LAST = [
  "Al-Rashid", "Al-Farsi", "Al-Mansouri", "Al-Zaabi", "Al-Shamsi",
  "Al-Nuaimi", "Al-Maktoum", "Al-Nahyan", "Khalifa", "Hassan", "Ibrahim",
  "Saleh", "Nasser", "Qasim", "Darwish", "Saeed", "Hamdan", "Zayed",
  "Jaber", "Thani",
];

const WESTERN_FIRST = [
  "James", "Oliver", "William", "Henry", "George", "Thomas", "Charles",
  "Edward", "Alexander", "Robert", "Emma", "Charlotte", "Sophie", "Isabella",
  "Eleanor", "Victoria", "Catherine", "Alice", "Grace", "Rose", "Jack",
  "Harry", "Liam", "Noah", "Ethan", "Sophia", "Amelia", "Olivia", "Emily",
  "Hannah",
];

const WESTERN_LAST = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Taylor", "Davies",
  "Evans", "Wilson", "Thomas", "Roberts", "Hughes", "Clarke", "Turner",
  "Mitchell", "Harris", "Walker", "White", "Martin", "Thompson",
];

const ETHNICITIES = [
  { first: SOMALI_FIRST,  last: SOMALI_LAST  },
  { first: KENYAN_FIRST,  last: KENYAN_LAST  },
  { first: ARAB_FIRST,    last: ARAB_LAST    },
  { first: WESTERN_FIRST, last: WESTERN_LAST },
] as const;

// ─── Helpers ─────────────────────────────────────────────────────

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBalance() {
  return Math.round((Math.random() * 19500 + 500) * 100) / 100;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

const COLORS = ["green", "blue", "amber", "purple"] as const;

// ─── Generate action ─────────────────────────────────────────────

export async function generateMarketingAccounts(): Promise<{ error?: string }> {
  try {
    const supabase = createAdminClient();

    // Fetch today's trades and AmiinFx account size in parallel
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [{ data: todayTrades }, { data: settingsRow }] = await Promise.all([
      supabase
        .from("master_trades")
        .select("symbol, direction, pnl_percentage")
        .gte("opened_at", todayStart.toISOString()),
      supabase
        .from("platform_settings")
        .select("value")
        .eq("key", "amiinfx_account_size")
        .maybeSingle(),
    ]);

    const amiinfxAccountSize = settingsRow?.value ? Number(settingsRow.value) : null;
    const useLiveTrades =
      (todayTrades?.length ?? 0) > 0 && amiinfxAccountSize != null && amiinfxAccountSize > 0;

    await supabase.from("marketing_accounts").delete().not("id", "is", null);

    const accounts = Array.from({ length: 10 }, (_, i) => {
      const ethnicity = pick(ETHNICITIES);
      const firstName = pick(ethnicity.first);
      const lastName  = pick(ethnicity.last);
      const fullName  = `${firstName} ${lastName}`;
      const initials  = `${firstName[0]}${lastName[0]}`.toUpperCase();
      const balance   = randomBalance();

      let trades: { symbol: string; direction: string; pnl_amount: number }[];

      if (useLiveTrades) {
        trades = todayTrades!.map((t) => ({
          symbol:     t.symbol ?? "XAUUSD",
          direction:  (t.direction ?? "BUY").toUpperCase(),
          pnl_amount: round2((balance / amiinfxAccountSize!) * (t.pnl_percentage ?? 0)),
        }));
      } else {
        const tradeCount = Math.floor(Math.random() * 3) + 1;
        trades = Array.from({ length: tradeCount }, () => ({
          symbol:     "XAUUSD",
          direction:  Math.random() < 0.5 ? "BUY" : "SELL",
          pnl_amount: round2(Math.random() * 550 - 50),
        }));
      }

      const total_pnl = round2(trades.reduce((s, t) => s + t.pnl_amount, 0));

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
