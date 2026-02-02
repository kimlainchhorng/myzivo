/**
 * ZIVO FLIGHTS - MERCHANT OF RECORD COMPLIANCE TEXT
 * 
 * ZIVO is the seller of travel - NOT an affiliate
 * Tickets issued by licensed partners under sub-agent agreement
 * 
 * Last Updated: February 2, 2026
 */

// ============================================
// MOR CTA TEXT (ZIVO = SELLER)
// ============================================

export const FLIGHT_MOR_CTA = {
  /** Primary booking button */
  primary: "Book Now",
  
  /** Continue to checkout */
  checkout: "Continue to Payment",
  
  /** Payment button */
  pay: "Pay Securely",
  
  /** Confirm booking */
  confirm: "Complete Booking",
  
  /** Results page */
  results: "Select Flight",
  
  /** Details page */
  details: "Book This Flight",
  
  /** Mobile CTA */
  mobile: "Book Now",
} as const;

// ============================================
// MOR DISCLAIMERS (ZIVO = SELLER)
// ============================================

export const FLIGHT_MOR_DISCLAIMERS = {
  /** Main seller disclaimer - REQUIRED on checkout */
  seller: "ZIVO sells flight tickets as a sub-agent of licensed ticketing providers.",
  
  /** Ticketing partner notice */
  ticketing: "Tickets are issued by authorized partners under applicable airline rules.",
  
  /** Combined seller + ticketing (for checkout footer) */
  sellerFull: "ZIVO sells flight tickets as a sub-agent of licensed ticketing providers. Tickets are issued by authorized partners under applicable airline rules.",
  
  /** Price display - NO "indicative" language */
  price: "All prices include taxes and fees. Final total shown at checkout.",
  
  /** Price breakdown */
  priceBreakdown: "Price includes all taxes, fees, and charges. No hidden costs.",
  
  /** Terms checkbox text */
  termsCheckbox: "I agree to the Terms and Conditions and Airline Rules.",
  
  /** Refund policy */
  refund: "Refunds are subject to airline fare rules. Cancellation fees may apply.",
  
  /** Support */
  support: "For booking changes or cancellations, contact ZIVO Support.",
  
  /** Payment */
  payment: "Payment is processed securely by ZIVO. Your card details are encrypted.",
  
  /** Booking confirmation */
  confirmation: "Your booking is confirmed. You will receive your e-ticket via email.",
  
  /** Footer disclaimer */
  footer: "ZIVO is a registered seller of travel. Tickets are issued by our licensed ticketing partners.",
} as const;

// ============================================
// TRUST BADGES (MOR)
// ============================================

export const FLIGHT_MOR_TRUST = {
  securePayment: "Secure Payment",
  sellerOfTravel: "Licensed Seller of Travel",
  instantConfirmation: "Instant Confirmation",
  eTicketDelivery: "E-Ticket Delivery",
  support247: "24/7 Customer Support",
  priceGuarantee: "Price Guarantee",
  dataProtection: "Data Protection",
} as const;

// ============================================
// LEGAL LINKS
// ============================================

export const FLIGHT_LEGAL_LINKS = {
  terms: "/terms",
  privacy: "/privacy",
  flightTerms: "/legal/flight-terms",
  refundPolicy: "/legal/flight-terms#refunds",
  partnerDisclosure: "/partner-disclosure",
} as const;

// ============================================
// EMAIL SUBJECTS (MOR)
// ============================================

export const FLIGHT_MOR_EMAIL_SUBJECTS = {
  confirmation: "Your Flight Booking Confirmation",
  eTicket: "Your E-Ticket for Flight",
  paymentReceipt: "Payment Receipt for Your Flight",
  scheduleChange: "Important: Flight Schedule Change",
  refundProcessed: "Your Refund Has Been Processed",
} as const;

// ============================================
// ERROR MESSAGES
// ============================================

export const FLIGHT_MOR_ERRORS = {
  offerExpired: "This flight offer has expired. Please search again for current availability.",
  priceChanged: "The price has changed. Please review the updated price before continuing.",
  noAvailability: "This flight is no longer available. Please select another option.",
  paymentFailed: "Payment failed. Please try again or use a different payment method.",
  ticketingFailed: "We're processing your booking. You'll receive confirmation shortly.",
  generalError: "Something went wrong. Please try again or contact support.",
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the appropriate CTA text for MoR model
 */
export function getMoRCTAText(context: 'primary' | 'checkout' | 'pay' | 'results' | 'details' | 'mobile' = 'primary'): string {
  return FLIGHT_MOR_CTA[context] || FLIGHT_MOR_CTA.primary;
}

/**
 * Get the seller disclaimer (required on checkout)
 */
export function getSellerDisclaimer(variant: 'short' | 'full' = 'short'): string {
  return variant === 'full' ? FLIGHT_MOR_DISCLAIMERS.sellerFull : FLIGHT_MOR_DISCLAIMERS.seller;
}

/**
 * Format price with proper MoR language (no "indicative" or "estimated")
 */
export function formatMoRPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}
