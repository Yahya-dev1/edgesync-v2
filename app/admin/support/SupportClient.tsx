"use client";

import { useState, useEffect, useRef, useTransition, useCallback } from "react";
import { MessageSquare, Send, Loader2, CheckCircle, RotateCcw, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { sendAdminMessage, setConversationStatus } from "./actions";
import type { Conversation } from "./page";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  is_admin: boolean;
  message: string;
  created_at: string;
}

interface Props {
  initialConversations: Conversation[];
  adminUserId: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function SupportClient({ initialConversations, adminUserId }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadIds, setUnreadIds] = useState<Set<string>>(new Set());
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [input, setInput] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "thread">("list");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const selectedIdRef = useRef<string | null>(null);

  const selectedConv = conversations.find((c) => c.id === selectedId);

  // Keep ref in sync for use inside realtime callbacks
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load messages when a conversation is selected
  const loadMessages = useCallback(async (convId: string) => {
    setLoadingMsgs(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("support_messages")
      .select("id, conversation_id, sender_id, is_admin, message, created_at")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    setMessages(data ?? []);
    setLoadingMsgs(false);
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    loadMessages(selectedId);
    setUnreadIds((prev) => {
      const next = new Set(prev);
      next.delete(selectedId);
      return next;
    });
  }, [selectedId, loadMessages]);

  // Realtime: all support_messages (admin sees all via RLS)
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-support-msgs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_messages" },
        (payload) => {
          const msg = payload.new as Message;
          const current = selectedIdRef.current;

          if (msg.conversation_id === current) {
            setMessages((prev) =>
              prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
            );
          } else if (!msg.is_admin) {
            setUnreadIds((prev) => new Set([...prev, msg.conversation_id]));
          }

          setConversations((prev) =>
            prev
              .map((c) =>
                c.id === msg.conversation_id
                  ? {
                      ...c,
                      last_message: msg.message,
                      last_is_admin: msg.is_admin,
                      last_message_at: msg.created_at,
                      updated_at: msg.created_at,
                    }
                  : c
              )
              .sort(
                (a, b) =>
                  new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
              )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Realtime: support_conversations (new convs + status changes)
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-support-convs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_conversations" },
        async (payload) => {
          const raw = payload.new as {
            id: string;
            user_id: string;
            status: string;
            created_at: string;
            updated_at: string;
          };
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", raw.user_id)
            .single();

          const conv: Conversation = {
            id: raw.id,
            user_id: raw.user_id,
            status: raw.status === "closed" ? "closed" : "open",
            created_at: raw.created_at,
            updated_at: raw.updated_at,
            user_name: profile?.full_name ?? profile?.email ?? "Unknown",
            user_email: profile?.email ?? "",
            last_message: null,
            last_is_admin: false,
            last_message_at: raw.created_at,
          };
          setConversations((prev) => [conv, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "support_conversations" },
        (payload) => {
          const updated = payload.new as { id: string; status: string; updated_at: string };
          setConversations((prev) =>
            prev.map((c) =>
              c.id === updated.id
                ? {
                    ...c,
                    status: updated.status === "closed" ? "closed" : "open",
                    updated_at: updated.updated_at,
                  }
                : c
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const selectConversation = (id: string) => {
    setSelectedId(id);
    setMobileView("thread");
  };

  const handleSend = () => {
    if (!input.trim() || !selectedId || selectedConv?.status === "closed") return;
    const text = input.trim();
    const convId = selectedId; // capture before async gap
    setInput("");

    startTransition(async () => {
      await sendAdminMessage(convId, adminUserId, text);

      // Silently reload the thread so the sent message appears without
      // relying on the unfiltered realtime subscription (service-role
      // inserts aren't reliably delivered back to the inserter's channel).
      const supabase = createClient();
      const { data } = await supabase
        .from("support_messages")
        .select("id, conversation_id, sender_id, is_admin, message, created_at")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);

      // Also update the conversation list preview immediately
      const now = new Date().toISOString();
      setConversations((prev) =>
        prev
          .map((c) =>
            c.id === convId
              ? { ...c, last_message: text, last_is_admin: true, last_message_at: now, updated_at: now }
              : c
          )
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      );
    });
  };

  const handleToggleStatus = () => {
    if (!selectedId || !selectedConv) return;
    const next = selectedConv.status === "open" ? "closed" : "open";
    startTransition(async () => {
      await setConversationStatus(selectedId, next);
    });
  };

  return (
    <div
      className="flex h-[calc(100vh-156px)] md:h-[calc(100vh-96px)] rounded-xl overflow-hidden"
      style={{ border: "0.5px solid var(--surface-border)" }}
    >
      {/* ── Left panel: conversation list ──────────────────────── */}
      <div
        className={cn(
          "w-full md:w-[280px] flex-shrink-0 flex flex-col bg-surface",
          mobileView === "thread" && selectedId ? "hidden md:flex" : "flex"
        )}
        style={{ borderRight: "0.5px solid var(--surface-border)" }}
      >
        {/* List header */}
        <div
          className="h-12 flex items-center px-4 gap-2 flex-shrink-0"
          style={{ borderBottom: "0.5px solid var(--surface-border)" }}
        >
          <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
          <span className="text-sm font-semibold text-foreground flex-1">Support</span>
          {conversations.length > 0 && (
            <span className="text-xs text-muted-foreground">{conversations.length}</span>
          )}
        </div>

        {/* List body */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 p-6 text-center">
              <MessageSquare className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = selectedId === conv.id;
              const hasUnread = unreadIds.has(conv.id);
              return (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 flex flex-col gap-1 transition-colors",
                    isSelected ? "bg-primary/[0.07]" : "hover:bg-overlay"
                  )}
                  style={{ borderBottom: "0.5px solid var(--surface-border)" }}
                >
                  <div className="flex items-center gap-1.5">
                    {hasUnread && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                    <span
                      className={cn(
                        "text-sm font-medium truncate flex-1",
                        isSelected ? "text-primary" : "text-foreground"
                      )}
                    >
                      {conv.user_name}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0 whitespace-nowrap">
                      {timeAgo(conv.last_message_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground truncate flex-1">
                      {conv.last_message
                        ? `${conv.last_is_admin ? "You: " : ""}${conv.last_message}`
                        : "No messages yet"}
                    </p>
                    <span
                      className={cn(
                        "text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0",
                        conv.status === "open"
                          ? "bg-emerald-500/15 text-emerald-500"
                          : "bg-overlay text-muted-foreground"
                      )}
                    >
                      {conv.status}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right panel: thread ─────────────────────────────────── */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 bg-background",
          mobileView === "list" && !selectedId ? "hidden md:flex" : "flex"
        )}
      >
        {!selectedId ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <MessageSquare className="w-10 h-10 text-muted-foreground" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-foreground">No conversation selected</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pick one from the list to view the thread
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div
              className="h-12 flex items-center gap-3 px-4 flex-shrink-0 bg-surface"
              style={{ borderBottom: "0.5px solid var(--surface-border)" }}
            >
              <button
                onClick={() => setMobileView("list")}
                className="md:hidden w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              </button>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {selectedConv?.user_name}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {selectedConv?.user_email}
                </p>
              </div>

              <span
                className={cn(
                  "text-[9px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0",
                  selectedConv?.status === "open"
                    ? "bg-emerald-500/15 text-emerald-500"
                    : "bg-overlay text-muted-foreground"
                )}
              >
                {selectedConv?.status}
              </span>

              <button
                onClick={handleToggleStatus}
                disabled={isPending}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
              >
                {isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : selectedConv?.status === "open" ? (
                  <CheckCircle className="w-3 h-3" strokeWidth={1.5} />
                ) : (
                  <RotateCcw className="w-3 h-3" strokeWidth={1.5} />
                )}
                {selectedConv?.status === "open" ? "Close" : "Reopen"}
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 min-h-0">
              {loadingMsgs ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center py-10">
                  <p className="text-sm text-muted-foreground">No messages yet</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed",
                      msg.is_admin
                        ? "self-end bg-primary text-primary-foreground rounded-tr-sm"
                        : "self-start bg-surface text-foreground rounded-tl-sm"
                    )}
                    style={
                      !msg.is_admin
                        ? { border: "0.5px solid var(--surface-border)" }
                        : undefined
                    }
                  >
                    {msg.message}
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Reply input */}
            <div
              className="p-3 flex gap-2 flex-shrink-0 bg-surface"
              style={{ borderTop: "0.5px solid var(--surface-border)" }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  selectedConv?.status === "closed"
                    ? "Conversation closed"
                    : "Reply as admin…"
                }
                disabled={selectedConv?.status === "closed" || isPending}
                className="flex-1 bg-background rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary/50 transition-colors disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={
                  !input.trim() || isPending || selectedConv?.status === "closed"
                }
                className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50 flex-shrink-0"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" strokeWidth={2} />
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
