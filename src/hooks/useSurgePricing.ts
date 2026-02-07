import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { calculateSurge, getDemandMetrics, SurgeLevel } from "@/lib/surge";

export interface SurgePricingInfo {
  multiplier: number;
  isActive: boolean;
  label: string;
  level: SurgeLevel;
  requestedCount: number;
  availableDrivers: number;
  isLoading: boolean;
  refetch: () => void;
}

/**
 * Hook to calculate surge pricing based on demand vs supply ratio.
 * 
 * Surge rules (matching Analytics):
 * - ratio >= 2.0 or no drivers: 2.0x (High)
 * - ratio >= 1.5: 1.6x (High)
 * - ratio >= 1.0: 1.3x (Medium)
 * - ratio < 1.0: 1.0x (Low)
 * 
 * Where ratio = requestedCount / max(1, availableDrivers)
 * 
 * Refreshes every 15 seconds automatically.
 */
export function useSurgePricing(): SurgePricingInfo {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["demand-metrics"],
    queryFn: () => getDemandMetrics(supabase, 5),
    refetchInterval: 15000, // Every 15 seconds
    staleTime: 10000,
  });

  const requestedCount = data?.requestedCount || 0;
  const availableDrivers = data?.availableDrivers || 0;

  const surgeResult = calculateSurge({
    requestedCount,
    availableDrivers,
    basePrice: 1, // Base price is applied elsewhere
  });

  const labelMap: Record<SurgeLevel, string> = {
    Low: "",
    Medium: "Moderate demand",
    High: "High demand",
  };

  return {
    multiplier: surgeResult.multiplier,
    isActive: surgeResult.multiplier > 1.0,
    label: labelMap[surgeResult.level],
    level: surgeResult.level,
    requestedCount,
    availableDrivers,
    isLoading,
    refetch,
  };
}
