/**
 * useCityPricing Hook
 * Fetches city-specific pricing for a ride type
 * Falls back to default pricing if no city match
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CityPricingData {
  id: string;
  city: string;
  ride_type: string;
  base_fare: number;
  per_mile: number;
  per_minute: number;
  booking_fee: number;
  minimum_fare: number;
  is_active: boolean;
}

interface UseCityPricingReturn {
  data: CityPricingData | null;
  isLoading: boolean;
  error: Error | null;
}

async function fetchCityPricing(
  city: string | null,
  rideType: string
): Promise<CityPricingData | null> {
  if (!city || !rideType) return null;

  // First try exact city + ride_type match
  const { data: exactMatch, error: exactError } = await supabase
    .from("city_pricing")
    .select("*")
    .eq("city", city)
    .eq("ride_type", rideType)
    .eq("is_active", true)
    .single();

  if (exactMatch && !exactError) {
    console.log(`[useCityPricing] Found pricing for ${city}/${rideType}`);
    return exactMatch as CityPricingData;
  }

  // Fall back to default + ride_type
  const { data: defaultMatch, error: defaultError } = await supabase
    .from("city_pricing")
    .select("*")
    .eq("city", "default")
    .eq("ride_type", rideType)
    .eq("is_active", true)
    .single();

  if (defaultMatch && !defaultError) {
    console.log(`[useCityPricing] Using default pricing for ${rideType}`);
    return defaultMatch as CityPricingData;
  }

  // Fall back to default + standard
  const { data: fallback, error: fallbackError } = await supabase
    .from("city_pricing")
    .select("*")
    .eq("city", "default")
    .eq("ride_type", "standard")
    .eq("is_active", true)
    .single();

  if (fallback && !fallbackError) {
    console.log(`[useCityPricing] Using fallback default/standard pricing`);
    return fallback as CityPricingData;
  }

  console.warn(`[useCityPricing] No pricing found for ${city}/${rideType}`);
  return null;
}

export function useCityPricing(
  city: string | null,
  rideType: string
): UseCityPricingReturn {
  const { data, isLoading, error } = useQuery({
    queryKey: ["city-pricing", city, rideType],
    queryFn: () => fetchCityPricing(city, rideType),
    enabled: !!rideType, // Always enabled, city can be null (uses default)
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  return {
    data: data ?? null,
    isLoading,
    error: error as Error | null,
  };
}

/**
 * Hook to fetch all available cities for pricing
 */
export function useAvailableCities() {
  return useQuery({
    queryKey: ["available-cities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("city_pricing")
        .select("city")
        .eq("is_active", true)
        .neq("city", "default");

      if (error) {
        console.error("[useAvailableCities] Error:", error);
        return [];
      }

      // Get unique cities
      const cities = [...new Set(data.map((row) => row.city))];
      return cities;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}
