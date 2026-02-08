/**
 * useZoneSurgePricing Hook
 * 
 * Fetches surge pricing from surge_multipliers table (zone='GLOBAL').
 * Admin-controlled dynamic pricing with max cap of 2.5x.
 * 
 * Refreshes every 15 seconds.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchGlobalSurgeMultiplier, getSurgeLevelFromMultiplier, SurgeLevel, MAX_SURGE_MULTIPLIER } from "@/lib/surge";
import type { PricingZone } from "@/hooks/usePricingZone";

export interface ZoneSurgePricingInfo {
  multiplier: number;
  level: SurgeLevel;
  label: string;
  isActive: boolean;
  isLoading: boolean;
  zoneName?: string;
  refetch: () => void;
}

/**
 * Hook to fetch zone-specific or global surge pricing from database.
 * 
 * Surge levels:
 * - multiplier = 1.0: Low (no badge)
 * - multiplier 1.01–1.5: Medium
 * - multiplier > 1.5: High
 * 
 * @param zone - Pricing zone (used for zone name display only, surge is global)
 */
export function useZoneSurgePricing(zone: PricingZone | null): ZoneSurgePricingInfo {
  const { data: multiplier, isLoading, refetch } = useQuery({
    queryKey: ["global-surge-multiplier"],
    queryFn: () => fetchGlobalSurgeMultiplier(supabase),
    refetchInterval: 15000, // Every 15 seconds
    staleTime: 10000,
  });

  const cappedMultiplier = Math.min(multiplier || 1.0, MAX_SURGE_MULTIPLIER);
  const level = getSurgeLevelFromMultiplier(cappedMultiplier);

  const labelMap: Record<SurgeLevel, string> = {
    Low: "",
    Medium: `Busy time pricing ×${cappedMultiplier.toFixed(1)}`,
    High: `Busy time pricing ×${cappedMultiplier.toFixed(1)}`,
  };

  return {
    multiplier: cappedMultiplier,
    level,
    label: labelMap[level],
    isActive: cappedMultiplier > 1.0,
    isLoading,
    zoneName: zone?.name,
    refetch,
  };
}
