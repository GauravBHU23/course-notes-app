"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

const DISMISS_KEY = "pwa-install-dismissed";

// Minimal shape of the non-standard BeforeInstallPromptEvent.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function readDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function InstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(readDismissed);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (dismissed || !deferredEvent) return null;

  const handleInstall = async () => {
    try {
      await deferredEvent.prompt();
      await deferredEvent.userChoice;
    } catch {
      // ignore — browser may reject if already handled
    } finally {
      setDeferredEvent(null);
    }
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore — worst case the banner reappears next visit
    }
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface px-4 py-3 shadow-sm"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-accent-500 text-sm text-white">
          &darr;
        </span>
        <div className="flex-1 text-sm">
          <p className="font-medium text-foreground">Install ExamPrep Store</p>
          <p className="text-foreground/60">Add it to your home screen for quick access.</p>
        </div>
        <Button size="sm" onClick={handleInstall}>
          Install App
        </Button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          className="text-foreground/40 transition-colors hover:text-foreground/70"
        >
          &times;
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
