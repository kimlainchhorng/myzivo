/**
 * ZIVO OTA FRAUD PREVENTION CONFIGURATION
 * 
 * Risk scoring, velocity limits, and fraud prevention rules
 * for payment and booking operations
 * 
 * Last Updated: February 4, 2026
 */

// ============================================
// RISK SCORING THRESHOLDS
// ============================================

export const RISK_THRESHOLDS = {
  /** Risk score below this is auto-approved */
  LOW_RISK: 30,
  
  /** Risk score between LOW and HIGH triggers manual review */
  MEDIUM_RISK: 60,
  
  /** Risk score above this is auto-declined */
  HIGH_RISK: 80,
  
  /** Maximum acceptable Stripe Radar score */
  MAX_RADAR_SCORE: 75,
  
  /** Score above this requires 3D Secure */
  REQUIRE_3DS: 40,
} as const;

// ============================================
// RISK SIGNAL WEIGHTS
// ============================================

export interface RiskSignal {
  id: string;
  name: string;
  weight: number;
  description: string;
  category: 'payment' | 'velocity' | 'identity' | 'behavior' | 'geo';
}

export const RISK_SIGNALS: RiskSignal[] = [
  // Payment signals
  {
    id: 'card_country_mismatch',
    name: 'Card/IP Country Mismatch',
    weight: 25,
    description: 'Card issuing country differs from IP geolocation',
    category: 'payment',
  },
  {
    id: 'multiple_cards_same_ip',
    name: 'Multiple Cards Same IP',
    weight: 30,
    description: 'Multiple different cards used from same IP within 24h',
    category: 'payment',
  },
  {
    id: 'high_value_first_booking',
    name: 'High Value First Booking',
    weight: 20,
    description: 'First booking is unusually high value (>$2000)',
    category: 'payment',
  },
  {
    id: 'failed_payment_attempts',
    name: 'Multiple Failed Payments',
    weight: 35,
    description: '3+ failed payment attempts before success',
    category: 'payment',
  },
  {
    id: 'prepaid_card',
    name: 'Prepaid Card Used',
    weight: 15,
    description: 'Payment made with prepaid or gift card',
    category: 'payment',
  },
  
  // Velocity signals
  {
    id: 'rapid_rebooking',
    name: 'Rapid Re-booking',
    weight: 25,
    description: 'Multiple bookings within 1 hour',
    category: 'velocity',
  },
  {
    id: 'booking_velocity_high',
    name: 'High Booking Velocity',
    weight: 30,
    description: 'More than 5 bookings per day',
    category: 'velocity',
  },
  {
    id: 'search_to_book_fast',
    name: 'Instant Search-to-Book',
    weight: 20,
    description: 'Booking completed within 30 seconds of search',
    category: 'velocity',
  },
  
  // Identity signals
  {
    id: 'name_mismatch',
    name: 'Passenger/Card Name Mismatch',
    weight: 25,
    description: 'Passenger name differs significantly from cardholder',
    category: 'identity',
  },
  {
    id: 'disposable_email',
    name: 'Disposable Email',
    weight: 20,
    description: 'Email domain is known disposable provider',
    category: 'identity',
  },
  {
    id: 'new_account',
    name: 'New Account',
    weight: 10,
    description: 'Account created within last 24 hours',
    category: 'identity',
  },
  {
    id: 'unverified_email',
    name: 'Unverified Email',
    weight: 15,
    description: 'Email address not verified',
    category: 'identity',
  },
  
  // Behavior signals
  {
    id: 'bot_detected',
    name: 'Bot Behavior Detected',
    weight: 50,
    description: 'Automated/bot behavior patterns detected',
    category: 'behavior',
  },
  {
    id: 'no_mouse_movement',
    name: 'No Mouse Movement',
    weight: 15,
    description: 'No mouse/touch interaction recorded during session',
    category: 'behavior',
  },
  {
    id: 'refund_abuse_history',
    name: 'Refund Abuse History',
    weight: 40,
    description: 'User has history of disputed transactions',
    category: 'behavior',
  },
  
  // Geo signals
  {
    id: 'high_risk_country',
    name: 'High Risk Country',
    weight: 20,
    description: 'IP or card from high-fraud region',
    category: 'geo',
  },
  {
    id: 'vpn_detected',
    name: 'VPN/Proxy Detected',
    weight: 15,
    description: 'Connection through VPN or proxy server',
    category: 'geo',
  },
  {
    id: 'itinerary_mismatch',
    name: 'Itinerary/Location Mismatch',
    weight: 15,
    description: 'Travel itinerary inconsistent with user location',
    category: 'geo',
  },
];

// ============================================
// VELOCITY LIMITS
// ============================================

