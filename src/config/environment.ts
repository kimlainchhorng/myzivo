/**
 * ZIVO Environment Configuration
 * Centralized production/development mode settings
 * 
 * PRODUCTION MODE SETTINGS:
 * - APP_ENV: production
 * - NODE_ENV: production  
 * - STRIPE_MODE: live
 * - DUFFEL_MODE: live
 * - SHOW_TEST_BADGE: false
 * - ALLOW_TEST_PAYMENTS: false
 */

// ============================================
// ENVIRONMENT MODE (LOCKED FOR PRODUCTION)
// ============================================

export const APP_ENV = 'production' as const;
export const STRIPE_MODE = 'live' as const;
export const DUFFEL_MODE = 'live' as const;

// ============================================
// FEATURE FLAGS
// ============================================

export const SHOW_TEST_BADGE = false;
export const ALLOW_TEST_PAYMENTS = false;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if app is running in production mode
 */
export function isProduction(): boolean {
  return APP_ENV === 'production';
}

/**
 * Check if app is running in development mode
 * Uses Vite's import.meta.env.MODE for dev detection
 */
export function isDevelopment(): boolean {
  return import.meta.env.MODE === 'development';
}

/**
 * Check if Stripe is in live mode
 */
export function isStripeLiveMode(): boolean {
  return STRIPE_MODE === 'live';
}

/**
 * Check if Duffel is in live mode
 */
export function isDuffelLiveMode(): boolean {
  return DUFFEL_MODE === 'live';
}

/**
 * Check if test payments are allowed
 */
export function canUseTestPayments(): boolean {
  return ALLOW_TEST_PAYMENTS;
}

/**
 * Check if test badge should be shown
 */
export function shouldShowTestBadge(): boolean {
  return SHOW_TEST_BADGE;
}

/**
 * Get current environment summary
 */
export function getEnvironmentSummary() {
  return {
    appEnv: APP_ENV,
    stripeMode: STRIPE_MODE,
    duffelMode: DUFFEL_MODE,
    showTestBadge: SHOW_TEST_BADGE,
    allowTestPayments: ALLOW_TEST_PAYMENTS,
    isProduction: isProduction(),
  };
}
