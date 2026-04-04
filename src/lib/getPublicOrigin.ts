/**
 * Returns the public-facing origin for shareable URLs.
 * On native Capacitor apps, window.location.origin is "capacitor://localhost"
 * which is not a valid shareable URL. We use the published domain instead.
 */
export function getPublicOrigin(): string {
  const origin = window.location.origin;
  // Detect Capacitor or other non-http origins
  if (!origin || !origin.startsWith("http")) {
    return "https://myzivo.lovable.app";
  }
  // Also handle localhost dev preview pointing to Capacitor
  if (origin.includes("localhost") && navigator.userAgent.includes("Capacitor")) {
    return "https://myzivo.lovable.app";
  }
  return origin;
}
