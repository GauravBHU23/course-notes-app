import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { isEmailIdentifier } from "@/lib/utils/validators";

export interface ResolvedProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

/**
 * Both login forms (password and OTP) accept an email OR mobile identifier.
 * Supabase Auth itself is email-based, so mobile resolves to the linked
 * profile/email first; email is used as-is.
 */
export async function resolveIdentifierToProfile(identifier: string): Promise<ResolvedProfile | null> {
  const supabase = createAdminClient();
  const column = isEmailIdentifier(identifier) ? "email" : "mobile";

  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq(column, identifier.trim().toLowerCase())
    .maybeSingle();

  return data ?? null;
}
