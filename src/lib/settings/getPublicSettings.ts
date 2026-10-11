import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export interface PublicSettings {
  whatsappLink: string;
  telegramLink: string;
  apkDownloadLink: string;
  supportEmail: string;
  supportPhone: string;
  announcementBannerText: string;
  announcementBannerActive: boolean;
}

const FALLBACKS: PublicSettings = {
  whatsappLink: "#",
  telegramLink: "#",
  apkDownloadLink: "#",
  supportEmail: "",
  supportPhone: "",
  announcementBannerText: "",
  announcementBannerActive: false,
};

// settings is a key/value table (see 0005_site_visits_counters_settings_banners.sql).
// Reads are public per RLS, but we still go through the admin client since this
// is only ever called from Server Components/routes and avoids an extra round
// trip through the anon client for a table that's effectively server-owned config.
export async function getPublicSettings(): Promise<PublicSettings> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("settings").select("key, value");
    if (error) throw error;

    const map = new Map((data ?? []).map((row) => [row.key, row.value ?? ""]));
    const nonEmpty = (key: string, fallback: string) => {
      const v = map.get(key);
      return v && v.trim().length > 0 ? v : fallback;
    };

    return {
      whatsappLink: nonEmpty("whatsapp_link", FALLBACKS.whatsappLink),
      telegramLink: nonEmpty("telegram_link", FALLBACKS.telegramLink),
      apkDownloadLink: nonEmpty("apk_download_link", FALLBACKS.apkDownloadLink),
      supportEmail: nonEmpty("support_email", FALLBACKS.supportEmail),
      supportPhone: nonEmpty("support_phone", FALLBACKS.supportPhone),
      announcementBannerText: nonEmpty("announcement_banner_text", FALLBACKS.announcementBannerText),
      announcementBannerActive: map.get("announcement_banner_active") === "true",
    };
  } catch (err) {
    console.error("[settings/getPublicSettings] failed, using fallbacks:", err);
    return FALLBACKS;
  }
}
