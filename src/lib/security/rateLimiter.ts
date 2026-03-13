/**
 * Client-side rate limiter using sliding window
 * Acts as a fallback; primary rate limiting is server-side.
 */

export class RateLimitError extends Error {
  retryAfter?: number;
  constructor(message: string, retryAfter?: number) {
    super(message);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

const LIMITS: Record<string, { maxRequests: number; windowMs: number }> = {
  search: { maxRequests: 30, windowMs: 60_000 },
  auth: { maxRequests: 5, windowMs: 300_000 },
  api: { maxRequests: 60, windowMs: 60_000 },
  default: { maxRequests: 100, windowMs: 60_000 },
};

export async function checkRateLimit(
  key: string
): Promise<{ allowed: boolean; retryAfter: number }> {
  const category = key.split(":")[0] || "default";
  const config = LIMITS[category] || LIMITS.default;
  const now = Date.now();

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside window
  entry.timestamps = entry.timestamps.filter(
    (t) => now - t < config.windowMs
  );

  if (entry.timestamps.length >= config.maxRequests) {
    const oldest = entry.timestamps[0];
    const retryAfter = Math.ceil((oldest + config.windowMs - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.timestamps.push(now);
  return { allowed: true, retryAfter: 0 };
}

// Periodic cleanup of expired entries
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < 300_000);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}, 120_000);
