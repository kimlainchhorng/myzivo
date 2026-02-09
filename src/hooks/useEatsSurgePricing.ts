/**
 * useEatsSurgePricing Hook
 * 
 * Fetches global surge pricing and provides helpers for Eats delivery fees.
 * Refreshes every 15 seconds to match ride surge behavior.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  fetchGlobalSurgeMultiplier, 
  getSurgeLevelFromMultiplier, 
  SurgeLevel, 
  MAX_SURGE_MULTIPLIER 
} from "@/lib/surge";

export interface DeliveryFeeBreakdown {
  baseFee: number;
  surgeAmount: number;
  finalFee: number;
}

export interface EatsSurgePricingInfo {
  multiplier: number;
  level: SurgeLevel;
  isActive: boolean;
  label: string;
  isLoading: boolean;
  refetch: () => void;
  calculateDeliveryFee: (baseFee: number) => DeliveryFeeBreakdown;
}

/**
 * Hook to fetch surge pricing for Eats delivery fees.
 * 
 * Surge levels:
 * - multiplier = 1.0: Low (no badge)
 * - multiplier 1.01–1.5: Medium (orange)
 * - multiplier > 1.5: High (red)
 * 
 * @returns EatsSurgePricingInfo with multiplier, level, and fee calculator
 */
export function useEatsSurgePricing(): EatsSurgePricingInfo {
  const { data: multiplier, isLoading, refetch } = useQuery({
    queryKey: ["global-surge-multiplier"],
    queryFn: () => fetchGlobalSurgeMultiplier(supabase),
    refetchInterval: 15000, // Every 15 seconds
    staleTime: 10000,
  });

  const cappedMultiplier = Math.min(multiplier || 1.0, MAX_SURGE_MULTIPLIER);
  const level = getSurgeLevelFromMultiplier(cappedMultiplier);
  const isActive = cappedMultiplier > 1.0;

  // Label for display
  const labelMap: Record<SurgeLevel, string> = {
    Low: "",
    Medium: "Busy - higher fees",
    High: "High demand - surge pricing",
  };

  // Calculate delivery fee with surge applied
  const calculateDeliveryFee = (baseFee: number): DeliveryFeeBreakdown => {
    const surgeAmount = Math.round((baseFee * (cappedMultiplier - 1)) * 100) / 100;
    const finalFee = Math.round((baseFee * cappedMultiplier) * 100) / 100;
    
    return {
      baseFee,
      surgeAmount,
      finalFee,
    };
  };

  return {
    multiplier: cappedMultiplier,
    level,
    isActive,
    label: labelMap[level],
    isLoading,
    refetch,
    calculateDeliveryFee,
  };
}
