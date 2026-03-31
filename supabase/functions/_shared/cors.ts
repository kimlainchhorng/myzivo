/**
 * Shared CORS Module - Origin Whitelist for Sensitive Edge Functions
 * 
 * Use getCorsHeaders(req) in payment, payout, backup, and admin functions.
 * Public functions (search, exchange-rates, maps) can continue using wildcard.
 */

const ALLOWED_ORIGINS = new Set([
  // Production
  "https://hizivo.com",
  "https://www.hizivo.com",
  // Legacy typo kept temporarily to avoid breaking old references
  "https://hizovo.com",
  "https://www.hizovo.com",
  // Lovable preview
  "https://id-preview--72f99340-9c9f-453a-acff-60e5a9b25774.lovable.app",
  // Lovable alternate
  "https://72f99340-9c9f-453a-acff-60e5a9b25774.lovableproject.com",
  // Published
  "https://myzivo.lovable.app",
]);

const DEV_ORIGIN_PATTERN = /^http:\/\/localhost:\d+$/;

const STANDARD_HEADERS = "authorization, x-client-info, apikey, content-type, stripe-signature, x-rate-limit-action, x-session-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version";

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true; // Allow native app requests (Capacitor) with no origin
  if (ALLOWED_ORIGINS.has(origin)) return true;
  if (DEV_ORIGIN_PATTERN.test(origin)) return true;
  return false;
}

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  // Native apps (Capacitor) send no origin — allow with wildcard
  const allowedOrigin = !origin ? "*" : isAllowedOrigin(origin) ? origin : "";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": STANDARD_HEADERS,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

/**
 * Wildcard CORS for public, non-sensitive endpoints
 */
export const publicCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": STANDARD_HEADERS,
};
