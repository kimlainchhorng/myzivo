/**
 * useSmartEta Hook
 * Centralized ETA range calculation with traffic/demand factors
 * Recalculates on driver assignment, pickup, and significant location changes
 */
import { useState, useEffect, useMemo, useRef } from "react";
import type { SurgeLevel } from "@/lib/surge";

export type TrafficLevel = "light" | "moderate" | "heavy";
export type RecalcReason = "initial" | "driver_assigned" | "pickup_complete" | "location_change" | "interval";

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
}: UseSmartEtaOptions): SmartEtaResult {
  const [lastRecalcAt, setLastRecalcAt] = useState(new Date());
  const [lastRecalcReason, setLastRecalcReason] = useState<RecalcReason>("initial");
  
  // Track previous values for change detection
  const prevDriverAssigned = useRef(driverAssigned);
  const prevOrderStatus = useRef(orderStatus);
  const prevLat = useRef(driverLat);
  const prevLng = useRef(driverLng);

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
  }, [driverAssigned, orderStatus, driverLat, driverLng]);

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
    
    // Calculate base ETA from driver location
    let etaSingleMinutes: number | null = null;
    
    if (isLive) {
      // Determine target based on order status
      const targetLat = orderStatus === "out_for_delivery" ? deliveryLat : pickupLat;
      const targetLng = orderStatus === "out_for_delivery" ? deliveryLng : pickupLng;
      
      if (targetLat != null && targetLng != null) {
        const distance = calculateDistanceMiles(driverLat!, driverLng!, targetLat, targetLng);
        etaSingleMinutes = Math.max(1, Math.ceil(distance / AVG_SPEED_MILES_PER_MIN));
      }
    } else if (baseEtaMinutes != null) {
      etaSingleMinutes = baseEtaMinutes;
    }
    
    // Calculate range
    let etaMinRange: number | null = null;
    let etaMaxRange: number | null = null;
    let etaDisplayText = "";
    
    if (etaSingleMinutes != null) {
      const combinedFactor = Math.min(traffic.factor * demandFactor, 2.0);
      
      // Min = 85% of base (optimistic)
      etaMinRange = Math.max(1, Math.floor(etaSingleMinutes * 0.85));
      
      // Max = base × combinedFactor × 1.15 (pessimistic)
      etaMaxRange = Math.max(etaMinRange + 2, Math.ceil(etaSingleMinutes * combinedFactor * 1.15));
      
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
      etaSingleMinutes,
      lastRecalcAt,
      lastRecalcReason,
      isLive,
      trafficFactor: traffic.factor,
      demandFactor,
      isRushHour: traffic.isRushHour,
      trafficLevel: traffic.level,
    };
  }, [
    orderStatus,
    driverLat,
    driverLng,
    pickupLat,
    pickupLng,
    deliveryLat,
    deliveryLng,
    baseEtaMinutes,
    supplyMultiplier,
    lastRecalcAt,
    lastRecalcReason,
  ]);
}
