"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, X, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { approveKyc, rejectKyc } from "./actions";

// ─── Types ───────────────────────────────────────────────────────

interface KYCRow {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  full_name: string | null;
  email: string | null;
}

type KYCStatus = "all" | "pending" | "approved" | "rejected";

interface Props {
  rows: KYCRow[];
  totalCount: number;
  page: number;
  totalPages: number;
  status: KYCStatus;
}

// ─── Helpers ─────────────────────────────────────────────────────

function fmtDate(s: string | null | undefined) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
        "inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize",
        classes[status] ?? "bg-overlay text-muted-foreground"
      )}
    >
      {status}
    </span>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  confirmClassName,
  onConfirm,
  onClose,
  pending,
  error,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  confirmClassName: string;
  onConfirm: () => void;
  onClose: () => void;
  pending: boolean;
  error: string | null;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-sm rounded-xl bg-surface p-6 shadow-2xl"
        style={{ border: "0.5px solid var(--surface-border)" }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-400 flex items-center gap-1.5 mb-4">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </p>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            disabled={pending}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-overlay text-foreground hover:bg-overlay/80 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={pending}
            className={cn(
              "flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2",
              confirmClassName
            )}
          >
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────

export default function KYCClient({ rows, totalCount, page, totalPages, status }: Props) {
  const router = useRouter();
  const [confirmTarget, setConfirmTarget] = useState<{
    row: KYCRow;
    action: "approve" | "reject";
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function navigate(newPage: number, newStatus?: KYCStatus) {
    const s = newStatus !== undefined ? newStatus : status;
    const params = new URLSearchParams();
    if (s !== "all") params.set("status", s);
    if (newPage > 1) params.set("page", String(newPage));
    router.push(`/admin/kyc${params.size ? "?" + params : ""}`);
  }

  function handleConfirm() {
    if (!confirmTarget) return;
    const { row, action } = confirmTarget;
    setError(null);
    startTransition(async () => {
      const result =
        action === "approve"
          ? await approveKyc(row.id, row.user_id)
          : await rejectKyc(row.id, row.user_id);
      if (result.error) {
        setError(result.error);
      } else {
        setConfirmTarget(null);
        router.refresh();
      }
    });
  }

  const statusFilters: { label: string; value: KYCStatus }[] = [
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
          <h1 className="text-lg font-semibold text-foreground">KYC Queue</h1>
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
                {["User", "Email", "Submitted At", "Status", "Actions"].map((h) => (
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
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    {status !== "all"
                      ? `No ${status} submissions found.`
                      : "No KYC submissions found."}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t hover:bg-overlay/50 transition-colors"
                    style={{ borderColor: "var(--surface-border)" }}
                  >
                    <td className="px-4 py-3 text-xs font-medium text-foreground whitespace-nowrap">
                      {row.full_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {row.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {fmtDate(row.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3">
                      {row.status === "pending" ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setError(null);
                              setConfirmTarget({ row, action: "approve" });
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setError(null);
                              setConfirmTarget({ row, action: "reject" });
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
              ? "Approve KYC submission?"
              : "Reject KYC submission?"
          }
          description={
            confirmTarget.action === "approve"
              ? `This will approve the identity verification for ${confirmTarget.row.full_name ?? confirmTarget.row.email ?? "this user"} and notify them.`
              : `This will reject the identity verification for ${confirmTarget.row.full_name ?? confirmTarget.row.email ?? "this user"}. They will be asked to resubmit with clearer documents.`
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
