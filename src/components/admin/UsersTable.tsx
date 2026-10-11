"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import type { Profile } from "@/types/domain";

export function UsersTable({ users }: { users: Profile[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (user) =>
        user.full_name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        (user.mobile ?? "").includes(q)
    );
  }, [users, query]);

  return (
    <div>
      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search by name, email, or mobile"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-50/60 text-left text-foreground/60">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Mobile</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => {
              const isLocked = !!user.locked_until && new Date(user.locked_until) > new Date();
              return (
                <tr key={user.id} className="border-t border-border-subtle">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/admin/users/${user.id}`} className="text-brand-700 hover:underline">
                      {user.full_name || "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-foreground/60">{user.email}</td>
                  <td className="px-4 py-3 text-foreground/60">{user.mobile ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={user.role === "admin" ? "brand" : "neutral"}>{user.role}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={isLocked ? "danger" : "success"}>{isLocked ? "Locked" : "Active"}</Badge>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-foreground/50">
                  No matching users.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
