/**
 * useSmartEta Hook
 * Centralized ETA range calculation with traffic/demand factors
 * Recalculates on driver assignment, pickup, and significant location changes
 * Now includes learned prep time integration
 */
import { useState, useEffect, useMemo, useRef } from "react";
import type { SurgeLevel } from "@/lib/surge";

export type TrafficLevel = "light" | "moderate" | "heavy";
export type RecalcReason = "initial" | "driver_assigned" | "driver_reassigned" | "pickup_complete" | "location_change" | "interval" | "prep_speed_change";
export type OrderPhase = "preparing" | "ready" | "out_for_delivery";

export interface SmartEtaResult {
  // Range-based ETA
  etaMinRange: number | null;
  etaMaxRange: number | null;
  etaDisplayText: string;
  
  // Single-point for edge cases
  etaSingleMinutes: number | null;
  
  // Recalculation tracking
  lastRecalcAt: Date;
  lastRecalcReason: RecalcReason;
  isLive: boolean;
  
  // Factors applied
  trafficFactor: number;
  demandFactor: number;
  isRushHour: boolean;
  trafficLevel: TrafficLevel;
  
  // Prep time breakdown
  prepComponent: number | null;
  travelComponent: number | null;
  isPrepLearned: boolean;
}

interface UseSmartEtaOptions {
  orderStatus: string;
  driverAssigned: boolean;
  driverLat?: number | null;
  driverLng?: number | null;
  pickupLat?: number | null;
  pickupLng?: number | null;
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  baseEtaMinutes?: number | null;
  demandLevel?: SurgeLevel;
  supplyMultiplier?: number;
  // Learned prep time integration
  learnedPrepMinutes?: number | null;
  isPrepLearned?: boolean;
  orderPhase?: OrderPhase;
  // Real-time prep speed adjustment
  actualPrepElapsed?: number;
  prepSpeedFactor?: number;
}

// Haversine formula for distance calculation (miles)
function calculateDistanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.7613; // Earth radius in miles
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Average speed in city traffic (miles per minute) ~30 mph
const AVG_SPEED_MILES_PER_MIN = 0.5;

// Significant location change threshold (0.1 miles = ~528 feet)
const SIGNIFICANT_CHANGE_MILES = 0.1;

/**
 * Get traffic factor based on time of day
 */
function getTrafficFactor(): { factor: number; isRushHour: boolean; level: TrafficLevel } {
  const hour = new Date().getHours();
  
  // Rush hours: 7-9 AM and 4-7 PM
  if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19)) {
    return { factor: 1.4, isRushHour: true, level: "heavy" };
  }
  
  // Late night: 10 PM - 6 AM (faster)
  if (hour >= 22 || hour <= 6) {
    return { factor: 0.8, isRushHour: false, level: "light" };
  }
  
  return { factor: 1.0, isRushHour: false, level: "moderate" };
}

/**
 * Get demand factor based on driver supply level
 */
function getDemandFactor(supplyMultiplier: number = 1.0): number {
  // supplyMultiplier: 1.0 = normal, 1.2 = moderate, 1.5 = low
  return Math.min(supplyMultiplier, 2.0);
}