export interface VelocityLimit {
  action: string;
  limit: number;
  windowMs: number;
  scope: 'user' | 'ip' | 'card' | 'session';
  description: string;
}

export const VELOCITY_LIMITS: VelocityLimit[] = [
  // Booking limits
  {
    action: 'flight_booking',
    limit: 5,
    windowMs: 86400000, // 24 hours
    scope: 'user',
    description: 'Max flight bookings per user per day',
  },
  {
    action: 'hotel_booking',
    limit: 10,
    windowMs: 86400000,
    scope: 'user',
    description: 'Max hotel bookings per user per day',
  },
  {
    action: 'any_booking',
    limit: 3,
    windowMs: 3600000, // 1 hour
    scope: 'ip',
    description: 'Max bookings per IP per hour',
  },
  
  // Payment limits
  {
    action: 'payment_attempt',
    limit: 5,
    windowMs: 3600000,
    scope: 'card',
    description: 'Max payment attempts per card per hour',
  },
  {
    action: 'failed_payment',
    limit: 3,
    windowMs: 3600000,
    scope: 'user',
    description: 'Max failed payments before blocking',
  },
  
  // Search limits (prevent scraping)
  {
    action: 'flight_search',
    limit: 50,
    windowMs: 3600000,
    scope: 'ip',
    description: 'Max flight searches per IP per hour',
  },
  {
    action: 'hotel_search',
    limit: 100,
    windowMs: 3600000,
    scope: 'ip',
    description: 'Max hotel searches per IP per hour',
  },
];

// ============================================
// MANUAL REVIEW TRIGGERS
// ============================================

