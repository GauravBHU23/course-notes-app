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
        <div className="mb-4 rounded-xl bg-amber-50 p-3 text-center text-sm text-amber-700">
          You were signed out because your account was logged in elsewhere.
        </div>
      )}
      {signup === "success" && (
        <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-center text-sm text-emerald-700">
          Account created! Please log in.
        </div>
      )}
      <LoginForm />
    </Suspense>
  );
}
