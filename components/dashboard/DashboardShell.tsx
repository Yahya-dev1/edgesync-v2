"use client";

import { useState, useEffect, useCallback } from "react";
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
  BarChart2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { label: "Dashboard",    href: "/dashboard",              icon: LayoutDashboard },
  { label: "Copy Trading", href: "/dashboard/copy-trading", icon: Users },
  { label: "Markets",      href: "/dashboard/markets",      icon: BarChart2 },
  { label: "Deposit",      href: "/dashboard/deposit",      icon: ArrowDownToLine },
  { label: "Transactions", href: "/dashboard/transactions", icon: List },
  { label: "Withdraw",     href: "/dashboard/withdraw",     icon: ArrowUpFromLine },
  { label: "Settings",     href: "/dashboard/settings",     icon: Settings },
];

const drawerNavItems = [
  { label: "Dashboard",     href: "/dashboard",               icon: LayoutDashboard },
  { label: "Copy Trading",  href: "/dashboard/copy-trading",  icon: Users },
  { label: "Markets",       href: "/dashboard/markets",       icon: BarChart2 },
  { label: "Transactions",  href: "/dashboard/transactions",  icon: List },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Withdraw",      href: "/dashboard/withdraw",      icon: ArrowUpFromLine },
  { label: "Deposit",       href: "/dashboard/deposit",       icon: ArrowDownToLine },
  { label: "Settings",      href: "/dashboard/settings",      icon: Settings },
];

const bottomNavItems = [
  { label: "Dashboard", href: "/dashboard",          icon: LayoutDashboard },
  { label: "Deposit",   href: "/dashboard/deposit",  icon: ArrowDownToLine },
  { label: "Withdraw",  href: "/dashboard/withdraw", icon: ArrowUpFromLine },
];

interface Props {
  children: React.ReactNode;
  displayName: string;
  initials: string;
  userId: string;
}

