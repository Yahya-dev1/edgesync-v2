"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldAlert, X, ArrowRight } from "lucide-react";

export default function KycBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 border border-primary/20 bg-primary/[0.06]">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex-shrink-0">
        <ShieldAlert className="w-4 h-4 text-primary" strokeWidth={1.5} />
      </div>
      <p className="flex-1 text-sm text-foreground">
        Complete identity verification to unlock full platform features.
      </p>
      <Link
        href="/dashboard/settings#kyc"
        className="hidden sm:flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors whitespace-nowrap"
      >
        Verify Now
        <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
      </Link>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
