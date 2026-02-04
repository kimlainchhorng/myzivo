/**
 * RISK MANAGEMENT & FRAUD PREVENTION CONFIGURATION
 * Comprehensive protection for traffic quality, affiliate safety, and compliance
 */

// ============================================
// TRAFFIC QUALITY PROTECTION
// ============================================

export const TRAFFIC_QUALITY_RULES = {
  // Bot traffic detection
  botDetection: {
    enabled: true,
    threshold: 50, // Score above this = likely bot
    captchaThreshold: 70, // Score above this = require captcha
    blockThreshold: 90, // Score above this = auto-block
  },
  
  // Click farm detection
  clickFarmIndicators: [
    'high_clicks_zero_bookings',
    'geographic_anomaly',
    'device_fingerprint_collision',
    'session_time_anomaly',
    'referrer_mismatch',
  ],
  
  // VPN/Proxy detection (basic level)
  vpnDetection: {
    enabled: true,
    action: 'flag', // 'flag' | 'block' | 'captcha'
    allowKnownVPNs: true, // Don't block legitimate privacy users
  },
  
  // Suspicious spike thresholds
  spikeDetection: {
    trafficIncreaseThreshold: 500, // % increase triggers alert
    clickIncreaseThreshold: 300,
    searchIncreaseThreshold: 400,
    timeWindow: 3600, // 1 hour in seconds
  },
};

// ============================================
// AFFILIATE FRAUD SAFETY
// ============================================

export const AFFILIATE_FRAUD_RULES = {
  // IP-based limits
  ipLimits: {
    clicksPerMinute: 5,
    clicksPerHour: 30,
    clicksPerDay: 100,
    searchesPerMinute: 10,
    searchesPerHour: 60,
  },
  
  // Session-based limits
  sessionLimits: {
    maxClicksPerSession: 50,
    maxSearchesPerSession: 100,
    maxRedirectsPerSession: 20,
  },
  
  // Blocked behaviors (NEVER ALLOW)
  blockedBehaviors: [
    'forced_redirect',
    'auto_click',
    'hidden_affiliate_link',
    'iframe_injection',
    'cookie_stuffing',
    'click_spam',
    'auto_refresh_abuse',
  ],
  
  // Rapid action thresholds
  rapidActionThresholds: {
    minTimeBetweenClicks: 500, // ms
    minTimeBetweenSearches: 1000, // ms
    suspiciousClickSpeed: 100, // ms - clicks faster than this are suspicious
  },
};

// ============================================
// SEARCH & BOOKING RATE LIMITS
// ============================================

export const RATE_LIMITS = {
  // Per user/IP limits
  searchesPerMinute: 15,
  clicksPerMinute: 10,
  bookingAttemptsPerHour: 10,
  priceAlertsPerDay: 20,
  
  // Global throttling
  globalSearchLimit: 1000, // per minute, triggers degraded mode
  globalClickLimit: 500,
  
  // Copy for rate limit messages
  messages: {
    searchLimit: "You're searching too quickly. Please wait a moment.",
    clickLimit: "Too many clicks detected. Please slow down.",
    bookingLimit: "Maximum booking attempts reached. Try again later.",
    globalLimit: "High demand detected. Some features may be slower.",
  },
  
  internalCopy: "Limits protect users and partners.",
};

// ============================================
// PRICE MISUSE PREVENTION
// ============================================

export const PRICE_SAFETY_RULES = {
  // Price display requirements
  requireProviderSource: true,
  noCachedPricesAsLive: true,
  maxCacheAge: 300, // 5 minutes max cache
  
  // Price change disclaimer (REQUIRED)
  priceChangeDisclaimer: "Prices may change until booking is completed.",
  
  // Stale price warnings
  stalePriceWarning: {
    enabled: true,
    threshold: 600, // 10 minutes
    message: "This price was last updated {minutes} minutes ago. Final price confirmed at checkout.",
  },
  
  // Price verification
  verifyPriceOnCheckout: true,
  blockIfPriceChanged: false, // Show warning instead
  priceChangeTolerance: 0.05, // 5% change tolerance
};

// ============================================
// USER ACCOUNT SAFETY
// ============================================

export const ACCOUNT_SAFETY_RULES = {
  // Email verification
  requireEmailVerification: true,
  verificationTimeout: 24 * 60 * 60, // 24 hours
  
  // Password requirements
  passwordRules: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: false, // Recommended but not required
    maxLength: 128,
  },
  
  // Session management
  sessionTimeout: 24 * 60 * 60, // 24 hours
  inactivityTimeout: 2 * 60 * 60, // 2 hours
  maxConcurrentSessions: 5,
  
  // Login attempt limits
  loginAttempts: {
    maxAttempts: 5,
    lockoutDuration: 15 * 60, // 15 minutes
    progressiveLockout: true, // Increases with repeated failures
  },
  
  // 2FA recommendations
  recommend2FA: true,
  require2FAForHighValue: false, // Future: require for large bookings
};

// ============================================
// PAYMENT & CHARGEBACK RISK
// ============================================

export const PAYMENT_RISK_RULES = {
  // High-risk route tracking
  highRiskRoutes: [
    { pattern: 'one_way_international', riskMultiplier: 1.5 },
    { pattern: 'last_minute_premium', riskMultiplier: 1.8 },
    { pattern: 'high_value_first_booking', riskMultiplier: 2.0 },
  ],
  
  // Abnormal booking behavior
  abnormalBehavior: {
    multipleCardsInSession: { threshold: 3, action: 'flag' },
    rapidBookingAttempts: { threshold: 5, action: 'block' },
    mismatachedBillingInfo: { enabled: true, action: 'review' },
    unusualBookingPattern: { enabled: true, action: 'flag' },
  },
  
  // Booking log retention (for disputes)
  bookingLogRetention: 7 * 365, // 7 years
  
  // Disclaimer copy
  paymentDisclaimer: "Payments are processed by licensed providers.",
};

