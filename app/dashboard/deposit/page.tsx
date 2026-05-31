"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, CheckCircle, Loader2, AlertTriangle } from "lucide-react";

type Step = "amount" | "payment" | "success";

interface PaymentInfo {
  payment_id: string;
  pay_address: string;
  pay_amount: string;
  pay_currency: string;
}

export default function DepositPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>("waiting");

  // Poll payment status every 10 seconds
  const pollStatus = useCallback(async (paymentId: string) => {
    try {
      const res = await fetch(`/api/payment-status?payment_id=${paymentId}`);
      if (!res.ok) return;
      const data = await res.json();
      setPaymentStatus(data.payment_status ?? "waiting");
      if (data.payment_status === "finished" || data.payment_status === "confirmed") {
        setStep("success");
      }
    } catch {
      // ignore poll errors
    }
  }, []);

  useEffect(() => {
    if (step !== "payment" || !payment) return;
    const id = setInterval(() => pollStatus(payment.payment_id), 10_000);
    return () => clearInterval(id);
  }, [step, payment, pollStatus]);

  async function handleContinue() {
    const num = parseFloat(amount);
    if (!num || num < 10) {
      setError("Minimum deposit amount is $10.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: num }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setPayment(data);
      setStep("payment");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopyAddress() {
    if (!payment) return;
    navigator.clipboard.writeText(payment.pay_address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const statusLabel: Record<string, string> = {
    waiting: "Awaiting payment…",
    confirming: "Confirming transaction…",
    confirmed: "Confirmed!",
    finished: "Finished!",
    failed: "Failed",
    expired: "Expired",
  };

  if (step === "success") {
    return (
      <div className="max-w-md mx-auto pt-8">
        <div className="rounded-xl border border-[#162035] bg-[#0b1120] p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[#00C896]/10 flex items-center justify-center mb-5">
            <CheckCircle className="w-8 h-8 text-[#00C896]" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Deposit Confirmed!</h2>
          <p className="text-sm text-slate-400 mb-8">Your balance has been updated.</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-3 rounded-lg text-sm font-semibold bg-[#00C896] text-[#080d1a] hover:bg-[#00b084] transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (step === "payment" && payment) {
    return (
      <div className="max-w-md mx-auto pt-4">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-white">Complete Payment</h1>
          <p className="text-sm text-slate-500 mt-1">Send USDT to the address below.</p>
        </div>

        <div className="rounded-xl border border-[#162035] bg-[#0b1120] p-6 space-y-6">
          {/* Network badge */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-400">Network:</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#00C896]/10 text-[#00C896] border border-[#00C896]/20">
              USDT TRC20
            </span>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="p-3 bg-white rounded-xl inline-block">
              <QRCodeSVG
                value={payment.pay_address}
                size={180}
                bgColor="#ffffff"
                fgColor="#000000"
                level="M"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <p className="text-xs text-slate-500 mb-1.5 font-medium">Wallet Address</p>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/[0.03] border border-[#162035]">
              <span className="flex-1 text-xs font-mono text-slate-200 break-all leading-relaxed">
                {payment.pay_address}
              </span>
              <button
                onClick={handleCopyAddress}
                className="flex-shrink-0 p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Copy address"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-[#00C896]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            {copied && (
              <p className="text-xs text-[#00C896] mt-1">Address copied!</p>
            )}
          </div>

          {/* Amount to send */}
          <div>
            <p className="text-xs text-slate-500 mb-1.5 font-medium">Amount to Send</p>
            <p className="text-lg font-bold text-white">
              {payment.pay_amount}{" "}
              <span className="text-sm font-medium text-slate-400 uppercase">
                {payment.pay_currency}
              </span>
            </p>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-white/[0.03] border border-[#162035]">
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                paymentStatus === "waiting"
                  ? "bg-amber-400 animate-pulse"
                  : paymentStatus === "confirming"
                  ? "bg-blue-400 animate-pulse"
                  : "bg-[#00C896]"
              }`}
            />
            <span className="text-xs text-slate-300">
              {statusLabel[paymentStatus] ?? paymentStatus}
            </span>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <p className="text-xs text-amber-300 leading-relaxed">
              Only send <strong>USDT on the TRC20 network</strong>. Sending any other asset or network
              will result in permanent loss of funds.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Step 1 — Amount
  return (
    <div className="max-w-md mx-auto pt-4">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-white">Deposit Funds</h1>
        <p className="text-sm text-slate-500 mt-1">Add funds to your trading account via USDT TRC20.</p>
      </div>

      <div className="rounded-xl border border-[#162035] bg-[#0b1120] p-6 space-y-5">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Amount (USD)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
              $
            </span>
            <input
              type="number"
              min="10"
              step="1"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleContinue()}
              placeholder="0.00"
              className="w-full bg-white/[0.04] border border-[#162035] rounded-lg pl-8 pr-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#00C896]/50 focus:bg-white/[0.06] transition-colors"
            />
          </div>
          {error && (
            <p className="text-xs text-red-400 mt-1.5">{error}</p>
          )}
          <p className="text-xs text-slate-600 mt-1.5">Minimum deposit: $10</p>
        </div>

        {/* Quick amount buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[50, 100, 250, 500].map((preset) => (
            <button
              key={preset}
              onClick={() => { setAmount(String(preset)); setError(""); }}
              className="py-2 rounded-lg text-xs font-semibold border border-[#162035] text-slate-300 hover:border-[#00C896]/40 hover:text-[#00C896] hover:bg-[#00C896]/5 transition-colors"
            >
              ${preset}
            </button>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={loading || !amount}
          className="w-full py-3 rounded-lg text-sm font-semibold bg-[#00C896] text-[#080d1a] hover:bg-[#00b084] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating address…
            </>
          ) : (
            "Continue"
          )}
        </button>

        <p className="text-xs text-slate-600 text-center">
          Deposits are credited after 1 network confirmation.
        </p>
      </div>
    </div>
  );
}
