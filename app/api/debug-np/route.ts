import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.NOWPAYMENTS_API_KEY ?? "";
  const res = await fetch(
    "https://api.nowpayments.io/v1/min-amount?currency_from=usd&currency_to=usdttrc20",
    { headers: { "x-api-key": key } }
  );
  const body = await res.json();
  return NextResponse.json({
    status: res.status,
    key_present: key.length > 0,
    key_preview: key ? `${key.slice(0, 4)}...${key.slice(-4)}` : "MISSING",
    nowpayments_response: body,
  });
}
