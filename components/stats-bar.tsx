import { Activity, Layers, DollarSign, Globe } from "lucide-react";

const stats = [
  { value: "500+", label: "Instruments", icon: Activity },
  { value: "1:500", label: "Max Leverage", icon: Layers },
  { value: "$20", label: "Min. Deposit", icon: DollarSign },
  { value: "150+", label: "Countries", icon: Globe },
];

export default function StatsBar() {
  return (
    <section className="border-y border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
          {stats.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center py-7 px-6 gap-2"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <Icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
              </div>
              <span className="text-2xl font-bold text-foreground tabular-nums leading-none">
                {value}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
