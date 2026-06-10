"use client";

import { useState, useRef, useEffect } from "react";
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
  Upload,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// ─── Wallet address ───────────────────────────────────────────────
// The live address comes from platform_settings (key 'deposit_wallet_address')
// and is fetched at runtime. This is only the fallback shown until it loads or
// if the setting is somehow missing.

const FALLBACK_USDT_TRC20_ADDRESS = "TDAHiiJJFSarDNQpos63qSfLd9sr2QYyd5";

// ─── Types ────────────────────────────────────────────────────────

type Step = "method" | "amount" | "payment" | "screenshot" | "success";

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
    processingTime: "1–2 hours",
    fee: "0%",
    min: "$20",
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
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-foreground">Deposit Funds</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select a payment method to fund your trading account.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {METHODS.map((method) => (
          <button
            key={method.id}
            onClick={() => method.enabled && onSelect()}
            className={cn(
              "w-full text-left rounded-xl border bg-card transition-colors duration-150",
              "flex items-center gap-4 px-4 py-4",
              method.enabled
                ? "border-border hover:border-primary/25 hover:bg-overlay cursor-pointer group"
                : "border-border cursor-not-allowed opacity-60"
            )}
          >
            <div className="flex-shrink-0">
              <method.Icon />
            </div>

            <div className="flex-1 min-w-0">
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

            {method.enabled && (
              <ChevronRight
                className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0"
              />
            )}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-6 leading-relaxed">
        All deposits are reviewed by our team and credited within 1–2 hours.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────

