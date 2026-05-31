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
    if (!num || num < 1) {
      setError("Enter a valid amount.");
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
        <div
          className="rounded-xl bg-surface p-8 flex flex-col items-center text-center"
          style={{ border: "0.5px solid var(--surface-border)" }}
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
            <CheckCircle className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Deposit Confirmed!</h2>
          <p className="text-base text-muted-foreground mb-8">Your balance has been updated.</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-3 rounded-lg text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
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
          <h1 className="text-2xl font-bold text-foreground">Complete Payment</h1>
          <p className="text-base text-muted-foreground mt-1">Send USDT to the address below.</p>
        </div>

        <div
          className="rounded-xl bg-surface p-6 space-y-6"
          style={{ border: "0.5px solid var(--surface-border)" }}
        >
          {/* Network badge */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Network:</span>
            <span className="px-2.5 py-1 rounded-full text-sm font-semibold bg-primary/10 text-primary border border-primary/20">
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
            <p className="text-sm text-muted-foreground mb-1.5 font-medium">Wallet Address</p>
            <div
              className="flex items-center gap-2 p-3 rounded-lg bg-subtle"
              style={{ border: "0.5px solid var(--surface-border)" }}
            >
              <span className="flex-1 text-sm font-mono text-foreground break-all leading-relaxed">
                {payment.pay_address}
              </span>
              <button
                onClick={handleCopyAddress}
                className="flex-shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors"
                aria-label="Copy address"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            {copied && (
              <p className="text-sm text-primary mt-1">Address copied!</p>
            )}
          </div>

          {/* Amount to send */}
          <div>
            <p className="text-sm text-muted-foreground mb-1.5 font-medium">Amount to Send</p>
            <p className="text-xl font-bold text-foreground">
              {payment.pay_amount}{" "}
              <span className="text-base font-medium text-muted-foreground uppercase">
                {payment.pay_currency}
              </span>
            </p>
          </div>

          {/* Status */}
          <div
            className="flex items-center gap-2 p-3 rounded-lg bg-subtle"
            style={{ border: "0.5px solid var(--surface-border)" }}
          >
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                paymentStatus === "waiting"
                  ? "bg-amber-400 animate-pulse"
                  : paymentStatus === "confirming"
                  ? "bg-blue-400 animate-pulse"
                  : "bg-primary"
              }`}
            />
            <span className="text-sm text-muted-foreground">
              {statusLabel[paymentStatus] ?? paymentStatus}
            </span>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <p className="text-sm text-amber-300 leading-relaxed">
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
        <h1 className="text-2xl font-bold text-foreground">Deposit Funds</h1>
        <p className="text-base text-muted-foreground mt-1">Add funds to your trading account via USDT TRC20.</p>
      </div>

      <div
        className="rounded-xl bg-surface p-6 space-y-5"
        style={{ border: "0.5px solid var(--surface-border)" }}
      >
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">
            Amount (USD)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-base font-medium">
              $
            </span>
            <input
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleContinue()}
              placeholder="0.00"
              className="w-full bg-subtle border border-border rounded-lg pl-8 pr-4 py-3 text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-overlay transition-colors"
            />
          </div>
          {error && (
            <p className="text-sm text-red-400 mt-1.5">{error}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1.5">Minimum varies by network — typically $1–5 USDT</p>
        </div>

        {/* Quick amount buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[50, 100, 250, 500].map((preset) => (
            <button
              key={preset}
              onClick={() => { setAmount(String(preset)); setError(""); }}
              className="py-2 rounded-lg text-sm font-semibold border border-border text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-colors"
            >
              ${preset}
            </button>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={loading || !amount}
          className="w-full py-3 rounded-lg text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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

        <p className="text-sm text-muted-foreground text-center">
          Deposits are credited after 1 network confirmation.
        </p>
      </div>
    </div>
  );
}
