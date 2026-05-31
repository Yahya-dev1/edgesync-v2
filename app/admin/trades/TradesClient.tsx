"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, X, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { insertTrade, updateTrade, deleteTrade, type TradePayload, type TradeStatus } from "./actions";

// ─── Types ──────────────────────────────────────────────────────

interface Trade {
  id: string;
  trader_name: string;
  symbol: string | null;
  direction: string | null;
  open_price: number | null;
  close_price: number | null;
  pnl_percentage: number | null;
  is_active: boolean | null;
  opened_at: string | null;
  closed_at: string | null;
  created_at: string | null;
}

interface Props {
  trades: Trade[];
  totalCount: number;
  page: number;
  totalPages: number;
  status: "open" | "closed" | "all";
}

// ─── Helpers ────────────────────────────────────────────────────

function fmt(n: number | null | undefined, decimals = 2) {
  if (n == null) return "—";
  return n.toFixed(decimals);
}

function fmtDate(s: string | null | undefined) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Empty state fields for modal ────────────────────────────────

const EMPTY_FORM = {
  symbol: "",
  direction: "buy",
  open_price: "",
  pnl_percentage: "",
  status: "open" as TradeStatus,
  close_price: "",
};

type FormState = typeof EMPTY_FORM;

// ─── Trade Modal ─────────────────────────────────────────────────

