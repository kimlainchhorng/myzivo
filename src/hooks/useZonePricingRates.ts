/**
 * useZonePricingRates Hook
 * Fetch pricing rates for a specific zone and ride type
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ZonePricingRate {
  id: string;
  zone_id: string;
  ride_type: string;
  base_fare: number;
  per_mile: number;
  per_minute: number;
  booking_fee: number;
  minimum_fare: number;
  multiplier: number;
}

// Default rates when no zone-specific rates exist
export const DEFAULT_ZONE_RATES: Omit<ZonePricingRate, "id" | "zone_id" | "ride_type"> = {
  base_fare: 3.50,
  per_mile: 1.75,
  per_minute: 0.35,
  booking_fee: 2.50,
  minimum_fare: 7.00,
  multiplier: 1.0,
};

interface UseZonePricingRatesResult {
  rates: ZonePricingRate | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch zone pricing rates for a specific ride type
 * Falls back to default rates if not found
 * 
 * @param zoneId - The pricing zone ID
 * @param rideType - The ride type (standard, black, etc.)
 */
export function useZonePricingRates(
  zoneId: string | null | undefined,
  rideType: string | null | undefined
): UseZonePricingRatesResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ["zone-pricing-rates", zoneId, rideType],
    queryFn: async () => {
      if (!zoneId || !rideType) return null;

      // First try exact zone + ride_type match
      const { data: exactMatch, error: exactError } = await supabase
        .from("zone_pricing_rates")
        .select("*")
        .eq("zone_id", zoneId)
        .eq("ride_type", rideType)
        .single();

      if (exactMatch && !exactError) {
        return exactMatch as ZonePricingRate;
      }

      // Try zone + standard (base rates)
      const { data: standardMatch, error: standardError } = await supabase
        .from("zone_pricing_rates")
        .select("*")
        .eq("zone_id", zoneId)
        .eq("ride_type", "standard")
        .single();

      if (standardMatch && !standardError) {
        return standardMatch as ZonePricingRate;
      }

      // Try default US zone + ride_type
      const { data: defaultMatch } = await supabase
        .from("zone_pricing_rates")
        .select("*")
        .eq("zone_id", "00000000-0000-0000-0000-000000000001")
        .eq("ride_type", rideType)
        .single();

      if (defaultMatch) {
        return defaultMatch as ZonePricingRate;
      }

      // Final fallback: default US zone + standard
      const { data: finalFallback } = await supabase
        .from("zone_pricing_rates")
        .select("*")
        .eq("zone_id", "00000000-0000-0000-0000-000000000001")
        .eq("ride_type", "standard")
        .single();

      return finalFallback as ZonePricingRate | null;
    },
    enabled: !!zoneId && !!rideType,
    staleTime: 60 * 1000, // Cache for 60 seconds
    gcTime: 2 * 60 * 1000, // Keep in memory for 2 minutes
    refetchInterval: 60 * 1000, // Auto-refresh every 60 seconds
    refetchOnWindowFocus: true,
  });

  return {
    rates: data ?? null,
    isLoading,
    error: error as Error | null,
  };
}

/**
 * Fetch all rates for a zone (for admin/debug)
 */
export function useAllZoneRates(zoneId: string | null | undefined) {
  return useQuery({
    queryKey: ["zone-pricing-rates-all", zoneId],
    queryFn: async () => {
      if (!zoneId) return [];

      const { data, error } = await supabase
        .from("zone_pricing_rates")
        .select("*")
        .eq("zone_id", zoneId)
        .order("ride_type");

      if (error) throw error;
      return data as ZonePricingRate[];
    },
    enabled: !!zoneId,
    staleTime: 60 * 1000, // Cache for 60 seconds
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

/**
 * Fetch ALL ride-type rates for a zone and return as a Map for quick lookup
 * This is used to display different prices for each ride type card.
 * 
 * Fallback priority:
 * 1. Zone-specific rates
 * 2. Default US zone rates (00000000-0000-0000-0000-000000000001)
 * 
 * @param zoneId - The pricing zone ID
 * @returns Map<ride_type, ZonePricingRate> for quick lookup
 */
export function useAllZoneRatesMap(zoneId: string | null | undefined) {
  const DEFAULT_ZONE_ID = "00000000-0000-0000-0000-000000000001";
  
  const { data, isLoading, error, dataUpdatedAt, isRefetching } = useQuery({
    queryKey: ["zone-pricing-rates-map", zoneId],
    queryFn: async () => {
      const ratesMap = new Map<string, ZonePricingRate>();
      
      // 1. First try to fetch rates for the specific zone
      if (zoneId && zoneId !== DEFAULT_ZONE_ID) {
        const { data: zoneData } = await supabase
          .from("zone_pricing_rates")
          .select("*")
          .eq("zone_id", zoneId);
        
        if (zoneData && zoneData.length > 0) {
          zoneData.forEach((rate) => {
            ratesMap.set(rate.ride_type, rate as ZonePricingRate);
          });
        }
      }
      
      // 2. Fetch default US zone rates to fill in any missing ride types
      const { data: defaultData, error: defaultError } = await supabase
        .from("zone_pricing_rates")
        .select("*")
        .eq("zone_id", DEFAULT_ZONE_ID);
      
      if (defaultError) {
        console.warn("[useAllZoneRatesMap] Error fetching default zone rates:", defaultError);
      }
      
      if (defaultData) {
        defaultData.forEach((rate) => {
          // Only add if not already present from specific zone
          if (!ratesMap.has(rate.ride_type)) {
            ratesMap.set(rate.ride_type, rate as ZonePricingRate);
          }
        });
      }
      
      return ratesMap;
    },
    enabled: true, // Always enabled since we have a default fallback
    staleTime: 60 * 1000, // Cache for 60 seconds
    gcTime: 2 * 60 * 1000, // Keep in memory for 2 minutes
    refetchInterval: 60 * 1000, // Auto-refresh every 60 seconds
    refetchOnWindowFocus: true,
  });

  return {
    ratesMap: data ?? new Map<string, ZonePricingRate>(),
    isLoading,
    error: error as Error | null,
    dataUpdatedAt, // Timestamp of last successful fetch
    isRefetching, // True when background refetch in progress
  };
}