export interface ManualReviewTrigger {
  id: string;
  name: string;
  condition: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export const MANUAL_REVIEW_TRIGGERS: ManualReviewTrigger[] = [
  {
    id: 'high_value_booking',
    name: 'High Value Booking',
    condition: 'Booking value exceeds $3,000',
    priority: 'medium',
  },
  {
    id: 'last_minute_intl',
    name: 'Last-Minute International',
    condition: 'International flight departing within 24 hours',
    priority: 'high',
  },
  {
    id: 'card_country_mismatch',
    name: 'Card/Itinerary Mismatch',
    condition: 'Card country differs from departure country',
    priority: 'medium',
  },
  {
    id: 'multiple_passengers_cards',
    name: 'Multiple Cards for Group',
    condition: 'Multiple different cards used for same booking',
    priority: 'high',
  },
  {
    id: 'first_time_high_value',
    name: 'First Booking High Value',
    condition: 'New user first booking exceeds $1,500',
    priority: 'high',
  },
  {
    id: 'risk_score_medium',
    name: 'Medium Risk Score',
    condition: 'Risk score between 40-70',
    priority: 'medium',
  },
  {
    id: 'name_format_unusual',
    name: 'Unusual Name Format',
    condition: 'Passenger name format suspicious (all caps, numbers, etc.)',
    priority: 'low',
  },
];

// ============================================
// TICKETING SAFETY RULES
// ============================================

export const TICKETING_RULES = {
  /** Require full payment capture before ticketing */
  requirePaymentCapture: true,
  
  /** Maximum acceptable fraud score for auto-ticketing */
  maxAutoTicketRiskScore: 40,
  
  /** Require email verification before ticketing */
  requireVerifiedEmail: true,
  
  /** Require phone verification for high-value tickets */
  requirePhoneForHighValue: true,
  
  /** High value threshold requiring phone verification */
  highValueThreshold: 2000,
  
  /** Time window for same-day void (hours) */
  voidWindowHours: 24,
  
  /** Auto-void on confirmed fraud detection */
  autoVoidOnFraud: true,
} as const;

// ============================================
// CHARGEBACK DEFENSE EVIDENCE
// ============================================

export interface ChargebackEvidence {
  type: string;
  description: string;
  required: boolean;
  autoCollect: boolean;
}

export const CHARGEBACK_EVIDENCE: ChargebackEvidence[] = [
  {
    type: 'confirmation_page',
    description: 'Screenshot/HTML of order confirmation page',
    required: true,
    autoCollect: true,
  },
  {
    type: 'terms_acceptance',
    description: 'Timestamp of terms & conditions acceptance',
    required: true,
    autoCollect: true,
  },
  {
    type: 'fare_rules_shown',
    description: 'Fare rules displayed at checkout',
    required: true,
    autoCollect: true,
  },
  {
    type: 'payment_authorization',
    description: 'Payment authorization response from Stripe',
    required: true,
    autoCollect: true,
  },
  {
    type: 'ticket_confirmation',
    description: 'Airline PNR or hotel confirmation number',
    required: true,
    autoCollect: true,
  },
  {
    type: 'ip_address',
    description: 'IP address at time of booking',
    required: true,
    autoCollect: true,
  },
  {
    type: 'device_fingerprint',
    description: 'Device fingerprint hash',
    required: true,
    autoCollect: true,
  },
  {
    type: 'confirmation_email',
    description: 'Booking confirmation email sent',
    required: true,
    autoCollect: true,
  },
  {
    type: 'user_agent',
    description: 'Browser user agent string',
    required: false,
    autoCollect: true,
  },
  {
    type: 'session_replay',
    description: 'Session recording/replay if available',
    required: false,
    autoCollect: false,
  },
];

// ============================================
// ACCOUNT SECURITY RULES
// ============================================

export const ACCOUNT_SECURITY = {
  /** Require email verification for bookings */
  requireEmailVerification: true,
  
  /** Maximum active unpaid bookings per user */
  maxActiveBookings: 10,
  
  /** Lock account after X suspicious activities */
  lockThreshold: 3,
  
  /** Suspicious activity cooldown period (hours) */
  cooldownHours: 24,
  
  /** Require re-authentication for high-value bookings */
  reAuthForHighValue: true,
  
  /** High value threshold for re-authentication */
  reAuthThreshold: 5000,
} as const;

// ============================================
// COMPLIANCE COPY
// ============================================

export const FRAUD_PREVENTION_COPY = {
  /** Checkout notice */
  checkoutNotice: "All bookings are subject to fraud prevention checks. ZIVO reserves the right to cancel and refund suspicious transactions.",
  
  /** Payment verification notice */
  paymentVerification: "Your payment may require additional verification to ensure security.",
  
  /** Manual review notice */
  manualReview: "Your booking is under review. We'll confirm within 30 minutes during business hours.",
  
  /** Declined notice */
  declined: "We were unable to process your booking. Please contact support if you believe this is an error.",
  
  /** Account locked notice */
  accountLocked: "Your account has been temporarily locked for security reasons. Please contact support.",
  
  /** 3DS required */
  threeDsRequired: "Additional verification is required to complete your payment.",
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate risk score from detected signals
 */
export function calculateRiskScore(detectedSignals: string[]): number {
  let totalScore = 0;
  
  for (const signalId of detectedSignals) {
    const signal = RISK_SIGNALS.find(s => s.id === signalId);
    if (signal) {
      totalScore += signal.weight;
    }
  }
  
  return Math.min(totalScore, 100);
}

/**
 * Determine action based on risk score
 */
export function getRiskDecision(score: number): 'approve' | 'review' | 'decline' | '3ds_required' {
  if (score >= RISK_THRESHOLDS.HIGH_RISK) return 'decline';
  if (score >= RISK_THRESHOLDS.MEDIUM_RISK) return 'review';
  if (score >= RISK_THRESHOLDS.REQUIRE_3DS) return '3ds_required';
  return 'approve';
}

/**
 * Get manual review triggers for a booking
 */
export function getApplicableTriggers(
  bookingValue: number,
  isFirstBooking: boolean,
  isInternational: boolean,
  departureWithin24h: boolean,
  riskScore: number
): ManualReviewTrigger[] {
  const triggers: ManualReviewTrigger[] = [];
  
  if (bookingValue > 3000) {
    triggers.push(MANUAL_REVIEW_TRIGGERS.find(t => t.id === 'high_value_booking')!);
  }
  
  if (isInternational && departureWithin24h) {
    triggers.push(MANUAL_REVIEW_TRIGGERS.find(t => t.id === 'last_minute_intl')!);
  }
  
  if (isFirstBooking && bookingValue > 1500) {
    triggers.push(MANUAL_REVIEW_TRIGGERS.find(t => t.id === 'first_time_high_value')!);
  }
  
  if (riskScore >= 40 && riskScore < 70) {
    triggers.push(MANUAL_REVIEW_TRIGGERS.find(t => t.id === 'risk_score_medium')!);
  }
  
  return triggers.filter(Boolean);
}

/**
 * Check if booking should be auto-approved for ticketing
 */
export function canAutoTicket(
  riskScore: number,
  paymentCaptured: boolean,
  emailVerified: boolean,
  bookingValue: number
): { allowed: boolean; reason?: string } {
  if (!paymentCaptured) {
    return { allowed: false, reason: 'Payment not captured' };
  }
  
  if (riskScore > TICKETING_RULES.maxAutoTicketRiskScore) {
    return { allowed: false, reason: 'Risk score too high for auto-ticketing' };
  }
  
  if (TICKETING_RULES.requireVerifiedEmail && !emailVerified) {
    return { allowed: false, reason: 'Email verification required' };
  }
  
  if (bookingValue > TICKETING_RULES.highValueThreshold && TICKETING_RULES.requirePhoneForHighValue) {
    return { allowed: false, reason: 'Phone verification required for high-value booking' };
  }
  
  return { allowed: true };
}
