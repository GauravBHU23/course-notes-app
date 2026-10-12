"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { GoogleIcon } from "@/components/icons/GoogleIcon";

function safeRedirect(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

export function GoogleSignInButton() {
  const searchParams = useSearchParams();
  const redirectTo = safeRedirect(searchParams.get("redirect"));
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const supabase = createClient();
    const callbackUrl = new URL("/api/auth/callback", window.location.origin);
    if (redirectTo) callbackUrl.searchParams.set("redirect", redirectTo);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl.toString() },
    });

    if (error) {
      setLoading(false);
    }
    // On success the browser navigates away to Google immediately, so
    // nothing else needs to happen here.
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="md"
      loading={loading}
      onClick={handleClick}
      className="w-full gap-2"
    >
      <GoogleIcon className="h-4.5 w-4.5" /> Continue with Google
    </Button>
  );
}
