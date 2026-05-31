import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const amount = Number(body.amount);
  if (!amount || amount < 10) {
    return NextResponse.json({ error: "Minimum deposit is $10" }, { status: 400 });
  }

  const orderId = `${user.id}-${Date.now()}`;

  const npRes = await fetch("https://api.nowpayments.io/v1/payment", {
    method: "POST",
    headers: {
      "x-api-key": process.env.NOWPAYMENTS_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pay_currency: "usdttrc20",
      price_amount: amount,
      price_currency: "usd",
      order_id: orderId,
      order_description: "EdgeSync deposit",
    }),
  });

  if (!npRes.ok) {
    const err = await npRes.text();
    console.error("NOWPayments error:", err);
    return NextResponse.json({ error: "Payment provider error" }, { status: 502 });
  }

  const payment = await npRes.json();
  const { payment_id, pay_address, pay_amount, pay_currency } = payment;

  const { error: dbError } = await supabase.from("deposits").insert({
    user_id: user.id,
    amount,
    status: "pending",
    method: "USDT TRC20",
    nowpayments_payment_id: String(payment_id),
  });

  if (dbError) {
    console.error("DB insert error:", dbError);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({ payment_id, pay_address, pay_amount, pay_currency });
}
