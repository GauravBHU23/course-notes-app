"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export interface SessionRow {
  id: string;
  device_label: string | null;
  ip_address: string | null;
  last_seen_at: string;
  created_at: string;
  user_name: string;
  user_email: string;
}

export function SessionsTable({ sessions }: { sessions: SessionRow[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleRevoke(id: string) {
    setLoading(id);
    try {
      await fetch(`/api/admin/sessions/${id}/revoke`, { method: "POST" });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card className="overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-brand-50/60 text-left text-foreground/60">
          <tr>
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">Device</th>
            <th className="px-4 py-3 font-medium">IP</th>
            <th className="px-4 py-3 font-medium">Last seen</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.id} className="border-t border-border-subtle">
              <td className="px-4 py-3">
                <div className="font-medium">{session.user_name}</div>
                <div className="text-xs text-foreground/50">{session.user_email}</div>
              </td>
              <td className="px-4 py-3">{session.device_label ?? "Unknown device"}</td>
              <td className="px-4 py-3 text-foreground/60">{session.ip_address ?? "—"}</td>
              <td className="px-4 py-3 text-foreground/60">
                {new Date(session.last_seen_at).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  size="sm"
                  variant="danger"
                  loading={loading === session.id}
                  onClick={() => handleRevoke(session.id)}
                >
                  Revoke
                </Button>
              </td>
            </tr>
          ))}
          {sessions.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-foreground/50">
                No active sessions.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}
