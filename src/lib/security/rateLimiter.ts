/** Rate limiter stub */
export class RateLimitError extends Error {
  retryAfter?: number;
  constructor(message: string, retryAfter?: number) {
    super(message);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

export async function checkRateLimit(_key: string) {
  return { allowed: true, retryAfter: 0 };
}
