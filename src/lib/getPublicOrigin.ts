const DEFAULT_PUBLIC_ORIGIN = "https://endearing-tiramisu-95e81d.netlify.app";

// Edge function URL that serves profile OG tags and redirects humans.
const PROFILE_OG_FUNCTION = "https://slirphzzwcogdbkeicff.supabase.co/functions/v1/profile-og";
const POST_OG_FUNCTION = "https://slirphzzwcogdbkeicff.supabase.co/functions/v1/post-og";

/**
 * Returns the public-facing origin for shareable URLs.
 */
export function getPublicOrigin(): string {
  const configuredOrigin = import.meta.env.VITE_PUBLIC_ORIGIN?.trim();
  if (configuredOrigin) {
    return configuredOrigin;
  }

  return DEFAULT_PUBLIC_ORIGIN;
}

/**
 * Returns a share URL for a feed/reel post.
 * Uses edge function OG endpoint so social crawlers get post-specific previews.
 */
export function getPostShareUrl(postId: string): string {
  return `${getPublicOrigin()}/dl/reel/${encodeURIComponent(postId)}`;
}

/**
 * Returns the profile share URL for social networks.
 */
export function getProfileShareUrl(shareCode: string): string {
  return `${PROFILE_OG_FUNCTION}?code=${encodeURIComponent(shareCode)}`;
}