export default function DashboardShell({ children, displayName, initials, userId }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("sidebar-collapsed") === "true") setCollapsed(true);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const fetchUnreadCount = useCallback(async () => {
    const supabase = createClient();
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    setUnreadCount(count ?? 0);
  }, [userId]);

  useEffect(() => {
    fetchUnreadCount();

    const supabase = createClient();
    const channel = supabase
      .channel("notifications-badge")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => setUnreadCount((prev) => prev + 1)
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        fetchUnreadCount
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, fetchUnreadCount]);

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
    <>
      <div className="min-h-screen bg-background flex w-full overflow-x-hidden">

        {/* ── Sidebar (desktop ≥768px) ──────────────────────────── */}
        <aside
          className={cn(
            "hidden md:flex flex-col flex-shrink-0 bg-surface transition-[width] duration-200 overflow-hidden",
            collapsed ? "w-[52px]" : "w-[186px]"
          )}
          style={{ borderRight: "0.5px solid var(--surface-border)" }}
        >
          {/* Logo row */}
          <div
            className="h-14 flex items-center flex-shrink-0"
            style={{ borderBottom: "0.5px solid var(--surface-border)" }}
          >
            {collapsed ? (
              <Link href="/" className="flex w-full items-center justify-center">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary">
                  <TrendingUp className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
                </div>
              </Link>
            ) : (
              <Link href="/" className="flex items-center gap-2 px-4 min-w-0">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
                </div>
                <span className="text-foreground font-semibold text-sm tracking-tight whitespace-nowrap">
                  EdgeSync <span className="text-primary">Markets</span>
                </span>
              </Link>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden flex flex-col gap-0.5">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = isActive(href);
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
                    {!collapsed && (
                      <span className="text-sm font-medium whitespace-nowrap">{label}</span>
                    )}
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
        </aside>

        {/* ── Right column ─────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Top bar */}
          <header
            className="h-14 bg-surface flex items-center px-4 gap-2 flex-shrink-0"
            style={{ borderBottom: "0.5px solid var(--surface-border)" }}
          >
            {/* Mobile hamburger — opens drawer */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex md:hidden items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors flex-shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>

            {/* Desktop hamburger — collapses sidebar */}
            <button
              onClick={toggle}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors flex-shrink-0"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary">
                <TrendingUp className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="text-foreground font-semibold text-sm tracking-tight">
                EdgeSync <span className="text-primary">Markets</span>
              </span>
            </Link>

            <div className="flex-1" />

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Notification bell */}
            <Link
              href="/dashboard/notifications"
              className="relative flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" strokeWidth={1.5} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-0.5 rounded-full bg-red-500 border-2 border-background flex items-center justify-center">
                  <span className="text-[9px] font-bold text-white leading-none">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                </span>
              )}
            </Link>

            {/* User avatar pill */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-subtle border border-border">
              <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <span className="text-[9px] font-bold text-primary leading-none">{initials}</span>
              </div>
              <span className="text-sm font-medium text-foreground hidden sm:block max-w-[90px] truncate">
                {displayName.split(" ")[0]}
              </span>
            </div>

            {/* Logout */}
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

          {/* Page content */}
          <main className="flex-1 min-w-0 overflow-auto bg-background p-[16px] pb-[80px] md:p-5 md:pb-5">
            {children}
          </main>
        </div>

        {/* ── Bottom nav (mobile, 3 items) ─────────────────────── */}
        <nav
          className="md:hidden fixed bottom-0 left-0 h-[64px] bg-surface flex items-center justify-around z-50"
          style={{ borderTop: "0.5px solid var(--surface-border)", width: "100%" }}
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
                  className={cn("w-5 h-5 transition-colors", active ? "text-primary" : "text-muted-foreground")}
                  strokeWidth={1.5}
                />
                <span
                  className={cn(
                    "text-[10px] leading-none font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Mobile drawer backdrop ────────────────────────────── */}
      <div
        className={cn(
          "md:hidden fixed inset-0 bg-black/50 z-[60] transition-opacity duration-200",
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* ── Mobile drawer panel ───────────────────────────────── */}
      <div
        className={cn(
          "md:hidden fixed left-0 top-0 h-full w-72 bg-surface z-[61] flex flex-col transition-transform duration-200 ease-in-out",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ borderRight: "0.5px solid var(--surface-border)" }}
      >
        {/* Drawer header */}
        <div
          className="h-14 flex items-center justify-between px-4 flex-shrink-0"
          style={{ borderBottom: "0.5px solid var(--surface-border)" }}
        >
          <Link href="/" className="flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="text-foreground font-semibold text-sm tracking-tight">
              EdgeSync <span className="text-primary">Markets</span>
            </span>
          </Link>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Drawer nav links */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-0.5">
          {drawerNavItems.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            const isNotif = href === "/dashboard/notifications";
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  active
                    ? "bg-primary/[0.07] text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-overlay"
                )}
              >
                <div className="relative flex-shrink-0">
                  <Icon
                    className={cn("w-4 h-4", active ? "text-primary" : "text-muted-foreground")}
                    strokeWidth={1.5}
                  />
                  {isNotif && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[13px] h-[13px] px-0.5 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-white leading-none">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Drawer footer: user + logout */}
        <div
          className="p-4 flex-shrink-0"
          style={{ borderTop: "0.5px solid var(--surface-border)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-primary leading-none">{initials}</span>
            </div>
            <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors disabled:opacity-50"
          >
            {loggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
            ) : (
              <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
            )}
            <span className="text-sm font-medium">Log out</span>
          </button>
        </div>
      </div>

      {/* ── Floating chat button ──────────────────────────────── */}
      <button
        className="fixed right-4 bottom-[80px] md:bottom-6 w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20 z-40 hover:bg-primary/80 transition-colors"
        aria-label="Chat"
      >
        <MessageCircle className="w-5 h-5 text-primary-foreground" strokeWidth={2} />
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-background" />
      </button>
    </>
  );
}
