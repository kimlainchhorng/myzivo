import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches real lowest flight fares from Duffel API for popular destinations.
 * Uses the user's nearest major airport as origin.
 */

// Map user location to nearest major airport
function getNearestAirport(isKH: boolean): string {
  return isKH ? "PNH" : "LAX"; // Default origins; could be made smarter with geolocation
}

export function useDestinationPrices(destinations: string[], isKH: boolean) {
  const origin = getNearestAirport(isKH);

  return useQuery({
    queryKey: ["destination-prices", origin, destinations],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("duffel-destination-prices", {
        body: { origin, destinations },
      });

      if (error) {
        console.error("Failed to fetch destination prices:", error);
        return {} as Record<string, number | null>;
      }

      return (data?.prices || {}) as Record<string, number | null>;
    },
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
    gcTime: 12 * 60 * 60 * 1000,
    retry: 1,
    enabled: destinations.length > 0,
  });
}
