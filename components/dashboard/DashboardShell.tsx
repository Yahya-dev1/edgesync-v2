"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  TrendingUp,
  LayoutDashboard,
  Users,
  ArrowDownToLine,
  List,
  ArrowUpFromLine,
  Settings,
  Menu,
  Bell,
  MessageCircle,
  LogOut,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { label: "Dashboard",    href: "/dashboard",              icon: LayoutDashboard },
  { label: "Copy Trading", href: "/dashboard/copy-trading", icon: Users },
  { label: "Deposit",      href: "/dashboard/deposit",      icon: ArrowDownToLine },
  { label: "Transactions", href: "/dashboard/transactions", icon: List },
  { label: "Withdraw",     href: "/dashboard/withdraw",     icon: ArrowUpFromLine },
  { label: "Settings",     href: "/dashboard/settings",     icon: Settings },
];

const bottomNavItems = [
  { label: "Dashboard",    href: "/dashboard",              icon: LayoutDashboard },
  { label: "Copy Trading", href: "/dashboard/copy-trading", icon: Users },
  { label: "Deposit",      href: "/dashboard/deposit",      icon: ArrowDownToLine },
  { label: "Transactions", href: "/dashboard/transactions", icon: List },
  { label: "Settings",     href: "/dashboard/settings",     icon: Settings },
];

interface Props {
  children: React.ReactNode;
  displayName: string;
  initials: string;
}

export default function DashboardShell({ children, displayName, initials }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("sidebar-collapsed") === "true") setCollapsed(true);
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-[#080d1a] flex w-full overflow-x-hidden">

      {/* ── Sidebar (desktop ≥768px) ────────────────────────────── */}
      <aside
        className={cn(
          "hidden md:flex flex-col flex-shrink-0 bg-[#0b1120] transition-[width] duration-200 overflow-hidden",
          collapsed ? "w-[52px]" : "w-[186px]"
        )}
        style={{ borderRight: "0.5px solid #162035" }}
      >
        {/* Logo row */}
        <div
          className="h-14 flex items-center flex-shrink-0"
          style={{ borderBottom: "0.5px solid #162035" }}
        >
          {collapsed ? (
            <Link
              href="/"
              className="flex w-full items-center justify-center"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#00C896]">
                <TrendingUp className="w-4 h-4 text-[#080d1a]" strokeWidth={2.5} />
              </div>
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2 px-4 min-w-0">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#00C896] flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-[#080d1a]" strokeWidth={2.5} />
              </div>
              <span className="text-white font-semibold text-sm tracking-tight whitespace-nowrap">
                EdgeSync <span className="text-[#00C896]">Markets</span>
              </span>
            </Link>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden flex flex-col gap-0.5">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <div
                key={href}
                className={cn("relative", !collapsed && "px-2")}
              >
                <Link
                  href={href}
                  title={collapsed ? label : undefined}
                  className={cn(
                    "flex items-center rounded-lg transition-colors",
                    collapsed ? "justify-center h-10 w-full" : "gap-3 px-3 py-2.5 w-full",
                    active
                      ? "bg-[rgba(0,200,150,0.07)] text-[#00C896]"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 flex-shrink-0",
                      active ? "text-[#00C896]" : "text-slate-500"
                    )}
                    strokeWidth={1.5}
                  />
                  {!collapsed && (
                    <span className="text-sm font-medium whitespace-nowrap">{label}</span>
                  )}
                </Link>

                {/* Active border — left when expanded, right when collapsed */}
                {active && !collapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r bg-[#00C896]" />
                )}
                {active && collapsed && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-l bg-[#00C896]" />
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* ── Right column ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header
          className="h-14 bg-[#0b1120] flex items-center px-4 gap-2 flex-shrink-0"
          style={{ borderBottom: "0.5px solid #162035" }}
        >
          {/* Hamburger — desktop only */}
          <button
            onClick={toggle}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#00C896]">
              <TrendingUp className="w-4 h-4 text-[#080d1a]" strokeWidth={2.5} />
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">
              EdgeSync <span className="text-[#00C896]">Markets</span>
            </span>
          </Link>

          <div className="flex-1" />

          {/* Notification bell */}
          <button
            className="relative flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" strokeWidth={1.5} />
            <span className="absolute top-[7px] right-[7px] w-[6px] h-[6px] rounded-full bg-red-500" />
          </button>

          {/* User avatar pill */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.07]">
            <div className="w-5 h-5 rounded-full bg-[#00C896]/20 border border-[#00C896]/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] font-bold text-[#00C896] leading-none">
                {initials}
              </span>
            </div>
            <span className="text-sm font-medium text-white hidden sm:block max-w-[90px] truncate">
              {displayName.split(" ")[0]}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
            aria-label="Logout"
          >
            {loggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
            )}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 min-w-0 overflow-auto bg-[#080d1a] p-4 pb-[76px] md:p-5 md:pb-5">
          {children}
        </main>
      </div>

      {/* ── Bottom nav (mobile <768px) ────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 h-[64px] bg-[#0b1120] flex items-center justify-around z-50"
        style={{ borderTop: "0.5px solid #162035", width: "100%" }}
      >
        {bottomNavItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center flex-1 h-full min-w-[44px] gap-0.5"
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  active ? "text-[#00C896]" : "text-slate-500"
                )}
                strokeWidth={1.5}
              />
              <span
                className={cn(
                  "text-[0.75rem] leading-tight font-medium transition-colors",
                  active ? "text-[#00C896]" : "text-slate-500"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ── Floating chat button ──────────────────────────────────── */}
      <button
        className="fixed right-4 bottom-[80px] md:bottom-6 w-12 h-12 rounded-full bg-[#00C896] flex items-center justify-center shadow-lg shadow-[#00C896]/20 z-40 hover:bg-[#00b084] transition-colors"
        aria-label="Chat"
      >
        <MessageCircle className="w-5 h-5 text-[#080d1a]" strokeWidth={2} />
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-[#080d1a]" />
      </button>
    </div>
  );
}
