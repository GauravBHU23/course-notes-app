import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { TelegramIcon } from "@/components/icons/TelegramIcon";
import { ContactForm } from "@/components/support/ContactForm";
import { getPublicSettings } from "@/lib/settings/getPublicSettings";

export const metadata: Metadata = {
  title: "Contact & Support — Course and Notes Purchasing App",
  description:
    "Having trouble logging in or viewing a PDF? Contact the Course and Notes Purchasing App administrator via WhatsApp, Telegram or email.",
  openGraph: {
    title: "Contact & Support — Course and Notes Purchasing App",
    description: "Get help with login, purchases or PDF viewing issues.",
    type: "website",
  },
};

export default async function ContactPage() {
  const settings = await getPublicSettings();
  const hasWhatsapp = settings.whatsappLink !== "#" && settings.whatsappLink.trim().length > 0;
  const hasTelegram = settings.telegramLink !== "#" && settings.telegramLink.trim().length > 0;
  const hasEmail = settings.supportEmail.trim().length > 0;
  const hasPhone = settings.supportPhone.trim().length > 0;

  return (
    <div className="bg-gradient-to-b from-brand-50/60 via-background to-background">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <span className="inline-flex items-center rounded-full bg-brand-50 px-4 py-1.5 text-xs font-medium text-brand-700">
            We&apos;re here to help
          </span>
          <h1 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">Contact &amp; Support</h1>
          <p className="mt-3 text-foreground/60">
            Having trouble logging in, completing a purchase, or viewing a PDF you bought? Reach
            out to the administrator using any of the channels below and we&apos;ll help you out.
          </p>
        </div>

        <Card className="mt-10 overflow-hidden p-0 shadow-lg shadow-brand-600/5">
          <div className="bg-gradient-to-r from-brand-600 to-accent-500 px-6 py-5 sm:px-8">
            <p className="text-sm font-medium text-white/90">Fastest response</p>
            <p className="text-xs text-white/70">Chat with us directly for real-time help.</p>
          </div>
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {hasWhatsapp ? (
                <a href={settings.whatsappLink} target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="primary" size="lg" className="w-full gap-2">
                    <WhatsAppIcon className="h-5 w-5" /> Chat on WhatsApp
                  </Button>
                </a>
              ) : (
                <Button variant="primary" size="lg" className="w-full gap-2 opacity-50" disabled>
                  <WhatsAppIcon className="h-5 w-5" /> Chat on WhatsApp
                </Button>
              )}
              {hasTelegram ? (
                <a href={settings.telegramLink} target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="secondary" size="lg" className="w-full gap-2">
                    <TelegramIcon className="h-5 w-5" /> Join Telegram
                  </Button>
                </a>
              ) : (
                <Button variant="secondary" size="lg" className="w-full gap-2 opacity-50" disabled>
                  <TelegramIcon className="h-5 w-5" /> Join Telegram
                </Button>
              )}
            </div>

            {(hasEmail || hasPhone) && (
              <div className="mt-6 flex flex-col gap-3 border-t border-border-subtle pt-6 text-center">
                {hasEmail && (
                  <div>
                    <p className="text-sm text-foreground/60">Prefer email?</p>
                    <a
                      href={`mailto:${settings.supportEmail}`}
                      className="mt-1 inline-block font-medium text-brand-600 hover:underline"
                    >
                      {settings.supportEmail}
                    </a>
                  </div>
                )}
                {hasPhone && (
                  <div>
                    <p className="text-sm text-foreground/60">Or call us</p>
                    <a
                      href={`tel:${settings.supportPhone}`}
                      className="mt-1 inline-block font-medium text-brand-600 hover:underline"
                    >
                      {settings.supportPhone}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        <div className="mt-10 rounded-2xl bg-brand-50 p-6 text-sm text-brand-700">
          <p className="font-semibold">Common issues</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-brand-700/90">
            <li>Forgot your password? Use the &quot;Forgot password&quot; link on the login page.</li>
            <li>Account locked after failed attempts? It unlocks automatically after 5 minutes.</li>
            <li>Logged out unexpectedly? Only one active session per account is allowed at a time.</li>
            <li>PDF not loading? Make sure your purchase is still within its validity period.</li>
          </ul>
        </div>

        <Card className="mt-10 p-6 sm:p-8">
          <h2 className="mb-1 text-lg font-bold text-foreground">Still need help? Send us a message</h2>
          <p className="mb-6 text-sm text-foreground/60">
            Fill out the form below and we&apos;ll get back to you by email as soon as possible.
          </p>
          <ContactForm />
        </Card>
      </div>
    </div>
  );
}
