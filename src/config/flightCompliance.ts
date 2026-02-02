/**
 * ZIVO FLIGHTS - LOCKED COMPLIANCE TEXT
 * 
 * DO NOT MODIFY WITHOUT LEGAL APPROVAL
 * These texts are required for Duffel/airline partner compliance
 * 
 * Last Updated: February 2, 2026
 * Approved By: Legal/Compliance Team
 */

// ============================================
// LOCKED CTA TEXT (PRODUCTION)
// ============================================

export const FLIGHT_CTA_TEXT = {
  /** Primary CTA button text - use on all flight booking buttons */
  primary: "Continue to secure checkout",
  
  /** Secondary/alternative CTA text */
  secondary: "Book with our partner",
  
  /** Mobile sticky CTA */
  mobile: "Continue to checkout",
  
  /** View deal variant (results page) */
  viewDeal: "View Deal",
  
  /** Select flight variant */
  select: "Select Flight",
} as const;

// ============================================
// LOCKED DISCLAIMERS (PRODUCTION)
// ============================================

export const FLIGHT_DISCLAIMERS = {
  /** Main ticketing disclaimer - REQUIRED on all flight pages */
  ticketing: "Hizivo does not issue airline tickets. Flight bookings are completed with licensed airline partners.",
  
  /** Shorter version for inline use */
  ticketingShort: "Hizivo does not issue airline tickets.",
  
  /** Footer disclaimer */
  footer: "Hizivo is not the merchant of record for flights. All flight bookings, payments, and ticket issuance are handled by licensed airline partners.",
  
  /** Partner redirect notice */
  redirect: "You will be redirected to our trusted airline partner to complete your booking securely.",
  
  /** Price disclaimer */
  price: "Prices shown are estimates and may change. Final price confirmed on partner checkout.",
  
  /** Support disclaimer */
  support: "For flight changes, cancellations, or refunds, please contact the airline partner listed in your confirmation email.",
  
  /** Payment disclaimer - CRITICAL for MoR compliance */
  payment: "Hizivo does not collect or process payments for flights. All payments are handled by the airline partner.",
} as const;

// ============================================
// LOCKED CONSENT TEXT (PRODUCTION)
// ============================================

export const FLIGHT_CONSENT = {
  /** Checkbox label - REQUIRED before partner redirect */
  checkboxLabel: "I agree to share my information with the booking partner.",
  
  /** Full consent description */
  description: "Your details will be securely transmitted to our licensed airline partner to complete your booking. By proceeding, you agree to the partner's terms and conditions.",
  
  /** Privacy notice */
  privacy: "Your data is encrypted and only shared with the booking partner. Hizivo does not store payment information.",
  
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
