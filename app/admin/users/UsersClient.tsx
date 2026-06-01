"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Pencil, ChevronLeft, ChevronRight, X, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateBalance } from "./actions";

// ─── Types ──────────────────────────────────────────────────────

interface User {
  id: string;
  full_name: string | null;
  email: string | null;
  balance: number;
  role: string;
  is_copying: boolean;
  created_at: string | null;
}

interface Props {
  users: User[];
  totalCount: number;
  page: number;
  totalPages: number;
  search: string;
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

function fmtBalance(n: number | null | undefined) {
  if (n == null) return "$0.00";
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Edit Balance Modal ──────────────────────────────────────────

function EditBalanceModal({
  user,
  onClose,
  onSaved,
}: {
  user: User;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [value, setValue] = useState(String(user.balance ?? 0));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) {
      setError("Enter a valid non-negative balance.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await updateBalance(user.id, num);
      if (result.error) {
        setError(result.error);
      } else {
        onSaved();
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
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-foreground">Edit balance</h2>
            <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[220px]">
              {user.full_name ?? user.email ?? user.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Balance (USD)</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
              className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-shadow"
            />
          </label>

          {error && (
            <p className="text-xs text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save balance
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────

export default function UsersClient({ users, totalCount, page, totalPages, search }: Props) {
  const router = useRouter();
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [searchVal, setSearchVal] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function navigate(newPage: number, newSearch?: string) {
    const s = newSearch !== undefined ? newSearch : searchVal;
    const params = new URLSearchParams();
    if (s.trim()) params.set("search", s.trim());
    if (newPage > 1) params.set("page", String(newPage));
    router.push(`/admin/users${params.size ? "?" + params : ""}`);
  }

  function onSearchChange(val: string) {
    setSearchVal(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => navigate(1, val), 400);
  }

  function afterMutation() {
    setEditTarget(null);
    router.refresh();
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Users</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{totalCount} total</p>
        </div>
      </div>

      {/* Search bar */}
      <div
        className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-surface"
        style={{ border: "0.5px solid var(--surface-border)" }}
      >
        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <input
          value={searchVal}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name or email..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        {searchVal && (
          <button
            onClick={() => onSearchChange("")}
            className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
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
                {["Name", "Email", "Balance", "Role", "Copying", "Joined", ""].map((h) => (
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
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    {search ? "No users match your search." : "No users found."}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t hover:bg-overlay/50 transition-colors"
                    style={{ borderColor: "var(--surface-border)" }}
                  >
                    <td className="px-4 py-3 text-xs font-medium text-foreground whitespace-nowrap">
                      {user.full_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {user.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-foreground tabular-nums whitespace-nowrap">
                      {fmtBalance(user.balance)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize",
                          user.role === "admin"
                            ? "bg-primary/10 text-primary"
                            : "bg-overlay text-muted-foreground"
                        )}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold",
                          user.is_copying
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-overlay text-muted-foreground"
                        )}
                      >
                        {user.is_copying ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {fmtDate(user.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => setEditTarget(user)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors"
                          title="Edit balance"
                        >
                          <Pencil className="w-3.5 h-3.5" />
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

      {/* Edit balance modal */}
      {editTarget && (
        <EditBalanceModal
          user={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={afterMutation}
        />
      )}
    </div>
  );
}