export function useSmartEta({
  orderStatus,
  driverAssigned,
  driverLat,
  driverLng,
  pickupLat,
  pickupLng,
  deliveryLat,
  deliveryLng,
  baseEtaMinutes,
  supplyMultiplier = 1.0,
  learnedPrepMinutes,
  isPrepLearned = false,
  orderPhase,
  actualPrepElapsed,
  prepSpeedFactor = 1.0,
}: UseSmartEtaOptions): SmartEtaResult {
  const [lastRecalcAt, setLastRecalcAt] = useState(new Date());
  const [lastRecalcReason, setLastRecalcReason] = useState<RecalcReason>("initial");
  
  // Track previous values for change detection
  const prevDriverAssigned = useRef(driverAssigned);
  const prevOrderStatus = useRef(orderStatus);
  const prevLat = useRef(driverLat);
  const prevLng = useRef(driverLng);
  const prevPrepSpeedFactor = useRef(prepSpeedFactor);

  // Detect recalculation triggers
  useEffect(() => {
    let reason: RecalcReason | null = null;
    
    // Driver assigned
    if (!prevDriverAssigned.current && driverAssigned) {
      reason = "driver_assigned";
    }
    // Order picked up
    else if (prevOrderStatus.current !== "out_for_delivery" && orderStatus === "out_for_delivery") {
      reason = "pickup_complete";
    }
    // Prep speed changed significantly (>10% change)
    else if (
      prevPrepSpeedFactor.current != null &&
      Math.abs(prepSpeedFactor - prevPrepSpeedFactor.current) > 0.1
    ) {
      reason = "prep_speed_change";
    }
    // Significant location change
    else if (
      prevLat.current != null && prevLng.current != null &&
      driverLat != null && driverLng != null
    ) {
      const moved = calculateDistanceMiles(prevLat.current, prevLng.current, driverLat, driverLng);
      if (moved >= SIGNIFICANT_CHANGE_MILES) {
        reason = "location_change";
      }
    }
    
    if (reason) {
      setLastRecalcAt(new Date());
      setLastRecalcReason(reason);
    }
    
    // Update refs
    prevDriverAssigned.current = driverAssigned;
    prevOrderStatus.current = orderStatus;
    prevLat.current = driverLat;
    prevLng.current = driverLng;
    prevPrepSpeedFactor.current = prepSpeedFactor;
  }, [driverAssigned, orderStatus, driverLat, driverLng, prepSpeedFactor]);

  // Fallback interval recalc every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRecalcAt(new Date());
      setLastRecalcReason("interval");
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    const traffic = getTrafficFactor();
    const demandFactor = getDemandFactor(supplyMultiplier);
    const isLive = driverLat != null && driverLng != null;
    
    // Calculate travel ETA from driver location
    let travelEtaMinutes: number | null = null;
    
    if (isLive) {
      // Determine target based on order status
      const targetLat = orderStatus === "out_for_delivery" ? deliveryLat : pickupLat;
      const targetLng = orderStatus === "out_for_delivery" ? deliveryLng : pickupLng;
      
      if (targetLat != null && targetLng != null) {
        const distance = calculateDistanceMiles(driverLat!, driverLng!, targetLat, targetLng);
        travelEtaMinutes = Math.max(1, Math.ceil(distance / AVG_SPEED_MILES_PER_MIN));
      }
    } else if (baseEtaMinutes != null) {
      travelEtaMinutes = baseEtaMinutes;
    }
    
    // Phase-aware ETA calculation with prep time
    let prepComponent: number | null = null;
    let travelComponent: number | null = null;
    let totalEtaMinutes: number | null = null;
    
    const phase = orderPhase || "preparing";
    
    if (phase === "preparing") {
      // Add prep time + travel time, with prep speed adjustment
      const adjustedPrep = (learnedPrepMinutes || 20) * demandFactor * prepSpeedFactor;
      const adjustedTravel = (travelEtaMinutes || 10) * traffic.factor;
      prepComponent = Math.ceil(adjustedPrep);
      travelComponent = Math.ceil(adjustedTravel);
      totalEtaMinutes = Math.ceil(adjustedPrep + adjustedTravel);
    } else if (phase === "ready" || phase === "out_for_delivery") {
      // Travel only
      prepComponent = 0;
      travelComponent = travelEtaMinutes ? Math.ceil(travelEtaMinutes * traffic.factor) : null;
      totalEtaMinutes = travelComponent;
    } else {
      // Default
      totalEtaMinutes = learnedPrepMinutes || 25;
    }
    
    // Calculate range
    let etaMinRange: number | null = null;
    let etaMaxRange: number | null = null;
    let etaDisplayText = "";
    
    if (totalEtaMinutes != null) {
      const combinedFactor = Math.min(traffic.factor * demandFactor, 2.0);
      
      // Min = 85% of base (optimistic)
      etaMinRange = Math.max(1, Math.floor(totalEtaMinutes * 0.85));
      
      // Max = base × combinedFactor × 1.15 (pessimistic)
      etaMaxRange = Math.max(etaMinRange + 2, Math.ceil(totalEtaMinutes * combinedFactor * 1.15));
      
      // Cap range spread to be reasonable
      if (etaMaxRange - etaMinRange > 20) {
        etaMaxRange = etaMinRange + 20;
      }
      
      etaDisplayText = `${etaMinRange}–${etaMaxRange} min`;
    }
    
    return {
      etaMinRange,
      etaMaxRange,
      etaDisplayText,
      etaSingleMinutes: totalEtaMinutes,
      lastRecalcAt,
      lastRecalcReason,
      isLive,
      trafficFactor: traffic.factor,
      demandFactor,
      isRushHour: traffic.isRushHour,
      trafficLevel: traffic.level,
      prepComponent,
      travelComponent,
      isPrepLearned,
    };
  }, [
    orderStatus,
    orderPhase,
    driverLat,
    driverLng,
    pickupLat,
    pickupLng,
    deliveryLat,
    deliveryLng,
    baseEtaMinutes,
    supplyMultiplier,
    learnedPrepMinutes,
    isPrepLearned,
    prepSpeedFactor,
    lastRecalcAt,
    lastRecalcReason,
  ]);
}
