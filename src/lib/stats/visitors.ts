import "server-only";
import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

// Deterministic, non-reversible per-visitor-per-day hash. We salt with a
// server-only secret so the hash can't be brute-forced/rainbow-tabled back
// to an IP, and we fold in today's date so the same visitor is only counted
// once per day (not once ever).
function computeVisitorHash(ip: string, userAgent: string, todayDateString: string): string {
  const salt = process.env.VISITOR_HASH_SALT || process.env.OTP_SECRET || "dev-only-insecure-salt";
  return createHash("sha256").update(`${ip}:${userAgent}:${todayDateString}:${salt}`).digest("hex");
}

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD, UTC-based is fine for a rough daily-unique count
}

/**
 * Best-effort, atomic-ish "count this visitor if we haven't already today".
 * Never throws — callers (the API route) should still respond ok:true even
 * if this fails, since visitor counting must never block page rendering.
 */
export async function recordVisit(opts: {
  ip: string;
  userAgent: string;
  path?: string | null;
}): Promise<{ counted: boolean; total: number | null }> {
  const supabase = createAdminClient();
  const visitorHash = computeVisitorHash(opts.ip, opts.userAgent, todayDateString());

  try {
    const { data: existing, error: selectError } = await supabase
      .from("site_visits")
      .select("id")
      .eq("visitor_hash", visitorHash)
      .limit(1);

    if (selectError) throw selectError;

    if (existing && existing.length > 0) {
      // Already counted today — fetch current total cheaply, don't increment.
      const total = await getTotalVisits();
      return { counted: false, total };
    }

    const { error: insertError } = await supabase
      .from("site_visits")
      .insert({ visitor_hash: visitorHash, path: opts.path ?? null });
    if (insertError) throw insertError;

    const { data: newValue, error: rpcError } = await supabase.rpc("increment_counter", {
      p_key: "total_visits",
    });
    if (rpcError) throw rpcError;

    return { counted: true, total: newValue ?? null };
  } catch (err) {
    console.error("[stats/visitors] recordVisit failed:", err);
    return { counted: false, total: null };
  }
}

export async function getTotalVisits(): Promise<number | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("counters")
      .select("value")
      .eq("key", "total_visits")
      .maybeSingle();
    if (error) throw error;
    return data?.value ?? 0;
  } catch (err) {
    console.error("[stats/visitors] getTotalVisits failed:", err);
    return null;
  }
}
