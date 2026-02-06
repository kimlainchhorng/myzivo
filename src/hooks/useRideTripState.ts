import { RideOption } from "@/components/ride/RideCard";
import { TripDetails } from "@/lib/tripCalculator";

const STORAGE_KEY = "zivo_active_ride";

export interface RideTripState {
  ride: RideOption;
  pickup: string;
  destination: string;
  paymentMethod: string;
  tripDetails?: TripDetails;
  startedAt: number;
}

export function useRideTripState() {
  const getActiveTrip = (): RideTripState | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as RideTripState;
    } catch {
      return null;
    }
  };

  const saveTrip = (tripData: Omit<RideTripState, "startedAt">) => {
    try {
      const state: RideTripState = {
        ...tripData,
        startedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      console.error("Failed to save trip state");
    }
  };

  const clearTrip = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      console.error("Failed to clear trip state");
    }
  };

  const hasActiveTrip = (): boolean => {
    return getActiveTrip() !== null;
  };

  return {
    getActiveTrip,
    saveTrip,
    clearTrip,
    hasActiveTrip,
  };
}
