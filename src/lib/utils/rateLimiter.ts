// In-memory sliding-window rate limiter. Fine for a single Next.js server
// instance; swap for a Redis-backed limiter (e.g. Upstash) if deployed
// across multiple instances/regions.
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (timestamps.length >= maxRequests) {
    buckets.set(key, timestamps);
    return false;
  }

  timestamps.push(now);
  buckets.set(key, timestamps);
  return true;
}

// Periodically prevent unbounded growth from one-off keys (IPs, identifiers).
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of buckets.entries()) {
    const fresh = timestamps.filter((t) => now - t < 10 * 60 * 1000);
    if (fresh.length === 0) buckets.delete(key);
    else buckets.set(key, fresh);
  }
}, 5 * 60 * 1000);
