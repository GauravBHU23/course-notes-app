"use client";

import { Toaster } from "sonner";

// Styled via CSS variables already defined in globals.css so toasts follow
// the same manual light/dark override (data-theme attribute) as the rest
// of the app, instead of sonner's own system-preference-only detection.
export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      richColors={false}
      toastOptions={{
        style: {
          background: "var(--surface-raised)",
          color: "var(--foreground)",
          border: "1px solid var(--border-subtle)",
        },
        classNames: {
          success: "!border-l-4 !border-l-emerald-500",
          error: "!border-l-4 !border-l-red-500",
          warning: "!border-l-4 !border-l-amber-500",
          info: "!border-l-4 !border-l-sky-500",
        },
      }}
    />
  );
}
