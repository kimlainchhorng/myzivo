/**
 * Returns the public-facing origin for shareable URLs.
 */
export function getPublicOrigin(): string {
  return "https://hizivo.com";
}

/**
 * Returns a clean profile share URL using the short share code.
 * No UUID or Supabase domain exposed.
 */
export function getProfileShareUrl(shareCode: string): string {
  return `${getPublicOrigin()}/p/${shareCode}`;
}
