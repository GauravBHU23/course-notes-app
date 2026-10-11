import { getPublicSettings } from "@/lib/settings/getPublicSettings";
import { Card } from "@/components/ui/Card";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { TelegramIcon } from "@/components/icons/TelegramIcon";

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
            className="inline-flex items-center gap-2 rounded-full bg-tone-success-bg px-4 py-2 text-sm font-medium text-tone-success-text transition-colors hover:opacity-80"
          >
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp Channel
          </a>
        )}
        {settings.telegramLink !== "#" && (
          <a
            href={settings.telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-tone-info-bg px-4 py-2 text-sm font-medium text-tone-info-text transition-colors hover:opacity-80"
          >
            <TelegramIcon className="h-4 w-4" /> Telegram Channel
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
