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

function XAUUSDIcon() {
  return (
    <svg width="40" height="40" viewBox="0 83 512 346" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fill="#FEBD4B" d="M511.351,401.722l-31.999-129.388c-2.374-9.6-10.906-16.335-20.695-16.335h-95.977c13.87-0.01,24.045-13.189,20.68-26.795L351.36,99.816c-2.374-9.6-10.906-16.335-20.695-16.335h-149.32c-9.789,0-18.321,6.735-20.695,16.335l-31.999,129.388c-3.365,13.606,6.809,26.785,20.68,26.795H53.342c-9.789,0-18.321,6.735-20.695,16.335L0.647,401.722c-3.366,13.61,6.817,26.795,20.695,26.795h213.319c12.062,0,21.327-9.959,21.338-21.501c0.011,11.542,9.276,21.501,21.338,21.501h213.319C504.533,428.517,514.716,415.332,511.351,401.722z"/>
      <path fill="#FEE66B" d="M116.871,255.999h59.361l-37.1,172.518H77.915L116.871,255.999z M372.865,255.999L333.91,428.517h61.216l37.1-172.518H372.865z M205.918,255.999h61.216l37.1-172.518h-59.361L205.918,255.999z"/>
    </svg>
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
