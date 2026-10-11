"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { OtpInput } from "@/components/auth/OtpInput";

type Step = "request" | "reset";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("request");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        const message = data.error ?? "Could not send reset code.";
        setError(message);
        toast.error(message);
        return;
      }
      setInfo("If this account exists, a reset code has been emailed to you.");
      toast.success("Reset code sent! Check your email.");
      setStep("reset");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      const message = "Passwords do not match.";
      setError(message);
      toast.error(message);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), code: otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        const message = data.error ?? "Could not reset password.";
        setError(message);
        toast.error(message);
        return;
      }
      toast.success("Password reset successfully!");
      router.push("/login?reset=success");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-8">
      <h1 className="mb-1 text-xl font-bold">Reset your password</h1>
      <p className="mb-6 text-sm text-foreground/60">
        {step === "request"
          ? "Enter your registered email and we'll send you a reset code."
          : "Enter the code we emailed you and choose a new password."}
      </p>

      {info && (
        <p className="mb-4 rounded-lg bg-tone-success-bg p-3 text-sm text-tone-success-text">{info}</p>
      )}

      {step === "request" ? (
        <form onSubmit={handleRequest} className="flex flex-col gap-4">
          <Input
            label="Registered email"
            type="email"
            placeholder="you@example.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="email"
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" loading={loading} disabled={!identifier.trim()}>
            Send reset code
          </Button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <OtpInput value={otp} onChange={setOtp} />
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            autoComplete="new-password"
            required
          />
          <Input
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
            autoComplete="new-password"
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" loading={loading} disabled={otp.length !== 6 || !newPassword}>
            Reset password
          </Button>
          <button
            type="button"
            onClick={() => setStep("request")}
            className="text-xs text-brand-600 hover:underline"
          >
            Didn&apos;t get a code? Try again
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-foreground/60">
        Remembered your password?{" "}
        <a href="/login" className="font-medium text-brand-600 hover:underline">
          Log in
        </a>
      </p>
    </Card>
  );
}
