import { useEffect, useRef, useCallback, useState } from "react";
import { useRideStore } from "@/stores/rideStore";
import { useNotificationSound } from "@/hooks/useNotificationSound";
import { useNativeFeatures } from "@/hooks/useNativeFeatures";
import { RideStatus } from "@/types/rideTypes";

export interface StatusNotification {
  status: RideStatus;
  message: string;
  subMessage?: string;
  type: "info" | "success" | "warning";
}

const STATUS_MESSAGES: Record<string, StatusNotification> = {
  assigned: {
    status: "assigned",
    message: "Driver is on the way",
    subMessage: "Your driver has accepted the ride",
    type: "info",
  },
  arrived: {
    status: "arrived",
    message: "Driver has arrived",
    subMessage: "Please meet your driver at the pickup location",
    type: "success",
  },
  in_trip: {
    status: "in_trip",
    message: "Trip started",
    subMessage: "Enjoy your ride",
    type: "info",
  },
  completed: {
    status: "completed",
    message: "Trip completed",
    subMessage: "Thank you for riding with ZIVO",
    type: "success",
  },
};

export const useRideStatusNotifications = () => {
  const { state } = useRideStore();
  const { playStatusUpdateSound } = useNotificationSound();
  const { hapticNotification } = useNativeFeatures();
  const prevStatusRef = useRef<RideStatus | null>(null);
  const [activeNotification, setActiveNotification] = useState<StatusNotification | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerNotification = useCallback((status: RideStatus) => {
    const notification = STATUS_MESSAGES[status];
    if (!notification) return;

    // Clear any existing hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    setActiveNotification(notification);
    setShowBanner(true);

    // Play sound for assigned and arrived
    if (status === "assigned" || status === "arrived") {
      playStatusUpdateSound();
      hapticNotification("success");
    }

    // Auto-hide banner after 5 seconds (except for arrived which persists longer)
    const hideDelay = status === "arrived" ? 8000 : 5000;
    hideTimeoutRef.current = setTimeout(() => setShowBanner(false), hideDelay);
  }, [playStatusUpdateSound, hapticNotification]);

  // Monitor status changes
  useEffect(() => {
    if (prevStatusRef.current !== state.status && state.status !== "idle") {
      triggerNotification(state.status);
    }
    prevStatusRef.current = state.status;
  }, [state.status, triggerNotification]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const dismissBanner = useCallback(() => {
    setShowBanner(false);
  }, []);

  return {
    activeNotification,
    showBanner,
    dismissBanner,
  };
};
