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
  if (!amount || amount < 100) {
    return NextResponse.json({ error: "Minimum deposit is $100." }, { status: 400 });
  }

  const API_KEY = process.env.NOWPAYMENTS_API_KEY!;
  const NP_BASE = "https://api.nowpayments.io/v1";

  // Check NOWPayments minimum before attempting payment creation
  try {
    const minRes = await fetch(
      `${NP_BASE}/min-amount?currency_from=usd&currency_to=usdttrc20`,
      { headers: { "x-api-key": API_KEY } }
    );
    if (minRes.ok) {
      const minData = await minRes.json();
      const minAmount = Number(minData.min_amount);
      if (amount < minAmount) {
        return NextResponse.json(
          { error: `Minimum deposit is $${minAmount.toFixed(2)}` },
          { status: 400 }
        );
      }
    }
  } catch {
    // Non-fatal — let the main payment call surface any key/config errors
  }

  const orderId = `${user.id}-${Date.now()}`;

  const npRes = await fetch(`${NP_BASE}/payment`, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      price_amount: amount,
      price_currency: "usd",
      pay_currency: "usdttrc20",
      order_id: orderId,
      order_description: "EdgeSync deposit",
      is_fixed_rate: true,
      is_fee_paid_by_user: false,
    }),
  });

  if (!npRes.ok) {
    const errText = await npRes.text();
    console.error("NOWPayments error", npRes.status, errText);
    let errMessage = "Payment provider error";
    try {
      const errJson = JSON.parse(errText);
      errMessage = errJson.message ?? errJson.code ?? errMessage;
    } catch { /* not JSON */ }
    return NextResponse.json(
      { error: errMessage, _debug: errText },
      { status: 502 }
    );
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
