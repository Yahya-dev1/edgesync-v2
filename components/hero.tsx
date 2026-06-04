import Link from "next/link";
import { ArrowRight, Check, Users, TrendingUp, Award } from "lucide-react";

const trustItems = ["No hidden fees", "Instant deposits", "24/7 support", "FSA regulated"];

const heroStats = [
  { label: "Active Traders", value: "15,000+", icon: Users },
  { label: "Avg. Win Rate", value: "76.4%", icon: TrendingUp },
  { label: "Expert Traders", value: "250+", icon: Award },
];

export default function Hero() {
  return (
    <section className="relative flex items-center justify-center overflow-hidden pt-16 pb-28">
      {/* Layered background gradients */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 50% -5%, var(--teal-glow-strong) 0%, transparent 65%), radial-gradient(ellipse 50% 35% at 85% 85%, var(--teal-glow-subtle) 0%, transparent 60%)",
        }}
      />
      {/* Dot grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.025,
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-14">
        {/* Regulation badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-primary/[0.07] mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-semibold text-primary tracking-wide">
            FSA Seychelles Regulated Broker
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-bold tracking-tight text-foreground mb-6 leading-[1.05]">
          Trade Smarter.{" "}
          <br className="hidden sm:block" />
          <span className="text-primary">Earn Better.</span>
        </h1>

        {/* Sub-headline */}
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Professional copy trading, tight spreads from 0.0 pips, and
          institutional-grade execution — across 500+ instruments.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 transition-all text-sm shadow-lg shadow-primary/20"
          >
            Create Account
            <ArrowRight
              className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5"
              strokeWidth={2.5}
            />
          </Link>
          <a
            href="#markets"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold border border-border text-muted-foreground hover:text-foreground hover:border-primary/25 active:bg-overlay transition-all text-sm"
          >
            Explore Markets
          </a>
        </div>

        {/* Social proof stat cards */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {heroStats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 px-5 py-3 rounded-xl border border-border bg-card/80 backdrop-blur-sm"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <Icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
              </div>
              <div className="text-left">
                <p className="text-base font-bold text-foreground leading-none tabular-nums">
                  {value}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {trustItems.map((item) => (
            <span key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" strokeWidth={2.5} />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
