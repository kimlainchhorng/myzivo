const PUBLIC_ORIGIN = "https://hizivo.com";
const PROFILE_SHARE_ORIGIN = "https://myzivo.lovable.app";

/**
 * Returns the public-facing origin for shareable URLs.
 */
export function getPublicOrigin(): string {
  return PUBLIC_ORIGIN;
}

/**
 * Returns the branded published profile share URL.
 */
export function getProfileShareUrl(shareCode: string): string {
  return `${PROFILE_SHARE_ORIGIN}/p/${encodeURIComponent(shareCode)}`;
}
