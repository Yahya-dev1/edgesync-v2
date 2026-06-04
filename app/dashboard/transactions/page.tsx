import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

// ─── Types ────────────────────────────────────────────────────

type TxType = "deposit" | "withdrawal";

interface Tx {
  id: string;
  type: TxType;
  amount: number;
  status: string;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────

function fmtAmount(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function TypeBadge({ type }: { type: TxType }) {
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 rounded-lg text-[11px] font-semibold capitalize",
        type === "deposit"
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-red-500/10 text-red-400"
      )}
    >
      {type === "deposit" ? "Deposit" : "Withdrawal"}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const classes: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400",
    approved: "bg-emerald-500/10 text-emerald-400",
    rejected: "bg-red-500/10 text-red-400",
  };
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 rounded-lg text-[11px] font-semibold capitalize",
        classes[status] ?? "bg-overlay text-muted-foreground"
      )}
    >
      {status}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function TransactionsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: deposits }, { data: withdrawals }] = await Promise.all([
    supabase
      .from("deposits")
      .select("id, amount, status, created_at")
      .eq("user_id", user.id),
    supabase
      .from("withdrawals")
      .select("id, amount, status, created_at")
      .eq("user_id", user.id),
  ]);

  const all: Tx[] = [
    ...(deposits ?? []).map((d) => ({
      id: d.id as string,
      type: "deposit" as TxType,
      amount: Number(d.amount),
      status: d.status as string,
      created_at: d.created_at as string,
    })),
    ...(withdrawals ?? []).map((w) => ({
      id: w.id as string,
      type: "withdrawal" as TxType,
      amount: Number(w.amount),
      status: w.status as string,
      created_at: w.created_at as string,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const totalCount = all.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages);
  const rows = all.slice((clampedPage - 1) * PAGE_SIZE, clampedPage * PAGE_SIZE);

  function pageHref(p: number) {
    return p === 1 ? "/dashboard/transactions" : `/dashboard/transactions?page=${p}`;
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Transactions</h1>
        <p className="text-base text-muted-foreground mt-1">
          {totalCount} transaction{totalCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Table card */}
      <div className="rounded-xl overflow-hidden border border-border bg-card">
        {totalCount === 0 ? (
          <div className="px-4 py-16 text-center text-sm text-muted-foreground">
            No transactions yet.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Type", "Amount", "Status", "Date"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((tx) => (
                    <tr
                      key={`${tx.type}-${tx.id}`}
                      className="border-t border-border transition-colors hover:bg-overlay/40"
                    >
                      <td className="px-4 py-3">
                        <TypeBadge type={tx.type} />
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-foreground tabular-nums whitespace-nowrap">
                        {fmtAmount(tx.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {fmtDate(tx.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Page {clampedPage} of {totalPages}
                </span>
                <div className="flex items-center gap-1.5">
                  <Link
                    href={pageHref(clampedPage - 1)}
                    aria-disabled={clampedPage <= 1}
                    className={cn(
                      "w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors",
                      clampedPage <= 1 && "pointer-events-none opacity-40"
                    )}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Link>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - clampedPage) <= 1
                    )
                    .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                        acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, idx) =>
                      p === "..." ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="w-7 text-center text-xs text-muted-foreground"
                        >
                          …
                        </span>
                      ) : (
                        <Link
                          key={p}
                          href={pageHref(p as number)}
                          className={cn(
                            "w-7 h-7 flex items-center justify-center rounded-md text-xs font-medium transition-colors",
                            clampedPage === p
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:text-foreground hover:bg-overlay"
                          )}
                        >
                          {p}
                        </Link>
                      )
                    )}

                  <Link
                    href={pageHref(clampedPage + 1)}
                    aria-disabled={clampedPage >= totalPages}
                    className={cn(
                      "w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors",
                      clampedPage >= totalPages && "pointer-events-none opacity-40"
                    )}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
