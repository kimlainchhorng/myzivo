const PUBLIC_ORIGIN = "https://hizivo.com";

/**
 * Returns the public-facing origin for shareable URLs.
 */
export function getPublicOrigin(): string {
  return PUBLIC_ORIGIN;
}

/**
 * Returns the canonical profile share URL.
 * /p/:code is resolved in-app and is stable for copy/share and QR codes.
 */
export function getProfileShareUrl(shareCode: string): string {
  return `${PUBLIC_ORIGIN}/p/${encodeURIComponent(shareCode)}`;
}
