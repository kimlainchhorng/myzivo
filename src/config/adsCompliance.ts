/**
 * HIZIVO Ads Ready Checklist
 * 
 * This file documents the ads compliance setup for Google & Meta
 * Reference for campaign managers and audits
 */

// ============================================
// LANDING PAGES
// ============================================

export const AD_LANDING_PAGES = {
  flights: {
    url: '/lp/flights',
    headline: 'Search & Compare Flights',
    cta: 'Search Flights',
    disclaimer: 'Hizivo does not issue airline tickets. Flight bookings are completed with licensed airline partners.',
    hasRealImages: true,
    hasPartnerDisclosure: true,
    noIndex: true, // Prevent organic indexing
  },
  hotels: {
    url: '/lp/hotels',
    headline: 'Search & Compare Hotels',
    cta: 'Search Hotels',
    disclaimer: 'Hizivo is not the merchant of record. Hotel bookings are completed with licensed third-party providers.',
    hasRealImages: true,
    hasPartnerDisclosure: true,
    noIndex: true,
  },
  cars: {
    url: '/lp/cars',
    headline: 'Compare Car Rentals',
    cta: 'Search Cars',
    disclaimer: 'Hizivo is not the merchant of record. Car rentals are fulfilled by licensed third-party providers.',
    hasRealImages: true,
    hasPartnerDisclosure: true,
    noIndex: true,
  },
} as const;

// ============================================
// CONVERSION EVENTS (TRACKED)
// ============================================

export const TRACKED_EVENTS = [
  'page_view',              // User lands on LP
  'travel_search_submitted', // User clicks search button
  'offer_viewed',           // User views specific offer
  'partner_checkout_initiated', // User clicks to partner checkout
] as const;

// ============================================
// EVENTS WE DO NOT TRACK
// ============================================

export const FORBIDDEN_EVENTS = [
  'payment_completed',  // We don't process payments
  'purchase_value',     // We don't know booking value
  'purchase',           // We are NOT the merchant
  'transaction_id',     // Partner owns this
] as const;

// ============================================
// GOOGLE ADS CONFIGURATION
// ============================================

export const GOOGLE_ADS_CONFIG = {
  campaigns: {
    flights: {
      name: 'Flights - Search',
      keywords: ['cheap flights', 'book flights', 'flight deals', 'compare flights', 'flight search'],
      finalUrl: '/lp/flights',
      negativesKeywords: ['airline tickets sale', 'buy tickets', 'cheapest guaranteed'],
    },
    hotels: {
      name: 'Hotels - Search',
      keywords: ['hotel deals', 'compare hotels', 'hotel search', 'cheap hotels', 'book hotel'],
      finalUrl: '/lp/hotels',
      negativesKeywords: ['hotel booking direct', 'hotel reservation guaranteed'],
    },
    cars: {
      name: 'Car Rentals - Search',
      keywords: ['car rental', 'rent a car', 'cheap car rental', 'compare car rentals'],
      finalUrl: '/lp/cars',
      negativesKeywords: ['car rental guaranteed', 'best price car'],
    },
  },
  forbiddenClaims: [
    'We sell airline tickets',
    'Best price guarantee',
    'Lowest price guaranteed',
    'Book directly with us',
    'We are the airline',
    'Official booking',
  ],
  requiredClaims: [
    'Compare options',
    'Search and compare',
    'Book with partners',
    'Secure partner checkout',
  ],
};

// ============================================
// META ADS CONFIGURATION
// ============================================

export const META_ADS_CONFIG = {
  objective: 'TRAFFIC', // or 'LANDING_PAGE_VIEWS'
  cta: 'SEARCH', // "Search Now" button
  adCopy: {
    primary: 'Search flights, hotels & cars. Book securely with our travel partners.',
    alternatives: [
      'Compare travel options from trusted partners worldwide.',
      'Find your next trip. Compare prices from licensed partners.',
      'Travel search made easy. Secure booking with partner sites.',
    ],
  },
  forbiddenClaims: [
    'Guaranteed lowest price',
    'We sell tickets',
    'Best price promise',
    'Book with us directly',
  ],
  creativeGuidelines: {
    useRealImages: true,
    noMisleadingClaims: true,
    clearPartnerLanguage: true,
  },
};

// ============================================
// COMPLIANCE CHECKLIST
// ============================================

export const COMPLIANCE_CHECKLIST = {
  landingPages: {
    realImages: true,           // No icon-only sections
    clearHeadlines: true,       // Descriptive, not misleading
    partnerDisclosure: true,    // Visible explanation
    disclaimerFooter: true,     // Locked legal text
    legalLinks: true,           // Privacy, Terms, Disclosure
    noPaymentFields: true,      // No credit card inputs
    noPriceGuarantees: true,    // No "cheapest" claims
  },
  tracking: {
    pageView: true,
    searchSubmitted: true,
    offerViewed: true,
    checkoutInitiated: true,
    noPurchaseEvents: true,     // CRITICAL
    noPaymentValue: true,       // CRITICAL
  },
  adCopy: {
    noMisleadingClaims: true,
    partnerLanguage: true,
    searchFocused: true,
    noGuarantees: true,
  },
};
