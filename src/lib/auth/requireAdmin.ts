import "server-only";
import { getCurrentProfile } from "@/lib/auth/getCurrentProfile";
import type { Profile } from "@/types/domain";

/**
 * Every admin API route must call this independently — middleware only
 * checks that the admin_session cookie is valid, not that the underlying
 * profile has role === 'admin'. Returns null when the caller isn't an
 * authenticated admin, in which case the route should respond 403.
 */
export async function requireAdmin(): Promise<{ profile: Profile; sessionId: string } | null> {
  const current = await getCurrentProfile("admin");
  if (!current || current.profile.role !== "admin") return null;
  return current;
}
