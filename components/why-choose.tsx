import { Shield, Zap, BarChart2, Clock } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Regulated Broker",
    description:
      "Licensed and regulated by the Financial Services Authority of Seychelles (FSA), ensuring your funds are fully protected.",
  },
  {
    icon: Zap,
    title: "Fast Execution",
    description:
      "Ultra-low latency order execution powered by institutional-grade infrastructure, reaching the market in milliseconds.",
  },
  {
    icon: BarChart2,
    title: "Tight Spreads",
    description:
      "Spreads from 0.0 pips on major forex pairs with transparent, no-commission pricing on select account types.",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description:
      "Multilingual support available around the clock via live chat, email, and phone — whenever you need us.",
  },
];

export default function WhyChoose() {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#00C896]">
            Why EdgeSync Markets
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
            Built for Serious Traders
          </h2>
          <p className="mt-3 text-slate-400 max-w-lg mx-auto text-sm">
            Everything you need to trade with confidence — from regulation to execution.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-6 rounded-xl border border-white/6 bg-[#0d1526] hover:border-white/12 transition-colors duration-200"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 mb-5">
                  <Icon className="w-4.5 h-4.5 text-[#00C896]" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
