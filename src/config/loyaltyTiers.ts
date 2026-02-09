/**
 * Order-Count-Based Loyalty Tiers
 * 
 * Maps order counts to ZIVO tier perks.
 * The higher of points-based or order-based tier wins.
 */

import type { ZivoTier } from "@/config/zivoPoints";

export interface OrderTier {
  name: string;
  minOrders: number;
  maxOrders: number;
  icon: string;
  color: string;        // Tailwind color prefix (e.g. "amber")
  textColor: string;     // Tailwind text class
  bgColor: string;       // Tailwind bg class
  borderColor: string;   // Tailwind border class
  zivoTier: ZivoTier;
  benefits: string[];
}

export const LOYALTY_TIERS_BY_ORDERS: OrderTier[] = [
  {
    name: "Bronze",
    minOrders: 0,
    maxOrders: 9,
    icon: "🥉",
    color: "amber",
    textColor: "text-amber-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    zivoTier: "explorer",
    benefits: [
      "Earn points on bookings",
      "Access to deals hub",
      "Basic price alerts",
    ],
  },
  {
    name: "Silver",
    minOrders: 10,
    maxOrders: 29,
    icon: "🥈",
    color: "slate",
    textColor: "text-slate-400",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/30",
    zivoTier: "traveler",
    benefits: [
      "All Bronze benefits",
      "5% checkout discount",
      "1.5× point earning",
      "Priority alerts",
    ],
  },
  {
    name: "Gold",
    minOrders: 30,
    maxOrders: 79,
    icon: "🥇",
    color: "amber",
    textColor: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    zivoTier: "elite",
    benefits: [
      "All Silver benefits",
      "10% checkout discount",
      "2× point earning",
      "Free delivery (Eats)",
      "Priority support",
    ],
  },
  {
    name: "Platinum",
    minOrders: 80,
    maxOrders: Infinity,
    icon: "💎",
    color: "purple",
    textColor: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    zivoTier: "elite",
    benefits: [
      "All Gold benefits",
      "10% checkout discount",
      "2× point earning",
      "Free delivery (Eats)",
      "Birthday bonus points",
    ],
  },
];

/** Get the order-count tier for a given number of completed orders */
export function getOrderTier(orderCount: number): OrderTier {
  for (let i = LOYALTY_TIERS_BY_ORDERS.length - 1; i >= 0; i--) {
    if (orderCount >= LOYALTY_TIERS_BY_ORDERS[i].minOrders) {
      return LOYALTY_TIERS_BY_ORDERS[i];
    }
  }
  return LOYALTY_TIERS_BY_ORDERS[0];
}

/** Get the next tier (or null if at max) */
export function getNextOrderTier(currentTier: OrderTier): OrderTier | null {
  const idx = LOYALTY_TIERS_BY_ORDERS.indexOf(currentTier);
  if (idx < LOYALTY_TIERS_BY_ORDERS.length - 1) {
    return LOYALTY_TIERS_BY_ORDERS[idx + 1];
  }
  return null;
}

/** Rank ZIVO tiers for comparison */
const TIER_RANK: Record<ZivoTier, number> = {
  explorer: 0,
  traveler: 1,
  elite: 2,
};

/** Return the higher of two ZIVO tiers */
export function higherTier(a: ZivoTier, b: ZivoTier): ZivoTier {
  return TIER_RANK[a] >= TIER_RANK[b] ? a : b;
}
