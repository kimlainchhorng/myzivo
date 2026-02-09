/**
 * Eats Dispatch Status Hook
 * Determines the dispatch phase for customer-facing messaging
 * Provides transparent status updates during driver assignment
 * Enhanced with preparing, near_pickup, and at_pickup phases
 */
import { useMemo } from "react";

export type DispatchPhase = 
  | "pending"       // Waiting for restaurant confirmation
  | "preparing"     // Restaurant preparing order
  | "almost_ready"  // 75%+ through prep time - smoother transitions
  | "searching"     // Looking for driver
  | "matched"       // Driver just assigned (brief ~3s transition)
  | "reassigning"   // Looking for replacement driver after cancellation
  | "assigned"      // Driver heading to restaurant
  | "near_pickup"   // Driver near restaurant (< 0.2mi)
  | "at_pickup"     // Driver at restaurant (< 0.05mi)
  | "en_route"      // Driver heading to customer
  | "arrived"       // Driver near customer (< 0.15mi)
  | "delivered"     // Complete
  | "cancelled";    // Cancelled

export interface DispatchStatus {
  phase: DispatchPhase;
  message: string;
  subMessage: string;
  showSearching: boolean;
}

interface UseEatsDispatchStatusOptions {
  status: string;
  driverId: string | null | undefined;
  driverLat?: number | null;
  driverLng?: number | null;
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  /** Restaurant/pickup coordinates for near_pickup detection */
  pickupLat?: number | null;
  pickupLng?: number | null;
  /** Prep progress percentage from usePrepProgress (0-100) */
  prepProgressPercent?: number;
  /** Whether order is almost ready (75%+ through prep) */
  isAlmostReady?: boolean;
  /** Reassignment context - driver was recently reassigned */
  wasReassigned?: boolean;
  /** Currently searching for a replacement driver */
  isSearchingForNewDriver?: boolean;
  /** Driver was just assigned (for matched transition) */
  justAssigned?: boolean;
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

// Proximity thresholds
const THRESHOLDS = {
  NEAR_PICKUP: 0.2,     // ~320m - Driver arriving at restaurant
  AT_PICKUP: 0.05,      // ~80m - Driver at restaurant
  ARRIVAL_DELIVERY: 0.15, // ~240m - Driver arriving now
} as const;

export function useEatsDispatchStatus({
  status,
  driverId,
  driverLat,
  driverLng,
  deliveryLat,
  deliveryLng,
  pickupLat,
  pickupLng,
  prepProgressPercent,
  isAlmostReady,
  wasReassigned,
  isSearchingForNewDriver,
  justAssigned,
}: UseEatsDispatchStatusOptions): DispatchStatus {
  return useMemo(() => {
    // Matched transition (brief ~3s window after driver assignment)
    if (justAssigned && driverId) {
      return {
        phase: "matched" as DispatchPhase,
        message: "Matched with your driver!",
        subMessage: "They're heading to the restaurant now",
        showSearching: false,
      };
    }

    // Cancelled orders
    if (status === "cancelled") {
      return {
        phase: "cancelled",
        message: "Order was cancelled",
        subMessage: "",
        showSearching: false,
      };
    }

    // Delivered orders
    if (status === "delivered") {
      return {
        phase: "delivered",
        message: "Order delivered. Enjoy!",
        subMessage: "",
        showSearching: false,
      };
    }

    // Pending (waiting for restaurant confirmation)
    if (status === "placed" || status === "pending") {
      return {
        phase: "pending",
        message: "Waiting for restaurant confirmation...",
        subMessage: "Restaurant will confirm shortly",
        showSearching: false,
      };
    }

    // Confirmed but not yet preparing
    if (status === "confirmed") {
      // Check if driver is being reassigned
      if (isSearchingForNewDriver) {
        return {
          phase: "reassigning",
          message: "Finding another driver near you...",
          subMessage: "Your previous driver had to cancel",
          showSearching: true,
        };
      }
      
      // Check if driver assigned
      if (!driverId) {
        return {
          phase: "searching",
          message: "Finding the best driver near you...",
          subMessage: "We're matching you with a nearby driver",
          showSearching: true,
        };
      }
      
      // Driver assigned, check proximity to pickup
      if (driverLat != null && driverLng != null && pickupLat != null && pickupLng != null) {
        const distToPickup = calculateDistanceMiles(driverLat, driverLng, pickupLat, pickupLng);
        
        if (distToPickup <= THRESHOLDS.AT_PICKUP) {
          return {
            phase: "at_pickup",
            message: "Driver at restaurant",
            subMessage: "Waiting for your order",
            showSearching: false,
          };
        }
        
        if (distToPickup <= THRESHOLDS.NEAR_PICKUP) {
          return {
            phase: "near_pickup",
            message: "Driver arriving at restaurant",
            subMessage: "Almost ready to pick up your order",
            showSearching: false,
          };
        }
      }
      
      return {
        phase: "assigned",
        message: "Driver heading to restaurant",
        subMessage: "Your driver will pick up your order soon",
        showSearching: false,
      };
    }

    // Preparing status
    if (status === "preparing") {
      // Check if almost ready (75%+ through prep)
      if (isAlmostReady) {
        // Check if driver assigned and near/at pickup
        if (driverId && driverLat != null && driverLng != null && pickupLat != null && pickupLng != null) {
          const distToPickup = calculateDistanceMiles(driverLat, driverLng, pickupLat, pickupLng);
          
          if (distToPickup <= THRESHOLDS.AT_PICKUP) {
            return {
              phase: "at_pickup",
              message: "Driver waiting at restaurant",
              subMessage: "Order almost ready!",
              showSearching: false,
            };
          }
          
          if (distToPickup <= THRESHOLDS.NEAR_PICKUP) {
            return {
              phase: "near_pickup",
              message: "Driver arriving for pickup",
              subMessage: "Order will be picked up shortly",
              showSearching: false,
            };
          }
        }
        
        return {
          phase: "almost_ready",
          message: "Almost ready!",
          subMessage: "Final touches on your order",
          showSearching: !driverId,
        };
      }
      
      // Check if driver is being reassigned
      if (isSearchingForNewDriver) {
        return {
          phase: "reassigning",
          message: "Finding another driver near you...",
          subMessage: "Your previous driver had to cancel",
          showSearching: true,
        };
      }
      
      // Check if driver assigned
      if (!driverId) {
        return {
          phase: "preparing",
          message: "Restaurant is preparing your order",
          subMessage: "Your food is being made fresh",
          showSearching: true,
        };
      }
      
      // Driver assigned, check proximity to pickup
      if (driverLat != null && driverLng != null && pickupLat != null && pickupLng != null) {
        const distToPickup = calculateDistanceMiles(driverLat, driverLng, pickupLat, pickupLng);
        
        if (distToPickup <= THRESHOLDS.AT_PICKUP) {
          return {
            phase: "at_pickup",
            message: "Driver at restaurant",
            subMessage: "Waiting for your order to be ready",
            showSearching: false,
          };
        }
        
        if (distToPickup <= THRESHOLDS.NEAR_PICKUP) {
          return {
            phase: "near_pickup",
            message: "Driver arriving for pickup",
            subMessage: "Food is being prepared",
            showSearching: false,
          };
        }
      }
      
      return {
        phase: "assigned",
        message: "Driver heading to restaurant",
        subMessage: "Food is being prepared",
        showSearching: false,
      };
    }

    // Ready for pickup
    if (status === "ready" || status === "ready_for_pickup") {
      // Check if driver is being reassigned
      if (isSearchingForNewDriver) {
        return {
          phase: "reassigning",
          message: "Finding another driver near you...",
          subMessage: "Your previous driver had to cancel",
          showSearching: true,
        };
      }
      
      if (!driverId) {
        return {
          phase: "searching",
          message: "Order ready! Finding driver...",
          subMessage: "We're matching you with a nearby driver",
          showSearching: true,
        };
      }
      
      // Driver assigned, check proximity to pickup
      if (driverLat != null && driverLng != null && pickupLat != null && pickupLng != null) {
        const distToPickup = calculateDistanceMiles(driverLat, driverLng, pickupLat, pickupLng);
        
        if (distToPickup <= THRESHOLDS.AT_PICKUP) {
          return {
            phase: "at_pickup",
            message: "Driver picking up your order",
            subMessage: "Almost on the way!",
            showSearching: false,
          };
        }
        
        if (distToPickup <= THRESHOLDS.NEAR_PICKUP) {
          return {
            phase: "near_pickup",
            message: "Driver arriving at restaurant",
            subMessage: "Order is ready for pickup",
            showSearching: false,
          };
        }
      }
      
      return {
        phase: "assigned",
        message: "Driver heading to restaurant",
        subMessage: "Order is ready and waiting",
        showSearching: false,
      };
    }

    // Out for delivery - check proximity for "arrived" status
    if (status === "out_for_delivery" && driverId) {
      // Calculate distance to delivery if we have coordinates
      if (driverLat != null && driverLng != null && deliveryLat != null && deliveryLng != null) {
        const distance = calculateDistanceMiles(driverLat, driverLng, deliveryLat, deliveryLng);
        
        if (distance <= THRESHOLDS.ARRIVAL_DELIVERY) {
          return {
            phase: "arrived",
            message: "Driver arriving now!",
            subMessage: "Get ready for your delivery",
            showSearching: false,
          };
        }
      }

      return {
        phase: "en_route",
        message: "Driver is on the way!",
        subMessage: "Your food is coming to you",
        showSearching: false,
      };
    }

    // Default fallback
    return {
      phase: "pending",
      message: "Processing your order...",
      subMessage: "",
      showSearching: false,
    };
  }, [status, driverId, driverLat, driverLng, deliveryLat, deliveryLng, pickupLat, pickupLng, prepProgressPercent, isAlmostReady, justAssigned]);
}