export default function DepositPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("method");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [walletAddress, setWalletAddress] = useState(FALLBACK_USDT_TRC20_ADDRESS);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadWalletAddress() {
      const supabase = createClient();
      const { data } = await supabase
        .from("platform_settings")
        .select("value")
        .eq("key", "deposit_wallet_address")
        .maybeSingle();
      if (data?.value) setWalletAddress(data.value);
    }
    loadWalletAddress();
  }, []);

  function handleContinueToPayment() {
    const num = parseFloat(amount);
    if (!num || num < 20) {
      setError("Minimum deposit amount is $20.");
      return;
    }
    if (num > 200_000) {
      setError("Maximum deposit amount is $200,000.");
      return;
    }
    setError("");
    setStep("payment");
  }

  function handleCopyAddress() {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSubmitScreenshot() {
    if (!screenshotFile) {
      setError("Please select a screenshot to upload.");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Not authenticated. Please log in and try again.");
        return;
      }

      const ext = screenshotFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const fileName = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("deposit-screenshots")
        .upload(fileName, screenshotFile, { upsert: false });

      if (uploadError) {
        setError("Failed to upload screenshot. Please try again.");
        return;
      }

      const { error: dbError } = await supabase.from("deposits").insert({
        user_id: user.id,
        amount: parseFloat(amount),
        status: "pending",
        method: "USDT TRC20",
        screenshot_url: fileName,
      });

      if (dbError) {
        setError("Failed to submit deposit request. Please try again.");
        return;
      }

      setStep("success");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  // ── Step: method selection ─────────────────────────────────────

  if (step === "method") {
    return <MethodStep onSelect={() => setStep("amount")} />;
  }

  // ── Step: success ──────────────────────────────────────────────

  if (step === "success") {
    return (
      <div className="max-w-md mx-auto pt-8">
        <div className="rounded-xl border border-border bg-card p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
            <CheckCircle className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Deposit Submitted!</h2>
          <p className="text-sm text-muted-foreground mb-1.5 leading-relaxed">
            Your deposit is under review. Admin will approve within 1–2 hours.
          </p>
          <p className="text-xs text-muted-foreground mb-8">
            You will receive a notification once your deposit is confirmed.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Step: screenshot upload ────────────────────────────────────

  if (step === "screenshot") {
    return (
      <div className="max-w-md mx-auto pt-4">
        <button
          onClick={() => { setStep("payment"); setScreenshotFile(null); setError(""); }}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to payment details
        </button>

        <div className="mb-5">
          <h1 className="text-2xl font-bold text-foreground">Upload Screenshot</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload proof of your payment to complete the deposit.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          {/* Amount reminder */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border">
            <span className="text-sm text-muted-foreground">Deposit amount</span>
            <span className="text-sm font-bold text-foreground">
              ${parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
            </span>
          </div>

          {/* File upload area */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Payment Screenshot
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "w-full rounded-xl border-2 border-dashed transition-colors p-6 flex flex-col items-center gap-3 cursor-pointer",
                screenshotFile
                  ? "border-primary/40 bg-primary/5"
                  : "border-border hover:border-primary/30 hover:bg-overlay"
              )}
            >
              {screenshotFile ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">{screenshotFile.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(screenshotFile.size / 1024).toFixed(1)} KB · Click to change
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-overlay flex items-center justify-center">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Click to upload screenshot</p>
                    <p className="text-xs text-muted-foreground mt-0.5">JPG or PNG, max 10 MB</p>
                  </div>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setScreenshotFile(file);
                setError("");
              }}
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </p>
          )}

          <button
            onClick={handleSubmitScreenshot}
            disabled={uploading || !screenshotFile}
            className="w-full py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm shadow-primary/20"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4" />
                Submit Deposit
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── Step: payment instructions ─────────────────────────────────

  if (step === "payment") {
    const displayAmount = parseFloat(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return (
      <div className="max-w-md mx-auto pt-4">
        <button
          onClick={() => { setStep("amount"); setError(""); }}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5"
        >
          <ArrowLeft className="w-4 h-4" />
          Change amount
        </button>

        <div className="mb-5">
          <h1 className="text-2xl font-bold text-foreground">Payment Instructions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Send exactly <strong className="text-foreground">${displayAmount} USDT</strong> to the address below,
            then upload your payment screenshot.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
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
                value={walletAddress}
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
            <div className="flex items-center gap-2 p-3 rounded-xl border border-border bg-background">
              <span className="flex-1 text-sm font-mono text-foreground break-all leading-relaxed">
                {walletAddress}
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

          {/* Amount */}
          <div>
            <p className="text-sm text-muted-foreground mb-1.5 font-medium">Amount to Send</p>
            <p className="text-xl font-bold text-foreground">
              {displayAmount}{" "}
              <span className="text-base font-medium text-muted-foreground">USDT</span>
            </p>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <p className="text-sm text-amber-300 leading-relaxed">
              Only send <strong>USDT on the TRC20 network</strong>. Sending any other asset or
              network will result in permanent loss of funds.
            </p>
          </div>

          <button
            onClick={() => setStep("screenshot")}
            className="w-full py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
          >
            I've Sent the Payment
          </button>
        </div>
      </div>
    );
  }

  // ── Step: amount entry ─────────────────────────────────────────

  return (
    <div className="max-w-md mx-auto pt-4">
      <button
        onClick={() => { setStep("method"); setAmount(""); setError(""); }}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Change method
      </button>

      <div className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl border border-border bg-card">
        <UsdtIcon />
        <div>
          <p className="text-sm font-semibold text-foreground">Tether (USDT TRC20)</p>
          <p className="text-xs text-muted-foreground mt-0.5">1–2 hours · 0% fee · $20 – $200,000</p>
        </div>
        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
          Recommended
        </span>
      </div>

      <div className="mb-5">
        <h1 className="text-2xl font-bold text-foreground">Enter Amount</h1>
        <p className="text-sm text-muted-foreground mt-1">How much would you like to deposit?</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Amount (USD)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
            <input
              type="number"
              min="20"
              max="200000"
              step="1"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleContinueToPayment()}
              placeholder="0.00"
              className="w-full bg-background border border-border rounded-xl pl-8 pr-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-colors"
            />
          </div>
          {error && (
            <p className="text-sm text-red-400 mt-1.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1.5">
            Minimum $20 · Maximum $200,000
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[20, 50, 100, 250].map((preset) => (
            <button
              key={preset}
              onClick={() => { setAmount(String(preset)); setError(""); }}
              className="py-2 rounded-xl text-sm font-semibold border border-border text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-colors"
            >
              ${preset}
            </button>
          ))}
        </div>

        <button
          onClick={handleContinueToPayment}
          disabled={!amount}
          className="w-full py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm shadow-primary/20"
        >
          Continue
        </button>

        <p className="text-sm text-muted-foreground text-center">
          Deposits are reviewed and credited within 1–2 hours.
        </p>
      </div>
    </div>
  );
}
