/**
 * useEatsDeliveryPricing Hook
 * 
 * Combines zone-based pricing (base + per-mile) with real-time surge
 * to produce a complete delivery fee and order total breakdown.
 */

import { useMemo } from "react";
import { DEFAULT_EATS_ZONE } from "@/lib/pricing";
import { useEatsSurgePricing } from "@/hooks/useEatsSurgePricing";

const DEFAULT_ESTIMATED_MILES = 2;

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export interface EatsDeliveryPricing {
  // Delivery fee breakdown
  baseFee: number;
  distanceFee: number;
  estimatedMiles: number;
  demandAdjustment: number;
  totalDeliveryFee: number;
  // Order-level fees
  serviceFee: number;
  smallOrderFee: number;
  tax: number;
  // Totals
  subtotal: number;
  orderTotal: number;
  // Surge info
  surgeActive: boolean;
  surgeMultiplier: number;
  surgeLabel: string;
  isLoading: boolean;
}

/**
 * @param subtotal - Cart subtotal (sum of item prices)
 * @param estimatedMiles - Estimated delivery distance (default 2 mi)
 */
export function useEatsDeliveryPricing(
  subtotal: number,
  estimatedMiles: number = DEFAULT_ESTIMATED_MILES
): EatsDeliveryPricing {
  const surge = useEatsSurgePricing();
  const zone = DEFAULT_EATS_ZONE;

  return useMemo(() => {
    const baseFee = zone.delivery_fee_base;
    const distanceFee = round(estimatedMiles * zone.delivery_fee_per_mile);
    const rawDeliveryFee = baseFee + distanceFee;

    // Apply surge to delivery fee only
    const surgedDeliveryFee = round(rawDeliveryFee * surge.multiplier);
    const demandAdjustment = round(surgedDeliveryFee - rawDeliveryFee);

    const serviceFee = round(subtotal * (zone.service_fee_percent / 100));
    const smallOrderFee = subtotal < zone.small_order_threshold ? zone.small_order_fee : 0;
    const tax = round(subtotal * zone.tax_rate);

    const orderTotal = round(subtotal + surgedDeliveryFee + serviceFee + smallOrderFee + tax);

    return {
      baseFee,
      distanceFee,
      estimatedMiles,
      demandAdjustment,
      totalDeliveryFee: surgedDeliveryFee,
      serviceFee,
      smallOrderFee,
      tax,
      subtotal: round(subtotal),
      orderTotal,
      surgeActive: surge.isActive,
      surgeMultiplier: surge.multiplier,
      surgeLabel: surge.isActive ? "Delivery fee adjusted due to high demand." : "",
      isLoading: surge.isLoading,
    };
  }, [subtotal, estimatedMiles, surge.multiplier, surge.isActive, surge.isLoading, zone]);
}
