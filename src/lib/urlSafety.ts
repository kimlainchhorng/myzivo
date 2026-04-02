/**
 * URL Safety — domain allowlisting for outbound redirects
 * 
 * Prevents open-redirect attacks where an attacker crafts a link like:
 *   hizovo.com/out?partner=fake&name=Your+Bank&url=https://phishing.com
 * 
 * Only known partner domains and our own domain are allowed.
 */

/** 
 * Allowed partner domains for outbound redirects.
 * Add new partner domains here when onboarding new affiliates.
 */
const ALLOWED_PARTNER_DOMAINS: string[] = [
  // Travelpayouts network
  'aviasales.com',
  'tp.media',
  'tpo.li',
  'hotellook.com',
  'economybookings.com',
  'qeeq.com',
  'getrentacar.com',
  'kiwitaxi.com',
  'gettransfer.com',
  'intui.travel',
  'klook.com',
  'tiqets.com',
  'wegotrip.com',
  'ticketnetwork.com',
  'airalo.com',
  'drimsim.com',
  'yesim.app',
  'radicalstorage.com',
  'airhelp.com',
  'compensair.com',
  // Booking platforms
  'booking.com',
  'expedia.com',
  'hotels.com',
  // Duffel
  'duffel.com',
  'links.duffel.com',
  // Kiwi
  'kiwi.com',
  // Skyscanner
  'skyscanner.com',
  'skyscanner.net',
  // Insurance / extras
  'rentalcover.com',
  // ZIVO's own domains
  'hizovo.com',
  'myzivo.lovable.app',
];

/**
 * Check if a URL points to an allowed partner domain.
 * Returns false for javascript:, data:, or unknown domains.
 */
export function isAllowedPartnerUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    // Only allow http/https
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }
    
    const hostname = parsed.hostname.toLowerCase();
    
    return ALLOWED_PARTNER_DOMAINS.some(domain => {
      // Exact match or subdomain match (e.g. www.booking.com matches booking.com)
      return hostname === domain || hostname.endsWith(`.${domain}`);
    });
  } catch {
    return false;
  }
}

/**
 * Sanitize partner name displayed in UI.
 * Prevents social engineering (e.g. name="Your Bank - Login Required")
 */
export function sanitizePartnerName(name: string): string {
  // Strip HTML-like characters, limit length, remove suspicious patterns
  const cleaned = name
    .replace(/[<>"'`]/g, '')   // Remove potential injection chars
    .replace(/\s+/g, ' ')      // Normalize whitespace
    .trim()
    .slice(0, 50);             // Max 50 chars
  
  // If empty after cleaning, return generic
  return cleaned || 'Partner';
}
