import { Shield, Zap, BarChart2, Clock } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Regulated Broker",
    description:
      "Licensed and regulated by the Financial Services Authority of Seychelles (FSA), ensuring your funds and trading activity are fully protected.",
  },
  {
    icon: Zap,
    title: "Fast Execution",
    description:
      "Ultra-low latency order execution powered by institutional-grade infrastructure. Your trades reach the market in milliseconds.",
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
      "Our multilingual support team is available around the clock via live chat, email, and phone to assist you whenever you need.",
  },
];

export default function WhyChoose() {
  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#00C896]">
            Why EdgeSync Markets
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
            Built for Serious Traders
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto">
            Everything you need to trade with confidence — from regulation to
            execution.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="group relative p-6 rounded-2xl border border-white/8 bg-[#0d1526] hover:border-[#00C896]/30 transition-all duration-300"
              >
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#00C896]/10 border border-[#00C896]/20 mb-5 group-hover:bg-[#00C896]/20 transition-colors">
                  <Icon className="w-6 h-6 text-[#00C896]" strokeWidth={1.5} />
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feat.description}
                </p>

                {/* Bottom accent */}
                <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#00C896]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
