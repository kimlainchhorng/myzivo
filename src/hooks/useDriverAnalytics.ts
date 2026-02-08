/**
 * Driver Analytics Hooks
 * React Query hooks for driver earnings and performance analytics
 */

import { useQuery } from "@tanstack/react-query";
import {
  getDriverEarningsByDay,
  getDriverStats,
} from "@/lib/analytics";

const STALE_TIME = 60000; // 1 minute
const CACHE_TIME = 300000; // 5 minutes

export function useDriverEarningsByDay(driverId: string | undefined, days: number = 7) {
  return useQuery({
    queryKey: ["driver-earnings-daily", driverId, days],
    queryFn: () => getDriverEarningsByDay(driverId!, days),
    enabled: !!driverId,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useDriverStats(driverId: string | undefined) {
  return useQuery({
    queryKey: ["driver-stats", driverId],
    queryFn: () => getDriverStats(driverId!),
    enabled: !!driverId,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
  });
}
