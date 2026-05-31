"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, User, X } from "lucide-react";

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border border-amber-500/30 bg-[#1a1200] text-amber-300 shadow-2xl animate-in slide-in-from-bottom-2 duration-300">
      <span className="text-lg">🔧</span>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
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
    <section id="trading-options" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0f1e]">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#00C896]">
            Trading Options
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
            Choose Your Path
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto">
            Whether you prefer to follow expert traders or execute your own
            strategy, we have you covered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Copy Trading — active */}
          <div className="relative rounded-2xl border-2 border-[#00C896]/40 bg-[#0d1526] p-8 flex flex-col overflow-hidden">
            {/* Glow */}
            <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-[#00C896]/10 blur-2xl pointer-events-none" />

            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00C896]/15 border border-[#00C896]/30 mb-6">
              <Users className="w-7 h-7 text-[#00C896]" strokeWidth={1.5} />
            </div>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#00C896]/15 text-[#00C896] border border-[#00C896]/30 self-start mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C896] animate-pulse" />
              Active
            </span>

            <h3 className="text-2xl font-bold text-white mb-3">
              Copy Trading
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed flex-1 mb-8">
              Automatically copy the trades of verified expert traders in
              real-time. Perfect for beginners and busy professionals who want
              consistent exposure to the markets without active management.
            </p>

            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-[#00C896] text-[#080d1a] hover:bg-[#00b084] transition-all shadow-lg shadow-[#00C896]/20 text-sm"
            >
              Start Copying
            </Link>
          </div>

          {/* Self Trading — greyed / under maintenance */}
          <div className="relative rounded-2xl border border-white/8 bg-[#0d1526]/60 p-8 flex flex-col overflow-hidden opacity-75">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mb-6">
              <User className="w-7 h-7 text-slate-500" strokeWidth={1.5} />
            </div>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 self-start mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Coming Soon
            </span>

            <h3 className="text-2xl font-bold text-slate-300 mb-3">
              Self Trading
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed flex-1 mb-8">
              Take full control of your trading with our advanced platform.
              Access charts, indicators, and direct market execution across all
              500+ instruments at your own pace.
            </p>

            <button
              onClick={showToast}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white/5 text-slate-500 border border-white/8 cursor-not-allowed text-sm"
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
          message="Self Trading is currently under maintenance. Check back soon!"
          onClose={() => setToast(false)}
        />
      )}
    </section>
  );
}
