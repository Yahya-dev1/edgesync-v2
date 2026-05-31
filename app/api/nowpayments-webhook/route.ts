import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS; SUPABASE_SERVICE_ROLE_KEY must be set in env
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const signature = req.headers.get("x-nowpayments-sig");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // NOWPayments signs the sorted JSON body with HMAC-SHA512
  const expected = crypto
    .createHmac("sha512", process.env.NOWPAYMENTS_IPN_SECRET!)
    .update(sortedJsonBody(rawBody))
    .digest("hex");

  if (expected !== signature) {
    console.warn("Webhook signature mismatch");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const { payment_id, payment_status, price_amount } = payload;

  if (payment_status !== "finished" && payment_status !== "confirmed") {
    return NextResponse.json({ ok: true });
  }

  const supabase = adminClient();

  const { data: deposit, error: fetchError } = await supabase
    .from("deposits")
    .select("id, user_id, amount, status")
    .eq("nowpayments_payment_id", String(payment_id))
    .single();

  if (fetchError || !deposit) {
    console.error("Deposit not found:", payment_id, fetchError);
    return NextResponse.json({ error: "Deposit not found" }, { status: 404 });
  }

  // Idempotency — skip if already approved
  if (deposit.status === "approved") {
    return NextResponse.json({ ok: true });
  }

  await supabase
    .from("deposits")
    .update({ status: "approved", updated_at: new Date().toISOString() })
    .eq("id", deposit.id);

  const creditAmount = Number(price_amount ?? deposit.amount);

  // Atomic balance increment via RPC
  await supabase.rpc("increment_balance", {
    p_user_id: deposit.user_id,
    p_amount: creditAmount,
  });

  return NextResponse.json({ ok: true });
}

function sortedJsonBody(raw: string): string {
  const parsed = JSON.parse(raw);
  const sorted = Object.fromEntries(
    Object.keys(parsed)
      .sort()
      .map((k) => [k, parsed[k]])
  );
  return JSON.stringify(sorted);
}
