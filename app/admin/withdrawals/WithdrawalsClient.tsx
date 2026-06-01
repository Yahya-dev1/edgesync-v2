"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, ChevronLeft, ChevronRight, X, Loader2, AlertTriangle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { approveWithdrawal, rejectWithdrawal, saveProfitTarget } from "./actions";

// ─── Types ──────────────────────────────────────────────────────

interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  wallet_address: string;
  status: string;
  created_at: string;
  full_name: string | null;
  email: string | null;
}

type WithdrawalStatus = "all" | "pending" | "approved" | "rejected";

interface Props {
  withdrawals: Withdrawal[];
  totalCount: number;
  page: number;
  totalPages: number;
  status: WithdrawalStatus;
  profitTarget: number;
}

// ─── Profit target settings card ────────────────────────────────

function ProfitTargetCard({ initialValue }: { initialValue: number }) {
  const [value, setValue] = useState(String(initialValue));
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0 || num > 100) {
      setError("Enter a value between 1 and 100.");
      return;
    }
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveProfitTarget(num);
      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    });
  }

  return (
    <div
      className="rounded-xl bg-surface p-4 mb-5"
      style={{ border: "0.5px solid var(--surface-border)" }}
    >
      <h2 className="text-sm font-semibold text-foreground mb-3">Settings</h2>
      <div className="flex items-end gap-3 flex-wrap">
        <div className="flex-1 min-w-[160px] max-w-xs">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Profit Target (%)
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="100"
              step="0.1"
              value={value}
              onChange={(e) => { setValue(e.target.value); setSaved(false); setError(null); }}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="w-full pr-8 pl-3 py-2 rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:ring-2 focus:ring-primary"
              style={{ background: "var(--muted)", border: "0.5px solid var(--surface-border)" }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground select-none">
              %
            </span>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={pending}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/80 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : saved ? (
            <Check className="w-3.5 h-3.5" />
          ) : null}
          {saved ? "Saved" : "Save"}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1.5 mt-2">
          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────

function fmtDate(s: string | null | undefined) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtAmount(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

// ─── Confirm Dialog ──────────────────────────────────────────────

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

// ─── Main component ──────────────────────────────────────────────

export default function WithdrawalsClient({
  withdrawals,
  totalCount,
  page,
  totalPages,
  status,
  profitTarget,
}: Props) {
  const router = useRouter();
  const [confirmTarget, setConfirmTarget] = useState<{
    withdrawal: Withdrawal;
    action: "approve" | "reject";
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function navigate(newPage: number, newStatus?: WithdrawalStatus) {
    const s = newStatus !== undefined ? newStatus : status;
    const params = new URLSearchParams();
    if (s !== "all") params.set("status", s);
    if (newPage > 1) params.set("page", String(newPage));
    router.push(`/admin/withdrawals${params.size ? "?" + params : ""}`);
  }

  function handleConfirm() {
    if (!confirmTarget) return;
    const { withdrawal, action } = confirmTarget;
    setError(null);
    startTransition(async () => {
      const result =
        action === "approve"
          ? await approveWithdrawal(withdrawal.id, withdrawal.user_id, withdrawal.amount)
          : await rejectWithdrawal(withdrawal.id);
      if (result.error) {
        setError(result.error);
      } else {
        setConfirmTarget(null);
        router.refresh();
      }
    });
  }

  const statusFilters: { label: string; value: WithdrawalStatus }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Settings */}
      <ProfitTargetCard initialValue={profitTarget} />

      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Withdrawals</h1>
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
                {["User", "Email", "Amount", "Wallet Address", "Status", "Requested At", "Actions"].map(
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
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    {status !== "all"
                      ? `No ${status} withdrawals found.`
                      : "No withdrawals found."}
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr
                    key={w.id}
                    className="border-t hover:bg-overlay/50 transition-colors"
                    style={{ borderColor: "var(--surface-border)" }}
                  >
                    <td className="px-4 py-3 text-xs font-medium text-foreground whitespace-nowrap">
                      {w.full_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {w.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-foreground tabular-nums whitespace-nowrap">
                      {fmtAmount(w.amount)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono max-w-[180px] truncate">
                      {w.wallet_address}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={w.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {fmtDate(w.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      {w.status === "pending" ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setError(null);
                              setConfirmTarget({ withdrawal: w, action: "approve" });
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setError(null);
                              setConfirmTarget({ withdrawal: w, action: "reject" });
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
              ? "Approve withdrawal?"
              : "Reject withdrawal?"
          }
          description={
            confirmTarget.action === "approve"
              ? `This will approve a withdrawal of ${fmtAmount(confirmTarget.withdrawal.amount)} and deduct it from ${confirmTarget.withdrawal.full_name ?? confirmTarget.withdrawal.email ?? "this user"}'s balance.`
              : `This will mark the withdrawal of ${fmtAmount(confirmTarget.withdrawal.amount)} as rejected. No balance change will be made.`
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
