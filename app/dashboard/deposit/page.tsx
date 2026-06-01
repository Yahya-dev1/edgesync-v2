"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
  Copy,
  Check,
  CheckCircle,
  Loader2,
  AlertTriangle,
  ChevronRight,
  ArrowLeft,
  Clock,
  Percent,
  ArrowUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────

type Step = "method" | "amount" | "payment" | "success";

interface PaymentInfo {
  payment_id: string;
  pay_address: string;
  pay_amount: string;
  pay_currency: string;
}

// ─── Payment method icons ─────────────────────────────────────────

function UsdtIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill="#00C896" fillOpacity="0.12" />
      <circle cx="20" cy="20" r="19.5" stroke="#00C896" strokeOpacity="0.35" />
      <text
        x="20" y="21" dominantBaseline="middle" textAnchor="middle"
        fill="#00C896" fontSize="18" fontWeight="700" fontFamily="system-ui, sans-serif"
      >
        ₮
      </text>
    </svg>
  );
}

function BitcoinIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill="#F7931A" fillOpacity="0.12" />
      <circle cx="20" cy="20" r="19.5" stroke="#F7931A" strokeOpacity="0.3" />
      <text
        x="20" y="21" dominantBaseline="middle" textAnchor="middle"
        fill="#F7931A" fontSize="16" fontWeight="700" fontFamily="system-ui, sans-serif"
      >
        ₿
      </text>
    </svg>
  );
}

function EthereumIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill="#627EEA" fillOpacity="0.12" />
      <circle cx="20" cy="20" r="19.5" stroke="#627EEA" strokeOpacity="0.3" />
      {/* Ethereum diamond */}
      <path d="M20 11.5L13.5 20.2L20 23.8L26.5 20.2L20 11.5Z" fill="#627EEA" fillOpacity="0.65" />
      <path d="M13.5 21.5L20 28.5L26.5 21.5L20 25.2L13.5 21.5Z" fill="#627EEA" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill="#64748B" fillOpacity="0.10" />
      <circle cx="20" cy="20" r="19.5" stroke="#64748B" strokeOpacity="0.25" />
      <rect x="11" y="15" width="18" height="12" rx="2" stroke="#64748B" strokeWidth="1.4" />
      <line x1="11" y1="19.5" x2="29" y2="19.5" stroke="#64748B" strokeWidth="1.4" />
      <rect x="13.5" y="22" width="5" height="2" rx="0.75" fill="#64748B" />
    </svg>
  );
}

function WireIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill="#64748B" fillOpacity="0.10" />
      <circle cx="20" cy="20" r="19.5" stroke="#64748B" strokeOpacity="0.25" />
      {/* Bank columns */}
      <path d="M20 12L12 16h16L20 12Z" fill="#64748B" fillOpacity="0.5" />
      <rect x="12" y="16" width="16" height="1.5" rx="0.5" fill="#64748B" />
      <rect x="13.5" y="18.5" width="2" height="6" rx="0.5" fill="#64748B" fillOpacity="0.7" />
      <rect x="19" y="18.5" width="2" height="6" rx="0.5" fill="#64748B" fillOpacity="0.7" />
      <rect x="24.5" y="18.5" width="2" height="6" rx="0.5" fill="#64748B" fillOpacity="0.7" />
      <rect x="12" y="25.5" width="16" height="1.5" rx="0.5" fill="#64748B" />
    </svg>
  );
}

// ─── Payment method definitions ───────────────────────────────────

interface Method {
  id: string;
  name: string;
  badge: string;
  badgeVariant: "recommended" | "maintenance";
  processingTime: string;
  fee: string;
  min: string;
  max: string;
  enabled: boolean;
  Icon: React.ComponentType;
}

