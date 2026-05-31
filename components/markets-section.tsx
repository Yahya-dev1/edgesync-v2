"use client";

import { useState } from "react";
import { TrendingUp, BarChart2, Gem, Bitcoin, Zap, X } from "lucide-react";

const markets = [
  {
    icon: TrendingUp,
    name: "Forex",
    description: "Major, minor & exotic currency pairs with tight spreads.",
    pairs: "70+ pairs",
  },
  {
    icon: BarChart2,
    name: "Indices",
    description: "Trade the world's top stock market indices 24/5.",
    pairs: "20+ indices",
  },
  {
    icon: Gem,
    name: "Metals",
    description: "Gold, silver, platinum and other precious metals.",
    pairs: "Gold, Silver & more",
  },
  {
    icon: Bitcoin,
    name: "Crypto",
    description: "Leading cryptocurrencies with competitive spreads.",
    pairs: "50+ coins",
  },
  {
    icon: Zap,
    name: "Energies",
    description: "Crude oil, natural gas, and energy commodity CFDs.",
    pairs: "WTI, Brent & more",
  },
];

function Toast({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border border-[#00C896]/20 bg-[#0d1526] text-white shadow-xl shadow-black/50">
      <div>
        <p className="text-sm font-medium text-white">Coming Soon</p>
        <p className="text-xs text-slate-400 mt-0.5">
          Self-trading launches soon. Create an account to be notified.
        </p>
      </div>
      <button onClick={onClose} className="ml-2 text-slate-500 hover:text-white transition-colors">
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
    <section id="markets" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0a0f1e]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#00C896]">
            Instruments
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
            Global Markets at Your Fingertips
          </h2>
          <p className="mt-3 text-slate-400 max-w-lg mx-auto text-sm">
            500+ instruments across five asset classes with competitive spreads
            and deep liquidity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {markets.map((market) => {
            const Icon = market.icon;
            return (
              <div
                key={market.name}
                className="group p-5 rounded-xl border border-white/6 bg-[#0d1526] hover:border-white/12 transition-colors duration-200 flex flex-col"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 mb-4">
                  <Icon className="w-4.5 h-4.5 text-[#00C896]" strokeWidth={1.5} />
                </div>

                <h3 className="text-sm font-semibold text-white mb-0.5">
                  {market.name}
                </h3>
                <p className="text-xs text-[#00C896] mb-3">{market.pairs}</p>
                <p className="text-xs text-slate-500 leading-relaxed flex-1 mb-5">
                  {market.description}
                </p>

                <button
                  onClick={handleTradeNow}
                  className="w-full py-2 rounded-lg text-xs font-semibold border border-white/8 text-slate-400 hover:border-[#00C896]/30 hover:text-[#00C896] transition-colors"
                >
                  Trade Now
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {toast && <Toast onClose={() => setToast(false)} />}
    </section>
  );
}
