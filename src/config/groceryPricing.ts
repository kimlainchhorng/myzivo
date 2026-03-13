/**
 * Grocery pricing constants — single source of truth.
 * All components referencing delivery/service fees must import from here.
 */

/** Delivery fee in dollars */
export const DELIVERY_FEE = 5.99;

/** Service fee in dollars */
export const SERVICE_FEE = 1.99;

/** Priority delivery surcharge in dollars */
export const PRIORITY_FEE = 2.99;

/** Free delivery threshold */
export const FREE_DELIVERY_THRESHOLD = 35;

/** Delivery fee in cents (for Stripe) */
export const DELIVERY_FEE_CENTS = 599;

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
