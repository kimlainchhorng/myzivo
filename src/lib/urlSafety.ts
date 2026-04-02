/**
 * URL Safety — domain allowlisting, link validation, and path sanitization
 * 
 * Prevents:
 * - Open redirect attacks via crafted partner links
 * - Path traversal via injected IDs in push notifications
 * - Phishing via unvalidated social/payment URLs from DB
 * - Protocol injection (javascript:, data:, vbscript:)
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

/** Domains allowed for Stripe checkout redirects */
const ALLOWED_CHECKOUT_DOMAINS: string[] = [
  'checkout.stripe.com',
  'pay.stripe.com',
  'billing.stripe.com',
];

/** Domains allowed for social media links from DB */
const ALLOWED_SOCIAL_DOMAINS: string[] = [
  'instagram.com',
  'facebook.com',
  'fb.com',
  'telegram.org',
  't.me',
  'telegram.me',
  'tiktok.com',
  'twitter.com',
  'x.com',
  'youtube.com',
  'linkedin.com',
  'wa.me',
  'whatsapp.com',
];

/** Domains allowed for payment links in chat */
const ALLOWED_PAYMENT_DOMAINS: string[] = [
  'checkout.stripe.com',
  'pay.stripe.com',
  'checkout.payway.com.kh',
  'bakong.nbc.gov.kh',
  'paypal.com',
  'paypal.me',
];

/**
 * Check if a URL uses a safe protocol (http/https only).
 * Blocks javascript:, data:, vbscript:, etc.
 */
export function isSafeProtocol(url: string): boolean {
  const trimmed = url.trim().toLowerCase();
  // Block dangerous protocols
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.startsWith('blob:')
  ) {
    return false;
  }
  return true;
}

/**
 * Validate a URL against an allowed domain list.
 */
function isAllowedDomain(url: string, allowedDomains: string[]): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();
    return allowedDomains.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Check if a URL points to an allowed partner domain.
 */
export function isAllowedPartnerUrl(url: string): boolean {
  return isAllowedDomain(url, ALLOWED_PARTNER_DOMAINS);
}

/**
 * Check if a URL is a valid Stripe checkout URL.
 * Used to validate server-returned checkout URLs before redirecting.
 */
export function isAllowedCheckoutUrl(url: string): boolean {
  return isAllowedDomain(url, ALLOWED_CHECKOUT_DOMAINS);
}

/**
 * Check if a URL is a valid social media link.
 * Used to validate DB-stored social URLs before rendering as <a href>.
 */
export function isAllowedSocialUrl(url: string): boolean {
  return isAllowedDomain(url, ALLOWED_SOCIAL_DOMAINS);
}

/**
 * Check if a URL is a valid payment link for chat.
 * Used to validate payment URLs before rendering QR codes or links.
 */
export function isAllowedPaymentUrl(url: string): boolean {
  return isAllowedDomain(url, ALLOWED_PAYMENT_DOMAINS);
}

/**
 * Sanitize a dynamic path segment (e.g. IDs from push notifications).
 * Only allows UUID-like strings and simple alphanumeric IDs.
 * Prevents path traversal (../../admin) and injection.
 */
export function sanitizePathSegment(value: string | undefined | null): string | null {
  if (!value) return null;
  
  const trimmed = value.trim();
  
  // Only allow: alphanumeric, hyphens, underscores (covers UUIDs and simple IDs)
  // Block: ../ ./ / \ and any special chars
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    console.warn('[urlSafety] Blocked suspicious path segment:', trimmed);
    return null;
  }
  
  // Max 128 chars for an ID
  if (trimmed.length > 128) return null;
  
  return trimmed;
}

/**
 * Build a safe internal navigation path from a base path and an ID.
 * Returns the fallback path if the ID is invalid.
 */
export function safeInternalPath(basePath: string, id: string | undefined | null, fallback: string): string {
  const safeId = sanitizePathSegment(id);
  if (!safeId) return fallback;
  return `${basePath}/${safeId}`;
}

/**
 * Sanitize partner name displayed in UI.
 * Prevents social engineering (e.g. name="Your Bank - Login Required")
 */
export function sanitizePartnerName(name: string): string {
  const cleaned = name
    .replace(/[<>"'`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 50);
  
  return cleaned || 'Partner';
}

/**
 * Validate a URL from an external/untrusted source before rendering.
 * Returns the URL if safe, or null if blocked.
 */
export function validateExternalUrl(url: string | null | undefined, allowedDomains?: string[]): string | null {
  if (!url) return null;
  
  const trimmed = url.trim();
  if (!trimmed) return null;
  
  if (!isSafeProtocol(trimmed)) {
    console.warn('[urlSafety] Blocked unsafe protocol:', trimmed.slice(0, 30));
    return null;
  }
  
  // If domain allowlist provided, validate against it
  if (allowedDomains && !isAllowedDomain(trimmed, allowedDomains)) {
    console.warn('[urlSafety] Blocked URL not in allowlist:', trimmed.slice(0, 60));
    return null;
  }
  
  return trimmed;
}
