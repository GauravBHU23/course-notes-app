import Link from "next/link";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/admin";

// Server Component — queries active, currently-in-window banners and renders
// them as a simple promo strip. Intended for the top of the public layout.
// Never throws: a banner-fetch failure (including a missing/unconfigured
// Supabase connection) must not take down the pages that render this.
export async function ActiveBanners() {
  let banners: Array<{
    id: string;
    title: string | null;
    image_url: string | null;
    link_url: string | null;
  }> = [];

  try {
    const supabase = createAdminClient();
    const nowIso = new Date().toISOString();

    const { data, error } = await supabase
      .from("banners")
      .select("id, title, image_url, link_url, display_order, is_active, starts_at, ends_at")
      .eq("is_active", true)
      .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
      .or(`ends_at.is.null,ends_at.gte.${nowIso}`)
      .order("display_order", { ascending: true });

    if (error) throw error;
    banners = data ?? [];
  } catch (err) {
    console.error("[marketing/ActiveBanners] failed to load banners:", err);
    return null;
  }

  if (banners.length === 0) return null;

  return (
    <div className="flex flex-col divide-y divide-white/10">
      {banners.map((banner) => {
        const content = (
          <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-brand-600 to-accent-500 px-4 py-2 text-sm text-white">
            {banner.image_url && (
              <Image
                src={banner.image_url}
                alt=""
                width={24}
                height={24}
                className="h-6 w-6 rounded object-cover"
                unoptimized
              />
            )}
            {banner.title && <span className="font-medium">{banner.title}</span>}
          </div>
        );

        if (banner.link_url) {
          return (
            <Link key={banner.id} href={banner.link_url} className="block hover:opacity-90">
              {content}
            </Link>
          );
        }
        return <div key={banner.id}>{content}</div>;
      })}
    </div>
  );
}
