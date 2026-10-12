import { Suspense } from "react";
import { LoginTabs } from "@/components/auth/LoginTabs";
import { LoginPageToasts } from "@/components/auth/LoginPageToasts";

export const metadata = { title: "Log in | Course and Notes Purchasing App" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; signup?: string; reset?: string }>;
}) {
  const { reason, signup, reset } = await searchParams;

  return (
    <Suspense>
      <LoginPageToasts signup={signup} reset={reset} />
      {reason === "session_ended" && (
        <div className="mb-4 rounded-xl bg-tone-warning-bg p-3 text-center text-sm text-tone-warning-text">
          You were signed out because your account was logged in elsewhere.
        </div>
      )}
      {reason === "oauth_failed" && (
        <div className="mb-4 rounded-xl bg-tone-danger-bg p-3 text-center text-sm text-tone-danger-text">
          Google sign-in didn&apos;t complete. Please try again.
        </div>
      )}
      <LoginTabs />
    </Suspense>
  );
}
