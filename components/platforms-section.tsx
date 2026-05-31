import { Monitor, Smartphone } from "lucide-react";

const platforms = [
  {
    icon: Monitor,
    name: "WebTrader",
    tagline: "Trade directly from your browser",
    features: [
      "Advanced charting tools",
      "Real-time quotes",
      "One-click trading",
      "Multi-account support",
    ],
  },
  {
    icon: Smartphone,
    name: "Mobile App",
    tagline: "iOS & Android — trade anywhere",
    features: [
      "Full-featured mobile platform",
      "Push notifications & alerts",
      "Copy trade management",
      "Biometric authentication",
    ],
  },
];

export default function PlatformsSection() {
  return (
    <section id="platforms" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#00C896]">
            Platforms
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
            Trade on Any Device
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto">
            Our platforms are designed for performance, reliability, and ease of
            use — wherever you are.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <div
                key={platform.name}
                className="relative p-8 rounded-2xl border border-white/8 bg-[#0d1526] overflow-hidden"
              >
                {/* Background decoration */}
                <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-[#00C896]/5 blur-xl" />

                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00C896]/10 border border-[#00C896]/20 mb-6">
                  <Icon className="w-7 h-7 text-[#00C896]" strokeWidth={1.5} />
                </div>

                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-2xl font-bold text-white">
                    {platform.name}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Coming Soon
                  </span>
                </div>

                <p className="text-sm text-slate-400 mb-6">
                  {platform.tagline}
                </p>

                <ul className="space-y-2.5 mb-8">
                  {platform.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <span className="w-4 h-4 rounded-full bg-[#00C896]/15 flex items-center justify-center flex-shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00C896]" />
                      </span>
                      {feat}
                    </li>
                  ))}
                </ul>

                <button
                  disabled
                  className="w-full py-3 rounded-xl text-sm font-semibold text-slate-500 bg-white/5 border border-white/8 cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
