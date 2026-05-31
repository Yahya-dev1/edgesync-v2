import { UserPlus, Wallet, LineChart } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Account",
    description:
      "Sign up in minutes with your email. Complete identity verification to unlock full access.",
  },
  {
    number: "02",
    icon: Wallet,
    title: "Deposit Funds",
    description:
      "Fund your account from $100 using bank transfer, card, or supported payment methods.",
  },
  {
    number: "03",
    icon: LineChart,
    title: "Start Trading",
    description:
      "Pick a master trader to copy or explore our markets. Your journey to smarter trading starts now.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#00C896]">
            Get Started
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
            How It Works
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto">
            Three simple steps to start trading with EdgeSync Markets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-14 left-1/3 right-1/3 h-px bg-gradient-to-r from-[#00C896]/20 via-[#00C896]/40 to-[#00C896]/20" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="flex flex-col items-center text-center relative">
                {/* Step number bubble */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#0d1526] border border-[#00C896]/30 flex items-center justify-center relative z-10">
                    <Icon className="w-7 h-7 text-[#00C896]" strokeWidth={1.5} />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#00C896] text-[#080d1a] text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold bg-[#00C896] text-[#080d1a] hover:bg-[#00b084] transition-all shadow-lg shadow-[#00C896]/20 text-base"
          >
            Get Started Today
          </a>
        </div>
      </div>
    </section>
  );
}
