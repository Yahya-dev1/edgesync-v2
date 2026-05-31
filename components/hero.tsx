import Link from "next/link";
import { Check } from "lucide-react";

const trustItems = ["No hidden fees", "Instant deposits", "24/7 support", "FSA regulated"];

export default function Hero() {
  return (
    <section className="relative flex items-center justify-center overflow-hidden pt-16 pb-24">
      {/* Subtle radial gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,200,150,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/8 mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="text-xs font-medium text-primary">
            FSA Seychelles Regulated Broker
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-5 leading-[1.1]">
          Trade Smarter.{" "}
          <span className="text-primary">Earn Better.</span>
        </h1>

        {/* Sub-headline */}
        <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-9 leading-relaxed">
          Professional trading tools, tight spreads from 0.0 pips, and
          world-class execution — on 500+ instruments.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/register"
            className="px-7 py-3 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/80 transition-colors text-sm"
          >
            Create Account Now
          </Link>
          <a
            href="#markets"
            className="px-7 py-3 rounded-lg font-semibold border border-border text-muted-foreground hover:text-foreground hover:border-border/60 transition-colors text-sm"
          >
            Explore Markets
          </a>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-5">
          {trustItems.map((item) => (
            <span key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Check className="w-3.5 h-3.5 text-primary" strokeWidth={2.5} />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
