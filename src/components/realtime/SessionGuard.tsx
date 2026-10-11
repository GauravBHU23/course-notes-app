"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface SessionGuardProps {
  userId: string;
  sessionId: string;
  redirectTo: string;
}

/**
 * Mounted once in dashboard/admin layouts. Subscribes to this user's
 * realtime broadcast channel and force-logs-out this tab the instant a
 * newer login happens elsewhere, without waiting for the next request.
 * The per-request middleware check is still the authoritative fallback for
 * tabs that are closed, offline, or miss the broadcast.
 *
 * createBrowserClient (from @supabase/ssr) reads the session from cookies
 * but does NOT automatically propagate that JWT into the realtime module
 * the way a plain supabase-js client with localStorage persistence does --
 * without the explicit realtime.setAuth() call below, a `private: true`
 * channel subscription gets CHANNEL_ERROR ("Unauthorized"), confirmed by
 * direct testing. Must also be refreshed on token refresh
 * (onAuthStateChange), since realtime auth doesn't auto-update when the
 * underlying JWT rotates. The server side (lib/auth/session.ts) must also
 * publish with config: { private: true } to match -- a private channel and
 * a public one with the identical topic string are different routing paths,
 * so a mismatch here silently drops every broadcast even when both the
 * publish and the subscribe otherwise succeed (also confirmed by testing).
 */
export function SessionGuard({ userId, sessionId, redirectTo }: SessionGuardProps) {
  const router = useRouter();
  const loggedOutRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    async function setup() {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (accessToken) {
        await supabase.realtime.setAuth(accessToken);
      }
      if (cancelled) return;

      channel = supabase.channel(`user-session-${userId}`, {
        config: { private: true },
      });

      channel
        .on("broadcast", { event: "force_logout" }, (message) => {
          const newSessionId = (message.payload as { newSessionId: string | null } | undefined)?.newSessionId;
          if (loggedOutRef.current) return;
          if (newSessionId === sessionId) return; // this tab is the new session itself

          loggedOutRef.current = true;
          fetch("/api/auth/logout", { method: "POST" }).finally(() => {
            router.replace(`${redirectTo}?reason=session_ended`);
          });
        })
        .subscribe();
    }

    setup();

    // Keep the realtime module's auth in sync if the Supabase JWT refreshes
    // during this tab's lifetime (access tokens are short-lived).
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) {
        supabase.realtime.setAuth(session.access_token);
      }
    });

    return () => {
      cancelled = true;
      authListener.subscription.unsubscribe();
      if (channel) supabase.removeChannel(channel);
    };
  }, [userId, sessionId, redirectTo, router]);

  return null;
}
