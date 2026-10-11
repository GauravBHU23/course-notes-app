"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

interface ChatMessage {
  id: number;
  role: "user" | "bot";
  text: string;
}

const WELCOME: ChatMessage = {
  id: 0,
  role: "bot",
  text: "Hi! Ask me about downloads, login issues, payments, purchases, or validity — I'll do my best to help.",
};

export function ChatbotWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const nextId = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  // Never render inside the admin area.
  if (pathname?.startsWith("/admin")) return null;

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { id: nextId.current++, role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      const answer =
        typeof data?.answer === "string"
          ? data.answer
          : "Sorry, something went wrong. Please try again or contact the administrator.";
      setMessages((prev) => [...prev, { id: nextId.current++, role: "bot", text: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId.current++,
          role: "bot",
          text: "Sorry, something went wrong reaching support. Please try again shortly.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.18 }}
          >
            <Card className="flex h-[26rem] w-80 flex-col overflow-hidden p-0 shadow-xl">
              <div className="flex items-center justify-between bg-gradient-to-r from-brand-600 to-accent-500 px-4 py-3 text-white">
                <span className="text-sm font-semibold">Support Chat</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="text-white/80 transition-colors hover:text-white"
                >
                  &times;
                </button>
              </div>

              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                        m.role === "user"
                          ? "bg-brand-600 text-white"
                          : "bg-brand-50 text-foreground"
                      )}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl bg-brand-50 px-3 py-2 text-sm text-foreground/60">
                      Typing…
                    </div>
                  </div>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="flex items-center gap-2 border-t border-border-subtle p-3"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1 rounded-lg border border-border-subtle bg-background px-3 py-2 text-sm outline-none focus:border-brand-500"
                />
                <Button type="submit" size="sm" disabled={loading || !input.trim()}>
                  Send
                </Button>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.95 }}
        aria-label={open ? "Close support chat" : "Open support chat"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-accent-500 text-white shadow-lg shadow-brand-600/30"
      >
        {open ? (
          <span className="text-2xl leading-none">&times;</span>
        ) : (
          <span className="text-xl">💬</span>
        )}
      </motion.button>
    </div>
  );
}
