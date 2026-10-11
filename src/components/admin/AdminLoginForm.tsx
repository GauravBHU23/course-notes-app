"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCountdown } from "@/hooks/useCountdown";

export function AdminLoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockSeconds, setLockSeconds] = useState(0);
  const { formatted, isDone } = useCountdown(lockSeconds);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 423) setLockSeconds(data.remainingSeconds ?? 300);
        setError(data.error ?? "Login failed.");
        return;
      }
      if (data.role !== "admin") {
        setError("This account does not have admin access.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (lockSeconds > 0 && !isDone) {
    return (
      <Card className="p-8 text-center">
        <h2 className="mb-2 text-lg font-semibold text-red-600">Account locked</h2>
        <p className="mb-4 text-sm text-foreground/70">
          Too many failed attempts. Please try again in:
        </p>
        <div className="mb-4 text-3xl font-bold tabular-nums text-red-600">{formatted}</div>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <h1 className="mb-1 text-xl font-bold">Admin sign in</h1>
      <p className="mb-6 text-sm text-foreground/60">Restricted access — authorized staff only.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email or mobile number"
          placeholder="admin@example.com"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          autoComplete="username"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" loading={loading} disabled={!identifier.trim() || !password}>
          Log in
        </Button>
      </form>
    </Card>
  );
}
