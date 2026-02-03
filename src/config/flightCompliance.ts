/**
 * ZIVO TRAVEL - MOR (Merchant of Record) COMPLIANCE TEXT
 * 
 * ZIVO is the seller of travel. Tickets issued by licensed partners.
 * 
 * Last Updated: February 3, 2026
 * Model: Merchant of Record (MoR)
 */

// ============================================
// SELLER OF TRAVEL REGISTRATION (Re-export)
// ============================================

export { ZIVO_SOT_REGISTRATION } from './flightMoRCompliance';

// ============================================
// LOCKED CTA TEXT (MoR Model)
// ============================================

export const FLIGHT_CTA_TEXT = {
  /** Primary CTA button text - use on all flight booking buttons */
  primary: "Book Now",
  
  /** Secondary/alternative CTA text */
  secondary: "Select Flight",
  
  /** Mobile sticky CTA */
  mobile: "Book Flight",
  
  /** View deal variant (results page) */
  viewDeal: "Book on ZIVO",
  
  /** Select flight variant */
  select: "Select",
  
  /** Traveler info to checkout */
  proceedToPayment: "Continue to Payment",
  
  /** Checkout page */
  checkout: "Pay Securely",
  
  /** Confirm booking */
  confirm: "Complete Booking",
} as const;

// ============================================
// LOCKED DISCLAIMERS (MoR Model)
// ============================================

export const FLIGHT_DISCLAIMERS = {
  /** Main ticketing disclaimer - REQUIRED on all booking pages */
  ticketing: "ZIVO sells flight tickets as a sub-agent of licensed ticketing providers. Tickets are issued by authorized partners under applicable airline rules.",
  
  /** Shorter version for inline use */
  ticketingShort: "ZIVO sells flight tickets. Tickets issued by licensed partners.",
  
  /** Footer disclaimer */
  footer: "ZIVO sells flight tickets as a sub-agent of licensed ticketing providers. Tickets are issued by authorized partners under applicable airline rules.",
  
  /** Under CTA notice */
  checkout: "Secure ZIVO checkout · Final price confirmed before payment",
  
  /** Price disclaimer - NO indicative language */
  price: "All prices include taxes and fees. Final total shown at checkout.",
  
  /** Support disclaimer */
  support: "For booking changes, cancellations, or refunds, contact ZIVO Support. Airline fare rules apply.",
  
  /** Payment disclaimer - ZIVO is MoR */
  payment: "Payment is processed securely by ZIVO. Your payment details are encrypted and protected.",
  
  /** Results page notice */
  liveDeals: "Live flight prices from airline partners",
  
  /** Detail page disclosure */
  detailDisclosure: "Complete your booking securely with ZIVO. Tickets issued by licensed airline partners.",
  
  /** Refund policy */
  refund: "Refunds are subject to airline fare rules. Cancellation fees may apply.",
} as const;

// ============================================
// LOCKED CONSENT TEXT (MoR Model)
// ============================================

export const FLIGHT_CONSENT = {
  /** Checkbox label - REQUIRED before payment */
  checkboxLabel: "I agree to the Terms and Conditions and Airline Rules.",
  
  /** Full consent description */
  description: "By proceeding, you agree to ZIVO's Terms of Service, Privacy Policy, and the applicable airline fare rules and conditions of carriage.",
  
  /** Privacy notice */
  privacy: "Your data is encrypted and securely stored. ZIVO uses your information to process your booking and provide customer support.",
  
  /** Terms link text */
  termsLink: "View Flight Terms",
} as const;

// ============================================
// TRUST BADGES / SECURITY TEXT
// ============================================

export const FLIGHT_TRUST_BADGES = {
  secureCheckout: "Secure ZIVO checkout",
  transparentPricing: "Transparent pricing",
  licensedPartner: "Licensed ticketing partner",
  noHiddenFees: "No hidden fees",
  dataEncrypted: "256-bit encryption",
  moneyBackGuarantee: "Booking guarantee",
} as const;

// ============================================
// EMAIL SUBJECTS (MoR Model)
// ============================================

export const FLIGHT_EMAIL_SUBJECTS = {
  /** Payment confirmation */
  paymentConfirmation: "Payment Received - Your ZIVO Flight Booking",
  
  /** Ticket issued */
  ticketIssued: "Your E-Ticket is Ready - ZIVO Flight Confirmation",
  
  /** Booking pending */
  bookingPending: "Booking Confirmed - E-Ticket Being Issued",
  
  /** Booking cancelled */
  bookingCancelled: "Your ZIVO Flight Booking Has Been Cancelled",
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
  
  /** Ticketing error */
  ticketingError: "We encountered an issue issuing your ticket. Our team has been notified and will contact you shortly.",
  
  /** Payment error */
  paymentError: "Payment could not be processed. Please check your card details and try again.",
  
  /** General error */
  generalError: "Something went wrong. Please try again or contact support.",
} as const;

// ============================================
// TRACKING PARAMS
// ============================================

export const FLIGHT_TRACKING_PARAMS = {
  utm_source: 'zivo',
  utm_medium: 'direct',
  utm_campaign: 'flights',
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the appropriate CTA text based on context
 */
export function getFlightCTAText(context: 'primary' | 'mobile' | 'results' | 'details' | 'checkout' = 'primary'): string {
  switch (context) {
    case 'mobile':
      return FLIGHT_CTA_TEXT.mobile;
    case 'results':
      return FLIGHT_CTA_TEXT.viewDeal;
    case 'details':
      return FLIGHT_CTA_TEXT.primary;
    case 'checkout':
      return FLIGHT_CTA_TEXT.checkout;
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
 * Build tracking URL with ZIVO params
 */
export function buildFlightTrackingParams(sessionId: string): URLSearchParams {
  return new URLSearchParams({
    ...FLIGHT_TRACKING_PARAMS,
    session: sessionId,
  });
}
