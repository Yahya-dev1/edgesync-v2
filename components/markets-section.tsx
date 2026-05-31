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
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border border-primary/20 bg-card text-foreground shadow-xl shadow-black/20">
      <div>
        <p className="text-sm font-medium text-foreground">Coming Soon</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Self-trading launches soon. Create an account to be notified.
        </p>
      </div>
      <button onClick={onClose} className="ml-2 text-muted-foreground hover:text-foreground transition-colors">
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
    <section id="markets" className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Instruments
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground">
            Global Markets at Your Fingertips
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto text-sm">
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
                className="group p-5 rounded-xl border border-border bg-background hover:border-border/60 transition-colors duration-200 flex flex-col"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-overlay mb-4">
                  <Icon className="w-4.5 h-4.5 text-primary" strokeWidth={1.5} />
                </div>

                <h3 className="text-sm font-semibold text-foreground mb-0.5">
                  {market.name}
                </h3>
                <p className="text-xs text-primary mb-3">{market.pairs}</p>
                <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-5">
                  {market.description}
                </p>

                <button
                  onClick={handleTradeNow}
                  className="w-full py-2 rounded-lg text-xs font-semibold border border-border text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
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
