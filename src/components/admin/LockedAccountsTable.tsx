"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Profile } from "@/types/domain";

export function LockedAccountsTable({ profiles }: { profiles: Profile[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUnlock(id: string) {
    setLoading(id);
    try {
      await fetch(`/api/admin/users/${id}/unlock`, { method: "POST" });
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
            <th className="px-4 py-3 font-medium">Failed attempts</th>
            <th className="px-4 py-3 font-medium">Locked until</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((profile) => (
            <tr key={profile.id} className="border-t border-border-subtle">
              <td className="px-4 py-3">
                <div className="font-medium">{profile.full_name || "—"}</div>
                <div className="text-xs text-foreground/50">{profile.email}</div>
              </td>
              <td className="px-4 py-3">
                <Badge tone="danger">{profile.failed_login_attempts}</Badge>
              </td>
              <td className="px-4 py-3 text-foreground/60">
                {profile.locked_until ? new Date(profile.locked_until).toLocaleString() : "—"}
              </td>
              <td className="px-4 py-3 text-right">
                <Button size="sm" loading={loading === profile.id} onClick={() => handleUnlock(profile.id)}>
                  Unlock
                </Button>
              </td>
            </tr>
          ))}
          {profiles.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-foreground/50">
                No locked accounts right now.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}
