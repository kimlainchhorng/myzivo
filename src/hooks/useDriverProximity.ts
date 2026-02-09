/**
 * useDriverProximity Hook
 * Consolidated proximity tracking with automatic ETA updates
 * Recalculates immediately when driver location changes
 */
import { useMemo } from "react";

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

// Average speed in miles per minute (~30 mph)
const AVG_SPEED_MILES_PER_MIN = 0.5;

// Proximity thresholds in miles
const THRESHOLDS = {
  NEAR_PICKUP: 0.2,    // ~320m - "Arriving at restaurant"
  AT_PICKUP: 0.05,     // ~80m - "At restaurant"
  NEAR_DELIVERY: 0.15, // ~240m - "Arriving now!"
  AT_DELIVERY: 0.05,   // ~80m - "Driver here!"
} as const;

export interface ProximityState {
  /** Distance from driver to pickup (restaurant) in miles */
  distanceToPickup: number | null;
  /** Distance from driver to delivery in miles */
  distanceToDelivery: number | null;
  
  /** Driver is < 0.2 miles from pickup */
  isNearPickup: boolean;
  /** Driver is < 0.05 miles from pickup */
  isAtPickup: boolean;
  /** Driver is < 0.15 miles from delivery */
  isNearDelivery: boolean;
  /** Driver is < 0.05 miles from delivery */
  isArrivingSoon: boolean;
  
  /** ETA to pickup in minutes (recalculated on location change) */
  etaToPickup: number | null;
  /** ETA to delivery in minutes (recalculated on location change) */
  etaToDelivery: number | null;
  /** Timestamp of last ETA calculation */
  lastEtaUpdate: Date;
}

interface UseDriverProximityOptions {
  driverLat: number | null | undefined;
  driverLng: number | null | undefined;
  pickupLat: number | null | undefined;
  pickupLng: number | null | undefined;
  deliveryLat: number | null | undefined;
  deliveryLng: number | null | undefined;
  orderStatus: string;
  /** Traffic multiplier for speed adjustment (1.0 = normal, 1.5 = heavy traffic) */
  trafficMultiplier?: number;
}

export function useDriverProximity({
  driverLat,
  driverLng,
  pickupLat,
  pickupLng,
  deliveryLat,
  deliveryLng,
  orderStatus,
  trafficMultiplier = 1.0,
}: UseDriverProximityOptions): ProximityState {
  // Recalculates immediately when any coordinate changes
  return useMemo(() => {
    const now = new Date();
    
    // Calculate distance to pickup
    let distanceToPickup: number | null = null;
    if (
      driverLat != null &&
      driverLng != null &&
      pickupLat != null &&
      pickupLng != null
    ) {
      distanceToPickup = calculateDistanceMiles(
        driverLat,
        driverLng,
        pickupLat,
        pickupLng
      );
    }
    
    // Calculate distance to delivery
    let distanceToDelivery: number | null = null;
    if (
      driverLat != null &&
      driverLng != null &&
      deliveryLat != null &&
      deliveryLng != null
    ) {
      distanceToDelivery = calculateDistanceMiles(
        driverLat,
        driverLng,
        deliveryLat,
        deliveryLng
      );
    }
    
    // Proximity flags
    const isNearPickup = distanceToPickup != null && distanceToPickup <= THRESHOLDS.NEAR_PICKUP;
    const isAtPickup = distanceToPickup != null && distanceToPickup <= THRESHOLDS.AT_PICKUP;
    const isNearDelivery = distanceToDelivery != null && distanceToDelivery <= THRESHOLDS.NEAR_DELIVERY;
    const isArrivingSoon = distanceToDelivery != null && distanceToDelivery <= THRESHOLDS.AT_DELIVERY;
    
    // Calculate ETA to pickup (when driver is heading to restaurant)
    // Apply traffic multiplier for more accurate estimates
    const effectiveMultiplier = Math.max(0.5, Math.min(trafficMultiplier, 2.0));
    
    let etaToPickup: number | null = null;
    if (distanceToPickup != null) {
      etaToPickup = Math.max(1, Math.ceil((distanceToPickup / AVG_SPEED_MILES_PER_MIN) * effectiveMultiplier));
    }
    
    // Calculate ETA to delivery (when driver is out for delivery)
    let etaToDelivery: number | null = null;
    if (distanceToDelivery != null) {
      etaToDelivery = Math.max(1, Math.ceil((distanceToDelivery / AVG_SPEED_MILES_PER_MIN) * effectiveMultiplier));
    }
    
    return {
      distanceToPickup,
      distanceToDelivery,
      isNearPickup,
      isAtPickup,
      isNearDelivery,
      isArrivingSoon,
      etaToPickup,
      etaToDelivery,
      lastEtaUpdate: now,
    };
  }, [driverLat, driverLng, pickupLat, pickupLng, deliveryLat, deliveryLng, orderStatus, trafficMultiplier]);
}
