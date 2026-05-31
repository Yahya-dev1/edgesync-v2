const stats = [
  { value: "500+", label: "Instruments" },
  { value: "1:500", label: "Max Leverage" },
  { value: "$100", label: "Min Deposit" },
  { value: "2021", label: "Founded" },
];

export default function StatsBar() {
  return (
    <section className="border-y border-white/8 bg-[#0d1526]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center py-6 px-6"
            >
              <span className="text-2xl font-bold text-[#00C896]">
                {stat.value}
              </span>
              <span className="text-xs text-slate-500 mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
