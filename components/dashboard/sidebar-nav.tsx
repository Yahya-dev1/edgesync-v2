"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ArrowDownToLine,
  List,
  ArrowUpFromLine,
  MessageCircle,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Copy Trading", href: "/dashboard/copy-trading", icon: Users },
  { label: "Deposit", href: "/dashboard/deposit", icon: ArrowDownToLine },
  { label: "Transactions", href: "/dashboard/transactions", icon: List },
  { label: "Withdraw", href: "/dashboard/withdraw", icon: ArrowUpFromLine },
  { label: "Support", href: "/dashboard/support", icon: MessageCircle },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      {navItems.map(({ label, href, icon: Icon }) => {
        const active =
          href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
              active
                ? "bg-[#00C896]/10 text-[#00C896] font-medium"
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
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
