import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,200,150,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,150,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#00C896]/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00C896]/30 bg-[#00C896]/10 mb-8">
          <span className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse" />
          <span className="text-xs font-medium text-[#00C896]">
            FSA Seychelles Regulated Broker
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Trade Smarter.{" "}
          <span className="text-[#00C896]">Earn Better.</span>
        </h1>

        {/* Sub-headline */}
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Professional trading tools, tight spreads from 0.0 pips, and
          world-class execution. Copy top traders automatically or build your
          own strategy on 500+ instruments.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold bg-[#00C896] text-[#080d1a] hover:bg-[#00b084] transition-all shadow-lg shadow-[#00C896]/20 text-base"
          >
            Create Account Now
          </Link>
          <a
            href="#markets"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold border border-white/15 text-white hover:bg-white/5 hover:border-white/30 transition-all text-base"
          >
            Explore Markets
          </a>
        </div>

        {/* Trust indicators */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-slate-500 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="text-[#00C896]">✓</span> No hidden fees
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-[#00C896]">✓</span> Instant deposits
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-[#00C896]">✓</span> 24/7 support
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-[#00C896]">✓</span> FSA regulated
          </span>
        </div>
      </div>
    </section>
  );
}
