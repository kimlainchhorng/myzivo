const PUBLIC_ORIGIN = "https://hizivo.com";

/**
 * Returns the public-facing origin for shareable URLs.
 */
export function getPublicOrigin(): string {
  return PUBLIC_ORIGIN;
}

/**
 * Returns a server-rendered profile share URL so social crawlers always
 * receive the profile's real name and cover image, even if static rewrites
 * on the public domain are unavailable.
 */
export function getProfileShareUrl(shareCode: string): string {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;

  if (!projectId) {
    return `${PUBLIC_ORIGIN}/p/${shareCode}`;
  }

  return `https://${projectId}.supabase.co/functions/v1/profile-og?code=${encodeURIComponent(shareCode)}`;
}
