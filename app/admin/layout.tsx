"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  TrendingUp,
  LineChart,
  Users,
  ArrowUpFromLine,
  ShieldCheck,
  MessageSquare,
  Megaphone,
  Menu,
  LogOut,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";

const activeLinks = [
  { label: "Trades",      href: "/admin/trades",      icon: LineChart },
  { label: "Users",       href: "/admin/users",        icon: Users },
  { label: "Withdrawals", href: "/admin/withdrawals",  icon: ArrowUpFromLine },
  { label: "Support",     href: "/admin/support",      icon: MessageSquare },
  { label: "Marketing",   href: "/admin/marketing",    icon: Megaphone },
];

const comingSoonLinks = [
  { label: "KYC", icon: ShieldCheck },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
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
      {/* Sidebar */}
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

          {comingSoonLinks.map(({ label, icon: Icon }) => (
            <div key={label} className={cn("relative", !collapsed && "px-2")}>
              <div
                title={collapsed ? label : undefined}
                className={cn(
                  "flex items-center rounded-lg cursor-not-allowed opacity-40",
                  collapsed ? "justify-center h-10 w-full" : "gap-3 px-3 py-2.5 w-full"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0 text-muted-foreground" strokeWidth={1.5} />
                {!collapsed && (
                  <span className="text-sm font-medium whitespace-nowrap text-muted-foreground flex-1">
                    {label}
                  </span>
                )}
                {!collapsed && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-overlay text-muted-foreground">
                    Soon
                  </span>
                )}
              </div>
            </div>
          ))}
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

      {/* Right column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="h-14 bg-surface flex items-center px-4 gap-3 flex-shrink-0"
          style={{ borderBottom: "0.5px solid var(--surface-border)" }}
        >
          <button
            onClick={() => setCollapsed((p) => !p)}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
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

        <main className="flex-1 min-w-0 overflow-auto bg-background p-5 pb-[80px] md:pb-5">
          {children}
        </main>
      </div>

      {/* ── Bottom nav (mobile <768px) ────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 h-[64px] bg-surface flex items-center justify-around z-50"
        style={{ borderTop: "0.5px solid var(--surface-border)", width: "100%" }}
      >
        {activeLinks.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center flex-1 h-full min-w-[44px] gap-0.5"
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
                strokeWidth={1.5}
              />
              <span
                className={cn(
                  "text-[10px] leading-none font-medium transition-colors whitespace-nowrap",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
        {comingSoonLinks.map(({ label, icon: Icon }) => (
          <div
            key={label}
            className="flex flex-col items-center justify-center flex-1 h-full min-w-[44px] gap-0.5 opacity-40 cursor-not-allowed"
          >
            <Icon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-[10px] leading-none font-medium text-muted-foreground whitespace-nowrap">
              {label}
            </span>
          </div>
        ))}
      </nav>
    </div>
  );
}
