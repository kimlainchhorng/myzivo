/**
 * useQueueAwareEta Hook
 * Combines queue length, learned prep time, and delivery factors into comprehensive ETA
 */
import { useMemo } from "react";
import { useRestaurantQueueLength } from "./useRestaurantQueueLength";
import { useLearnedPrepTime } from "./useLearnedPrepTime";

export interface EtaBreakdown {
  queueMinutes: number;
  prepMinutes: number;
  driverMinutes: number;
}

export interface QueueAwareEtaResult {
  etaMinRange: number;
  etaMaxRange: number;
  etaDisplayText: string;
  breakdown: EtaBreakdown;
  isHighVolume: boolean;
  isVeryHighVolume: boolean;
  queueMessage: string | null;
  queueLength: number;
  isLoading: boolean;
}

interface UseQueueAwareEtaOptions {
  restaurantId: string | undefined;
  driverMinutes?: number;
}

// Default values
const DEFAULT_DRIVER_MINUTES = 12;
const DEFAULT_PREP_MINUTES = 20;

export function useQueueAwareEta({
  restaurantId,
  driverMinutes = DEFAULT_DRIVER_MINUTES,
}: UseQueueAwareEtaOptions): QueueAwareEtaResult {
  // Get learned prep time
  const learnedPrep = useLearnedPrepTime(restaurantId);
  const prepMinutes = learnedPrep.avgPrepMinutes || DEFAULT_PREP_MINUTES;

  // Get queue length with prep time for calculations
  const queue = useRestaurantQueueLength(restaurantId, prepMinutes);

  return useMemo(() => {
    const breakdown: EtaBreakdown = {
      queueMinutes: queue.queueWaitMinutes,
      prepMinutes: Math.round(prepMinutes),
      driverMinutes: Math.round(driverMinutes),
    };

    // Total base ETA
    const baseEta = breakdown.queueMinutes + breakdown.prepMinutes + breakdown.driverMinutes;

    // Calculate range with variability buffer
    const etaMinRange = Math.max(1, Math.round(baseEta * 0.85));
    let etaMaxRange = Math.round(baseEta * 1.20);

    // Cap range spread at 25 minutes
    if (etaMaxRange - etaMinRange > 25) {
      etaMaxRange = etaMinRange + 25;
    }

    // Ensure min range is at least 5 minutes
    const finalMinRange = Math.max(5, etaMinRange);
    const finalMaxRange = Math.max(finalMinRange + 5, etaMaxRange);

    return {
      etaMinRange: finalMinRange,
      etaMaxRange: finalMaxRange,
      etaDisplayText: `${finalMinRange}–${finalMaxRange} min`,
      breakdown,
      isHighVolume: queue.isHighVolume,
      isVeryHighVolume: queue.isVeryHighVolume,
      queueMessage: queue.queueMessage,
      queueLength: queue.queueLength,
      isLoading: queue.isLoading || learnedPrep.loading,
    };
  }, [
    queue.queueWaitMinutes,
    queue.isHighVolume,
    queue.isVeryHighVolume,
    queue.queueMessage,
    queue.queueLength,
    queue.isLoading,
    prepMinutes,
    driverMinutes,
    learnedPrep.loading,
  ]);
}
