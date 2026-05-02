const DEFAULT_PUBLIC_ORIGIN = "https://zivollc.com";

// Edge function URL that serves profile OG tags and redirects humans.
const PROFILE_OG_FUNCTION = "https://slirphzzwcogdbkeicff.supabase.co/functions/v1/profile-og";
const POST_OG_FUNCTION = "https://slirphzzwcogdbkeicff.supabase.co/functions/v1/post-og";

/**
 * Returns the public-facing origin for shareable URLs.
 * Always returns the production zivollc.com domain so links shared from
 * preview/staging environments never leak temporary hosts (netlify.app,
 * lovable.app, localhost, etc.) to social networks.
 */
export function getPublicOrigin(): string {
  const configuredOrigin = import.meta.env.VITE_PUBLIC_ORIGIN?.trim();
  if (configuredOrigin && /^https:\/\/(www\.)?(zivollc\.com|hizivo\.com)/i.test(configuredOrigin)) {
    return configuredOrigin;
  }

  return DEFAULT_PUBLIC_ORIGIN;
}

/**
 * Returns a share URL for a feed/reel post.
 * Points directly to the post-og edge function so social crawlers (Facebook,
 * Twitter, etc.) receive post-specific OG tags. Humans are 302-redirected to
 * the branded /dl/reel/:id landing page by the function itself.
 */
export function getPostShareUrl(postId: string): string {
  return `${POST_OG_FUNCTION}?post=${encodeURIComponent(postId)}`;
}

/**
 * Returns the profile share URL for social networks.
 * Uses the branded zivollc.com domain (routes through /p/:code which redirects
 * to the OG edge function for crawlers and to the in-app profile for humans).
 */
export function getProfileShareUrl(shareCode: string): string {
  return `${getPublicOrigin()}/p/${encodeURIComponent(shareCode)}`;
}

/** Internal: direct edge function URL (used by server-side OG redirects). */
export function getProfileOgFunctionUrl(shareCode: string): string {
  return `${PROFILE_OG_FUNCTION}?code=${encodeURIComponent(shareCode)}`;
}
