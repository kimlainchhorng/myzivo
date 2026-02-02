/**
 * HIZOVO TRAVEL - LOCKED COMPLIANCE TEXT
 * 
 * DO NOT MODIFY WITHOUT LEGAL APPROVAL
 * These texts are required for Duffel/CJ/airline partner compliance
 * 
 * Last Updated: February 2, 2026
 * Approved By: Legal/Compliance Team
 */

// ============================================
// LOCKED CTA TEXT (PRODUCTION)
// ============================================

export const FLIGHT_CTA_TEXT = {
  /** Primary CTA button text - use on all flight booking buttons */
  primary: "Continue to secure booking",
  
  /** Secondary/alternative CTA text */
  secondary: "Continue to secure booking",
  
  /** Mobile sticky CTA */
  mobile: "Continue to booking",
  
  /** View deal variant (results page) - redirect to partner */
  viewDeal: "Continue to secure booking",
  
  /** Select flight variant */
  select: "Continue to secure booking",
  
  /** Traveler info to checkout */
  proceedToPayment: "Proceed to secure payment",
} as const;

// ============================================
// LOCKED DISCLAIMERS (PRODUCTION)
// ============================================

export const FLIGHT_DISCLAIMERS = {
  /** Main ticketing disclaimer - REQUIRED on all booking pages (GLOBAL) */
  ticketing: "Hizovo does not issue tickets. Payment and booking fulfillment are handled by licensed travel partners.",
  
  /** Shorter version for inline use */
  ticketingShort: "Hizovo does not issue tickets.",
  
  /** Footer disclaimer */
  footer: "Hizovo does not issue tickets. Payment and booking fulfillment are handled by licensed travel partners.",
  
  /** Partner redirect notice - under CTA buttons */
  redirect: "Powered by licensed travel partners · Final price confirmed before payment",
  
  /** Price disclaimer */
  price: "Indicative prices shown. Final price confirmed on partner checkout.",
  
  /** Support disclaimer */
  support: "For changes, cancellations, or refunds, please contact the booking partner listed in your confirmation email.",
  
  /** Payment disclaimer - CRITICAL for MoR compliance */
  payment: "Hizovo does not collect or process payments for travel. All payments are handled by licensed travel partners.",
  
  /** Results page live deals notice */
  liveDeals: "Comparing live deals from licensed travel partners",
  
  /** Detail page disclosure */
  detailDisclosure: "You'll complete your booking securely on Hizovo with our licensed travel partner.",
} as const;

// ============================================
// LOCKED CONSENT TEXT (PRODUCTION)
// ============================================

export const FLIGHT_CONSENT = {
  /** Checkbox label - REQUIRED before partner redirect */
  checkboxLabel: "I agree to share my information with the licensed booking partner to complete my reservation.",
  
  /** Full consent description */
  description: "Your details will be securely transmitted to our licensed travel partner to complete your booking. By proceeding, you agree to the partner's terms and conditions.",
  
  /** Privacy notice */
  privacy: "Your data is encrypted and only shared with the booking partner. Hizovo does not store payment information.",
  
  /** Terms link text */
  termsLink: "View Partner Terms",
} as const;

// ============================================
// TRUST BADGES / SECURITY TEXT
// ============================================

export const FLIGHT_TRUST_BADGES = {
  secureCheckout: "Secure partner checkout",
  transparentPricing: "Transparent pricing",
  licensedPartner: "Licensed airline partner",
  noHiddenFees: "No hidden fees from Hizivo",
  dataEncrypted: "Data encrypted in transit",
} as const;

// ============================================
// EMAIL SUBJECTS (PRODUCTION)
// ============================================

export const FLIGHT_EMAIL_SUBJECTS = {
  /** Redirect confirmation email */
  redirectConfirmation: "You're booking with our airline partner",
  
  /** Booking return / success */
  bookingSuccess: "Your flight booking is being processed",
  
  /** Booking pending */
  bookingPending: "We're confirming your flight booking",
} as const;

// ============================================
// ERROR MESSAGES
// ============================================

export const FLIGHT_ERROR_MESSAGES = {
  /** Offer expired */
  offerExpired: "This flight offer has expired. Please search again for current availability.",
  
  /** Price changed */
  priceChanged: "The price has changed since your search. Please review the updated price before continuing.",
  
  /** No availability */
  noAvailability: "This flight is no longer available. Please select another option.",
  
  /** Partner error */
  partnerError: "We're having trouble connecting to our airline partner. Please try again in a moment.",
  
  /** General error */
  generalError: "Something went wrong. Please try again or contact support.",
} as const;

// ============================================
// TRACKING PARAMS (LOCKED FOR DUFFEL)
// ============================================

export const FLIGHT_TRACKING_PARAMS = {
  utm_source: 'hizivo',
  utm_medium: 'partner',
  utm_campaign: 'flights',
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the appropriate CTA text based on context
 */
export function getFlightCTAText(context: 'primary' | 'mobile' | 'results' | 'details' = 'primary'): string {
  switch (context) {
    case 'mobile':
      return FLIGHT_CTA_TEXT.mobile;
    case 'results':
      return FLIGHT_CTA_TEXT.viewDeal;
    case 'details':
      return FLIGHT_CTA_TEXT.primary;
    default:
      return FLIGHT_CTA_TEXT.primary;
  }
}

/**
 * Get the ticketing disclaimer (required on all flight pages)
 */
export function getTicketingDisclaimer(variant: 'full' | 'short' | 'footer' = 'full'): string {
  switch (variant) {
    case 'short':
      return FLIGHT_DISCLAIMERS.ticketingShort;
    case 'footer':
      return FLIGHT_DISCLAIMERS.footer;
    default:
      return FLIGHT_DISCLAIMERS.ticketing;
  }
}

/**
 * Build tracking URL with Duffel-compliant params
 */
export function buildFlightTrackingParams(sessionId: string): URLSearchParams {
  return new URLSearchParams({
    ...FLIGHT_TRACKING_PARAMS,
    subid: sessionId,
  });
}
