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
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
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
    staleTime: 5 * 60 * 1000,
  });
}
