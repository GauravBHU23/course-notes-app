"use client";

import { useEffect } from "react";

/**
 * Deters casual copying of marketing page text/descriptions: blocks
 * right-click, text selection, and Ctrl+C/Ctrl+A/Ctrl+S/Ctrl+P/F12/devtools
 * shortcuts, and applies CSS user-select: none site-wide on pages that
 * mount this.
 *
 * This is a deterrent, not a real protection -- it cannot stop view-source,
 * browser devtools, reading the page's HTML/network response directly, or
 * a screenshot/photo of the screen. No client-side JavaScript can prevent
 * any of those; anyone who specifically wants the text can still get it.
 * Mounted only on public marketing pages, not dashboard/admin, since those
 * need normal copy-paste for everyday use (copying an email, order ID, etc).
 */
export function ContentProtection() {
  useEffect(() => {
    function blockContextMenu(e: MouseEvent) {
      e.preventDefault();
    }
    function isFormField(target: EventTarget | null): boolean {
      if (!(target instanceof HTMLElement)) return false;
      return target.closest("input, textarea, [contenteditable='true']") !== null;
    }

    function blockSelectStart(e: Event) {
      if (isFormField(e.target)) return;
      e.preventDefault();
    }
    function blockShortcuts(e: KeyboardEvent) {
      if (isFormField(e.target)) return;
      const key = e.key.toLowerCase();
      const blocked =
        (e.ctrlKey && ["c", "a", "s", "p", "u"].includes(key)) ||
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(key));
      if (blocked) e.preventDefault();
    }

    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("selectstart", blockSelectStart);
    document.addEventListener("keydown", blockShortcuts);

    document.body.classList.add("no-select");

    return () => {
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("selectstart", blockSelectStart);
      document.removeEventListener("keydown", blockShortcuts);
      document.body.classList.remove("no-select");
    };
  }, []);

  return null;
}
