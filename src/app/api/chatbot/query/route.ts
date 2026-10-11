import { NextRequest, NextResponse } from "next/server";
import { matchRule } from "@/lib/chatbot/rules";
import { rateLimit } from "@/lib/utils/rateLimiter";
import { getClientIp } from "@/lib/utils/request";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req) ?? "unknown";
  if (!rateLimit(`chatbot:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests, please slow down." }, { status: 429 });
  }

  let message = "";
  try {
    const body = await req.json();
    message = typeof body?.message === "string" ? body.message : "";
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!message.trim()) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const answer = matchRule(message.slice(0, 500));
  return NextResponse.json({ answer });
}
