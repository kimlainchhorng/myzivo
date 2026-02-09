/**
 * useEatsDeliveryPricing Hook
 * 
 * Combines zone-based pricing (base + per-mile) with real-time surge
 * to produce a complete delivery fee and order total breakdown.
 */

import { useMemo } from "react";
import { DEFAULT_EATS_ZONE } from "@/lib/pricing";
import { useEatsSurgePricing } from "@/hooks/useEatsSurgePricing";
import { getTierPerks, type ZivoTier } from "@/config/zivoPoints";

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
  // Loyalty perks
  loyaltyDiscount: number;
  loyaltyFreeDelivery: boolean;
  loyaltyTier: ZivoTier | null;
  loyaltyBonusMultiplier: number;
  // Order-level fees
  serviceFee: number;
  smallOrderFee: number;
  tax: number;
  taxRate: number;
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
 * @param tier - User's loyalty tier (null if not logged in)
 */
export function useEatsDeliveryPricing(
  subtotal: number,
  estimatedMiles: number = DEFAULT_ESTIMATED_MILES,
  tier: ZivoTier | null = null
): EatsDeliveryPricing {
  const surge = useEatsSurgePricing();
  const zone = DEFAULT_EATS_ZONE;

  return useMemo(() => {
    const perks = tier ? getTierPerks(tier) : null;

    // Loyalty discount on subtotal
    const discountPercent = perks?.discountPercent ?? 0;
    const loyaltyDiscount = round(subtotal * (discountPercent / 100));
    const discountedSubtotal = round(subtotal - loyaltyDiscount);

    const baseFee = zone.delivery_fee_base;
    const distanceFee = round(estimatedMiles * zone.delivery_fee_per_mile);
    const rawDeliveryFee = baseFee + distanceFee;

    // Free delivery perk overrides everything
    const loyaltyFreeDelivery = perks?.freeDelivery ?? false;

    let surgedDeliveryFee: number;
    let demandAdjustment: number;

    if (loyaltyFreeDelivery) {
      surgedDeliveryFee = 0;
      demandAdjustment = 0;
    } else {
      surgedDeliveryFee = round(rawDeliveryFee * surge.multiplier);
      demandAdjustment = round(surgedDeliveryFee - rawDeliveryFee);
    }

    const serviceFee = round(discountedSubtotal * (zone.service_fee_percent / 100));
    const smallOrderFee = discountedSubtotal < zone.small_order_threshold ? zone.small_order_fee : 0;
    const tax = round(discountedSubtotal * zone.tax_rate);

    const orderTotal = round(discountedSubtotal + surgedDeliveryFee + serviceFee + smallOrderFee + tax);

    return {
      baseFee,
      distanceFee,
      estimatedMiles,
      demandAdjustment,
      totalDeliveryFee: surgedDeliveryFee,
      loyaltyDiscount,
      loyaltyFreeDelivery,
      loyaltyTier: tier,
      loyaltyBonusMultiplier: perks?.bonusPointsMultiplier ?? 1,
      serviceFee,
      smallOrderFee,
      tax,
      taxRate: zone.tax_rate,
      subtotal: round(subtotal),
      orderTotal,
      surgeActive: surge.isActive && !loyaltyFreeDelivery,
      surgeMultiplier: surge.multiplier,
      surgeLabel: surge.isActive && !loyaltyFreeDelivery ? "Delivery fee adjusted due to high demand." : "",
      isLoading: surge.isLoading,
    };
  }, [subtotal, estimatedMiles, surge.multiplier, surge.isActive, surge.isLoading, zone, tier]);
}
