import { createClient } from "@/lib/supabase/server";
import TradingViewChart from "@/components/dashboard/TradingViewChart";
import { AssetIcon } from "@/components/dashboard/AssetIcon";
import { cn } from "@/lib/utils";

interface Trade {
  id: string;
  symbol: string | null;
  direction: string | null;
  open_price: number | null;
  close_price: number | null;
  pnl_percentage: number | null;
  is_active: boolean | null;
  opened_at: string | null;
}

function fmtPrice(n: number | null) {
  if (n == null) return "—";
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 5 });
}

function fmtDate(s: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtPnl(n: number | null) {
  if (n == null) return { label: "—", positive: null };
  const positive = n >= 0;
  return {
    label: (positive ? "+" : "") + n.toFixed(2) + "%",
    positive,
  };
}

export default async function MarketsPage() {
  const supabase = await createClient();

  const { data: trades } = await supabase
    .from("master_trades")
    .select("id, symbol, direction, open_price, close_price, pnl_percentage, is_active, opened_at")
    .order("created_at", { ascending: false });

  const rows: Trade[] = trades ?? [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ── TradingView Chart ─────────────────────────────────── */}
      <div
        className="rounded-xl overflow-hidden bg-surface"
        style={{ border: "0.5px solid var(--surface-border)" }}
      >
        <TradingViewChart />
      </div>

      {/* ── AmiinFx Trade Executions ──────────────────────────── */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">AmiinFx Trade Executions</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {rows.length} trade{rows.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div
          className="rounded-xl overflow-hidden bg-surface"
          style={{ border: "0.5px solid var(--surface-border)" }}
        >
          {rows.length === 0 ? (
            <div className="px-4 py-16 text-center text-sm text-muted-foreground">
              No trades recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "0.5px solid var(--surface-border)" }}>
                    {["Symbol", "Direction", "Entry Price", "Close Price", "P&L %", "Status", "Opened At"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((trade, idx) => {
                    const isOpen = trade.is_active !== false;
                    const { label: pnlLabel, positive } = fmtPnl(trade.pnl_percentage);
                    return (
                      <tr
                        key={trade.id}
                        className="transition-colors hover:bg-overlay/40"
                        style={
                          idx > 0
                            ? { borderTop: "0.5px solid var(--surface-border)" }
                            : undefined
                        }
                      >
                        {/* Symbol */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <AssetIcon symbol={trade.symbol} />
                            <span className="text-xs font-semibold text-foreground tabular-nums">
                              {trade.symbol ?? "—"}
                            </span>
                          </div>
                        </td>

                        {/* Direction */}
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "text-xs font-bold",
                              trade.direction?.toUpperCase() === "BUY"
                                ? "text-emerald-400"
                                : "text-red-400"
                            )}
                          >
                            {trade.direction?.toUpperCase() ?? "—"}
                          </span>
                        </td>

                        {/* Entry Price */}
                        <td className="px-4 py-3 text-xs text-foreground tabular-nums whitespace-nowrap">
                          {fmtPrice(trade.open_price)}
                        </td>

                        {/* Close Price */}
                        <td className="px-4 py-3 text-xs text-foreground tabular-nums whitespace-nowrap">
                          {isOpen ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            fmtPrice(trade.close_price)
                          )}
                        </td>

                        {/* P&L % */}
                        <td className="px-4 py-3 text-xs tabular-nums whitespace-nowrap">
                          {positive === null ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <span className={positive ? "text-emerald-400" : "text-red-400"}>
                              {pnlLabel}
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold",
                              isOpen
                                ? "bg-yellow-500/10 text-yellow-400"
                                : "bg-overlay text-muted-foreground"
                            )}
                          >
                            {isOpen ? "Open" : "Closed"}
                          </span>
                        </td>

                        {/* Opened At */}
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {fmtDate(trade.opened_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
