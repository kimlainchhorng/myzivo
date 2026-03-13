/**
 * Grocery pricing constants — single source of truth.
 * All components referencing delivery/service fees must import from here.
 */

// ─── Markup tiers ───────────────────────────────────────────
/** Markup percentage for orders under the threshold */
export const MARKUP_UNDER_THRESHOLD_PCT = 5;
/** Markup percentage for orders at or above the threshold */
export const MARKUP_OVER_THRESHOLD_PCT = 3;
/** Threshold in dollars */
export const MARKUP_THRESHOLD = 50;

/** Calculate platform markup on a subtotal (in dollars) */
export function calcMarkup(subtotal: number): number {
  const pct = subtotal < MARKUP_THRESHOLD ? MARKUP_UNDER_THRESHOLD_PCT : MARKUP_OVER_THRESHOLD_PCT;
  return Math.round(subtotal * pct) / 100; // rounds to nearest cent
}

/** Markup percentage label for display */
export function getMarkupPct(subtotal: number): number {
  return subtotal < MARKUP_THRESHOLD ? MARKUP_UNDER_THRESHOLD_PCT : MARKUP_OVER_THRESHOLD_PCT;
}

// ─── Distance-based delivery fee (like ride pricing) ────────
/** Base delivery charge in dollars */
export const DELIVERY_BASE_FEE = 2.99;
/** Per-mile charge in dollars */
export const DELIVERY_PER_MILE = 0.60;
/** Per-minute charge in dollars (driver shopping + travel time) */
export const DELIVERY_PER_MIN = 0.10;
/** Minimum delivery fee in dollars */
export const DELIVERY_MIN_FEE = 3.99;
/** Maximum delivery fee cap in dollars */
export const DELIVERY_MAX_FEE = 14.99;

/** Calculate delivery fee based on distance & estimated time */
export function calcDeliveryFee(miles: number, minutes: number): number {
  const raw = DELIVERY_BASE_FEE + miles * DELIVERY_PER_MILE + minutes * DELIVERY_PER_MIN;
  return Math.round(Math.min(DELIVERY_MAX_FEE, Math.max(DELIVERY_MIN_FEE, raw)) * 100) / 100;
}

/** Flat fallback when distance is unknown */
export const DELIVERY_FEE_FALLBACK = 5.99;

/** Service fee in dollars */
export const SERVICE_FEE = 1.99;

/** Priority delivery surcharge in dollars */
export const PRIORITY_FEE = 2.99;

/** Free delivery threshold */
export const FREE_DELIVERY_THRESHOLD = 35;

/** Service fee in cents (for Stripe) */
export const SERVICE_FEE_CENTS = 199;

/** Priority fee in cents (for Stripe) */
export const PRIORITY_FEE_CENTS = 299;

/** Default tip options */
export const TIP_OPTIONS = [0, 2, 3, 5];

/** Cancellation fee schedule */
export const CANCELLATION_FEES = {
  beforeShopping: 0,
  duringShopping: 5.00,
  duringDelivery: 10.00,
};

/** Format fee for display */
export function formatFee(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
