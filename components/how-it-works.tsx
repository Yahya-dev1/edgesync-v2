import Link from "next/link";
import { UserPlus, Wallet, LineChart } from "lucide-react";

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
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Get Started
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground">
            How It Works
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto text-sm">
            Three simple steps to start trading with EdgeSync Markets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border border-border">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="bg-card p-8">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-xs font-bold text-primary font-mono">
                    {step.number}
                  </span>
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-overlay">
                    <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/80 transition-colors text-sm"
          >
            Get Started Today
          </Link>
        </div>
      </div>
    </section>
  );
}
