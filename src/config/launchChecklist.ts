/**
 * ZIVO OTA LAUNCH CHECKLIST CONFIGURATION
 * 
 * Pre-launch validation, processor readiness, and compliance checks
 * 
 * Last Updated: February 4, 2026
 */

// ============================================
// PRE-LAUNCH SYSTEM CHECKS
// ============================================

export interface LaunchCheckItem {
  id: string;
  category: LaunchCheckCategory;
  title: string;
  description: string;
  critical: boolean;
  verificationMethod: 'manual' | 'automated' | 'api_test';
  testPath?: string;
}

export type LaunchCheckCategory = 
  | 'search'
  | 'booking'
  | 'payment'
  | 'ticketing'
  | 'communication'
  | 'fraud'
  | 'compliance';

export const PRE_LAUNCH_CHECKS: LaunchCheckItem[] = [
  // Search checks
  {
    id: 'flight_search_duffel',
    category: 'search',
    title: 'Flight search returns Duffel results',
    description: 'Verify Duffel API returns flight offers',
    critical: true,
    verificationMethod: 'api_test',
    testPath: '/flights',
  },
  {
    id: 'flight_search_travelfusion',
    category: 'search',
    title: 'Flight search returns TravelFusion results',
    description: 'Verify TravelFusion API returns flight offers',
    critical: true,
    verificationMethod: 'api_test',
    testPath: '/flights',
  },
  {
    id: 'hotel_search_ratehawk',
    category: 'search',
    title: 'Hotel search returns RateHawk results',
    description: 'Verify RateHawk API returns hotel availability',
    critical: true,
    verificationMethod: 'api_test',
    testPath: '/hotels',
  },
  
  // Booking checks
  {
    id: 'checkout_payment_capture',
    category: 'payment',
    title: 'Checkout captures payment successfully',
    description: 'Verify Stripe payment capture works end-to-end',
    critical: true,
    verificationMethod: 'manual',
    testPath: '/checkout',
  },
  {
    id: 'ticket_issuance',
    category: 'ticketing',
    title: 'Tickets are issued after payment',
    description: 'Verify ticket/confirmation is created post-payment',
    critical: true,
    verificationMethod: 'api_test',
  },
  {
    id: 'confirmation_email',
    category: 'communication',
    title: 'Confirmation email is sent',
    description: 'Verify booking confirmation email delivery',
    critical: true,
    verificationMethod: 'manual',
  },
  
  // Post-booking checks
  {
    id: 'manage_booking_page',
    category: 'booking',
    title: 'Manage Booking page works',
    description: 'Verify users can view and manage their bookings',
    critical: true,
    verificationMethod: 'manual',
    testPath: '/my-trips',
  },
  {
    id: 'refund_void_logic',
    category: 'booking',
    title: 'Refund/void logic works in sandbox',
    description: 'Verify cancellation and refund flows function correctly',
    critical: true,
    verificationMethod: 'api_test',
  },
  
  // Fraud checks
  {
    id: 'fraud_3ds_enabled',
    category: 'fraud',
    title: '3D Secure enabled',
    description: 'Verify 3DS is active for card payments',
    critical: true,
    verificationMethod: 'api_test',
  },
  {
    id: 'fraud_avs_enabled',
    category: 'fraud',
    title: 'AVS checks enabled',
    description: 'Verify Address Verification Service is active',
    critical: true,
    verificationMethod: 'api_test',
  },
  {
    id: 'fraud_velocity_limits',
    category: 'fraud',
    title: 'Velocity limits configured',
    description: 'Verify rate limiting is active for bookings/payments',
    critical: true,
    verificationMethod: 'automated',
  },
];

// ============================================
// REQUIRED WEBSITE PAGES (PROCESSOR READINESS)
// ============================================

export interface RequiredPage {
  id: string;
  title: string;
  path: string;
  description: string;
  requiredContent: string[];
}

