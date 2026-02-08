/**
 * usePricingZone Hook
 * Find pricing zone by pickup coordinates using geo-bounding box lookup
 * Prefers smallest matching zone (city over state)
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PricingZone {
  id: string;
  name: string;
  state: string | null;
  country: string;
  min_lat: number;
  max_lat: number;
  min_lng: number;
  max_lng: number;
  is_active: boolean;
}

// Default US zone for fallback (uses well-known UUID)
export const DEFAULT_US_ZONE: PricingZone = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Default US",
  state: null,
  country: "US",
  min_lat: 24.0,
  max_lat: 50.0,
  min_lng: -125.0,
  max_lng: -66.0,
  is_active: true,
};

/**
 * Find the best matching zone for given coordinates
 * Prefers smallest bounding box (most specific/local zone)
 */
export function findBestZone(zones: PricingZone[], lat: number, lng: number): PricingZone {
  // Filter zones that contain the point
  const matches = zones.filter(zone =>
    lat >= zone.min_lat &&
    lat <= zone.max_lat &&
    lng >= zone.min_lng &&
    lng <= zone.max_lng
  );

  if (matches.length === 0) {
    return DEFAULT_US_ZONE;
  }

  if (matches.length === 1) {
    return matches[0];
  }

  // Multiple matches: prefer smallest bounding box (most specific)
  return matches.sort((a, b) => {
    const areaA = (a.max_lat - a.min_lat) * (a.max_lng - a.min_lng);
    const areaB = (b.max_lat - b.min_lat) * (b.max_lng - b.min_lng);
    return areaA - areaB;
  })[0];
}

interface UsePricingZoneResult {
  zone: PricingZone | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to find pricing zone based on pickup coordinates
 * @param lat - Pickup latitude
 * @param lng - Pickup longitude
 */
export function usePricingZone(
  lat: number | null | undefined,
  lng: number | null | undefined
): UsePricingZoneResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ["pricing-zones-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_zones")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      return data as PricingZone[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Find best matching zone based on coordinates
  const zone = data && lat != null && lng != null
    ? findBestZone(data, lat, lng)
    : null;

  return {
    zone,
    isLoading,
    error: error as Error | null,
  };
}

/**
 * Fetch all active pricing zones (for admin/debug)
 */
export function useAllPricingZones() {
  return useQuery({
    queryKey: ["pricing-zones-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_zones")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as PricingZone[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
