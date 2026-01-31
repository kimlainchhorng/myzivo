/**
 * ZIVO Affiliate Link Configuration
 * 
 * IMPORTANT: Do not modify SubIDs without Business Operations approval.
 * See src/docs/AFFILIATE_SUBID_MAPPING.md for full documentation.
 * 
 * Last Updated: 2026-01-31
 */

export interface AffiliateLink {
  url: string;
  name: string;
  description: string;
  subId: string;
  fallbackUrl?: string;
}

export const AFFILIATE_LINKS: Record<string, AffiliateLink> = {
  // Searadar - Flight search and booking
  flights: {
    url: "https://searadar.tpo.li/iAbLlX9i?subid=zivo_flights",
    name: "Searadar",
    description: "Search and compare flight prices from 728 airlines",
    subId: "zivo_flights",
    fallbackUrl: "https://www.skyscanner.com/?utm_source=zivo",
  },
  
  // Hotels - Partner TBD (using placeholder)
  hotels: {
    url: "https://hotellook.tpo.li/?subid=zivo_hotels",
    name: "Hotellook",
    description: "Compare hotel prices across booking sites",
    subId: "zivo_hotels",
    fallbackUrl: "https://www.booking.com/?aid=zivo",
  },
  
  // Car Rentals - Partner TBD (using placeholder)
  cars: {
    url: "https://economybookings.tpo.li/?subid=zivo_cars",
    name: "EconomyBookings",
    description: "Compare car rental prices worldwide",
    subId: "zivo_cars",
    fallbackUrl: "https://www.rentalcars.com/?affiliateCode=zivo",
  },
  
  // Klook - Activities, tours, and attractions
  activities: {
    url: "https://klook.tpo.li/ToVcOax7?subid=zivo_activities",
    name: "Klook",
    description: "Book tours, activities, and attractions worldwide",
    subId: "zivo_activities",
    fallbackUrl: "https://www.viator.com/?pid=zivo",
  },
} as const;

// Compliance text for affiliate redirects
export const AFFILIATE_DISCLOSURE_TEXT = {
  short: "You will be redirected to our trusted travel partner to complete your booking.",
  full: "ZIVO may earn a commission when you book through our partner links at no extra cost to you.",
  detailed: "ZIVO acts as a search and comparison platform. When you click a booking link, you will be redirected to our trusted travel partner to complete your booking. ZIVO may earn a commission at no additional cost to you.",
  payment: "All bookings, payments, refunds, and changes are handled directly by our travel partners.",
};

// Open affiliate link in new tab with fallback support
export function openAffiliateLink(type: keyof typeof AFFILIATE_LINKS) {
  const link = AFFILIATE_LINKS[type];
  if (!link) {
    console.warn(`[Affiliate] Unknown link type: ${type}`);
    return;
  }
  
  try {
    window.open(link.url, "_blank", "noopener,noreferrer");
  } catch (error) {
    // Fallback if primary link fails
    if (link.fallbackUrl) {
      console.warn(`[Affiliate] Primary link failed, using fallback for ${type}`);
      window.open(link.fallbackUrl, "_blank", "noopener,noreferrer");
    }
  }
}

// Get affiliate URL with fallback
export function getAffiliateUrl(type: keyof typeof AFFILIATE_LINKS): string {
  const link = AFFILIATE_LINKS[type];
  return link?.url || link?.fallbackUrl || "#";
}

// Check if affiliate link is healthy (for monitoring)
export function getAffiliateLinkHealth(): Record<string, boolean> {
  const health: Record<string, boolean> = {};
  for (const [key, link] of Object.entries(AFFILIATE_LINKS)) {
    health[key] = Boolean(link.url);
  }
  return health;
}
