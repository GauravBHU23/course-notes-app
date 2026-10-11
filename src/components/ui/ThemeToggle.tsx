"use client";

import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  // Avoid a hydration mismatch: render a neutral placeholder until the
  // client has read localStorage/system preference on mount.
  if (!mounted) {
    return <div className="h-9 w-9" aria-hidden />;
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle bg-surface text-foreground/70 transition-colors hover:bg-brand-50 hover:text-brand-700"
    >
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
          <path
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            d="M12 2v2M12 20v2M4 12H2M22 12h-2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5">
          <path d="M20.742 13.045a8.088 8.088 0 0 1-2.077.273c-4.464 0-8.08-3.616-8.08-8.08 0-.728.096-1.434.273-2.077a.75.75 0 0 0-.933-.933A9.588 9.588 0 1 0 21.675 13.978a.75.75 0 0 0-.933-.933z" />
        </svg>
      )}
    </button>
  );
}
