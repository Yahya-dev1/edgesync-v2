import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const paymentId = req.nextUrl.searchParams.get("payment_id");
  if (!paymentId) {
    return NextResponse.json({ error: "Missing payment_id" }, { status: 400 });
  }

  const res = await fetch(
    `https://api.nowpayments.io/v1/payment/${paymentId}`,
    {
      headers: { "x-api-key": process.env.NOWPAYMENTS_API_KEY! },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Provider error" }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json({ payment_status: data.payment_status });
}
