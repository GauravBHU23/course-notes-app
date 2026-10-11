import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { UserDetail } from "@/components/admin/UserDetail";
import type { ActiveSession, Profile, Purchase } from "@/types/domain";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: profile }, { data: purchases }, { data: sessions }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
    supabase.from("purchases").select("*").eq("user_id", id).order("created_at", { ascending: false }),
    supabase
      .from("active_sessions")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!profile) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">User: {profile.full_name || profile.email}</h1>
      <UserDetail
        profile={profile as Profile}
        purchases={(purchases ?? []) as Purchase[]}
        sessions={(sessions ?? []) as ActiveSession[]}
      />
    </div>
  );
}
