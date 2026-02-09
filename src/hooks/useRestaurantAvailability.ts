/**
 * Restaurant Availability Hook
 * Derives availability status and messaging from restaurant data
 */
import type { Restaurant } from "@/hooks/useEatsOrders";

export type AvailabilityStatus = "open" | "busy" | "unavailable";

export interface RestaurantAvailability {
  status: AvailabilityStatus;
  canOrder: boolean;
  statusMessage: string;
  detailMessage: string | null;
  adjustedPrepTime: number | null;
  prepTimeBonus: number | null;
}

export function getRestaurantAvailability(restaurant: Restaurant | null | undefined): RestaurantAvailability {
  // Default for null/undefined
  if (!restaurant) {
    return {
      status: "unavailable",
      canOrder: false,
      statusMessage: "Unavailable",
      detailMessage: "Restaurant information not available.",
      adjustedPrepTime: null,
      prepTimeBonus: null,
    };
  }

  // Unavailable: explicitly paused or closed
  if (restaurant.pause_new_orders || restaurant.is_open === false) {
    return {
      status: "unavailable",
      canOrder: false,
      statusMessage: "Temporarily unavailable",
      detailMessage: restaurant.closed_reason || "Ordering is currently paused.",
      adjustedPrepTime: null,
      prepTimeBonus: null,
    };
  }

  // Busy: open but in busy mode
  if (restaurant.busy_mode) {
    const bonus = restaurant.busy_prep_time_bonus_minutes || 15;
    const base = restaurant.avg_prep_time || 25;
    return {
      status: "busy",
      canOrder: true,
      statusMessage: "Busy",
      detailMessage: "High demand — longer preparation times.",
      adjustedPrepTime: base + bonus,
      prepTimeBonus: bonus,
    };
  }

  // Normal open state
  return {
    status: "open",
    canOrder: true,
    statusMessage: "Open",
    detailMessage: null,
    adjustedPrepTime: restaurant.avg_prep_time,
    prepTimeBonus: null,
  };
}

export function useRestaurantAvailability(restaurant: Restaurant | null | undefined): RestaurantAvailability {
  return getRestaurantAvailability(restaurant);
}
