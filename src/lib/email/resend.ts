import "server-only";
import nodemailer from "nodemailer";
import { otpEmailHtml } from "@/lib/email/templates/otpEmail";
import { passwordResetEmailHtml } from "@/lib/email/templates/passwordResetEmail";
import { welcomeEmailHtml } from "@/lib/email/templates/welcomeEmail";
import { invoiceEmailHtml } from "@/lib/email/templates/invoiceEmail";
import { sessionAlertEmailHtml } from "@/lib/email/templates/sessionAlertEmail";
import { contactQueryEmailHtml } from "@/lib/email/templates/contactQueryEmail";

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

/**
 * All send* functions below return a boolean rather than throwing. A down
 * SMTP server, a hit Gmail daily-send limit, or a transient network error
 * must never crash the caller (login OTP, signup, payment webhook) --
 * callers that need to tell the end user "email delivery failed" check the
 * return value explicitly; everyone else can fire-and-forget.
 */
async function send(mail: Parameters<ReturnType<typeof nodemailer.createTransport>["sendMail"]>[0]): Promise<boolean> {
  const mailer = transporter();
  if (!mailer) {
    console.warn(`[email] SMTP not configured; email to ${String(mail.to)} not sent (subject: ${String(mail.subject)})`);
    return false;
  }
  try {
    await mailer.sendMail(mail);
    return true;
  } catch (err) {
    console.error(`[email] send failed for ${String(mail.to)} (subject: ${String(mail.subject)}):`, err);
    return false;
  }
}

export type OtpEmailPurpose = "login" | "signup" | "password_reset";

export async function sendOtpEmail(to: string, code: string, purpose: OtpEmailPurpose = "login"): Promise<boolean> {
  if (purpose === "password_reset") {
    return send({ from: FROM, to, subject: "Your password reset code", html: passwordResetEmailHtml(code) });
  }
  return send({ from: FROM, to, subject: "Your login OTP", html: otpEmailHtml(code) });
}

export async function sendWelcomeEmail(to: string, fullName: string): Promise<boolean> {
  return send({ from: FROM, to, subject: "Welcome! Your account is ready", html: welcomeEmailHtml(fullName) });
}

export async function sendInvoiceEmail(params: {
  to: string;
  fullName: string;
  bundleTitle: string;
  amountInr: number;
  invoiceNumber: string;
  accessExpiresAt: string;
  invoicePdfBuffer: Buffer;
}): Promise<boolean> {
  return send({
    from: FROM,
    to: params.to,
    subject: `Purchase confirmed: ${params.bundleTitle}`,
    html: invoiceEmailHtml(params),
    attachments: [{ filename: `${params.invoiceNumber}.pdf`, content: params.invoicePdfBuffer }],
  });
}

export async function sendSessionAlertEmail(to: string, deviceLabel: string): Promise<boolean> {
  return send({ from: FROM, to, subject: "You were logged out of another device", html: sessionAlertEmailHtml(deviceLabel) });
}

export async function sendContactQueryEmail(params: {
  adminEmail: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  return send({
    from: FROM,
    to: params.adminEmail,
    replyTo: params.email,
    subject: `[Contact] ${params.subject}`,
    html: contactQueryEmailHtml(params),
  });
}
