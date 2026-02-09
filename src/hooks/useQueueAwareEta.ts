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
  /** Optional schedule forecast multiplier (0.85-1.0) to adjust driver time */
  scheduleForecastMultiplier?: number;
  /** Demand forecast multiplier (1.0-1.3) applied to prep time */
  demandMultiplier?: number;
  /** Incentive multiplier (0.85-1.0) applied to driver time when incentives attract more drivers */
  incentiveMultiplier?: number;
  /** Surge multiplier (1.0+) — inflates driver time to reflect high-demand delays */
  surgeMultiplier?: number;
  /** Forecast multiplier (1.0-1.3) — inflates prep time when demand is predicted to rise */
  forecastMultiplier?: number;
}

// Default values
const DEFAULT_DRIVER_MINUTES = 12;
const DEFAULT_PREP_MINUTES = 20;

export function useQueueAwareEta({
  restaurantId,
  driverMinutes = DEFAULT_DRIVER_MINUTES,
  scheduleForecastMultiplier = 1.0,
  demandMultiplier = 1.0,
  incentiveMultiplier = 1.0,
  surgeMultiplier = 1.0,
  forecastMultiplier = 1.0,
}: UseQueueAwareEtaOptions): QueueAwareEtaResult {
  // Get learned prep time
  const learnedPrep = useLearnedPrepTime(restaurantId);
  const prepMinutes = learnedPrep.avgPrepMinutes || DEFAULT_PREP_MINUTES;

  // Get queue length with prep time for calculations
  const queue = useRestaurantQueueLength(restaurantId, prepMinutes);

  return useMemo(() => {
    // Apply demand forecast multiplier and forecast multiplier to prep time
    const adjustedPrepMinutes = Math.round(prepMinutes * demandMultiplier * forecastMultiplier);
    // Apply schedule forecast, incentive, and surge multipliers to driver time
    // Surge inflation is dampened (50% of raw multiplier) and capped at 1.3x
    const surgeInflation = surgeMultiplier > 1
      ? Math.min(1 + (surgeMultiplier - 1) * 0.5, 1.3)
      : 1.0;
    const adjustedDriverMinutes = Math.round(driverMinutes * scheduleForecastMultiplier * incentiveMultiplier * surgeInflation);
    
    const breakdown: EtaBreakdown = {
      queueMinutes: queue.queueWaitMinutes,
      prepMinutes: adjustedPrepMinutes,
      driverMinutes: adjustedDriverMinutes,
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
    scheduleForecastMultiplier,
    demandMultiplier,
    incentiveMultiplier,
    surgeMultiplier,
    forecastMultiplier,
    learnedPrep.loading,
  ]);
}
