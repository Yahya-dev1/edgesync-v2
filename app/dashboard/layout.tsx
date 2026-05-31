import { redirect } from "next/navigation";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import SidebarNav from "@/components/dashboard/sidebar-nav";
import LogoutButton from "@/components/dashboard/logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch profile for display name
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  const displayName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    profile?.email ||
    user.email ||
    "User";

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-[#080d1a] flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 flex-shrink-0 border-r border-white/6 bg-[#080d1a]">
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-white/6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#00C896]">
              <TrendingUp className="w-4 h-4 text-[#080d1a]" strokeWidth={2.5} />
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">
              EdgeSync <span className="text-[#00C896]">Markets</span>
            </span>
          </Link>
        </div>

        {/* Nav */}
        <div className="flex-1 px-3 py-4 overflow-y-auto">
          <SidebarNav />
        </div>

        {/* User section at bottom */}
        <div className="p-3 border-t border-white/6">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-7 h-7 rounded-full bg-[#00C896]/20 border border-[#00C896]/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-[#00C896]">
                {initials}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {displayName}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {profile?.email || user.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-white/6 bg-[#080d1a] flex items-center justify-between px-5 flex-shrink-0">
          {/* Mobile logo */}
          <Link href="/" className="flex md:hidden items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#00C896]">
              <TrendingUp className="w-4 h-4 text-[#080d1a]" strokeWidth={2.5} />
            </div>
            <span className="text-white font-semibold text-sm">
              EdgeSync <span className="text-[#00C896]">Markets</span>
            </span>
          </Link>

          {/* Desktop greeting */}
          <p className="hidden md:block text-sm text-slate-400">
            Welcome back,{" "}
            <span className="text-white font-medium">
              {displayName.split(" ")[0]}
            </span>
          </p>

          {/* Right side */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-[#00C896]/20 border border-[#00C896]/30 flex items-center justify-center">
              <span className="text-[10px] font-bold text-[#00C896]">
                {initials}
              </span>
            </div>
            <LogoutButton />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
