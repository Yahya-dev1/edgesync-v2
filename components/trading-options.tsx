"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, User, X, Wrench } from "lucide-react";

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border border-amber-500/20 bg-[#0d1526] text-white shadow-xl shadow-black/50">
      <Wrench className="w-4 h-4 text-amber-400 flex-shrink-0" strokeWidth={1.5} />
      <span className="text-sm text-slate-300">{message}</span>
      <button onClick={onClose} className="ml-1 text-slate-500 hover:text-white transition-colors">
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
    <section id="trading-options" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0a0f1e]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#00C896]">
            Trading Options
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
            Choose Your Path
          </h2>
          <p className="mt-3 text-slate-400 max-w-lg mx-auto text-sm">
            Follow expert traders automatically or build your own strategy —
            your choice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Copy Trading — active */}
          <div className="rounded-xl border border-[#00C896]/25 bg-[#0d1526] p-6 flex flex-col">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#00C896]/10 mb-5">
              <Users className="w-4.5 h-4.5 text-[#00C896]" strokeWidth={1.5} />
            </div>

            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-[#00C896]/10 text-[#00C896] border border-[#00C896]/20 self-start mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C896] animate-pulse" />
              Active
            </span>

            <h3 className="text-xl font-bold text-white mb-2">Copy Trading</h3>
            <p className="text-sm text-slate-400 leading-relaxed flex-1 mb-6">
              Automatically copy the trades of verified expert traders in
              real-time. Perfect for beginners and busy professionals who want
              consistent market exposure without active management.
            </p>

            <Link
              href="/register"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-semibold bg-[#00C896] text-[#080d1a] hover:bg-[#00b084] transition-colors text-sm"
            >
              Start Copying
            </Link>
          </div>

          {/* Self Trading — coming soon */}
          <div className="rounded-xl border border-white/6 bg-[#0d1526]/50 p-6 flex flex-col">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/4 mb-5">
              <User className="w-4.5 h-4.5 text-slate-600" strokeWidth={1.5} />
            </div>

            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/8 text-amber-500/70 border border-amber-500/15 self-start mb-4">
              Coming Soon
            </span>

            <h3 className="text-xl font-bold text-slate-500 mb-2">Self Trading</h3>
            <p className="text-sm text-slate-600 leading-relaxed flex-1 mb-6">
              Take full control with our advanced platform. Access charts,
              indicators, and direct market execution across all 500+
              instruments at your own pace.
            </p>

            <button
              onClick={showToast}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-semibold text-slate-600 border border-white/6 cursor-not-allowed text-sm"
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
