const PUBLIC_ORIGIN = "https://hizivo.com";

// Edge function URL that serves OG meta tags for crawlers + redirects users
const PROFILE_OG_FUNCTION = `https://slirphzzwcogdbkeicff.supabase.co/functions/v1/profile-og`;

/**
 * Returns the public-facing origin for shareable URLs.
 */
export function getPublicOrigin(): string {
  return PUBLIC_ORIGIN;
}

/**
 * Returns the profile share URL that serves rich OG previews.
 * Points directly to the edge function so social crawlers always
 * get the account name, cover photo, and description.
 * TODO: Switch back to `${PUBLIC_ORIGIN}/p/{code}` once hizivo.com
 *       routes /p/* to this edge function.
 */
export function getProfileShareUrl(shareCode: string): string {
  return `${PROFILE_OG_FUNCTION}?code=${encodeURIComponent(shareCode)}`;
}
