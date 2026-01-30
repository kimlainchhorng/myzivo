import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FlightPrice {
  price: number;
  airline: string;
  flightNumber: string;
  departureAt: string;
  returnAt?: string;
  duration: number;
  transfers: number;
  origin: string;
  destination: string;
  link: string;
}

interface FlightPricesResponse {
  success: boolean;
  prices: FlightPrice[];
  currency: string;
  origin: string;
  destination: string;
  error?: string;
}

interface UseFlightPricesParams {
  origin: string;
  destination: string;
  departureDate?: string;
  returnDate?: string;
  currency?: string;
  enabled?: boolean;
}

export function useFlightPrices({
  origin,
  destination,
  departureDate,
  returnDate,
  currency = 'USD',
  enabled = true,
}: UseFlightPricesParams) {
  return useQuery({
    queryKey: ['flight-prices', origin, destination, departureDate, returnDate, currency],
    queryFn: async (): Promise<FlightPricesResponse> => {
      try {
        const { data, error } = await supabase.functions.invoke('get-flight-prices', {
          body: { origin, destination, departureDate, returnDate, currency },
        });

        if (error) {
          console.error('Error fetching flight prices:', error);
          // Return empty response instead of throwing to allow graceful fallback
          return {
            success: false,
            prices: [],
            currency,
            origin,
            destination,
            error: error.message,
          };
        }

        return data as FlightPricesResponse;
      } catch (err) {
        console.error('Flight prices fetch failed:', err);
        // Return empty response for network errors
        return {
          success: false,
          prices: [],
          currency,
          origin,
          destination,
          error: err instanceof Error ? err.message : 'Network error',
        };
      }
    },
    enabled: enabled && !!origin && !!destination && origin.length === 3 && destination.length === 3,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

// Helper to get the lowest price for a specific date from the prices array
export function getLowestPriceForDate(prices: FlightPrice[], date: string): number | null {
  const dateStr = date.split('T')[0];
  const matchingPrices = prices.filter(p => p.departureAt.startsWith(dateStr));
  if (matchingPrices.length === 0) return null;
  return Math.min(...matchingPrices.map(p => p.price));
}

// Helper to get price range for the month
export function getPriceRangeForMonth(prices: FlightPrice[]): { min: number; max: number } | null {
  if (prices.length === 0) return null;
  const allPrices = prices.map(p => p.price);
  return {
    min: Math.min(...allPrices),
    max: Math.max(...allPrices),
  };
}
