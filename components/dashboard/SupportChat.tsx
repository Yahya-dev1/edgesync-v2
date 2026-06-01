"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { initSupportConversation } from "@/app/dashboard/support-actions";

interface Message {
  id: string;
  message: string;
  is_admin: boolean;
  sender_id: string;
  created_at: string;
}

interface Props {
  userId: string;
}

export default function SupportChat({ userId }: Props) {
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadOrCreate = useCallback(async () => {
    if (initialized.current) return;
    initialized.current = true;
    setLoading(true);

    try {
      const supabase = createClient();

      const { data: existing } = await supabase
        .from("support_conversations")
        .select("id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const convId =
        existing?.id ?? (await initSupportConversation(userId)).conversationId;

      setConversationId(convId);

      const { data: msgs } = await supabase
        .from("support_messages")
        .select("id, message, is_admin, sender_id, created_at")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      setMessages(msgs ?? []);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (open) loadOrCreate();
  }, [open, loadOrCreate]);

  useEffect(() => {
    if (!conversationId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`support-user-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.some((m) => m.id === payload.new.id)
              ? prev
              : [...prev, payload.new as Message]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const sendMessage = async () => {
    if (!input.trim() || !conversationId || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);

    try {
      const supabase = createClient();
      await supabase.from("support_messages").insert({
        conversation_id: conversationId,
        sender_id: userId,
        is_admin: false,
        message: text,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-[80px] md:bottom-6 w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20 z-40 hover:bg-primary/80 transition-colors"
        aria-label="Open support chat"
      >
        <MessageCircle className="w-5 h-5 text-primary-foreground" strokeWidth={2} />
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-background" />
      </button>

      {/* Backdrop (mobile) */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-[55]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Chat panel */}
      <div
        className={cn(
          "fixed right-4 w-[calc(100vw-32px)] md:w-[380px] bg-surface rounded-2xl shadow-2xl z-[60] flex flex-col overflow-hidden transition-all duration-200",
          "bottom-[80px] md:bottom-6",
          "max-h-[70vh] md:max-h-[520px]",
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
        style={{ border: "0.5px solid var(--surface-border)" }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{ borderBottom: "0.5px solid var(--surface-border)" }}
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-4 h-4 text-primary" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Support</p>
            <p className="text-[11px] text-muted-foreground">
              Typically replies within 1–2 hours
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-overlay transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "max-w-[82%] px-3 py-2 rounded-2xl text-sm leading-relaxed",
                  msg.is_admin
                    ? "self-start bg-overlay text-foreground rounded-tl-sm"
                    : "self-end bg-primary text-primary-foreground rounded-tr-sm"
                )}
              >
                {msg.message}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          className="p-3 flex gap-2 flex-shrink-0"
          style={{ borderTop: "0.5px solid var(--surface-border)" }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type a message..."
            disabled={loading}
            className="flex-1 bg-background rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary/50 transition-colors disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending || loading}
            className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50 flex-shrink-0"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>
    </>
  );
}
