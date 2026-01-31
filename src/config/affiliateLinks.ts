// Centralized Travelpayouts affiliate link configuration
// These are the official affiliate links provided by Travelpayouts

export const AFFILIATE_LINKS = {
  // Searadar - Flight search and booking
  flights: {
    url: "https://searadar.tpo.li/iAbLlX9i",
    name: "Searadar",
    description: "Search and compare flight prices from 728 airlines",
  },
  
  // Klook - Activities, tours, and attractions
  activities: {
    url: "https://klook.tpo.li/ToVcOax7",
    name: "Klook",
    description: "Book tours, activities, and attractions worldwide",
  },
} as const;

// Compliance text for affiliate redirects
export const AFFILIATE_DISCLOSURE_TEXT = {
  short: "You will be redirected to our trusted travel partner to complete your booking.",
  full: "ZIVO may earn a commission when you book through our partner links at no extra cost to you.",
  detailed: "ZIVO acts as a search and comparison platform. When you click a booking link, you will be redirected to our trusted travel partner to complete your booking. ZIVO may earn a commission at no additional cost to you.",
};

// Open affiliate link in new tab
export function openAffiliateLink(type: keyof typeof AFFILIATE_LINKS) {
  const link = AFFILIATE_LINKS[type];
  window.open(link.url, "_blank", "noopener,noreferrer");
}
