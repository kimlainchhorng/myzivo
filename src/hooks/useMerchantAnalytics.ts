/**
 * Merchant Analytics Hooks
 * React Query hooks for restaurant dashboard analytics
 */

import { useQuery } from "@tanstack/react-query";
import {
  getMerchantRevenueByDay,
  getMerchantTopItems,
  getMerchantStats,
} from "@/lib/analytics";

const STALE_TIME = 60000; // 1 minute
const CACHE_TIME = 300000; // 5 minutes

export function useMerchantRevenueByDay(restaurantId: string | undefined, days: number = 7) {
  return useQuery({
    queryKey: ["merchant-revenue-daily", restaurantId, days],
    queryFn: () => getMerchantRevenueByDay(restaurantId!, days),
    enabled: !!restaurantId,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useMerchantTopItems(restaurantId: string | undefined, limit: number = 10) {
  return useQuery({
    queryKey: ["merchant-top-items", restaurantId, limit],
    queryFn: () => getMerchantTopItems(restaurantId!, limit),
    enabled: !!restaurantId,
    staleTime: STALE_TIME * 2,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useMerchantStats(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ["merchant-stats", restaurantId],
    queryFn: () => getMerchantStats(restaurantId!),
    enabled: !!restaurantId,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
  });
}
