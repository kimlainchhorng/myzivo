/**
 * Grocery pricing constants — single source of truth.
 * All components referencing delivery/service fees must import from here.
 */

/** Delivery fee in dollars */
export const DELIVERY_FEE = 5.99;

/** Service fee in dollars */
export const SERVICE_FEE = 1.99;

/** Delivery fee in cents (for Stripe) */
export const DELIVERY_FEE_CENTS = 599;

/** Service fee in cents (for Stripe) */
export const SERVICE_FEE_CENTS = 199;

/** Default tip options */
export const TIP_OPTIONS = [0, 2, 3, 5];

/** Format fee for display */
export function formatFee(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
