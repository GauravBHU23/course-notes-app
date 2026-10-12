import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email();
export const mobileSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

export const identifierSchema = z.string().trim().min(3);

export function isEmailIdentifier(identifier: string): boolean {
  return identifier.includes("@");
}

export const signupSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: emailSchema,
  mobile: mobileSchema.optional(),
  password: z.string().min(8).max(72),
});

export const passwordLoginSchema = z.object({
  identifier: identifierSchema,
  password: z.string().min(1),
});

export const otpSendSchema = z.object({
  identifier: identifierSchema,
  purpose: z.enum(["login", "signup", "password_reset"]),
});

export const otpVerifySchema = z.object({
  identifier: identifierSchema,
  code: z.string().regex(/^\d{6}$/),
  purpose: z.enum(["login", "signup", "password_reset"]),
});

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  mobile: mobileSchema.optional().or(z.literal("")),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(72),
});
