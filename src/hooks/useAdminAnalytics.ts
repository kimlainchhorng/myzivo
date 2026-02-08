/**
 * Admin Analytics Hooks
 * React Query hooks with caching for admin dashboard data
 */

import { useQuery } from "@tanstack/react-query";
import {
  getKpis,
  getOrdersTrend,
  getRevenueTrend,
  getPeakHours,
  getOrdersByStatus,
  getTopRestaurants,
  getTopDrivers,
  getHeatmapLocations,
  type DateRange,
} from "@/lib/analytics";

const STALE_TIME = 60000; // 1 minute
const CACHE_TIME = 300000; // 5 minutes

export function useAdminKPIs(dateRange: DateRange) {
  return useQuery({
    queryKey: ["admin-analytics-kpis", dateRange.start.toISOString(), dateRange.end.toISOString()],
    queryFn: () => getKpis(dateRange),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchInterval: STALE_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useOrdersTrend(dateRange: DateRange) {
  return useQuery({
    queryKey: ["admin-analytics-orders-trend", dateRange.start.toISOString(), dateRange.end.toISOString()],
    queryFn: () => getOrdersTrend(dateRange),
    staleTime: STALE_TIME * 2,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useRevenueTrend(dateRange: DateRange) {
  return useQuery({
    queryKey: ["admin-analytics-revenue-trend", dateRange.start.toISOString(), dateRange.end.toISOString()],
    queryFn: () => getRevenueTrend(dateRange),
    staleTime: STALE_TIME * 2,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
  });
}

export function usePeakHours(dateRange: DateRange) {
  return useQuery({
    queryKey: ["admin-analytics-peak-hours", dateRange.start.toISOString(), dateRange.end.toISOString()],
    queryFn: () => getPeakHours(dateRange),
    staleTime: STALE_TIME * 3,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useOrdersByStatus(dateRange: DateRange) {
  return useQuery({
    queryKey: ["admin-analytics-orders-status", dateRange.start.toISOString(), dateRange.end.toISOString()],
    queryFn: () => getOrdersByStatus(dateRange),
    staleTime: STALE_TIME * 2,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useTopRestaurants(dateRange: DateRange, limit: number = 20) {
  return useQuery({
    queryKey: ["admin-analytics-top-restaurants", dateRange.start.toISOString(), dateRange.end.toISOString(), limit],
    queryFn: () => getTopRestaurants(dateRange, limit),
    staleTime: STALE_TIME * 3,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useTopDrivers(dateRange: DateRange, limit: number = 20) {
  return useQuery({
    queryKey: ["admin-analytics-top-drivers", dateRange.start.toISOString(), dateRange.end.toISOString(), limit],
    queryFn: () => getTopDrivers(dateRange, limit),
    staleTime: STALE_TIME * 3,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useHeatmapLocations(dateRange: DateRange) {
  return useQuery({
    queryKey: ["admin-analytics-heatmap", dateRange.start.toISOString(), dateRange.end.toISOString()],
    queryFn: () => getHeatmapLocations(dateRange),
    staleTime: STALE_TIME * 5,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
  });
}
