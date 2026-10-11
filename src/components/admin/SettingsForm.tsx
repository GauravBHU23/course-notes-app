"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export interface SettingsValues {
  whatsapp_link: string;
  telegram_link: string;
  apk_download_link: string;
  support_email: string;
  support_phone: string;
  announcement_banner_text: string;
  announcement_banner_active: boolean;
}

export function SettingsForm({ initial }: { initial: SettingsValues }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof SettingsValues>(key: K, value: SettingsValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          announcement_banner_active: String(values.announcement_banner_active),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save settings.");
        return;
      }
      setSaved(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="WhatsApp link"
          value={values.whatsapp_link}
          onChange={(e) => set("whatsapp_link", e.target.value)}
          placeholder="https://wa.me/91XXXXXXXXXX"
        />
        <Input
          label="Telegram link"
          value={values.telegram_link}
          onChange={(e) => set("telegram_link", e.target.value)}
          placeholder="https://t.me/yourchannel"
        />
        <Input
          label="APK download link"
          value={values.apk_download_link}
          onChange={(e) => set("apk_download_link", e.target.value)}
        />
        <Input
          label="Support email"
          value={values.support_email}
          onChange={(e) => set("support_email", e.target.value)}
        />
        <Input
          label="Support phone"
          value={values.support_phone}
          onChange={(e) => set("support_phone", e.target.value)}
        />
        <Input
          label="Announcement banner text"
          value={values.announcement_banner_text}
          onChange={(e) => set("announcement_banner_text", e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
          <input
            type="checkbox"
            checked={values.announcement_banner_active}
            onChange={(e) => set("announcement_banner_active", e.target.checked)}
          />
          Show announcement banner
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {saved && <p className="text-sm text-emerald-600">Settings saved.</p>}

        <Button type="submit" loading={loading}>
          Save settings
        </Button>
      </form>
    </Card>
  );
}
