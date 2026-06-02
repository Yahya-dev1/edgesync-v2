"use client";

import { X, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function fmtDate(s: string | null | undefined) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function StatusBadge({ status }: { status: string }) {
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

export function ConfirmDialog({
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
