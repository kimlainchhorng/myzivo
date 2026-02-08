/**
 * useRideQuote Hook
 * 
 * React hook wrapper for the quoteRidePrice engine.
 * Provides caching and loading states for ride pricing.
 */

import { useQuery } from "@tanstack/react-query";
import { quoteRidePrice, RideQuoteResult } from "@/lib/quoteRidePrice";

interface UseRideQuoteParams {
  rideType: string;
  pickupCoords: { lat: number; lng: number } | null;
  dropoffCoords?: { lat: number; lng: number } | null;
  routeMiles: number | null;
  routeMinutes: number | null;
  enabled?: boolean;
}

interface UseRideQuoteResult {
  quote: RideQuoteResult | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to get a ride price quote with all multipliers applied
 * 
 * @param params.rideType - The ride type ID (e.g., "standard", "premium")
 * @param params.pickupCoords - Pickup coordinates { lat, lng }
 * @param params.routeMiles - Route distance in miles
 * @param params.routeMinutes - Route duration in minutes
 * @param params.enabled - Whether the query is enabled (default: true)
 */
export function useRideQuote({
  rideType,
  pickupCoords,
  routeMiles,
  routeMinutes,
  enabled = true,
}: UseRideQuoteParams): UseRideQuoteResult {
  const isReady = !!(
    rideType &&
    pickupCoords?.lat &&
    pickupCoords?.lng &&
    routeMiles !== null &&
    routeMinutes !== null
  );

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      "ride-quote",
      rideType,
      pickupCoords?.lat,
      pickupCoords?.lng,
      routeMiles,
      routeMinutes,
    ],
    queryFn: async () => {
      if (!isReady) return null;

      return quoteRidePrice({
        rideType,
        pickupLat: pickupCoords!.lat,
        pickupLng: pickupCoords!.lng,
        miles: routeMiles!,
        minutes: routeMinutes!,
      });
    },
    enabled: enabled && isReady,
    staleTime: 30_000, // 30 seconds
    gcTime: 60_000, // 1 minute
    refetchOnWindowFocus: false,
  });

  return {
    quote: data || null,
    isLoading: isReady ? isLoading : false,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Hook to get quotes for multiple ride types at once
 * Useful for displaying all ride options with live pricing
 */
export function useMultiRideQuotes({
  rideTypes,
  pickupCoords,
  routeMiles,
  routeMinutes,
  enabled = true,
}: {
  rideTypes: string[];
  pickupCoords: { lat: number; lng: number } | null;
  routeMiles: number | null;
  routeMinutes: number | null;
  enabled?: boolean;
}): {
  quotes: Map<string, RideQuoteResult>;
  isLoading: boolean;
  error: Error | null;
} {
  const isReady = !!(
    rideTypes.length > 0 &&
    pickupCoords?.lat &&
    pickupCoords?.lng &&
    routeMiles !== null &&
    routeMinutes !== null
  );

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "multi-ride-quotes",
      rideTypes.join(","),
      pickupCoords?.lat,
      pickupCoords?.lng,
      routeMiles,
      routeMinutes,
    ],
    queryFn: async () => {
      if (!isReady) return new Map<string, RideQuoteResult>();

      const quotes = new Map<string, RideQuoteResult>();

      // Fetch all quotes in parallel
      const results = await Promise.all(
        rideTypes.map(async (rideType) => {
          try {
            const quote = await quoteRidePrice({
              rideType,
              pickupLat: pickupCoords!.lat,
              pickupLng: pickupCoords!.lng,
              miles: routeMiles!,
              minutes: routeMinutes!,
            });
            return { rideType, quote };
          } catch (err) {
            console.error(`[useMultiRideQuotes] Failed for ${rideType}:`, err);
            return null;
          }
        })
      );

      for (const result of results) {
        if (result) {
          quotes.set(result.rideType, result.quote);
        }
      }

      return quotes;
    },
    enabled: enabled && isReady,
    staleTime: 30_000,
    gcTime: 60_000,
    refetchOnWindowFocus: false,
  });

  return {
    quotes: data || new Map(),
    isLoading: isReady ? isLoading : false,
    error: error as Error | null,
  };
}
