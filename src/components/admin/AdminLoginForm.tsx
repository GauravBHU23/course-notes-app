"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { OtpInput } from "@/components/auth/OtpInput";
import { useCountdown } from "@/hooks/useCountdown";

type Step = "password" | "otp";

export function AdminLoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [verifiedIdentifier, setVerifiedIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockSeconds, setLockSeconds] = useState(0);
  const { formatted, isDone } = useCountdown(lockSeconds);

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin/login-step1", {
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
      setMaskedEmail(data.maskedEmail);
      setVerifiedIdentifier(data.identifier);
      setStep("otp");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin/login-step2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: verifiedIdentifier, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Invalid OTP.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin/login-step1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not resend OTP.");
        return;
      }
      setOtp("");
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

  if (step === "otp") {
    return (
      <Card className="p-8">
        <h1 className="mb-1 text-xl font-bold">Verify it&apos;s you</h1>
        <p className="mb-6 text-sm text-foreground/60">
          We emailed a 6-digit code to <span className="font-medium text-foreground">{maskedEmail}</span>.
          Enter it below to finish signing in.
        </p>

        <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
          <OtpInput value={otp} onChange={setOtp} />
          {error && <p className="text-center text-sm text-red-500">{error}</p>}
          <Button type="submit" loading={loading} disabled={otp.length !== 6}>
            Verify & continue
          </Button>
          <button
            type="button"
            onClick={handleResendOtp}
            className="text-xs text-brand-600 hover:underline"
          >
            Resend code
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("password");
              setOtp("");
              setError(null);
            }}
            className="text-xs text-foreground/50 hover:underline"
          >
            &larr; Back
          </button>
        </form>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <h1 className="mb-1 text-xl font-bold">Admin sign in</h1>
      <p className="mb-6 text-sm text-foreground/60">
        Restricted access — authorized staff only. A one-time code will be emailed to you after
        your password is verified.
      </p>

      <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
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
          Continue
        </Button>
      </form>
    </Card>
  );
}
