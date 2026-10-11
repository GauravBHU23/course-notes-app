"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const SESSION_FLAG = "visit-counted";

function formatCount(n: number): string {
  return n.toLocaleString("en-IN");
}

export function VisitorCounterTicker() {
  const [count, setCount] = useState<number | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let alreadyCounted = false;
    try {
      alreadyCounted = sessionStorage.getItem(SESSION_FLAG) === "1";
    } catch {
      // sessionStorage can throw in private browsing — treat as "not counted".
    }

    if (!alreadyCounted) {
      fetch("/api/stats/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          try {
            sessionStorage.setItem(SESSION_FLAG, "1");
          } catch {
            // Ignore — worst case we double-count this session, acceptable.
          }
          if (data && typeof data.total === "number") setCount(data.total);
        })
        .catch(() => {
          /* best-effort, ignore failures */
        });
    }

    // Always fetch the current total for display, counted or not.
    fetch("/api/stats/visitors")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.total === "number") setCount((prev) => prev ?? data.total);
      })
      .catch(() => {
        /* best-effort, ignore failures */
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center gap-1.5 text-sm text-foreground/60">
      <span aria-hidden>👁</span>
      Total visitors:{" "}
      <AnimatePresence mode="wait">
        {count !== null ? (
          <motion.span
            key="count"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="font-semibold text-brand-700"
          >
            {formatCount(count)}
          </motion.span>
        ) : (
          <span className="inline-block h-4 w-10 animate-pulse rounded bg-border-subtle align-middle" />
        )}
      </AnimatePresence>
    </div>
  );
}
