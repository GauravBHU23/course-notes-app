import { createAdminClient } from "@/lib/supabase/admin";
import { SettingsForm, type SettingsValues } from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("settings").select("key, value");

  const map = new Map((data ?? []).map((row) => [row.key, row.value ?? ""]));

  const initial: SettingsValues = {
    whatsapp_link: map.get("whatsapp_link") ?? "",
    telegram_link: map.get("telegram_link") ?? "",
    apk_download_link: map.get("apk_download_link") ?? "",
    support_email: map.get("support_email") ?? "",
    support_phone: map.get("support_phone") ?? "",
    announcement_banner_text: map.get("announcement_banner_text") ?? "",
    announcement_banner_active: map.get("announcement_banner_active") === "true",
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      <SettingsForm initial={initial} />
    </div>
  );
}
