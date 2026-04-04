/**
 * Returns the public-facing origin for shareable URLs.
 * Always uses the real production domain for external sharing.
 */
export function getPublicOrigin(): string {
  return "https://hizovo.com";
}
