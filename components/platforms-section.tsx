import { Monitor, Smartphone, Check, Bell } from "lucide-react";

const platforms = [
  {
    icon: Monitor,
    name: "WebTrader",
    tagline: "Trade directly from your browser — no download required.",
    features: [
      "Advanced charting tools",
      "Real-time quotes & spreads",
      "One-click trade execution",
      "Multi-account support",
    ],
  },
  {
    icon: Smartphone,
    name: "Mobile App",
    tagline: "Full-featured iOS & Android app — trade anywhere.",
    features: [
      "Full-featured mobile platform",
      "Push notifications & price alerts",
      "Copy trade management",
      "Biometric authentication",
    ],
  },
];

export default function PlatformsSection() {
  return (
    <section id="platforms" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Platforms
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground">
            Trade on Any Device
          </h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
            Designed for performance and reliability — wherever you are.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <div
                key={platform.name}
                className="p-7 rounded-xl border border-border bg-card"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/15">
                    <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/8 text-amber-500/70 border border-amber-500/15">
                    Coming Soon
                  </span>
                </div>

                <h3 className="text-base font-bold text-foreground mb-1.5">{platform.name}</h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{platform.tagline}</p>

                <ul className="space-y-2.5 mb-7">
                  {platform.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" strokeWidth={2.5} />
                      {feat}
                    </li>
                  ))}
                </ul>

                <button
                  disabled
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground/50 border border-border/50 cursor-not-allowed"
                  aria-disabled="true"
                >
                  <Bell className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Notify Me at Launch
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
