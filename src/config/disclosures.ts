/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                    ZIVO COMPLIANCE DISCLOSURE CONFIG                       ║
 * ║═══════════════════════════════════════════════════════════════════════════║
 * ║  Centralized disclosure text for affiliate compliance.                     ║
 * ║  These messages MUST appear on all booking-related pages.                  ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

export const DISCLOSURE_TEXT = {
  // Short version for CTAs and buttons
  short: "You will be redirected to our trusted travel partner to complete your booking.",
  
  // Medium version for search cards
  medium: "ZIVO may earn a commission when you book through our partner links at no extra cost to you.",
  
  // Full version for footer/legal
  full: "ZIVO acts as a search and comparison platform. When you click a booking link, you will be redirected to our trusted travel partner to complete your booking. ZIVO may earn a commission at no additional cost to you.",
  
  // Payment disclaimer
  payment: "All bookings, payments, refunds, and changes are handled directly by our travel partners. ZIVO does not process payments or hold booking data.",
  
  // Price disclaimer (REQUIRED on all price displays)
  price: "Prices shown are indicative and may vary. Final price will be confirmed on our travel partner's website.",
  
  // Price with asterisk explanation
  priceAsterisk: "* Prices are estimates and subject to change. Actual prices will be shown on the booking site.",
  
  // No guarantee disclaimer (important for compliance)
  noGuarantee: "ZIVO does not guarantee prices, availability, or specific deals. All information is provided by our travel partners.",
  
  // Partner redirect notice
  redirect: "Opens partner site in new tab",
  
  // Compare prices context
  compare: "Compare prices from multiple trusted travel partners",
} as const;

// Service-specific disclosures
export const SERVICE_DISCLOSURES = {
  flights: {
    provider: "Flight prices and availability from 500+ airlines via our search partners.",
    booking: "Book directly with airlines or online travel agencies.",
  },
  hotels: {
    provider: "Hotel rates from Booking.com, Hotels.com, Expedia, and more.",
    booking: "Book directly with hotels or booking platforms.",
  },
  cars: {
    provider: "Car rental prices from major providers worldwide.",
    booking: "Book through rental companies or aggregator sites.",
  },
  activities: {
    provider: "Tours and activities from Klook, Viator, and local operators.",
    booking: "Book directly with experience providers.",
  },
} as const;

// Legal page references
export const LEGAL_LINKS = {
  privacy: "/privacy",
  terms: "/terms",
  affiliateDisclosure: "/affiliate-disclosure",
  cookies: "/privacy#cookies",
} as const;

/**
 * Get formatted disclosure for a specific context
 */
export function getDisclosure(
  type: keyof typeof DISCLOSURE_TEXT,
  service?: keyof typeof SERVICE_DISCLOSURES
): string {
  const base = DISCLOSURE_TEXT[type];
  
  if (service && SERVICE_DISCLOSURES[service]) {
    return `${base} ${SERVICE_DISCLOSURES[service].provider}`;
  }
  
  return base;
}
