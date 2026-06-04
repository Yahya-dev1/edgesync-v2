import { Shield, Zap, BarChart2, Clock } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Regulated Broker",
    description:
      "Licensed and regulated by the Financial Services Authority of Seychelles (FSA), ensuring your funds are fully protected.",
    accentClass: "bg-blue-500/10 border-blue-500/15",
    iconClass: "text-blue-400",
  },
  {
    icon: Zap,
    title: "Fast Execution",
    description:
      "Ultra-low latency order execution powered by institutional-grade infrastructure, reaching the market in milliseconds.",
    accentClass: "bg-amber-500/10 border-amber-500/15",
    iconClass: "text-amber-400",
  },
  {
    icon: BarChart2,
    title: "Tight Spreads",
    description:
      "Spreads from 0.0 pips on major forex pairs with transparent, no-commission pricing on select account types.",
    accentClass: "bg-primary/10 border-primary/15",
    iconClass: "text-primary",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description:
      "Multilingual support available around the clock via live chat, email, and phone — whenever you need us.",
    accentClass: "bg-violet-500/10 border-violet-500/15",
    iconClass: "text-violet-400",
  },
];

export default function WhyChoose() {
  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Why EdgeSync Markets
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground">
            Built for Serious Traders
          </h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
            Everything you need to trade with confidence — from regulation to execution.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="group p-6 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-sm transition-all duration-200 cursor-default"
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-xl border mb-5 ${feat.accentClass}`}
                >
                  <Icon className={`w-5 h-5 ${feat.iconClass}`} strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">{feat.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
