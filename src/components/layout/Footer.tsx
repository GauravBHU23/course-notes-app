import Link from "next/link";
import { getPublicSettings } from "@/lib/settings/getPublicSettings";
import { VisitorCounterTicker } from "@/components/layout/VisitorCounterTicker";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { Badge } from "@/components/ui/Badge";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { TelegramIcon } from "@/components/icons/TelegramIcon";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export async function Footer() {
  const year = new Date().getFullYear();
  const settings = await getPublicSettings();
  const hasApk = settings.apkDownloadLink !== "#" && settings.apkDownloadLink.trim().length > 0;

  return (
    <footer className="border-t border-border-subtle bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div>
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-brand-700">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-accent-500 text-xs text-white">
                CN
              </span>
              Course and Notes Purchasing App
            </Link>
            <p className="mt-3 max-w-xs text-sm text-foreground/60">
              Exam-ready notes and test series for SSC, Railway, Bank, UGC NET, BPSC and TRE
              aspirants.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-foreground">Quick Links</span>
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-foreground/60 transition-colors hover:text-brand-700"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="text-sm text-foreground/60 transition-colors hover:text-brand-700"
            >
              Contact Administrator
            </Link>
            <span className="text-xs text-foreground/40">
              Having login or PDF access issues? Reach the administrator above.
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-foreground">Get in touch</span>

            <div className="flex flex-wrap gap-2">
              <a
                href={settings.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-tone-success-bg px-3 py-1.5 text-xs font-medium text-tone-success-text transition-colors hover:opacity-80"
              >
                <WhatsAppIcon className="h-3.5 w-3.5" /> Join our WhatsApp channel
              </a>
              <a
                href={settings.telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-tone-info-bg px-3 py-1.5 text-xs font-medium text-tone-info-text transition-colors hover:opacity-80"
              >
                <TelegramIcon className="h-3.5 w-3.5" /> Join our Telegram channel
              </a>
            </div>

            <div className="flex items-center gap-2">
              {hasApk ? (
                <a
                  href={settings.apkDownloadLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100"
                >
                  <span aria-hidden>⬇</span> Download Android App
                </a>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-tone-neutral-bg px-3 py-1.5 text-xs font-medium text-tone-neutral-text">
                  <span aria-hidden>⬇</span> Android App
                  <Badge tone="neutral">Coming Soon</Badge>
                </span>
              )}
            </div>

            <div className="mt-1">
              <InstallPrompt />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border-subtle pt-6 text-xs text-foreground/50 sm:flex-row">
          <span>&copy; {year} Course and Notes Purchasing App. All rights reserved.</span>
          <VisitorCounterTicker />
          <span>Made for serious exam aspirants.</span>
        </div>
      </div>
    </footer>
  );
}
