"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { OtpInput } from "@/components/auth/OtpInput";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useCountdown } from "@/hooks/useCountdown";

type Method = "password" | "otp";

function isEmail(value: string) {
  return value.includes("@");
}

function isMobile(value: string) {
  return /^[6-9]\d{9}$/.test(value.trim());
}

function safeRedirect(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirect(searchParams.get("redirect"));
  const [method, setMethod] = useState<Method>("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockSeconds, setLockSeconds] = useState(0);
  const { formatted, isDone } = useCountdown(lockSeconds);

  const trimmed = identifier.trim();
  const identifierIsEmail = isEmail(trimmed);
  const identifierIsMobile = isMobile(trimmed);
  const otpUnavailable = method === "otp" && identifierIsMobile && !identifierIsEmail;

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: trimmed, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 423) setLockSeconds(data.remainingSeconds ?? 300);
        const message = data.error ?? "Login failed.";
        setError(message);
        toast.error(message);
        return;
      }
      toast.success("Logged in successfully!");
      router.push(data.role === "admin" ? "/admin" : redirectTo ?? "/dashboard");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOtp() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: trimmed, purpose: "login" }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 423) setLockSeconds(data.remainingSeconds ?? 300);
        const message = data.error ?? "Could not send OTP.";
        setError(message);
        toast.error(message);
        return;
      }
      setOtpSent(true);
      toast.success("OTP sent! Check your email.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: trimmed, code: otp, purpose: "login" }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 423) setLockSeconds(data.remainingSeconds ?? 300);
        const message = data.error ?? "Invalid OTP.";
        setError(message);
        toast.error(message);
        return;
      }
      toast.success("Logged in successfully!");
      router.push(data.role === "admin" ? "/admin" : redirectTo ?? "/dashboard");
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
        <p className="text-xs text-foreground/50">
          If this wasn&apos;t you, contact the administrator via WhatsApp or Telegram.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <h1 className="mb-1 text-xl font-bold">Welcome back</h1>
      <p className="mb-6 text-sm text-foreground/60">Log in to access your purchased content.</p>

      <GoogleSignInButton />

      <div className="my-5 flex items-center gap-3 text-xs text-foreground/40">
        <div className="h-px flex-1 bg-border-subtle" />
        or log in with email/mobile
        <div className="h-px flex-1 bg-border-subtle" />
      </div>

      <div className="mb-6 flex rounded-xl bg-brand-50 p-1">
        {(["password", "otp"] as Method[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMethod(m);
              setError(null);
              setOtpSent(false);
            }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              method === m ? "bg-surface-raised text-brand-700 shadow-sm" : "text-brand-600/70"
            }`}
          >
            {m === "password" ? "Password" : "OTP"}
          </button>
        ))}
      </div>

      <Input
        label="Email or mobile number"
        placeholder="you@example.com or 9876543210"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        autoComplete="username"
      />

      <AnimatePresence mode="wait">
        {method === "password" ? (
          <motion.form
            key="password"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            onSubmit={handlePasswordLogin}
            className="mt-4 flex flex-col gap-4"
          >
            <div>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <a
                href="/forgot-password"
                className="mt-1.5 inline-block text-xs text-brand-600 hover:underline"
              >
                Forgot password?
              </a>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" loading={loading} disabled={!trimmed || !password}>
              Log in
            </Button>
          </motion.form>
        ) : (
          <motion.div
            key="otp"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-4 flex flex-col gap-4"
          >
            {otpUnavailable ? (
              <p className="rounded-lg bg-tone-warning-bg p-3 text-sm text-tone-warning-text">
                Mobile OTP login is coming soon. Please use email OTP or password login for now.
              </p>
            ) : !otpSent ? (
              <>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="button" loading={loading} disabled={!trimmed} onClick={handleSendOtp}>
                  Send OTP
                </Button>
              </>
            ) : (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                <OtpInput value={otp} onChange={setOtp} />
                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                <Button type="submit" loading={loading} disabled={otp.length !== 6}>
                  Verify & log in
                </Button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-xs text-brand-600 hover:underline"
                >
                  Resend OTP
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-6 text-center text-sm text-foreground/60">
        Don&apos;t have an account?{" "}
        <a
          href={redirectTo ? `/signup?redirect=${encodeURIComponent(redirectTo)}` : "/signup"}
          className="font-medium text-brand-600 hover:underline"
        >
          Sign up
        </a>
      </p>
    </Card>
  );
}
