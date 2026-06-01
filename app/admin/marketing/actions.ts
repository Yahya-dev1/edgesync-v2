"use server";

import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const COLORS = ["green", "blue", "amber", "purple"] as const;

// ─── Name generation via Claude ───────────────────────────────────

async function fetchNames(): Promise<string[]> {
  const client = new Anthropic();

  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `Generate exactly 5 authentic Kenyan full names and 5 authentic Somali full names for fictional trader profiles.

Rules:
- Kenyan names must only use real Kenyan given names and Kenyan surnames (Kikuyu, Luo, Kalenjin, Kamba, Luhya, Meru, etc.)
- Somali names must only use real Somali given names and Somali family names
- Each name must be fully from its own nationality — no mixing
- All 10 names must be distinct
- Return ONLY a raw JSON object, no markdown, no explanation

Format: {"kenyan":["Full Name","Full Name","Full Name","Full Name","Full Name"],"somali":["Full Name","Full Name","Full Name","Full Name","Full Name"]}`,
      },
    ],
  });

  const raw =
    msg.content[0].type === "text" ? msg.content[0].text.trim() : "{}";
  const json = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? "{}") as {
    kenyan?: string[];
    somali?: string[];
  };

  const kenyan = (json.kenyan ?? []).slice(0, 5);
  const somali = (json.somali ?? []).slice(0, 5);

  // Interleave so both nationalities appear across both P&L tiers
  // Result order: k0,s0,k1,s1,k2,s2,k3,s3,k4,s4
  return kenyan.flatMap((k, i) => [k, somali[i] ?? k]);
}

// ─── P&L helpers ─────────────────────────────────────────────────

function bigPnl() {
  return Math.round((Math.random() * 19000 + 1000) * 100) / 100;
}

function normalPnl() {
  return Math.round((Math.random() * 550 - 50) * 100) / 100;
}

// ─── Generate action ─────────────────────────────────────────────

export async function generateMarketingAccounts(): Promise<{ error?: string }> {
  try {
    const [names, supabase] = await Promise.all([
      fetchNames(),
      Promise.resolve(createAdminClient()),
    ]);

    await supabase.from("marketing_accounts").delete().not("id", "is", null);

    const accounts = names.map((fullName, i) => {
      const parts    = fullName.trim().split(/\s+/);
      const initials = ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
      const isBig    = i % 2 === 0; // even index → big P&L, odd → normal
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
