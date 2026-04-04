/**
 * Returns the public-facing origin for shareable URLs.
 * Always uses the real production domain for external sharing.
 */
export function getPublicOrigin(): string {
  return "https://hizivo.com";
}

/**
 * Returns a profile share URL that goes through the Edge Function
 * so social media crawlers (Facebook, Twitter, etc.) get proper
 * Open Graph meta tags with profile picture, name, and cover photo.
 */
export function getProfileShareUrl(userId: string): string {
  return `https://slirphzzwcogdbkeicff.supabase.co/functions/v1/profile-og?userId=${userId}`;
}
