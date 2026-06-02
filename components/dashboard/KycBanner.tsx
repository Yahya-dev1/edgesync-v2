"use client";

import { useState } from "react";
import Link from "next/link";
import { X, ShieldAlert } from "lucide-react";

export default function KycBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 bg-primary/10"
      style={{ border: "0.5px solid color-mix(in srgb, var(--primary) 30%, transparent)" }}
    >
      <ShieldAlert className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={1.5} />
      <p className="flex-1 text-sm text-foreground">
        Complete your identity verification to unlock full platform features.
      </p>
      <Link
        href="/dashboard/settings#kyc"
        className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors whitespace-nowrap"
      >
        Verify Now
      </Link>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
