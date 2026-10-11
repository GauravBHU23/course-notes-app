import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Cashfree signs webhooks as base64(HMAC_SHA256(timestamp + rawBody, secret)).
 * We MUST verify against the raw request body text, not a re-serialized
 * JSON object, since re-serialization can change whitespace/key order and
 * break the signature even for a legitimate webhook.
 */
export function verifyCashfreeWebhookSignature(params: {
  rawBody: string;
  timestamp: string;
  signature: string;
}): boolean {
  const { rawBody, timestamp, signature } = params;
  const secret = process.env.CASHFREE_WEBHOOK_SECRET;
  if (!secret) return false;

  const expected = createHmac("sha256", secret).update(timestamp + rawBody).digest("base64");

  const expectedBuf = Buffer.from(expected);
  const providedBuf = Buffer.from(signature);
  if (expectedBuf.length !== providedBuf.length) return false;

  return timingSafeEqual(expectedBuf, providedBuf);
}
