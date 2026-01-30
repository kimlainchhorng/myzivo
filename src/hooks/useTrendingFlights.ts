import { useQueries, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TrendingRoute {
  origin: string;
  destination: string;
  city: string;
  country: string;
  image: string;
}

interface TrendingDestination {
  city: string;
  country: string;
  code: string;
  price: number | null;
  originalPrice?: number;
  image: string;
  trending: boolean;
  isLoading: boolean;
  isRealPrice: boolean;
}

// Popular routes to fetch real prices for
const TRENDING_ROUTES: TrendingRoute[] = [
  { origin: 'JFK', destination: 'LAX', city: 'Los Angeles', country: 'USA', image: '🌴' },
  { origin: 'JFK', destination: 'LHR', city: 'London', country: 'UK', image: '🇬🇧' },
  { origin: 'LAX', destination: 'NRT', city: 'Tokyo', country: 'Japan', image: '🗼' },
  { origin: 'JFK', destination: 'CDG', city: 'Paris', country: 'France', image: '🗼' },
  { origin: 'LAX', destination: 'DXB', city: 'Dubai', country: 'UAE', image: '🏙️' },
  { origin: 'SFO', destination: 'SIN', city: 'Singapore', country: 'Singapore', image: '🏛️' },
  { origin: 'MIA', destination: 'CUN', city: 'Cancun', country: 'Mexico', image: '🏝️' },
  { origin: 'ORD', destination: 'BCN', city: 'Barcelona', country: 'Spain', image: '⛪' },
  { origin: 'SEA', destination: 'HNL', city: 'Honolulu', country: 'USA', image: '🌺' },
  { origin: 'BOS', destination: 'DUB', city: 'Dublin', country: 'Ireland', image: '🍀' },
  { origin: 'DFW', destination: 'LAS', city: 'Las Vegas', country: 'USA', image: '🎰' },
  { origin: 'ATL', destination: 'MBJ', city: 'Montego Bay', country: 'Jamaica', image: '🌴' },
];

async function fetchRoutePrice(origin: string, destination: string): Promise<number | null> {
  try {
    const { data, error } = await supabase.functions.invoke('get-flight-prices', {
      body: { origin, destination, currency: 'USD' },
    });

    if (error) {
      console.log(`API unavailable for ${origin}-${destination}, using fallback`);
      return null;
    }
    
    if (!data?.success || !data?.prices?.length) {
      return null;
    }

    // Get the cheapest price
    const prices = data.prices.map((p: any) => p.price);
    return Math.min(...prices);
  } catch (err) {
    // Silent fallback for network errors
    return null;
  }
}

// Fallback prices when API is unavailable
const FALLBACK_PRICES: Record<string, number> = {
  'JFK-LAX': 199,
  'JFK-LHR': 449,
  'LAX-NRT': 699,
  'JFK-CDG': 399,
  'LAX-DXB': 549,
  'SFO-SIN': 749,
  'MIA-CUN': 149,
  'ORD-BCN': 429,
  'SEA-HNL': 299,
  'BOS-DUB': 379,
  'DFW-LAS': 89,
  'ATL-MBJ': 249,
};

export function useTrendingDestinations() {
  const queries = useQueries({
    queries: TRENDING_ROUTES.map((route) => ({
      queryKey: ['trending-price', route.origin, route.destination],
      queryFn: () => fetchRoutePrice(route.origin, route.destination),
      staleTime: 30 * 60 * 1000, // 30 minutes
      gcTime: 60 * 60 * 1000, // 1 hour
      retry: 1,
      retryDelay: 2000,
    })),
  });

  const destinations: TrendingDestination[] = TRENDING_ROUTES.map((route, index) => {
    const query = queries[index];
    const fallbackPrice = FALLBACK_PRICES[`${route.origin}-${route.destination}`];
    const realPrice = query.data;
    const isRealPrice = realPrice !== null && realPrice !== undefined;
    
    return {
      city: route.city,
      country: route.country,
      code: route.destination,
      price: isRealPrice ? realPrice : fallbackPrice,
      originalPrice: isRealPrice ? Math.round(realPrice * 1.3) : Math.round(fallbackPrice * 1.3),
      image: route.image,
      trending: index < 6,
      isLoading: query.isLoading,
      isRealPrice,
    };
  });

  const isLoading = queries.some(q => q.isLoading);
  const hasRealPrices = destinations.some(d => d.isRealPrice);

  return {
    destinations,
    isLoading,
    hasRealPrices,
    refetch: () => queries.forEach(q => q.refetch()),
  };
}

// Hook to get single route price
export function useRoutePrice(origin: string, destination: string, enabled = true) {
  return useQuery({
    queryKey: ['route-price', origin, destination],
    queryFn: () => fetchRoutePrice(origin, destination),
    enabled: enabled && !!origin && !!destination,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
}

// Hook to search for popular routes from any origin
export function usePopularRoutesFromOrigin(origin: string) {
  const popularDestinations = ['LAX', 'LHR', 'NRT', 'CDG', 'DXB', 'SIN', 'CUN', 'BCN'];
  
  const queries = useQueries({
    queries: popularDestinations
      .filter(dest => dest !== origin)
      .slice(0, 6)
      .map((destination) => ({
        queryKey: ['popular-route', origin, destination],
        queryFn: () => fetchRoutePrice(origin, destination),
        staleTime: 20 * 60 * 1000,
        gcTime: 40 * 60 * 1000,
        retry: 1,
        enabled: !!origin,
      })),
  });

  return {
    routes: popularDestinations
      .filter(dest => dest !== origin)
      .slice(0, 6)
      .map((destination, index) => ({
        destination,
        price: queries[index]?.data,
        isLoading: queries[index]?.isLoading || false,
      })),
    isLoading: queries.some(q => q.isLoading),
  };
}