// ============================================
// CONTENT & CLAIM SAFETY
// ============================================

export const CONTENT_SAFETY_RULES = {
  // Prohibited claims (NEVER USE)
  prohibitedClaims: [
    'guaranteed_savings',
    'cheapest_price',
    'best_price_guaranteed',
    'lowest_fare',
    'we_own_airlines',
    'we_are_the_airline',
    'official_partner',
  ],
  
  // Misleading urgency (AVOID)
  prohibitedUrgency: [
    'last_chance',
    'expires_in',
    'limited_time',
    'act_now',
    'hurry',
  ],
  
  // Approved copy patterns
  approvedPatterns: [
    'compare_prices',
    'search_and_book',
    'find_deals',
    'price_may_vary',
    'subject_to_availability',
  ],
  
  // Required disclosures
  requiredDisclosures: {
    affiliate: "ZIVO earns a commission when you book through our partners.",
    pricing: "Prices are provided by travel partners and may change.",
    ticketing: "ZIVO does not issue airline tickets.",
    support: "Booking support is provided by travel partners.",
  },
};

// ============================================
// COMPLIANCE MONITORING
// ============================================

export const COMPLIANCE_MONITORING = {
  // Check frequency
  monthlyChecks: [
    'affiliate_policy_updates',
    'ad_platform_policy_updates',
    'legal_disclaimer_accuracy',
    'partner_terms_compliance',
    'data_retention_compliance',
  ],
  
  // Quarterly reviews
  quarterlyReviews: [
    'fraud_threshold_review',
    'rate_limit_effectiveness',
    'security_policy_review',
    'privacy_compliance_audit',
  ],
  
  // Automated alerts
  alertThresholds: {
    chargebackRate: 0.01, // 1%
    refundRate: 0.05, // 5%
    fraudRate: 0.02, // 2%
    complaintRate: 0.005, // 0.5%
  },
};

// ============================================
// INCIDENT RESPONSE PLAN
// ============================================

export const INCIDENT_RESPONSE = {
  // Response steps
  steps: [
    { id: 'identify', label: 'Identify Issue', priority: 1 },
    { id: 'assess', label: 'Assess Impact', priority: 2 },
    { id: 'contain', label: 'Contain Problem', priority: 3 },
    { id: 'pause', label: 'Pause Traffic if Needed', priority: 4 },
    { id: 'notify', label: 'Notify Partner if Required', priority: 5 },
    { id: 'fix', label: 'Fix Root Cause', priority: 6 },
    { id: 'verify', label: 'Verify Resolution', priority: 7 },
    { id: 'resume', label: 'Resume Safely', priority: 8 },
    { id: 'document', label: 'Document Incident', priority: 9 },
  ],
  
  // Severity levels
  severityLevels: {
    critical: {
      label: 'Critical',
      responseTime: 15, // minutes
      escalation: 'immediate',
      trafficAction: 'pause_all',
    },
    high: {
      label: 'High',
      responseTime: 60, // minutes
      escalation: 'within_hour',
      trafficAction: 'pause_affected',
    },
    medium: {
      label: 'Medium',
      responseTime: 240, // 4 hours
      escalation: 'within_day',
      trafficAction: 'monitor',
    },
    low: {
      label: 'Low',
      responseTime: 1440, // 24 hours
      escalation: 'next_business_day',
      trafficAction: 'log_only',
    },
  },
  
  // Incident types
  incidentTypes: [
    'fraud_spike',
    'api_outage',
    'payment_failure',
    'affiliate_policy_violation',
    'data_breach',
    'bot_attack',
    'partner_complaint',
    'regulatory_inquiry',
  ],
};

// ============================================
// RISK SCORE CALCULATION
// ============================================

export interface RiskFactors {
  accountAge: number; // days
  previousBookings: number;
  failedPayments: number;
  flaggedActivity: boolean;
  ipRiskScore: number;
  deviceFingerprint: string;
  behaviorScore: number;
}

export function calculateRiskScore(factors: RiskFactors): number {
  let score = 0;
  
  // Account age (newer = riskier)
  if (factors.accountAge < 1) score += 30;
  else if (factors.accountAge < 7) score += 20;
  else if (factors.accountAge < 30) score += 10;
  
  // Previous bookings (more = lower risk)
  if (factors.previousBookings === 0) score += 15;
  else if (factors.previousBookings >= 5) score -= 10;
  
  // Failed payments history
  score += factors.failedPayments * 15;
  
  // Flagged activity
  if (factors.flaggedActivity) score += 30;
  
  // IP risk
  score += factors.ipRiskScore * 0.5;
  
  // Behavior score
  score += factors.behaviorScore * 0.3;
  
  return Math.min(Math.max(score, 0), 100);
}

export function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score < 25) return 'low';
  if (score < 50) return 'medium';
  if (score < 75) return 'high';
  return 'critical';
}

export function getRiskAction(level: string): 'approve' | 'review' | 'block' {
  switch (level) {
    case 'low': return 'approve';
    case 'medium': return 'review';
    case 'high': return 'review';
    case 'critical': return 'block';
    default: return 'review';
  }
}
