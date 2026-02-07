/**
 * Stripe Configuration
 * Stripe publishable key for client-side usage
 */
import { loadStripe } from '@stripe/stripe-js';

// Publishable key (safe to expose in frontend)
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51StzpDBxRnIs4yDmL86Jf58yoVAXP8jkOCDTUDYBuvjx4daUx3dcS728TkWBmzi5CqLnvUldjx2StCFZVb626KPd00W7xaTkhV';

// Singleton stripe promise
let stripePromise: Promise<import('@stripe/stripe-js').Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};