function TradeModal({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: "add" | "edit";
  initial?: Trade;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => {
    if (mode === "edit" && initial) {
      return {
        symbol: initial.symbol ?? "",
        direction: initial.direction ?? "buy",
        open_price: initial.open_price != null ? String(initial.open_price) : "",
        pnl_percentage: initial.pnl_percentage != null ? String(initial.pnl_percentage) : "",
        status: initial.is_active ? "open" : "closed",
        close_price: initial.close_price != null ? String(initial.close_price) : "",
      };
    }
    return EMPTY_FORM;
  });

  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isClosed = form.status === "closed";

  const set = (k: keyof FormState, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  function validate(): string | null {
    if (!form.symbol.trim()) return "Symbol is required.";
    if (!form.open_price || isNaN(Number(form.open_price))) return "Valid open price is required.";
    if (form.pnl_percentage === "" || isNaN(Number(form.pnl_percentage))) return "Valid P&L % is required.";
    if (isClosed && (!form.close_price || isNaN(Number(form.close_price))))
      return "Close price is required when status is Closed.";
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError(null);

    const payload: TradePayload = {
      symbol: form.symbol,
      direction: form.direction,
      open_price: Number(form.open_price),
      pnl_percentage: Number(form.pnl_percentage),
      status: form.status,
      close_price: isClosed ? Number(form.close_price) : null,
    };

    startTransition(async () => {
      const result =
        mode === "add"
          ? await insertTrade(payload)
          : await updateTrade(initial!.id, payload);

      if (result.error) {
        setError(result.error);
      } else {
        onSaved();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-md rounded-xl bg-surface p-6 shadow-2xl"
        style={{ border: "0.5px solid var(--surface-border)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-foreground">
            {mode === "add" ? "New trade" : "Edit trade"}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Symbol */}
          <Field label="Symbol">
            <input
              value={form.symbol}
              onChange={(e) => set("symbol", e.target.value)}
              placeholder="e.g. EURUSD"
              className={inputCls}
            />
          </Field>

          {/* Direction */}
          <Field label="Direction">
            <select
              value={form.direction}
              onChange={(e) => set("direction", e.target.value)}
              className={inputCls}
            >
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </Field>

          {/* Open Price */}
          <Field label="Open price">
            <input
              type="number"
              step="any"
              value={form.open_price}
              onChange={(e) => set("open_price", e.target.value)}
              placeholder="1.08500"
              className={inputCls}
            />
          </Field>

          {/* P&L % */}
          <Field label="P&L %">
            <input
              type="number"
              step="any"
              value={form.pnl_percentage}
              onChange={(e) => set("pnl_percentage", e.target.value)}
              placeholder="2.5"
              className={inputCls}
            />
          </Field>

          {/* Status */}
          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value as TradeStatus)}
              className={inputCls}
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </Field>

          {/* Close Price — only shown when closed */}
          {isClosed && (
            <Field label="Close price">
              <input
                type="number"
                step="any"
                value={form.close_price}
                onChange={(e) => set("close_price", e.target.value)}
                placeholder="1.09100"
                className={inputCls}
              />
            </Field>
          )}

          {error && (
            <p className="text-xs text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-1 w-full py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "add" ? "Create trade" : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Delete confirm ──────────────────────────────────────────────

function DeleteDialog({
  trade,
  onClose,
  onDeleted,
}: {
  trade: Trade;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteTrade(trade.id);
      if (result.error) {
        setError(result.error);
      } else {
        onDeleted();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-sm rounded-xl bg-surface p-6 shadow-2xl"
        style={{ border: "0.5px solid var(--surface-border)" }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Delete trade</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {trade.symbol ?? "Unknown"} · {trade.direction?.toUpperCase()}
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-5">
          This action is permanent and cannot be undone.
        </p>

        {error && (
          <p className="text-xs text-red-400 mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:bg-overlay hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={pending}
            className="flex-1 py-2 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Field wrapper ───────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full px-3 py-2 rounded-lg text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-shadow";

// ─── Main component ──────────────────────────────────────────────

export default function TradesClient({ trades, totalCount, page, totalPages, status }: Props) {
  const router = useRouter();
  const [modal, setModal] = useState<{ mode: "add" | "edit"; trade?: Trade } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Trade | null>(null);

  function navigate(newPage: number, newStatus?: string) {
    const s = newStatus ?? status;
    const params = new URLSearchParams();
    if (s !== "all") params.set("status", s);
    if (newPage > 1) params.set("page", String(newPage));
    router.push(`/admin/trades${params.size ? "?" + params : ""}`);
  }

  function onFilterChange(val: string) {
    navigate(1, val);
  }

  function afterMutation() {
    setModal(null);
    setDeleteTarget(null);
    router.refresh();
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Master Trades</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{totalCount} total</p>
        </div>
        <button
          onClick={() => setModal({ mode: "add" })}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New trade
        </button>
      </div>

      {/* Filter bar */}
      <div
        className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-surface"
        style={{ border: "0.5px solid var(--surface-border)" }}
      >
        <span className="text-xs font-medium text-muted-foreground">Status:</span>
        {(["all", "open", "closed"] as const).map((s) => (
          <button
            key={s}
            onClick={() => onFilterChange(s)}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize",
              status === s
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-overlay"
            )}
          >
            {s}
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
                {["Symbol", "Direction", "Open Price", "Close Price", "P&L %", "Status", "Opened", "Closed", ""].map(
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
              {trades.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No trades found.
                  </td>
                </tr>
              ) : (
                trades.map((trade) => (
                  <tr
                    key={trade.id}
                    className="border-t hover:bg-overlay/50 transition-colors"
                    style={{ borderColor: "var(--surface-border)" }}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground whitespace-nowrap">
                      {trade.symbol ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase",
                          trade.direction === "buy"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        )}
                      >
                        {trade.direction ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground tabular-nums">
                      {fmt(trade.open_price, 5)}
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground tabular-nums">
                      {fmt(trade.close_price, 5)}
                    </td>
                    <td className="px-4 py-3 text-xs tabular-nums">
                      <span
                        className={cn(
                          trade.pnl_percentage != null && trade.pnl_percentage >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        )}
                      >
                        {trade.pnl_percentage != null
                          ? `${trade.pnl_percentage >= 0 ? "+" : ""}${fmt(trade.pnl_percentage)}%`
                          : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold",
                          trade.is_active
                            ? "bg-primary/10 text-primary"
                            : "bg-overlay text-muted-foreground"
                        )}
                      >
                        {trade.is_active ? "Open" : "Closed"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {fmtDate(trade.opened_at)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {fmtDate(trade.closed_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => setModal({ mode: "edit", trade })}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(trade)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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

      {/* Modal */}
      {modal && (
        <TradeModal
          mode={modal.mode}
          initial={modal.trade}
          onClose={() => setModal(null)}
          onSaved={afterMutation}
        />
      )}

      {/* Delete dialog */}
      {deleteTarget && (
        <DeleteDialog
          trade={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={afterMutation}
        />
      )}
    </div>
  );
}
