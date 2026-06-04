"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, User, X, Wrench, CheckCircle2 } from "lucide-react";

const copyFeatures = [
  "Real-time trade mirroring",
  "Verified expert traders only",
  "Adjustable copy amounts",
  "Auto-stop loss protection",
  "Transparent performance stats",
];

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border border-amber-500/20 bg-card text-foreground shadow-xl shadow-black/20">
      <Wrench className="w-4 h-4 text-amber-400 flex-shrink-0" strokeWidth={1.5} />
      <span className="text-sm text-muted-foreground">{message}</span>
      <button
        onClick={onClose}
        className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function TradingOptions() {
  const [toast, setToast] = useState(false);

  const showToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 3500);
  };

  return (
    <section id="trading-options" className="py-24 px-4 sm:px-6 lg:px-8 bg-card">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Trading Options
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground">
            Choose Your Path
          </h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
            Follow expert traders automatically or build your own strategy — your choice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Copy Trading — active */}
          <div className="relative rounded-xl border border-primary/30 bg-background p-7 flex flex-col overflow-hidden">
            {/* Subtle gradient accent */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 80% 60% at 0% 0%, var(--teal-glow-subtle) 0%, transparent 70%)",
              }}
            />

            <div className="relative">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
                  <Users className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Live
                </span>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2">Copy Trading</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Automatically mirror the trades of verified expert traders in real-time.
                Perfect for beginners and busy professionals who want consistent market
                exposure without active management.
              </p>

              <ul className="space-y-2 mb-7">
                {copyFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" strokeWidth={2} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className="inline-flex items-center justify-center w-full px-5 py-3 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 transition-colors text-sm shadow-sm shadow-primary/20"
              >
                Start Copying
              </Link>
            </div>
          </div>

          {/* Self Trading — coming soon */}
          <div className="rounded-xl border border-border bg-card/50 p-7 flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-overlay border border-border">
                <User className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/8 text-amber-500/70 border border-amber-500/15">
                Coming Soon
              </span>
            </div>

            <h3 className="text-xl font-bold text-muted-foreground mb-2">Self Trading</h3>
            <p className="text-sm text-muted-foreground/60 leading-relaxed flex-1 mb-7">
              Take full control with our advanced platform. Access charts, indicators, and
              direct market execution across all 500+ instruments at your own pace.
            </p>

            <button
              onClick={showToast}
              className="inline-flex items-center justify-center w-full px-5 py-3 rounded-xl font-semibold text-muted-foreground/50 border border-border/50 cursor-not-allowed text-sm"
              disabled
              aria-disabled="true"
            >
              Under Maintenance
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message="Self Trading is under maintenance. Check back soon."
          onClose={() => setToast(false)}
        />
      )}
    </section>
  );
}
