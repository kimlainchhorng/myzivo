/**
 * ZIVO EMAIL COMPLIANCE CONFIGURATION
 * 
 * OTA-safe email templates and rules
 * 
 * Last Updated: February 4, 2026
 */

// ============================================
// EMAIL TEMPLATES (OTA COMPLIANT)
// ============================================

export interface EmailTemplate {
  id: string;
  type: 'transactional' | 'marketing';
  name: string;
  subject: string;
  preheader: string;
  footerDisclosure: string;
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  // Transactional emails
  {
    id: 'booking_confirmation',
    type: 'transactional',
    name: 'Booking Confirmation',
    subject: 'Your ZIVO Booking Confirmation - {bookingRef}',
    preheader: 'Your booking is confirmed. E-ticket attached.',
    footerDisclosure: 'ZIVO is an online travel agency. Airline and supplier rules apply to all bookings.',
  },
  {
    id: 'payment_receipt',
    type: 'transactional',
    name: 'Payment Receipt',
    subject: 'Payment Received - ZIVO Booking {bookingRef}',
    preheader: 'Your payment has been processed successfully.',
    footerDisclosure: 'ZIVO is an online travel agency. For refunds, airline fare rules apply.',
  },
  {
    id: 'itinerary_change',
    type: 'transactional',
    name: 'Itinerary Change',
    subject: 'Important: Your Itinerary Has Changed - {bookingRef}',
    preheader: 'Please review the changes to your booking.',
    footerDisclosure: 'Changes were made by the airline. Contact ZIVO support for assistance.',
  },
  {
    id: 'cancellation_confirmation',
    type: 'transactional',
    name: 'Cancellation Confirmation',
    subject: 'Booking Cancelled - {bookingRef}',
    preheader: 'Your booking has been cancelled.',
    footerDisclosure: 'Refunds are processed per airline fare rules. Service fees may be non-refundable.',
  },
  
  // Marketing emails (opt-in required)
  {
    id: 'price_alert',
    type: 'marketing',
    name: 'Price Alert',
    subject: 'Price Drop Alert: {route}',
    preheader: 'Prices have changed for your saved route.',
    footerDisclosure: 'Prices may change until booking is completed. You are receiving this because you opted in to price alerts.',
  },
  {
    id: 'abandoned_booking',
    type: 'marketing',
    name: 'Abandoned Booking Reminder',
    subject: 'Your Trip is Waiting',
    preheader: 'Complete your booking before prices change.',
    footerDisclosure: 'Prices may change. ZIVO is an online travel agency. Unsubscribe to stop receiving reminders.',
  },
];

// ============================================
// ABANDONED BOOKING EMAIL RULES
// ============================================

export interface AbandonedEmailRule {
  stage: 'search' | 'results' | 'details' | 'checkout';
  delayMinutes: number;
  subject: string;
  message: string;
  maxEmails: number;
}

export const ABANDONED_EMAIL_RULES: AbandonedEmailRule[] = [
  {
    stage: 'checkout',
    delayMinutes: 30,
    subject: 'Complete Your Booking',
    message: 'You were just about to book. Complete your reservation before prices change.',
    maxEmails: 2,
  },
  {
    stage: 'details',
    delayMinutes: 60,
    subject: 'Still Interested in {destination}?',
    message: 'You viewed flights to {destination}. Prices may have changed - check updated fares.',
    maxEmails: 1,
  },
  {
    stage: 'results',
    delayMinutes: 120,
    subject: 'Your Flight Search',
    message: 'You searched for flights. See if prices have changed since your last visit.',
    maxEmails: 1,
  },
];

// ============================================
// BLOCKED EMAIL CONTENT
// ============================================

export const BLOCKED_EMAIL_PHRASES = [
  // Cashback/reward promises
  'cashback',
  'cash back',
  'get money back',
  'earn rewards',
  'loyalty points',
  
  // Fake urgency
  'only 2 seats left',
  'book now or lose',
  'price expires in',
  'limited time only',
  'selling fast',
  
  // Price guarantees
  'lowest price guaranteed',
  'best price guarantee',
  'price match',
  'we\'ll beat any price',
  
  // Misleading claims
  'exclusive deal',
  'VIP pricing',
  'member-only',
];

// ============================================
// EMAIL FOOTER REQUIREMENTS
// ============================================

export const EMAIL_FOOTER_REQUIREMENTS = {
  /** Required for all emails */
  companyInfo: 'ZIVO | hizovo.com',
  
  /** Required OTA disclosure */
  otaDisclosure: 'ZIVO is an online travel agency. Airline and supplier rules apply to all bookings.',
  
  /** Required for marketing emails */
  unsubscribeText: 'Unsubscribe from these emails',
  
  /** Physical address (CAN-SPAM compliance) */
  physicalAddress: 'ZIVO, [Business Address]',
  
  /** Support contact */
  supportContact: 'Need help? Contact support@hizovo.com',
};

// ============================================
// PRICE ALERT RULES
// ============================================

export interface PriceAlertConfig {
  minPriceDropPercent: number;
  maxAlertsPerDay: number;
  alertValidityHours: number;
  disclaimer: string;
}

export const PRICE_ALERT_CONFIG: PriceAlertConfig = {
  minPriceDropPercent: 5,
  maxAlertsPerDay: 3,
  alertValidityHours: 24,
  disclaimer: 'Prices shown are estimates and may change. Final price confirmed at booking.',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if email content contains blocked phrases
 */
export function containsBlockedPhrase(content: string): { blocked: boolean; phrase?: string } {
  const lowerContent = content.toLowerCase();
  for (const phrase of BLOCKED_EMAIL_PHRASES) {
    if (lowerContent.includes(phrase.toLowerCase())) {
      return { blocked: true, phrase };
    }
  }
  return { blocked: false };
}

/**
 * Get appropriate email template
 */
export function getEmailTemplate(templateId: string): EmailTemplate | undefined {
  return EMAIL_TEMPLATES.find(t => t.id === templateId);
}

/**
 * Check if email type requires opt-in
 */
export function requiresOptIn(templateId: string): boolean {
  const template = EMAIL_TEMPLATES.find(t => t.id === templateId);
  return template?.type === 'marketing';
}
