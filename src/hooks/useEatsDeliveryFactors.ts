/**
 * useEatsDeliveryFactors Hook
 * 
 * Combines demand level, driver supply, and schedule forecasts into comprehensive
 * delivery factors for ETA adjustment and customer messaging.
 * 
 * Supply Levels:
 * - low: 0-2 drivers → 1.5x ETA multiplier
 * - moderate: 3-5 drivers → 1.2x ETA multiplier  
 * - high: 6+ drivers → 1.0x (no adjustment)
 */

import { useMemo } from "react";
import { useAvailableDriversCount } from "@/hooks/useAvailableDrivers";
import { useEatsSurgePricing } from "@/hooks/useEatsSurgePricing";
import { useDriverIncentives } from "@/hooks/useDriverIncentives";
import { useScheduledDriverForecast } from "@/hooks/useScheduledDriverForecast";
import { useUpcomingDemandAlert } from "@/hooks/useUpcomingDemandAlert";
import type { SurgeLevel } from "@/lib/surge";

export type DriverSupplyLevel = "low" | "moderate" | "high";

export interface DeliveryFactors {
  // Core factors
  demandLevel: SurgeLevel;
  demandActive: boolean;
  driverSupply: DriverSupplyLevel;
  nearbyDriverCount: number;
  
  // Computed
  supplyMultiplier: number;
  showLowSupplyWarning: boolean;
  warningMessage: string | null;
  warningType: "demand" | "supply" | null;
  
  // Incentive awareness
  isIncentivePeriod: boolean;
  incentiveMultiplier: number;
  showIncentiveBanner: boolean;
  incentiveMessage: string | null;
  
  // Peak period (schedule-based)
  isPeakPeriod: boolean;
  isPeakApproaching: boolean;
  peakStartsIn: number | null;
  showPeakBanner: boolean;
  peakMessage: string | null;
  scheduleForecastMultiplier: number;
  
  // Forecasted demand (prediction-based)
  isForecastedDemand: boolean;
  isLowCoverage: boolean;
  forecastMultiplier: number;
  
  // Loading states
  isLoading: boolean;
}

/**
 * Get supply level and multiplier from driver count
 */
function getSupplyFactors(driverCount: number): { 
  level: DriverSupplyLevel; 
  multiplier: number;
  showWarning: boolean;
  message: string | null;
} {
  if (driverCount <= 2) {
    return {
      level: "low",
      multiplier: 1.5,
      showWarning: true,
      message: "High demand — delivery may take longer",
    };
  }
  
  if (driverCount <= 5) {
    return {
      level: "moderate", 
      multiplier: 1.2,
      showWarning: true,
      message: "Busy area — delivery may take a bit longer",
    };
  }
  
  return {
    level: "high",
    multiplier: 1.0,
    showWarning: false,
    message: null,
  };
}

/**
 * Hook to get combined delivery factors for ETA and messaging
 */
export function useEatsDeliveryFactors(): DeliveryFactors {
  const { 
    count: nearbyDriverCount, 
    isLoading: driversLoading 
  } = useAvailableDriversCount();
  
  const { 
    level: demandLevel, 
    isActive: demandActive,
    isLoading: demandLoading 
  } = useEatsSurgePricing();

  const {
    isIncentivePeriod,
    isLoading: incentivesLoading,
  } = useDriverIncentives();

  const {
    isPeakPeriod,
    isPeakApproaching,
    peakStartsIn,
    peakMessage,
    scheduleForecastMultiplier,
    isLoading: forecastLoading,
  } = useScheduledDriverForecast();

  const {
    isHighDemandPredicted: isForecastedDemand,
    isLowCoverage,
    demandMultiplier: forecastMultiplier,
    isLoading: demandAlertLoading,
  } = useUpcomingDemandAlert();

  const factors = useMemo(() => {
    const supply = getSupplyFactors(nearbyDriverCount);
    
    // Don't show supply warning if demand banner is already showing
    const showLowSupplyWarning = supply.showWarning && !demandActive;
    
    // Determine which warning type to show (mutual exclusivity)
    let warningType: "demand" | "supply" | null = null;
    if (demandActive) {
      warningType = "demand";
    } else if (supply.showWarning) {
      warningType = "supply";
    }

    // Incentive period adjustments
    // Only show incentive banner when:
    // 1. Incentive is active
    // 2. Supply is good (not low)
    // 3. No negative banners are showing
    const incentiveMultiplier = isIncentivePeriod ? 0.85 : 1.0;
    const showIncentiveBanner = 
      isIncentivePeriod && 
      supply.level === "high" && 
      !demandActive;
    const incentiveMessage = showIncentiveBanner 
      ? "More drivers online in your area — faster delivery times." 
      : null;

    // Peak period banner (schedule-based)
    // Banner priority: demand > supply > incentive > peak
    // Only show peak banner when:
    // 1. Peak period is active or approaching
    // 2. No warning banners showing
    // 3. No incentive banner showing (incentive is more specific)
    const showPeakBanner = 
      (isPeakPeriod || isPeakApproaching) &&
      !demandActive &&
      supply.level !== "low" &&
      !showIncentiveBanner;

    return {
      demandLevel,
      demandActive,
      driverSupply: supply.level,
      nearbyDriverCount,
      supplyMultiplier: supply.multiplier,
      showLowSupplyWarning,
      warningMessage: showLowSupplyWarning ? supply.message : null,
      warningType,
      isIncentivePeriod,
      incentiveMultiplier,
      showIncentiveBanner,
      incentiveMessage,
      isPeakPeriod,
      isPeakApproaching,
      peakStartsIn,
      showPeakBanner,
      peakMessage: showPeakBanner ? peakMessage : null,
      scheduleForecastMultiplier,
      isForecastedDemand: isForecastedDemand && !demandActive,
      isLowCoverage,
      forecastMultiplier,
      isLoading: driversLoading || demandLoading || incentivesLoading || forecastLoading || demandAlertLoading,
    };
  }, [
    nearbyDriverCount, 
    demandLevel, 
    demandActive, 
    driversLoading, 
    demandLoading, 
    isIncentivePeriod, 
    incentivesLoading,
    isPeakPeriod,
    isPeakApproaching,
    peakStartsIn,
    peakMessage,
    scheduleForecastMultiplier,
    forecastLoading,
    isForecastedDemand,
    isLowCoverage,
    forecastMultiplier,
    demandAlertLoading,
  ]);

  return factors;
}
