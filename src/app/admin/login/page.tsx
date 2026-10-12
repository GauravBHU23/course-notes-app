import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <Suspense>
          {reason === "oauth_not_allowed" && (
            <div className="mb-4 rounded-xl bg-tone-danger-bg p-3 text-center text-sm text-tone-danger-text">
              Admin accounts can&apos;t use Google sign-in. Please log in with your password below.
            </div>
          )}
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
