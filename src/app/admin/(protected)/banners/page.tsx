import { createAdminClient } from "@/lib/supabase/admin";
import { BannersManager } from "@/components/admin/BannersManager";
import type { Banner } from "@/types/domain";

export default async function AdminBannersPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("banners")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Banners</h1>
      <BannersManager banners={(data ?? []) as Banner[]} />
    </div>
  );
}
