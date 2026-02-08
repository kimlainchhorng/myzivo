import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchGlobalSurgeMultiplier, getSurgeLevelFromMultiplier, SurgeLevel, MAX_SURGE_MULTIPLIER } from "@/lib/surge";

export interface SurgePricingInfo {
  multiplier: number;
  isActive: boolean;
  label: string;
  level: SurgeLevel;
  isLoading: boolean;
  refetch: () => void;
}

/**
 * Hook to fetch surge pricing from database (zone='GLOBAL').
 * 
 * Admin-controlled dynamic pricing with max cap of 2.5x.
 * 
 * Surge levels:
 * - multiplier = 1.0: Low (no badge)
 * - multiplier 1.01–1.5: Medium
 * - multiplier > 1.5: High
 * 
 * Refreshes every 15 seconds automatically.
 */
export function useSurgePricing(): SurgePricingInfo {
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
    isActive: cappedMultiplier > 1.0,
    label: labelMap[level],
    level,
    isLoading,
    refetch,
  };
}
