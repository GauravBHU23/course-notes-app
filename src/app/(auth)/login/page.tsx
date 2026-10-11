import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Log in | ExamPrep Store" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; signup?: string }>;
}) {
  const { reason, signup } = await searchParams;

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
      <LoginForm />
    </Suspense>
  );
}
