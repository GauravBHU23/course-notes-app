import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { ChatbotWidget } from "@/components/support/ChatbotWidget";
import { AppToaster } from "@/components/ui/AppToaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Course and Notes Purchasing App — SSC, Railway, Bank, UGC NET, BPSC, TRE Notes & Test Series",
    template: "%s",
  },
  description:
    "Exam-ready PDF notes and test series for SSC, Railway, Bank, UGC NET, BPSC and TRE aspirants. Affordable pricing, secure viewing, instant access after purchase.",
  manifest: "/manifest.json",
};

// Next.js 16: themeColor/colorScheme live on the `viewport` export, not `metadata`.
export const viewport: Viewport = {
  themeColor: "#4f46e5",
};

// Runs before paint/hydration to set data-theme from localStorage/system
// preference. Must live in the root layout's <head> (not a nested layout's
// JSX) since it mutates an attribute on <html>, which React's reconciler
// owns from here -- setting it anywhere else causes a hydration mismatch
// warning because the attribute changes after the server-rendered markup
// was produced but before/during React's own reconciliation of this tree.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var theme = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <ServiceWorkerRegister />
        <ChatbotWidget />
        <AppToaster />
      </body>
    </html>
  );
}
