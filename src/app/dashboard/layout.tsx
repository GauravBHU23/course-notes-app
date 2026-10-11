import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { SessionGuard } from "@/components/realtime/SessionGuard";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const current = await getCurrentProfile("student");
  if (!current) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <SessionGuard userId={current.profile.id} sessionId={current.sessionId} redirectTo="/session-ended" />
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto bg-background p-6 md:p-8">{children}</main>
    </div>
  );
}
