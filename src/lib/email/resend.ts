import "server-only";
import { Resend } from "resend";
import { otpEmailHtml } from "@/lib/email/templates/otpEmail";
import { welcomeEmailHtml } from "@/lib/email/templates/welcomeEmail";
import { invoiceEmailHtml } from "@/lib/email/templates/invoiceEmail";
import { sessionAlertEmailHtml } from "@/lib/email/templates/sessionAlertEmail";

function client() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.RESEND_FROM_EMAIL || "notifications@example.com";

export async function sendOtpEmail(to: string, code: string) {
  const resend = client();
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set; OTP for ${to} is ${code}`);
    return;
  }
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Your login OTP",
    html: otpEmailHtml(code),
  });
}

export async function sendWelcomeEmail(to: string, fullName: string) {
  const resend = client();
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Welcome! Your account is ready",
    html: welcomeEmailHtml(fullName),
  });
}

export async function sendInvoiceEmail(params: {
  to: string;
  fullName: string;
  bundleTitle: string;
  amountInr: number;
  invoiceNumber: string;
  accessExpiresAt: string;
  invoicePdfBuffer: Buffer;
}) {
  const resend = client();
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set; invoice ${params.invoiceNumber} not emailed`);
    return;
  }
  await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: `Purchase confirmed: ${params.bundleTitle}`,
    html: invoiceEmailHtml(params),
    attachments: [
      {
        filename: `${params.invoiceNumber}.pdf`,
        content: params.invoicePdfBuffer,
      },
    ],
  });
}

export async function sendSessionAlertEmail(to: string, deviceLabel: string) {
  const resend = client();
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to,
    subject: "You were logged out of another device",
    html: sessionAlertEmailHtml(deviceLabel),
  });
}
