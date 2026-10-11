import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/utils/request";
import { recordVisit, getTotalVisits } from "@/lib/stats/visitors";

// POST: best-effort, de-duplicated (per visitor-hash per day) visit counter.
// Must never block/break page rendering — always resolves ok:true.
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req) ?? "unknown";
    const userAgent = req.headers.get("user-agent") ?? "unknown";

    let path: string | null = null;
    try {
      const body = await req.json();
      if (body && typeof body.path === "string") path = body.path;
    } catch {
      // No/invalid JSON body is fine, path is optional.
    }

    const { total } = await recordVisit({ ip, userAgent, path });
    return NextResponse.json({ ok: true, total });
  } catch (err) {
    console.error("[api/stats/visitors] POST failed:", err);
    return NextResponse.json({ ok: true });
  }
}

// GET: public read of the current total, lightly cached since it doesn't
// need to be real-time-precise.
export async function GET() {
  const total = await getTotalVisits();
  return NextResponse.json(
    { total: total ?? 0 },
    { headers: { "Cache-Control": "public, max-age=30" } }
  );
}