const METHODS: Method[] = [
  {
    id: "usdt_trc20",
    name: "Tether (USDT TRC20)",
    badge: "Recommended",
    badgeVariant: "recommended",
    processingTime: "Instant – 15 min",
    fee: "0%",
    min: "$10",
    max: "$200,000",
    enabled: true,
    Icon: UsdtIcon,
  },
  {
    id: "bank_card",
    name: "Bank Card",
    badge: "Under Maintenance",
    badgeVariant: "maintenance",
    processingTime: "1–3 business days",
    fee: "2.5%",
    min: "$50",
    max: "$10,000",
    enabled: false,
    Icon: CardIcon,
  },
  {
    id: "bitcoin",
    name: "Bitcoin (BTC)",
    badge: "Under Maintenance",
    badgeVariant: "maintenance",
    processingTime: "10–60 min",
    fee: "0%",
    min: "$10",
    max: "$500,000",
    enabled: false,
    Icon: BitcoinIcon,
  },
  {
    id: "ethereum",
    name: "Ethereum (ETH)",
    badge: "Under Maintenance",
    badgeVariant: "maintenance",
    processingTime: "2–10 min",
    fee: "0%",
    min: "$10",
    max: "$500,000",
    enabled: false,
    Icon: EthereumIcon,
  },
  {
    id: "wire",
    name: "Wire Transfer",
    badge: "Under Maintenance",
    badgeVariant: "maintenance",
    processingTime: "2–5 business days",
    fee: "0%",
    min: "$1,000",
    max: "$1,000,000",
    enabled: false,
    Icon: WireIcon,
  },
];

// ─── Method selection step ────────────────────────────────────────

function MethodStep({ onSelect }: { onSelect: () => void }) {
  return (
    <div className="max-w-xl mx-auto pt-4">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-foreground">Deposit Funds</h1>
        <p className="text-base text-muted-foreground mt-1">
          Select a payment method to fund your trading account.
        </p>
      </div>

      {/* Method cards */}
      <div className="flex flex-col gap-2.5">
        {METHODS.map((method) => (
          <button
            key={method.id}
            onClick={() => method.enabled && onSelect()}
            disabled={!method.enabled}
            className={cn(
              "w-full text-left rounded-xl bg-surface transition-colors duration-150",
              "flex items-center gap-4 px-4 py-4",
              method.enabled
                ? "hover:bg-overlay cursor-pointer group"
                : "cursor-not-allowed opacity-50"
            )}
            style={{ border: "0.5px solid var(--surface-border)" }}
          >
            {/* Icon */}
            <div className="flex-shrink-0">
              <method.Icon />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              {/* Name + badge row */}
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-sm font-semibold text-foreground leading-tight">
                  {method.name}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full leading-tight",
                    method.badgeVariant === "recommended"
                      ? "bg-primary/10 text-primary"
                      : "bg-orange-500/10 text-orange-400"
                  )}
                >
                  {method.badge}
                </span>
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  {method.processingTime}
                </span>
                <span className="text-muted-foreground/40">·</span>
                <span className="flex items-center gap-1">
                  <Percent className="w-3 h-3 flex-shrink-0" />
                  {method.fee} fee
                </span>
                <span className="text-muted-foreground/40">·</span>
                <span className="flex items-center gap-1">
                  <ArrowUpDown className="w-3 h-3 flex-shrink-0" />
                  {method.min} – {method.max}
                </span>
              </div>
            </div>

            {/* Arrow — only on enabled */}
            {method.enabled && (
              <ChevronRight
                className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0"
              />
            )}
          </button>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-xs text-muted-foreground text-center mt-6 leading-relaxed">
        All deposits are processed securely. Funds are credited after network confirmation.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────

export default function DepositPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("method");
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
    if (num > 200_000) {
      setError("Maximum deposit amount is $200,000.");
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

  // ── Step: method selection ─────────────────────────────────────

  if (step === "method") {
    return <MethodStep onSelect={() => setStep("amount")} />;
  }

  // ── Step: success ──────────────────────────────────────────────

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

  // ── Step: payment instructions ─────────────────────────────────

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
              Only send <strong>USDT on the TRC20 network</strong>. Sending any other asset or
              network will result in permanent loss of funds.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Step: amount entry ─────────────────────────────────────────

  return (
    <div className="max-w-md mx-auto pt-4">
      {/* Back to method selection */}
      <button
        onClick={() => { setStep("method"); setAmount(""); setError(""); }}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Change method
      </button>

      {/* Selected method indicator */}
      <div className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl bg-surface"
        style={{ border: "0.5px solid var(--surface-border)" }}
      >
        <UsdtIcon />
        <div>
          <p className="text-sm font-semibold text-foreground">Tether (USDT TRC20)</p>
          <p className="text-xs text-muted-foreground mt-0.5">Instant – 15 min · 0% fee · $10 – $200,000</p>
        </div>
        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
          Recommended
        </span>
      </div>

      <div className="mb-5">
        <h1 className="text-2xl font-bold text-foreground">Enter Amount</h1>
        <p className="text-base text-muted-foreground mt-1">
          How much would you like to deposit?
        </p>
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
              min="10"
              max="200000"
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
            <p className="text-sm text-red-400 mt-1.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1.5">
            Minimum $10 · Maximum $200,000
          </p>
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
