/**
 * AI Insights React Query Hooks
 * Cached data fetching for insights and predictions
 */

import { useQuery } from "@tanstack/react-query";
import {
  getDemandForecast,
  getZoneDemandGaps,
  getDecliningMerchants,
  getAnomalySignals,
  getMerchantInsights,
  getDriverInsights,
  getInsightsSummary,
} from "@/lib/insights";

const STALE_TIME = 120000; // 2 minutes
const CACHE_TIME = 300000; // 5 minutes

/**
 * Hook for demand forecast data
 */
export function useDemandForecast(days: number = 7) {
  return useQuery({
    queryKey: ["demand-forecast", days],
    queryFn: () => getDemandForecast(days),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for zone demand gaps
 */
export function useZoneDemandGaps() {
  return useQuery({
    queryKey: ["zone-demand-gaps"],
    queryFn: getZoneDemandGaps,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchInterval: STALE_TIME,
  });
}

/**
 * Hook for declining merchants
 */
export function useDecliningMerchants(limit: number = 10) {
  return useQuery({
    queryKey: ["declining-merchants", limit],
    queryFn: () => getDecliningMerchants(limit),
    staleTime: STALE_TIME * 2,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for anomaly signals
 */
export function useAnomalySignals(limit: number = 50) {
  return useQuery({
    queryKey: ["anomaly-signals", limit],
    queryFn: () => getAnomalySignals(limit),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchInterval: STALE_TIME,
  });
}

/**
 * Hook for merchant insights
 */
export function useMerchantInsights(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ["merchant-insights", restaurantId],
    queryFn: () => getMerchantInsights(restaurantId!),
    enabled: !!restaurantId,
    staleTime: STALE_TIME * 2,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for driver insights
 */
export function useDriverInsights(driverId: string | undefined) {
  return useQuery({
    queryKey: ["driver-insights", driverId],
    queryFn: () => getDriverInsights(driverId!),
    enabled: !!driverId,
    staleTime: STALE_TIME * 2,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for full insights summary (admin dashboard)
 */
export function useInsightsSummary() {
  return useQuery({
    queryKey: ["insights-summary"],
    queryFn: getInsightsSummary,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchInterval: STALE_TIME,
  });
}
