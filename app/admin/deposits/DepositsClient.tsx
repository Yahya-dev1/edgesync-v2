"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { approveDeposit, rejectDeposit } from "./actions";
import { fmtDate, StatusBadge, ConfirmDialog } from "@/components/admin/shared";

// ─── Types ──────────────────────────────────────────────────────

interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  method: string;
  screenshot_url: string | null;
  screenshot_signed_url: string | null;
  created_at: string;
  full_name: string | null;
  email: string | null;
}

type DepositStatus = "all" | "pending" | "approved" | "rejected";

interface Props {
  deposits: Deposit[];
  totalCount: number;
  page: number;
  totalPages: number;
  status: DepositStatus;
}

// ─── Helpers ────────────────────────────────────────────────────

function fmtAmount(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Main component ──────────────────────────────────────────────

export default function DepositsClient({
  deposits,
  totalCount,
  page,
  totalPages,
  status,
}: Props) {
  const router = useRouter();
  const [confirmTarget, setConfirmTarget] = useState<{
    deposit: Deposit;
    action: "approve" | "reject";
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function navigate(newPage: number, newStatus?: DepositStatus) {
    const s = newStatus !== undefined ? newStatus : status;
    const params = new URLSearchParams();
    if (s !== "all") params.set("status", s);
    if (newPage > 1) params.set("page", String(newPage));
    router.push(`/admin/deposits${params.size ? "?" + params : ""}`);
  }

  function handleConfirm() {
    if (!confirmTarget) return;
    const { deposit, action } = confirmTarget;
    setError(null);
    startTransition(async () => {
      const result =
        action === "approve"
          ? await approveDeposit(deposit.id, deposit.user_id, deposit.amount)
          : await rejectDeposit(deposit.id, deposit.user_id, deposit.amount);
      if (result.error) {
        setError(result.error);
      } else {
        setConfirmTarget(null);
        router.refresh();
      }
    });
  }

  const statusFilters: { label: string; value: DepositStatus }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Deposits</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{totalCount} total</p>
        </div>
      </div>

      {/* Status filter */}
      <div
        className="flex items-center gap-1 mb-4 p-1 rounded-xl bg-surface w-fit"
        style={{ border: "0.5px solid var(--surface-border)" }}
      >
        {statusFilters.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => navigate(1, value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              status === value
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-overlay"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden bg-surface"
        style={{ border: "0.5px solid var(--surface-border)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "0.5px solid var(--surface-border)" }}>
                {["User", "Email", "Amount", "Screenshot", "Status", "Submitted At", "Actions"].map(
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
              {deposits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    {status !== "all"
                      ? `No ${status} deposits found.`
                      : "No deposits found."}
                  </td>
                </tr>
              ) : (
                deposits.map((d) => (
                  <tr
                    key={d.id}
                    className="border-t hover:bg-overlay/50 transition-colors"
                    style={{ borderColor: "var(--surface-border)" }}
                  >
                    <td className="px-4 py-3 text-xs font-medium text-foreground whitespace-nowrap">
                      {d.full_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {d.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-foreground tabular-nums whitespace-nowrap">
                      {fmtAmount(d.amount)}
                    </td>
                    <td className="px-4 py-3">
                      {d.screenshot_signed_url ? (
                        <a
                          href={d.screenshot_signed_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View full screenshot"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={d.screenshot_signed_url}
                            alt="Payment screenshot"
                            className="w-14 h-10 object-cover rounded-md border border-border hover:opacity-80 transition-opacity cursor-pointer"
                          />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5 flex-shrink-0" />
                          None
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {fmtDate(d.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      {d.status === "pending" ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setError(null);
                              setConfirmTarget({ deposit: d, action: "approve" });
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setError(null);
                              setConfirmTarget({ deposit: d, action: "reject" });
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: "0.5px solid var(--surface-border)" }}
          >
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => navigate(page - 1)}
                disabled={page <= 1}
                className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === "..." ? (
                    <span key={`ellipsis-${idx}`} className="w-7 text-center text-xs text-muted-foreground">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => navigate(p as number)}
                      className={cn(
                        "w-7 h-7 flex items-center justify-center rounded-md text-xs font-medium transition-colors",
                        page === p
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-overlay"
                      )}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => navigate(page + 1)}
                disabled={page >= totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm dialog */}
      {confirmTarget && (
        <ConfirmDialog
          title={
            confirmTarget.action === "approve"
              ? "Approve deposit?"
              : "Reject deposit?"
          }
          description={
            confirmTarget.action === "approve"
              ? `This will approve a deposit of ${fmtAmount(confirmTarget.deposit.amount)} and credit it to ${confirmTarget.deposit.full_name ?? confirmTarget.deposit.email ?? "this user"}'s balance.`
              : `This will reject the deposit of ${fmtAmount(confirmTarget.deposit.amount)} from ${confirmTarget.deposit.full_name ?? confirmTarget.deposit.email ?? "this user"}. No balance change will be made.`
          }
          confirmLabel={confirmTarget.action === "approve" ? "Approve" : "Reject"}
          confirmClassName={
            confirmTarget.action === "approve"
              ? "bg-emerald-500 text-white hover:bg-emerald-500/80"
              : "bg-red-500 text-white hover:bg-red-500/80"
          }
          onConfirm={handleConfirm}
          onClose={() => setConfirmTarget(null)}
          pending={pending}
          error={error}
        />
      )}
    </div>
  );
}
