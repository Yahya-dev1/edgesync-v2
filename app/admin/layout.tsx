"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  TrendingUp,
  LineChart,
  Users,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShieldCheck,
  MessageSquare,
  Megaphone,
  Menu,
  X,
  LogOut,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";

const activeLinks = [
  { label: "Trades",      href: "/admin/trades",      icon: LineChart },
  { label: "Users",       href: "/admin/users",        icon: Users },
  { label: "Deposits",    href: "/admin/deposits",     icon: ArrowDownToLine },
  { label: "Withdrawals", href: "/admin/withdrawals",  icon: ArrowUpFromLine },
  { label: "KYC",         href: "/admin/kyc",          icon: ShieldCheck },
  { label: "Support",     href: "/admin/support",      icon: MessageSquare },
  { label: "Marketing",   href: "/admin/marketing",    icon: Megaphone },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background flex w-full overflow-x-hidden">
      {/* ── Desktop sidebar ─────────────────────────────────────── */}
      <aside
        className={cn(
          "hidden md:flex flex-col flex-shrink-0 bg-surface transition-[width] duration-200 overflow-hidden",
          collapsed ? "w-[52px]" : "w-[186px]"
        )}
        style={{ borderRight: "0.5px solid var(--surface-border)" }}
      >
        {/* Logo */}
        <div
          className="h-14 flex items-center flex-shrink-0"
          style={{ borderBottom: "0.5px solid var(--surface-border)" }}
        >
          {collapsed ? (
            <Link href="/admin/trades" className="flex w-full items-center justify-center">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary">
                <TrendingUp className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
              </div>
            </Link>
          ) : (
            <Link href="/admin/trades" className="flex items-center gap-2 px-4 min-w-0">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="text-foreground font-semibold text-sm tracking-tight whitespace-nowrap">
                Admin <span className="text-primary">Panel</span>
              </span>
            </Link>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden flex flex-col gap-0.5">
          {activeLinks.map(({ label, href, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <div key={href} className={cn("relative", !collapsed && "px-2")}>
                <Link
                  href={href}
                  title={collapsed ? label : undefined}
                  className={cn(
                    "flex items-center rounded-lg transition-colors",
                    collapsed ? "justify-center h-10 w-full" : "gap-3 px-3 py-2.5 w-full",
                    active
                      ? "bg-primary/[0.07] text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-overlay"
                  )}
                >
                  <Icon
                    className={cn("w-4 h-4 flex-shrink-0", active ? "text-primary" : "text-muted-foreground")}
                    strokeWidth={1.5}
                  />
                  {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
                </Link>
                {active && !collapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r bg-primary" />
                )}
                {active && collapsed && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-l bg-primary" />
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div
          className="p-2 flex-shrink-0"
          style={{ borderTop: "0.5px solid var(--surface-border)" }}
        >
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title={collapsed ? "Logout" : undefined}
            className={cn(
              "flex items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors disabled:opacity-50 w-full",
              collapsed ? "justify-center h-10" : "gap-3 px-3 py-2.5"
            )}
          >
            {loggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
            ) : (
              <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
            )}
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Right column ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="h-14 bg-surface flex items-center px-4 gap-3 flex-shrink-0"
          style={{ borderBottom: "0.5px solid var(--surface-border)" }}
        >
          {/* Desktop: collapse sidebar */}
          <button
            onClick={() => setCollapsed((p) => !p)}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </button>

          {/* Mobile: open drawer */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors flex-shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary">
              <TrendingUp className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="text-foreground font-semibold text-sm tracking-tight">
              EdgeSync <span className="text-primary">Admin</span>
            </span>
          </div>

          <div className="flex-1" />

          <ThemeToggle />

          <Link
            href="/dashboard"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← User dashboard
          </Link>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors disabled:opacity-50"
            aria-label="Logout"
          >
            {loggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
            )}
          </button>
        </header>

        <main className="flex-1 min-w-0 overflow-auto bg-background p-5">
          {children}
        </main>
      </div>

      {/* ── Mobile drawer ────────────────────────────────────────── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer */}
          <div
            className="md:hidden fixed top-0 left-0 h-full w-64 z-50 bg-surface flex flex-col"
            style={{ borderRight: "0.5px solid var(--surface-border)" }}
          >
            {/* Drawer header */}
            <div
              className="h-14 flex items-center justify-between px-4 flex-shrink-0"
              style={{ borderBottom: "0.5px solid var(--surface-border)" }}
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary">
                  <TrendingUp className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
                </div>
                <span className="text-foreground font-semibold text-sm tracking-tight">
                  Admin <span className="text-primary">Panel</span>
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 py-3 overflow-y-auto flex flex-col gap-0.5 px-2">
              {activeLinks.map(({ label, href, icon: Icon }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                      active
                        ? "bg-primary/[0.07] text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-overlay"
                    )}
                  >
                    <Icon
                      className={cn("w-4 h-4 flex-shrink-0", active ? "text-primary" : "text-muted-foreground")}
                      strokeWidth={1.5}
                    />
                    <span className="text-sm font-medium">{label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div
              className="p-2 flex-shrink-0"
              style={{ borderTop: "0.5px solid var(--surface-border)" }}
            >
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors disabled:opacity-50"
              >
                {loggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                ) : (
                  <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                )}
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
