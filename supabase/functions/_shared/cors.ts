// Shared CORS helpers for Supabase Edge Functions.

const ALLOWED_HEADERS =
  "authorization, x-client-info, apikey, content-type, x-application-name";

// Default permissive headers (kept for backward compatibility with existing functions).
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": ALLOWED_HEADERS,
  "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE, PATCH, OPTIONS",
};

// Public-route variant — same shape, kept as a separate export for callers
// that distinguish "public" endpoints from authenticated ones.
export const publicCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": ALLOWED_HEADERS,
  "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE, PATCH, OPTIONS",
};

// Per-request variant: echoes the caller's Origin (useful when credentials
// would ever be enabled). Falls back to "*".
export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": ALLOWED_HEADERS,
    "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE, PATCH, OPTIONS",
    "Vary": "Origin",
  };
}
