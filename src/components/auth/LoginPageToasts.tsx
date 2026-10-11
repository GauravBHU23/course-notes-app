"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface LoginPageToastsProps {
  signup?: string;
  reset?: string;
}

/**
 * Fires a one-time toast for the signup/reset success notices. The
 * session_ended case stays as a persistent inline banner on the page
 * instead (see login/page.tsx) since that's security-relevant information
 * the user should still see even if they glance at the screen a moment
 * after a toast would have already auto-dismissed.
 */
export function LoginPageToasts({ signup, reset }: LoginPageToastsProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    if (signup === "success") {
      toast.success("Account created! Please log in.");
    }
    if (reset === "success") {
      toast.success("Password reset successfully. Please log in with your new password.");
    }
  }, [signup, reset]);

  return null;
}
