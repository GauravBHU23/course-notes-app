import "server-only";
import { createHmac, timingSafeEqual, randomUUID } from "crypto";
import type { PdfAccessTokenPayload } from "@/types/domain";

const TOKEN_TTL_SECONDS = 60;

function sign(payloadB64: string): string {
  return createHmac("sha256", process.env.PDF_TOKEN_SECRET!).update(payloadB64).digest("base64url");
}

export function issuePdfToken(params: {
  userId: string;
  pdfId: string;
  purchaseId: string;
  sessionId: string;
}): { token: string; jti: string; expiresAt: Date } {
  const now = Math.floor(Date.now() / 1000);
  const jti = randomUUID();
  const payload: PdfAccessTokenPayload = {
    uid: params.userId,
    pid: params.pdfId,
    purchase_id: params.purchaseId,
    sid: params.sessionId,
    jti,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(payloadB64);

  return {
    token: `${payloadB64}.${signature}`,
    jti,
    expiresAt: new Date((now + TOKEN_TTL_SECONDS) * 1000),
  };
}

export type VerifyTokenResult =
  | { valid: true; payload: PdfAccessTokenPayload }
  | { valid: false; reason: "malformed" | "bad_signature" | "expired" };

export function verifyPdfToken(token: string): VerifyTokenResult {
  const parts = token.split(".");
  if (parts.length !== 2) return { valid: false, reason: "malformed" };
  const [payloadB64, signature] = parts;

  const expectedSignature = sign(payloadB64);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return { valid: false, reason: "bad_signature" };
  }

  let payload: PdfAccessTokenPayload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch {
    return { valid: false, reason: "malformed" };
  }

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return { valid: false, reason: "expired" };
  }

  return { valid: true, payload };
}
