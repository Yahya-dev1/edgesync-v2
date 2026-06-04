import Link from "next/link";
import { UserPlus, Wallet, LineChart, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Account",
    description:
      "Sign up in minutes with your email and complete identity verification to unlock full access.",
  },
  {
    number: "02",
    icon: Wallet,
    title: "Deposit Funds",
    description:
      "Fund your account from $20 using USDT (TRC20) crypto deposits or other supported payment methods.",
  },
  {
    number: "03",
    icon: LineChart,
    title: "Start Trading",
    description:
      "Pick a master trader to copy or explore markets directly. Your journey starts now.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Get Started
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground">
            How It Works
          </h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
            Three simple steps to start trading with EdgeSync Markets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
          {/* Connecting line — desktop only */}
          <div className="hidden md:block absolute top-[52px] left-[calc(33.33%+8px)] right-[calc(33.33%+8px)] h-px">
            <div className="w-full h-full bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
          </div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative flex flex-col items-center text-center p-8 rounded-xl border border-border bg-card">
                {/* Step number circle */}
                <div className="relative flex items-center justify-center w-[52px] h-[52px] rounded-full bg-primary/10 border border-primary/20 mb-5 z-10">
                  <span className="text-sm font-bold text-primary font-mono leading-none">
                    {step.number}
                  </span>
                </div>

                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-overlay border border-border mb-4">
                  <Icon className="w-4.5 h-4.5 text-muted-foreground" strokeWidth={1.5} />
                </div>

                <h3 className="text-sm font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 transition-colors text-sm shadow-sm shadow-primary/20"
          >
            Get Started Today
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}
