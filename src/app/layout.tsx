import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { ChatbotWidget } from "@/components/support/ChatbotWidget";

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
    default: "ExamPrep Store — SSC, Railway, Bank, UGC NET, BPSC, TRE Notes & Test Series",
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ServiceWorkerRegister />
        <ChatbotWidget />
      </body>
    </html>
  );
}
