"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { ActiveSession, Profile, Purchase } from "@/types/domain";

interface UserDetailProps {
  profile: Profile;
  purchases: Purchase[];
  sessions: ActiveSession[];
}

export function UserDetail({ profile, purchases, sessions }: UserDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const isLocked = !!profile.locked_until && new Date(profile.locked_until) > new Date();

  async function handleLockToggle() {
    setLoading("lock");
    try {
      await fetch(`/api/admin/users/${profile.id}/${isLocked ? "unlock" : "lock"}`, { method: "POST" });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function handleRevokeSession(sessionId: string) {
    setLoading(sessionId);
    try {
      await fetch(`/api/admin/sessions/${sessionId}/revoke`, { method: "POST" });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function handleRevokeAll() {
    setLoading("revoke-all");
    try {
      await fetch(`/api/admin/users/${profile.id}/revoke-all-sessions`, { method: "POST" });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{profile.full_name || "—"}</h2>
            <p className="text-sm text-foreground/60">{profile.email}</p>
            <p className="text-sm text-foreground/60">{profile.mobile ?? "No mobile on file"}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge tone={profile.role === "admin" ? "brand" : "neutral"}>{profile.role}</Badge>
            <Badge tone={isLocked ? "danger" : "success"}>{isLocked ? "Locked" : "Active"}</Badge>
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-foreground/50">Failed attempts</dt>
            <dd className="font-medium">{profile.failed_login_attempts}</dd>
          </div>
          <div>
            <dt className="text-foreground/50">Locked until</dt>
            <dd className="font-medium">
              {profile.locked_until ? new Date(profile.locked_until).toLocaleString() : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-foreground/50">Session version</dt>
            <dd className="font-medium">{profile.session_version}</dd>
          </div>
          <div>
            <dt className="text-foreground/50">Joined</dt>
            <dd className="font-medium">{new Date(profile.created_at).toLocaleDateString()}</dd>
          </div>
        </dl>
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            variant={isLocked ? "secondary" : "danger"}
            loading={loading === "lock"}
            onClick={handleLockToggle}
          >
            {isLocked ? "Unlock account" : "Lock account"}
          </Button>
          <Button size="sm" variant="danger" loading={loading === "revoke-all"} onClick={handleRevokeAll}>
            Force logout (all sessions)
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-border-subtle px-4 py-3 font-semibold">Purchases</div>
        <table className="w-full text-sm">
          <thead className="bg-brand-50/60 text-left text-foreground/60">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Access window</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase) => (
              <tr key={purchase.id} className="border-t border-border-subtle">
                <td className="px-4 py-3 font-mono text-xs">{purchase.cashfree_order_id}</td>
                <td className="px-4 py-3">₹{purchase.amount_inr.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">
                  <Badge
                    tone={
                      purchase.status === "success"
                        ? "success"
                        : purchase.status === "pending"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {purchase.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-foreground/60">
                  {purchase.access_starts_at && purchase.access_expires_at
                    ? `${new Date(purchase.access_starts_at).toLocaleDateString()} – ${new Date(purchase.access_expires_at).toLocaleDateString()}`
                    : "—"}
                </td>
              </tr>
            ))}
            {purchases.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-foreground/50">
                  No purchases yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-border-subtle px-4 py-3 font-semibold">Sessions</div>
        <table className="w-full text-sm">
          <thead className="bg-brand-50/60 text-left text-foreground/60">
            <tr>
              <th className="px-4 py-3 font-medium">Device</th>
              <th className="px-4 py-3 font-medium">IP</th>
              <th className="px-4 py-3 font-medium">Last seen</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id} className="border-t border-border-subtle">
                <td className="px-4 py-3">{session.device_label ?? "Unknown device"}</td>
                <td className="px-4 py-3 text-foreground/60">{session.ip_address ?? "—"}</td>
                <td className="px-4 py-3 text-foreground/60">
                  {new Date(session.last_seen_at).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={session.revoked_at ? "neutral" : "success"}>
                    {session.revoked_at ? `Revoked (${session.revoked_reason})` : "Active"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  {!session.revoked_at && (
                    <Button
                      size="sm"
                      variant="danger"
                      loading={loading === session.id}
                      onClick={() => handleRevokeSession(session.id)}
                    >
                      Revoke
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-foreground/50">
                  No sessions recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
