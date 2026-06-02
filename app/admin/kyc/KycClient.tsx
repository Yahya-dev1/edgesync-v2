"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { approveKyc, rejectKyc, getDocumentUrls } from "./actions";
import { fmtDate, StatusBadge, ConfirmDialog } from "@/components/admin/shared";

// ─── Types ───────────────────────────────────────────────────────

interface Submission {
  id: string;
  user_id: string;
  id_front_url: string;
  id_back_url: string;
  status: string;
  created_at: string;
  updated_at: string;
  full_name: string | null;
  email: string | null;
}

type KycStatus = "all" | "pending" | "approved" | "rejected";

interface Props {
  submissions: Submission[];
  totalCount: number;
  pendingCount: number;
  page: number;
  totalPages: number;
  status: KycStatus;
}

// ─── Helpers ─────────────────────────────────────────────────────

function isPdf(path: string) {
  return path.toLowerCase().endsWith(".pdf");
}

// ─── Document panel (top-level to prevent remounting) ────────────

function DocPanel({ url, label, path }: { url: string | null; label: string; path: string }) {
  if (!url) return null;
  if (isPdf(path)) {
    return (
      <div className="flex-1">
        <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
        <div
          className="flex flex-col items-center justify-center gap-2 p-6 rounded-lg"
          style={{ background: "var(--muted)", border: "0.5px solid var(--surface-border)" }}
        >
          <ExternalLink className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:underline"
          >
            Open PDF
          </a>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
      <a href={url} target="_blank" rel="noopener noreferrer" title="Open full size">
        <img
          src={url}
          alt={label}
          className="w-full rounded-lg object-contain max-h-64 bg-black/20"
          style={{ border: "0.5px solid var(--surface-border)" }}
        />
      </a>
    </div>
  );
}

// ─── Document viewer modal ────────────────────────────────────────

function DocViewer({
  submission,
  onClose,
}: {
  submission: Submission;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [frontUrl, setFrontUrl] = useState<string | null>(null);
  const [backUrl, setBackUrl] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getDocumentUrls(submission.id_front_url, submission.id_back_url).then((result) => {
      if (!mounted) return;
      if (result.error) {
        setUrlError(result.error);
      } else {
        setFrontUrl(result.frontUrl ?? null);
        setBackUrl(result.backUrl ?? null);
      }
      setLoading(false);
    });
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-2xl rounded-xl bg-surface shadow-2xl overflow-hidden"
        style={{ border: "0.5px solid var(--surface-border)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "0.5px solid var(--surface-border)" }}
        >
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {submission.full_name ?? submission.email ?? submission.user_id}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Submitted {fmtDate(submission.created_at)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading documents…</p>
            </div>
          ) : urlError ? (
            <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{urlError}</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              <DocPanel url={frontUrl} label="ID Front" path={submission.id_front_url} />
              <DocPanel url={backUrl} label="ID Back" path={submission.id_back_url} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────

export default function KycClient({
  submissions,
  totalCount,
  pendingCount,
  page,
  totalPages,
  status,
}: Props) {
  const router = useRouter();
  const [viewTarget, setViewTarget] = useState<Submission | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{
    submission: Submission;
    action: "approve" | "reject";
  } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function navigate(newPage: number, newStatus?: KycStatus) {
    const s = newStatus !== undefined ? newStatus : status;
    const params = new URLSearchParams();
    if (s !== "pending") params.set("status", s);
    if (newPage > 1) params.set("page", String(newPage));
    router.push(`/admin/kyc${params.size ? "?" + params : ""}`);
  }

  function handleConfirm() {
    if (!confirmTarget) return;
    const { submission, action } = confirmTarget;
    setActionError(null);
    startTransition(async () => {
      const result =
        action === "approve"
          ? await approveKyc(submission.id)
          : await rejectKyc(submission.id);
      if (result.error) {
        setActionError(result.error);
      } else {
        setConfirmTarget(null);
        router.refresh();
      }
    });
  }

  const statusFilters: { label: string; value: KycStatus; count?: number }[] = [
    { label: "Pending", value: "pending", count: pendingCount },
    { label: "All", value: "all" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" strokeWidth={1.5} />
            KYC Queue
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">{totalCount} submission{totalCount !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Status filter */}
      <div
        className="flex items-center gap-1 mb-4 p-1 rounded-xl bg-surface w-fit"
        style={{ border: "0.5px solid var(--surface-border)" }}
      >
        {statusFilters.map(({ label, value, count }) => (
          <button
            key={value}
            onClick={() => navigate(1, value)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              status === value
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-overlay"
            )}
          >
            {label}
            {count !== undefined && count > 0 && (
              <span
                className={cn(
                  "inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold",
                  status === value
                    ? "bg-primary text-primary-foreground"
                    : "bg-yellow-500/20 text-yellow-400"
                )}
              >
                {count}
              </span>
            )}
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
                {["User", "Email", "Status", "Submitted", "Updated", "Documents", "Actions"].map(
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
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    {status === "pending"
                      ? "No pending KYC submissions."
                      : status !== "all"
                      ? `No ${status} submissions.`
                      : "No KYC submissions found."}
                  </td>
                </tr>
              ) : (
                submissions.map((s) => (
                  <tr
                    key={s.id}
                    className="border-t hover:bg-overlay/50 transition-colors"
                    style={{ borderColor: "var(--surface-border)" }}
                  >
                    <td className="px-4 py-3 text-xs font-medium text-foreground whitespace-nowrap">
                      {s.full_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {s.email ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {fmtDate(s.created_at)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {fmtDate(s.updated_at)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setViewTarget(s)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                        View
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {s.status === "pending" ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setActionError(null);
                              setConfirmTarget({ submission: s, action: "approve" });
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setActionError(null);
                              setConfirmTarget({ submission: s, action: "reject" });
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

      {/* Document viewer */}
      {viewTarget && (
        <DocViewer submission={viewTarget} onClose={() => setViewTarget(null)} />
      )}

      {/* Confirm dialog */}
      {confirmTarget && (
        <ConfirmDialog
          title={
            confirmTarget.action === "approve" ? "Approve KYC submission?" : "Reject KYC submission?"
          }
          description={
            confirmTarget.action === "approve"
              ? `This will mark ${confirmTarget.submission.full_name ?? confirmTarget.submission.email ?? "this user"}'s identity as verified.`
              : `This will reject ${confirmTarget.submission.full_name ?? confirmTarget.submission.email ?? "this user"}'s submission. They will be asked to resubmit.`
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
          error={actionError}
        />
      )}
    </div>
  );
}
