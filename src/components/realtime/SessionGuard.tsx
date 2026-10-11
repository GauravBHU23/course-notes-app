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
 */
export function SessionGuard({ userId, sessionId, redirectTo }: SessionGuardProps) {
  const router = useRouter();
  const loggedOutRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`user-session-${userId}`, {
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, sessionId, redirectTo, router]);

  return null;
}
