/**
 * Multi-rail payout router.
 *
 * ZIVO is a US company that needs to pay hosts/partners worldwide.
 * Stripe Connect Express only supports a fixed list of countries.
 * For everything else (Cambodia, Laos, Myanmar, Vietnam, etc.) we
 * fall back to manual rails (ABA / KHQR for KH, bank wire elsewhere)
 * routed through admin via Telegram notification.
 */

/** Stripe Connect Express supported countries (ISO 3166-1 alpha-2). */
export const STRIPE_CONNECT_COUNTRIES = new Set<string>([
  // Americas
  "US", "CA", "MX", "BR",
  // Europe
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LI", "LT", "LU", "MT", "NL", "NO", "PL", "PT",
  "RO", "SK", "SI", "ES", "SE", "CH", "GB",
  // Asia-Pacific (limited)
  "AU", "NZ", "HK", "JP", "SG", "MY", "TH", "ID", "PH", "IN", "AE",
]);

/** Markets where ABA Bank / KHQR is the preferred manual rail. */
export const MANUAL_ABA_COUNTRIES = new Set<string>(["KH"]);

/** Countries where PayPal payouts are widely usable as a fallback. */
export const PAYPAL_PAYOUT_COUNTRIES = new Set<string>([
  "US", "CA", "GB", "AU", "DE", "FR", "ES", "IT", "NL", "JP", "SG", "HK",
  "MY", "TH", "PH", "ID", "VN", "TW", "KR", "IN", "AE", "MX", "BR",
]);

export type PayoutRail = "stripe" | "aba" | "bank_wire" | "paypal";

export interface RailAvailability {
  stripe: boolean;
  aba: boolean;
  bank_wire: boolean;
  paypal: boolean;
}

/** Normalise an arbitrary country string to ISO alpha-2 upper-case. */
export function normalizeCountry(input?: string | null): string {
  const c = (input || "").trim().toUpperCase();
  if (c.length === 2) return c;
  // crude name → code map for the most common typed values
  const map: Record<string, string> = {
    "CAMBODIA": "KH",
    "UNITED STATES": "US",
    "USA": "US",
    "VIETNAM": "VN",
    "VIET NAM": "VN",
    "LAOS": "LA",
    "MYANMAR": "MM",
    "BURMA": "MM",
    "THAILAND": "TH",
    "SINGAPORE": "SG",
    "MALAYSIA": "MY",
    "PHILIPPINES": "PH",
    "INDONESIA": "ID",
    "JAPAN": "JP",
    "HONG KONG": "HK",
    "UNITED KINGDOM": "GB",
    "UAE": "AE",
  };
  return map[c] || "US";
}

export function getAvailableRails(countryRaw?: string | null): RailAvailability {
  const country = normalizeCountry(countryRaw);
  return {
    stripe: STRIPE_CONNECT_COUNTRIES.has(country),
    aba: MANUAL_ABA_COUNTRIES.has(country),
    // Bank wire is always available as a manual fallback (admin processes it).
    bank_wire: true,
    paypal: PAYPAL_PAYOUT_COUNTRIES.has(country),
  };
}

/** Pick the most automated/preferred rail for a host country. */
export function recommendedRail(countryRaw?: string | null): PayoutRail {
  const country = normalizeCountry(countryRaw);
  if (STRIPE_CONNECT_COUNTRIES.has(country)) return "stripe";
  if (MANUAL_ABA_COUNTRIES.has(country)) return "aba";
  if (PAYPAL_PAYOUT_COUNTRIES.has(country)) return "paypal";
  return "bank_wire";
}

export const RAIL_LABELS: Record<PayoutRail, string> = {
  stripe: "Stripe Connect",
  aba: "ABA / KHQR",
  bank_wire: "Bank wire",
  paypal: "PayPal",
};

export const RAIL_DESCRIPTIONS: Record<PayoutRail, string> = {
  stripe: "Direct deposit via Stripe Express. Fastest, automated, includes tax forms.",
  aba: "Manual transfer to ABA Bank / KHQR account. Processed within 1 business day.",
  bank_wire: "International bank wire (SWIFT). Processed manually within 2–3 business days.",
  paypal: "PayPal payout. Processed manually within 1–2 business days.",
};
