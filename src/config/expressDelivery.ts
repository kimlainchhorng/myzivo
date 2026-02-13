/**
 * Express Delivery Configuration
 * Default values — can be overridden via pricing_settings table.
 */
export const EXPRESS_DELIVERY = {
  /** Default express fee in USD */
  FEE: 2.99,
  /** ETA multiplier (0.7 = 30% faster) */
  ETA_MULTIPLIER: 0.7,
  /** Dispatch priority boost points for express orders */
  PRIORITY_BOOST: 15,
} as const;
