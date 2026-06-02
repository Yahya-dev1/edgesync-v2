// Shared trading symbol icon components used across dashboard pages.

function FlagUS({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={26} height={26} fill="#B22234" />
      {[2, 6, 10, 14, 18, 22].map((dy) => (
        <rect key={dy} x={x} y={y + dy} width={26} height={2} fill="white" />
      ))}
      <rect x={x} y={y} width={11} height={11} fill="#3C3B6E" />
      {[2, 5.5, 9].flatMap((dy) =>
        [2, 5.5, 9].map((dx) => (
          <circle key={`${dx}-${dy}`} cx={x + dx} cy={y + dy} r={0.75} fill="white" />
        ))
      )}
    </g>
  );
}

function FlagEU({ x, y }: { x: number; y: number }) {
  const cx = x + 13;
  const cy = y + 13;
  return (
    <g>
      <rect x={x} y={y} width={26} height={26} fill="#003399" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 - 90) * (Math.PI / 180);
        return (
          <circle key={i} cx={cx + 7 * Math.cos(a)} cy={cy + 7 * Math.sin(a)} r={1.3} fill="#FFDD00" />
        );
      })}
    </g>
  );
}

function FlagGB({ x, y }: { x: number; y: number }) {
  const cx = x + 13;
  const cy = y + 13;
  return (
    <g>
      <rect x={x} y={y} width={26} height={26} fill="#012169" />
      <line x1={x} y1={y} x2={x + 26} y2={y + 26} stroke="white" strokeWidth={8} />
      <line x1={x + 26} y1={y} x2={x} y2={y + 26} stroke="white" strokeWidth={8} />
      <line x1={x} y1={y} x2={x + 26} y2={y + 26} stroke="#C8102E" strokeWidth={3.5} />
      <line x1={x + 26} y1={y} x2={x} y2={y + 26} stroke="#C8102E" strokeWidth={3.5} />
      <rect x={x} y={cy - 4} width={26} height={8} fill="white" />
      <rect x={cx - 4} y={y} width={8} height={26} fill="white" />
      <rect x={x} y={cy - 2.4} width={26} height={4.8} fill="#C8102E" />
      <rect x={cx - 2.4} y={y} width={4.8} height={26} fill="#C8102E" />
    </g>
  );
}

function FlagJP({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={26} height={26} fill="white" />
      <circle cx={x + 13} cy={y + 13} r={6} fill="#BC002D" />
    </g>
  );
}

function PairIcon({
  id,
  Left,
  Right,
}: {
  id: string;
  Left: React.ComponentType<{ x: number; y: number }>;
  Right: React.ComponentType<{ x: number; y: number }>;
}) {
  return (
    <svg width="40" height="26" viewBox="0 0 40 26" aria-hidden="true">
      <defs>
        <clipPath id={`lc-${id}`}>
          <circle cx="13" cy="13" r="13" />
        </clipPath>
        <clipPath id={`rc-${id}`}>
          <circle cx="27" cy="13" r="13" />
        </clipPath>
      </defs>
      <g clipPath={`url(#rc-${id})`}>
        <Right x={14} y={0} />
      </g>
      <g clipPath={`url(#lc-${id})`}>
        <Left x={0} y={0} />
      </g>
      <circle cx="13" cy="13" r="13" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
    </svg>
  );
}

function XAUCircle({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={26} height={26} fill="#B45309" />
      <text
        x={x + 13}
        y={y + 17}
        textAnchor="middle"
        fontSize="8"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
        fill="white"
        letterSpacing="0.3"
      >
        XAU
      </text>
    </g>
  );
}

function XAUUSDIcon() {
  return (
    <PairIcon id="xauusd" Left={XAUCircle} Right={FlagUS} />
  );
}

function GenericIcon() {
  return (
    <svg width="40" height="26" viewBox="0 0 40 26" aria-hidden="true">
      <circle cx="20" cy="13" r="13" fill="#374151" />
      <rect x="13" y="8" width="14" height="11" rx="1.5" stroke="#94A3B8" strokeWidth="1.2" fill="none" />
      <path
        d="M14 17l3-3 2.5 2.5 3-4 2.5 2"
        stroke="#94A3B8"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AssetIcon({ symbol }: { symbol: string | null }) {
  switch (symbol?.toUpperCase()) {
    case "XAUUSD": return <XAUUSDIcon />;
    case "EURUSD": return <PairIcon id="eurusd" Left={FlagEU} Right={FlagUS} />;
    case "GBPUSD": return <PairIcon id="gbpusd" Left={FlagGB} Right={FlagUS} />;
    case "USDJPY": return <PairIcon id="usdjpy" Left={FlagUS} Right={FlagJP} />;
    case "GBPJPY": return <PairIcon id="gbpjpy" Left={FlagGB} Right={FlagJP} />;
    default:       return <GenericIcon />;
  }
}
