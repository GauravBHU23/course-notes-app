import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { SessionGuard } from "@/components/realtime/SessionGuard";

/**
 * Wraps every /admin/** route EXCEPT /admin/login — login lives as a
 * sibling outside this (protected) route group specifically so it never
 * inherits this layout (route groups don't affect the URL, so /admin/login
 * still serves at that exact path; this is the standard Next.js pattern for
 * "every child of this segment needs auth except one sibling").
 *
 * src/proxy.ts (Next.js 16's renamed middleware convention) also redirects
 * any /admin/** request without a valid admin_session cookie to
 * /admin/login before this ever runs. An earlier version of this file lived
 * at the project-root `middleware.ts` using the deprecated `middleware`
 * export — that file is silently ignored once the app code lives under
 * `src/` (it must be `src/proxy.ts` exporting `proxy`), which is why it
 * appeared not to fire. This layout's own session+role check remains as a
 * defense-in-depth backstop regardless.
 */
export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const current = await getCurrentProfile("admin");
  if (!current || current.profile.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen">
      <SessionGuard userId={current.profile.id} sessionId={current.sessionId} redirectTo="/admin/login" />
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-background p-6 md:p-8">{children}</main>
    </div>
  );
}
