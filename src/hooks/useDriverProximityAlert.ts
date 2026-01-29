import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useNotificationSound } from "./useNotificationSound";

interface UseDriverProximityAlertOptions {
  driverLocation: { lat: number; lng: number } | null;
  targetLocation: { lat: number; lng: number };
  tripStatus: string | null;
  etaMinutes: number | null;
  alertThresholdMinutes?: number;
}

export const useDriverProximityAlert = ({
  driverLocation,
  targetLocation,
  tripStatus,
  etaMinutes,
  alertThresholdMinutes = 3,
}: UseDriverProximityAlertOptions) => {
  const hasAlertedRef = useRef(false);
  const { playAlertSound } = useNotificationSound();

  // Reset alert flag when trip status changes to a new pickup phase
  useEffect(() => {
    if (tripStatus === "accepted") {
      hasAlertedRef.current = false;
    }
  }, [tripStatus]);

  // Check proximity and trigger alert
  useEffect(() => {
    // Only alert during en_route status (driver heading to pickup)
    if (tripStatus !== "en_route") return;
    if (!driverLocation || !etaMinutes) return;
    if (hasAlertedRef.current) return;

    // Alert when ETA is at or below threshold
    if (etaMinutes <= alertThresholdMinutes) {
      hasAlertedRef.current = true;
      
      // Play alert sound
      playAlertSound();
      
      // Show prominent toast notification
      toast.info("🚗 Your driver is almost here!", {
        description: `Arriving in about ${etaMinutes} minute${etaMinutes !== 1 ? 's' : ''}. Please head to the pickup point.`,
        duration: 10000,
        action: {
          label: "Got it",
          onClick: () => {},
        },
      });
    }
  }, [driverLocation, etaMinutes, tripStatus, alertThresholdMinutes, playAlertSound]);

  return {
    hasAlerted: hasAlertedRef.current,
  };
};
