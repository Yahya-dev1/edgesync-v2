"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  UserCheck,
  Play,
  Square,
  CheckCircle2,
  Clock,
  XCircle,
  Lock,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface Props {
  userId: string;
  initialNotifications: Notification[];
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    return `${m} min ago`;
  }
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600);
    return `${h} hour${h > 1 ? "s" : ""} ago`;
  }
  if (seconds < 604800) {
    const d = Math.floor(seconds / 86400);
    return `${d} day${d > 1 ? "s" : ""} ago`;
  }
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function NotificationIcon({ type }: { type: string }) {
  const map: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    account_created:    { icon: UserCheck,    color: "text-emerald-400", bg: "bg-emerald-500/10" },
    copying_started:    { icon: Play,         color: "text-blue-400",    bg: "bg-blue-500/10" },
    copying_stopped:    { icon: Square,       color: "text-muted-foreground", bg: "bg-overlay" },
    deposit_approved:   { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    deposit_pending:    { icon: Clock,        color: "text-yellow-400",  bg: "bg-yellow-500/10" },
    withdrawal_approved:{ icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    withdrawal_rejected:{ icon: XCircle,      color: "text-red-400",     bg: "bg-red-500/10" },
    password_changed:   { icon: Lock,         color: "text-purple-400",  bg: "bg-purple-500/10" },
  };

  const cfg = map[type] ?? { icon: Bell, color: "text-muted-foreground", bg: "bg-overlay" };
  const Icon = cfg.icon;

  return (
    <div className={cn("w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0", cfg.bg)}>
      <Icon className={cn("w-4 h-4", cfg.color)} strokeWidth={1.5} />
    </div>
  );
}

export default function NotificationsClient({ userId, initialNotifications }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [marking, setMarking] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length === 0) return;
    setMarking(true);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    setMarking(false);
  }, [notifications, userId]);

  const markOneRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_id", userId);
  }, [userId]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("notifications-list")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={marking}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* List */}
      <div
        className="rounded-xl overflow-hidden bg-surface"
        style={{ border: "0.5px solid var(--surface-border)" }}
      >
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-full bg-overlay flex items-center justify-center">
              <Bell className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n, idx) => (
            <button
              key={n.id}
              onClick={() => !n.is_read && markOneRead(n.id)}
              className={cn(
                "w-full flex items-start gap-3 px-4 py-4 text-left transition-colors",
                !n.is_read
                  ? "bg-primary/[0.04] hover:bg-primary/[0.07]"
                  : "hover:bg-overlay/40",
                idx > 0 && "border-t"
              )}
              style={idx > 0 ? { borderColor: "var(--surface-border)" } : undefined}
            >
              <NotificationIcon type={n.type} />

              <div className="flex-1 min-w-0">
                <p className={cn("text-sm leading-snug", !n.is_read ? "text-foreground font-medium" : "text-foreground/80")}>
                  {n.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{timeAgo(n.created_at)}</p>
              </div>

              {!n.is_read && (
                <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
