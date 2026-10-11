import { getPublicSettings } from "@/lib/settings/getPublicSettings";
import { Card } from "@/components/ui/Card";

// Server Component: reusable WhatsApp/Telegram/email/phone block driven by
// the settings table. Intended for the contact/support pages — safe to drop
// into any Server Component tree since it does its own data fetch.
export async function ContactLinks() {
  const settings = await getPublicSettings();

  return (
    <Card className="space-y-4 p-6">
      <h3 className="text-base font-semibold text-foreground">Get in touch</h3>

      <div className="flex flex-wrap gap-3">
        {settings.whatsappLink !== "#" && (
          <a
            href={settings.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
          >
            <span aria-hidden>🟢</span> WhatsApp Channel
          </a>
        )}
        {settings.telegramLink !== "#" && (
          <a
            href={settings.telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-100"
          >
            <span aria-hidden>🔵</span> Telegram Channel
          </a>
        )}
      </div>

      <div className="space-y-1 text-sm text-foreground/70">
        {settings.supportEmail && (
          <p>
            Email:{" "}
            <a href={`mailto:${settings.supportEmail}`} className="text-brand-700 hover:underline">
              {settings.supportEmail}
            </a>
          </p>
        )}
        {settings.supportPhone && (
          <p>
            Phone:{" "}
            <a href={`tel:${settings.supportPhone}`} className="text-brand-700 hover:underline">
              {settings.supportPhone}
            </a>
          </p>
        )}
        {!settings.supportEmail && !settings.supportPhone && (
          <p>Reach out via WhatsApp or Telegram above, or use the contact form.</p>
        )}
      </div>
    </Card>
  );
}