export const REQUIRED_PAGES: RequiredPage[] = [
  {
    id: 'terms',
    title: 'Terms of Service',
    path: '/terms',
    description: 'Terms and conditions for using ZIVO',
    requiredContent: [
      'Service description',
      'User obligations',
      'Liability limitations',
      'Dispute resolution',
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    path: '/privacy',
    description: 'Data collection and usage policies',
    requiredContent: [
      'Data collection practices',
      'Third-party sharing',
      'User rights (GDPR/CCPA)',
      'Contact information',
    ],
  },
  {
    id: 'refunds',
    title: 'Refund & Cancellation Policy',
    path: '/refunds',
    description: 'Refund and cancellation terms',
    requiredContent: [
      'Refund eligibility',
      'Cancellation process',
      'Timeframes',
      'Service fee policy',
    ],
  },
  {
    id: 'contact',
    title: 'Contact / Support',
    path: '/contact',
    description: 'Customer support contact information',
    requiredContent: [
      'Email address',
      'Response timeframes',
      'Support hours',
    ],
  },
  {
    id: 'about',
    title: 'About ZIVO',
    path: '/about',
    description: 'Company information',
    requiredContent: [
      'Company description',
      'Business model',
      'Mission statement',
    ],
  },
];

// ============================================
// SUPPLIER COMPLIANCE REQUIREMENTS
// ============================================

export interface SupplierCompliance {
  supplier: string;
  requirements: string[];
  violations: string[];
}

export const SUPPLIER_COMPLIANCE: SupplierCompliance[] = [
  {
    supplier: 'Duffel',
    requirements: [
      'Respect fare rules exactly',
      'Do not alter airline content',
      'Issue tickets only after payment',
      'Void tickets immediately on failure',
      'Handle refunds per supplier rules',
    ],
    violations: [
      'Modifying airline branding',
      'Issuing tickets before payment capture',
      'Misrepresenting fare rules',
      'Delayed void on payment failure',
    ],
  },
  {
    supplier: 'TravelFusion',
    requirements: [
      'Display all mandatory fees',
      'Show accurate baggage allowances',
      'Issue tickets only after payment',
      'Follow carrier-specific rules',
    ],
    violations: [
      'Hidden fees',
      'Incorrect baggage information',
      'Pre-payment ticketing',
    ],
  },
  {
    supplier: 'RateHawk',
    requirements: [
      'Display accurate cancellation policies',
      'Show property fees and taxes',
      'Confirm booking only after payment',
      'Honor rate guarantees',
    ],
    violations: [
      'Misrepresenting cancellation terms',
      'Hidden property fees',
      'Pre-payment confirmation',
    ],
  },
];

// ============================================
// LIVE MODE SWITCH REQUIREMENTS
// ============================================

export interface LiveModeSwitchItem {
  id: string;
  title: string;
  description: string;
  category: 'api' | 'payment' | 'email' | 'storage';
  critical: boolean;
}

export const LIVE_MODE_REQUIREMENTS: LiveModeSwitchItem[] = [
  {
    id: 'api_production',
    title: 'Switch APIs to production',
    description: 'All supplier APIs must use production credentials',
    category: 'api',
    critical: true,
  },
  {
    id: 'payment_live',
    title: 'Enable live payment processing',
    description: 'Stripe must be in live mode',
    category: 'payment',
    critical: true,
  },
  {
    id: 'email_enabled',
    title: 'Enable confirmation emails',
    description: 'Email service must be configured for production',
    category: 'email',
    critical: true,
  },
  {
    id: 'booking_storage',
    title: 'Enable booking storage',
    description: 'Database must be configured for production data',
    category: 'storage',
    critical: true,
  },
];

// ============================================
// PROCESSOR COMPLIANCE COPY
// ============================================

export const PROCESSOR_COMPLIANCE_COPY = {
  /** Required visible copy for payment processors */
  otaStatement: "ZIVO is an online travel agency.",
  
  /** Payment processing disclosure */
  paymentDisclosure: "ZIVO processes payments and issues tickets using authorized suppliers.",
  
  /** Pricing transparency */
  pricingTransparency: [
    "Clear pricing breakdown",
    "No hidden fees",
    "Service fees disclosed before payment",
  ],
  
  /** Checkout terms */
  checkoutTerms: "By completing this booking, you agree to ZIVO's Terms of Service and the airline or supplier's fare rules.",
  
  /** Required footer disclosure */
  footerDisclosure: `ZIVO is an online travel agency. ZIVO processes payments and issues travel services using authorized suppliers including Duffel, TravelFusion, and RateHawk. Airline and supplier rules apply to all bookings.`,
} as const;

// ============================================
// BANK & COMPLIANCE READINESS
// ============================================

export interface ComplianceReadinessItem {
  id: string;
  title: string;
  description: string;
  status: 'required' | 'recommended';
}

export const COMPLIANCE_READINESS: ComplianceReadinessItem[] = [
  {
    id: 'bank_account',
    title: 'Business bank account matches legal entity',
    description: 'Bank account name must match registered business name',
    status: 'required',
  },
  {
    id: 'domain_verified',
    title: 'Domain ownership verified',
    description: 'Domain ownership must be verified with payment processor',
    status: 'required',
  },
  {
    id: 'support_email',
    title: 'Support email active',
    description: 'Customer support email must be monitored',
    status: 'required',
  },
  {
    id: 'support_system',
    title: 'Phone support or ticket system available',
    description: 'Customers must have a way to contact support',
    status: 'required',
  },
  {
    id: 'seller_of_travel',
    title: 'Seller of Travel registration',
    description: 'Registration in required states (CA, FL, etc.)',
    status: 'required',
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all critical pre-launch checks
 */
export function getCriticalChecks(): LaunchCheckItem[] {
  return PRE_LAUNCH_CHECKS.filter(check => check.critical);
}

/**
 * Get checks by category
 */
export function getChecksByCategory(category: LaunchCheckCategory): LaunchCheckItem[] {
  return PRE_LAUNCH_CHECKS.filter(check => check.category === category);
}

/**
 * Check if all critical items are verified
 */
export function allCriticalsPassed(verifiedIds: string[]): boolean {
  const criticalIds = getCriticalChecks().map(c => c.id);
  return criticalIds.every(id => verifiedIds.includes(id));
}

/**
 * Get launch readiness percentage
 */
export function getLaunchReadinessPercent(verifiedIds: string[]): number {
  const total = PRE_LAUNCH_CHECKS.length;
  const verified = PRE_LAUNCH_CHECKS.filter(c => verifiedIds.includes(c.id)).length;
  return Math.round((verified / total) * 100);
}
