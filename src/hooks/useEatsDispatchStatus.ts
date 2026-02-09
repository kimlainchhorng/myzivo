/**
 * Eats Dispatch Status Hook
 * Determines the dispatch phase for customer-facing messaging
 * Provides transparent status updates during driver assignment
 */
import { useMemo } from "react";

export type DispatchPhase = "pending" | "searching" | "assigned" | "en_route" | "arrived" | "delivered" | "cancelled";

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

const ARRIVAL_THRESHOLD_MILES = 0.15;

export function useEatsDispatchStatus({
  status,
  driverId,
  driverLat,
  driverLng,
  deliveryLat,
  deliveryLng,
}: UseEatsDispatchStatusOptions): DispatchStatus {
  return useMemo(() => {
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

    // Order is active - check driver status
    const isActiveStatus = ["confirmed", "preparing", "ready", "ready_for_pickup"].includes(status);

    // Searching for driver (no driver assigned yet)
    if (isActiveStatus && !driverId) {
      return {
        phase: "searching",
        message: "Finding the best driver near you...",
        subMessage: "We're matching you with a nearby driver",
        showSearching: true,
      };
    }

    // Driver assigned but not yet en route (heading to restaurant)
    if (isActiveStatus && driverId) {
      return {
        phase: "assigned",
        message: "Driver assigned — heading to restaurant",
        subMessage: "Your driver is on their way to pick up your order",
        showSearching: false,
      };
    }

    // Out for delivery - check proximity for "arrived" status
    if (status === "out_for_delivery" && driverId) {
      // Calculate distance if we have coordinates
      if (driverLat != null && driverLng != null && deliveryLat != null && deliveryLng != null) {
        const distance = calculateDistanceMiles(driverLat, driverLng, deliveryLat, deliveryLng);
        
        if (distance <= ARRIVAL_THRESHOLD_MILES) {
          return {
            phase: "arrived",
            message: "Driver arriving now!",
            subMessage: "Your driver is almost at your location",
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
  }, [status, driverId, driverLat, driverLng, deliveryLat, deliveryLng]);
}
