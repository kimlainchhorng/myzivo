const PUBLIC_ORIGIN = "https://hizivo.com";

// Edge function URL that serves profile OG tags and redirects humans.
const PROFILE_OG_FUNCTION = "https://slirphzzwcogdbkeicff.supabase.co/functions/v1/profile-og";

/**
 * Returns the public-facing origin for shareable URLs.
 */
export function getPublicOrigin(): string {
  return PUBLIC_ORIGIN;
}

/**
 * Returns the profile share URL for social networks.
 * Crawlers read OG tags from the edge function, and real users are redirected
 * to the app profile route.
 */
export function getProfileShareUrl(shareCode: string): string {
  return `${PROFILE_OG_FUNCTION}?code=${encodeURIComponent(shareCode)}`;
}
