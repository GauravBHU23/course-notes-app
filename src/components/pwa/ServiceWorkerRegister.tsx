"use client";

import { useEffect } from "react";

// Mounted once in the root layout. Registers /sw.js (see public/sw.js) which
// explicitly never caches anything under /api/pdf/.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    try {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("[pwa] service worker registration failed:", err);
      });
    } catch (err) {
      console.error("[pwa] service worker registration threw:", err);
    }
  }, []);

  return null;
}
