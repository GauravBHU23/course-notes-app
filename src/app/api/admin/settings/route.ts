import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

const SETTINGS_KEYS = [
  "whatsapp_link",
  "telegram_link",
  "apk_download_link",
  "support_email",
  "support_phone",
  "announcement_banner_text",
  "announcement_banner_active",
] as const;

const updateSchema = z.object(
  Object.fromEntries(SETTINGS_KEYS.map((key) => [key, z.string().max(2000).optional()])) as Record<
    (typeof SETTINGS_KEYS)[number],
    z.ZodOptional<z.ZodString>
  >
);

export async function POST(req: NextRequest) {
  const current = await requireAdmin();
  if (!current) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const entries = Object.entries(parsed.data).filter(
    (entry): entry is [string, string] => entry[1] !== undefined
  );

  const results = await Promise.all(
    entries.map(([key, value]) => supabase.from("settings").upsert({ key, value }))
  );

  const failed = results.find((r) => r.error);
  if (failed?.error) {
    return NextResponse.json({ error: failed.error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
