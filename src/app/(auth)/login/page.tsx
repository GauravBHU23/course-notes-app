import { Suspense } from "react";
import { LoginTabs } from "@/components/auth/LoginTabs";

export const metadata = { title: "Log in | Course and Notes Purchasing App" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; signup?: string; reset?: string }>;
}) {
  const { reason, signup, reset } = await searchParams;

  return (
    <Suspense>
      {reason === "session_ended" && (
        <div className="mb-4 rounded-xl bg-tone-warning-bg p-3 text-center text-sm text-tone-warning-text">
          You were signed out because your account was logged in elsewhere.
        </div>
      )}
      {signup === "success" && (
        <div className="mb-4 rounded-xl bg-tone-success-bg p-3 text-center text-sm text-tone-success-text">
          Account created! Please log in.
        </div>
      )}
      {reset === "success" && (
        <div className="mb-4 rounded-xl bg-tone-success-bg p-3 text-center text-sm text-tone-success-text">
          Password reset successfully. Please log in with your new password.
        </div>
      )}
      <LoginTabs />
    </Suspense>
  );
}
