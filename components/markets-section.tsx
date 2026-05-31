"use client";

import { useState } from "react";
import { X } from "lucide-react";

const markets = [
  {
    emoji: "💱",
    name: "Forex",
    description: "Major, minor & exotic currency pairs with tight spreads.",
    pairs: "70+ pairs",
  },
  {
    emoji: "📊",
    name: "Indices",
    description: "Trade the world's top stock market indices 24/5.",
    pairs: "20+ indices",
  },
  {
    emoji: "🥇",
    name: "Metals",
    description: "Gold, silver, platinum and other precious metals.",
    pairs: "Gold, Silver & more",
  },
  {
    emoji: "₿",
    name: "Crypto",
    description: "Leading cryptocurrencies with competitive spreads.",
    pairs: "50+ coins",
  },
  {
    emoji: "⛽",
    name: "Energies",
    description: "Crude oil, natural gas, and energy commodity CFDs.",
    pairs: "WTI, Brent & more",
  },
];

function Toast({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border border-[#00C896]/30 bg-[#0d1526] text-white shadow-2xl shadow-black/40 animate-in slide-in-from-bottom-2 duration-300">
      <span className="text-lg">🚀</span>
      <div>
        <p className="text-sm font-semibold text-white">Coming Soon</p>
        <p className="text-xs text-slate-400 mt-0.5">
          Self-trading launches soon. Create an account to be notified.
        </p>
      </div>
      <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function MarketsSection() {
  const [toast, setToast] = useState(false);

  const handleTradeNow = () => {
    setToast(true);
    setTimeout(() => setToast(false), 4000);
  };

  return (
    <section id="markets" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0f1e]">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#00C896]">
            Instruments
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
            Global Markets at Your Fingertips
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto">
            Access 500+ instruments across five major asset classes with
            competitive spreads and deep liquidity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {markets.map((market) => (
            <div
              key={market.name}
              className="group relative p-6 rounded-2xl border border-white/8 bg-[#0d1526] hover:border-[#00C896]/25 transition-all duration-300 flex flex-col"
            >
              {/* Icon */}
              <div className="text-3xl mb-4">{market.emoji}</div>

              <h3 className="text-lg font-semibold text-white mb-1">
                {market.name}
              </h3>
              <p className="text-xs text-[#00C896] font-medium mb-3">
                {market.pairs}
              </p>
              <p className="text-sm text-slate-400 leading-relaxed flex-1 mb-6">
                {market.description}
              </p>

              <button
                onClick={handleTradeNow}
                className="w-full py-2.5 rounded-xl text-sm font-semibold border border-[#00C896]/30 text-[#00C896] hover:bg-[#00C896]/10 transition-colors"
              >
                Trade Now
              </button>
            </div>
          ))}
        </div>
      </div>

      {toast && <Toast onClose={() => setToast(false)} />}
    </section>
  );
}
