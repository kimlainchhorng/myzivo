/**
 * useEatsDeliveryFactors Hook
 * 
 * Combines demand level and driver supply into comprehensive delivery factors
 * for ETA adjustment and customer messaging.
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
      isLoading: driversLoading || demandLoading || incentivesLoading,
    };
  }, [nearbyDriverCount, demandLevel, demandActive, driversLoading, demandLoading, isIncentivePeriod, incentivesLoading]);

  return factors;
}
