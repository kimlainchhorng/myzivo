/**
 * useZoneSurgePricing Hook
 * Zone-aware surge pricing based on demand vs supply within a pricing zone's bounding box
 * Refreshes every 15 seconds
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { calculateSurge, SurgeLevel } from "@/lib/surge";
import type { PricingZone } from "@/hooks/usePricingZone";

export interface ZoneSurgePricingInfo {
  multiplier: number;
  level: SurgeLevel;
  label: string;
  isActive: boolean;
  isLoading: boolean;
  requestedCount: number;
  availableDrivers: number;
  zoneName?: string;
  refetch: () => void;
}

interface ZoneDemandMetrics {
  requestedCount: number;
  availableDrivers: number;
}

/**
 * Fetch demand metrics within a specific pricing zone's bounding box
 */
async function getZoneDemandMetrics(
  zone: PricingZone,
  windowMinutes: number = 5
): Promise<ZoneDemandMetrics> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);
  const driverActiveThreshold = new Date(now.getTime() - 2 * 60 * 1000);

  // Count trips in "requested/accepted/en_route" status within zone bounds (last 5 min)
  const { count: requestedCount, error: ridesError } = await supabase
    .from("trips")
    .select("*", { count: "exact", head: true })
    .in("status", ["requested", "accepted", "en_route"])
    .gte("pickup_lat", zone.min_lat)
    .lte("pickup_lat", zone.max_lat)
    .gte("pickup_lng", zone.min_lng)
    .lte("pickup_lng", zone.max_lng)
    .gte("created_at", windowStart.toISOString());

  if (ridesError) {
    console.warn("[getZoneDemandMetrics] Failed to fetch rides count:", ridesError);
  }

  // Count online drivers within zone bounds (active in last 2 min)
  const { count: availableDrivers, error: driversError } = await supabase
    .from("drivers")
    .select("*", { count: "exact", head: true })
    .eq("is_online", true)
    .eq("status", "verified")
    .gte("current_lat", zone.min_lat)
    .lte("current_lat", zone.max_lat)
    .gte("current_lng", zone.min_lng)
    .lte("current_lng", zone.max_lng)
    .gte("updated_at", driverActiveThreshold.toISOString());

  if (driversError) {
    console.warn("[getZoneDemandMetrics] Failed to fetch drivers count:", driversError);
  }

  return {
    requestedCount: requestedCount || 0,
    availableDrivers: availableDrivers || 0,
  };
}

/**
 * Hook to calculate zone-specific surge pricing
 * 
 * Surge rules (capped at 1.35x to stay cheaper than Uber/Lyft):
 * - ratio >= 2.0 or no drivers: 1.35x (High)
 * - ratio >= 1.5: 1.25x (High)
 * - ratio >= 1.0: 1.12x (Medium)
 * - ratio < 1.0: 1.0x (Low)
 * 
 * @param zone - Pricing zone with bounding box coordinates
 */
export function useZoneSurgePricing(zone: PricingZone | null): ZoneSurgePricingInfo {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["zone-demand-metrics", zone?.id],
    queryFn: () => zone ? getZoneDemandMetrics(zone) : Promise.resolve({ requestedCount: 0, availableDrivers: 0 }),
    enabled: !!zone,
    refetchInterval: 15000, // Every 15 seconds
    staleTime: 10000,
  });

  const requestedCount = data?.requestedCount || 0;
  const availableDrivers = data?.availableDrivers || 0;

  const surgeResult = calculateSurge({
    requestedCount,
    availableDrivers,
    basePrice: 1, // Base price applied elsewhere
  });

  const labelMap: Record<SurgeLevel, string> = {
    Low: "",
    Medium: "Moderate demand",
    High: "High demand",
  };

  return {
    multiplier: surgeResult.multiplier,
    level: surgeResult.level,
    label: labelMap[surgeResult.level],
    isActive: surgeResult.multiplier > 1.0,
    isLoading,
    requestedCount,
    availableDrivers,
    zoneName: zone?.name,
    refetch,
  };
}
