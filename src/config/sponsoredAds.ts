/**
 * SPONSORED LISTINGS & ADS CONFIGURATION
 * FTC-compliant sponsored content system for revenue monetization
 */

// ============================================
// SPONSORED PLACEMENT RULES
// ============================================

export const SPONSORED_RULES = {
  // Sponsored listings must be clearly labeled
  requireLabel: true,
  
  // Sponsored results never hide cheaper options
  neverHideCheaper: true,
  
  // Sponsored results appear only at top or mid-list
  allowedPositions: ['top', 'mid'] as const,
  
  // Maximum sponsored items per page
  maxPerPage: 3,
  
  // Keep sorting and filters intact
  respectFilters: true,
};

// ============================================
// SPONSORED BADGE CONFIG
// ============================================

export const SPONSORED_BADGE_TEXT = {
  default: "Sponsored",
  ad: "Ad",
  featured: "Featured",
  promoted: "Promoted",
  partner: "Partner",
};

export const SPONSORED_DISCLOSURE_TEXT = {
  results: "Sponsored results are clearly labeled and do not affect price transparency.",
  general: "ZIVO may display sponsored travel offers. Sponsored placements are clearly identified.",
  pricing: "All prices shown are the final prices from our partners.",
  hotel: "Featured hotel placement. Price and availability confirmed by partner.",
  destination: "Featured destination partner.",
  footer: "Some listings on this page are sponsored. Sponsored content is clearly marked and does not impact the order of non-sponsored results.",
};

// ============================================
// SPONSORED RESULT TYPES
// ============================================

export interface SponsoredItem {
  id: string;
  type: 'flight' | 'hotel' | 'car' | 'activity' | 'destination';
  position: 'top' | 'mid' | 'sidebar' | 'banner';
  partnerId: string;
  partnerName: string;
  campaignId?: string;
  pricingModel: 'cpc' | 'cpm' | 'fixed';
  impressionValue?: number;
  clickValue?: number;
}

export const SPONSORED_POSITIONS = {
  top: {
    label: "Top placement",
    maxItems: 1,
    premium: true,
  },
  mid: {
    label: "Mid-list placement",
    maxItems: 2,
    premium: false,
  },
  sidebar: {
    label: "Sidebar ad",
    maxItems: 3,
    premium: false,
  },
  banner: {
    label: "Banner ad",
    maxItems: 1,
    premium: true,
  },
};

// ============================================
// AD PLACEMENT TYPES (SOFT)
// ============================================

export const ALLOWED_AD_PLACEMENTS = [
  {
    id: "banner_results",
    label: "Banner inside results page",
    position: "after_third_result",
    format: "728x90",
  },
  {
    id: "card_between",
    label: "Cards between results",
    position: "every_5_results",
    format: "native_card",
  },
  {
    id: "sidebar",
    label: "Sidebar ads (desktop)",
    position: "right_sidebar",
    format: "300x250",
  },
];

export const BLOCKED_AD_FORMATS = [
  "popup",
  "auto_play_video",
  "fullscreen_takeover",
  "interstitial",
  "sticky_bottom",
];

// ============================================
// PRICING & SALES MODEL
// ============================================

export const PRICING_MODELS = {
  cpc: {
    id: "cpc",
    label: "Cost Per Click",
    description: "Pay when users click on your listing",
    minBid: 0.10,
    maxBid: 5.00,
    currency: "USD",
  },
  cpm: {
    id: "cpm",
    label: "Cost Per Mille (Impressions)",
    description: "Pay per 1,000 impressions",
    minBid: 1.00,
    maxBid: 50.00,
    currency: "USD",
  },
  fixed: {
    id: "fixed",
    label: "Fixed Monthly Placement",
    description: "Guaranteed placement for a fixed monthly fee",
    minPrice: 500,
    maxPrice: 10000,
    currency: "USD",
  },
};

// ============================================
// DESTINATION SPONSORSHIP
// ============================================

export const DESTINATION_SPONSORSHIP_PLACEMENTS = [
  { id: "city_page", label: "City landing pages" },
  { id: "deals_page", label: "Deals and offers pages" },
  { id: "travel_guide", label: "Travel guides" },
  { id: "inspiration", label: "Inspiration sections" },
];

// ============================================
// USER TRUST PROTECTION
// ============================================

export const TRUST_RULES = {
  // Always show sponsored labels
  requireSponsoredLabel: true,
  
  // No misleading pricing
  noMisleadingPricing: true,
  
  // No false urgency
  noFalseUrgency: true,
  
  // Maintain filter integrity
  respectUserFilters: true,
  
  // Non-sponsored results remain unaffected
  protectOrganicResults: true,
};

// ============================================
// COMPLIANCE COPY
// ============================================

export const SITE_WIDE_DISCLOSURE = 
  "ZIVO may display sponsored travel offers. Sponsored placements are clearly identified.";

export const SPONSORED_FOOTER_TEXT = 
  "Some content on this page may be sponsored. Sponsored listings are clearly marked with a 'Sponsored' label and do not affect the ranking of non-sponsored results.";
