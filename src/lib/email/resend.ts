import "server-only";
import nodemailer from "nodemailer";
import { otpEmailHtml } from "@/lib/email/templates/otpEmail";
import { welcomeEmailHtml } from "@/lib/email/templates/welcomeEmail";
import { invoiceEmailHtml } from "@/lib/email/templates/invoiceEmail";
import { sessionAlertEmailHtml } from "@/lib/email/templates/sessionAlertEmail";

// Despite the filename (kept for import-path stability across the codebase),
// this sends via SMTP (configured for Gmail by default) rather than Resend.
let cachedTransporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function transporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) return null;
  if (cachedTransporter) return cachedTransporter;

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  return cachedTransporter;
}

const FROM = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "notifications@example.com";

export async function sendOtpEmail(to: string, code: string) {
  const mailer = transporter();
  if (!mailer) {
    console.warn(`[email] SMTP not configured; OTP for ${to} is ${code}`);
    return;
  }
  await mailer.sendMail({
    from: FROM,
    to,
    subject: "Your login OTP",
    html: otpEmailHtml(code),
  });
}

export async function sendWelcomeEmail(to: string, fullName: string) {
  const mailer = transporter();
  if (!mailer) return;
  await mailer.sendMail({
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
  const mailer = transporter();
  if (!mailer) {
    console.warn(`[email] SMTP not configured; invoice ${params.invoiceNumber} not emailed`);
    return;
  }
  await mailer.sendMail({
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
  const mailer = transporter();
  if (!mailer) return;
  await mailer.sendMail({
    from: FROM,
    to,
    subject: "You were logged out of another device",
    html: sessionAlertEmailHtml(deviceLabel),
  });
}
