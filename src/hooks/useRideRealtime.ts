import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useRideStore } from "@/stores/rideStore";
import {
  isSupabaseConfigured,
  subscribeToRide,
  fetchDriverInfo,
  RideUpdateCallbacks,
} from "@/lib/supabaseRide";
import { RideStatus } from "@/types/rideTypes";

interface UseRideRealtimeOptions {
  tripId: string | null;
  enableMockFallback?: boolean;
  mockDelayMs?: number;
}

export const useRideRealtime = ({
  tripId,
  enableMockFallback = true,
  mockDelayMs = 5000,
}: UseRideRealtimeOptions) => {
  const navigate = useNavigate();
  const { state, assignDriver, setStatus } = useRideStore();
  const cleanupRef = useRef<(() => void) | null>(null);
  const mockTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isConnected = isSupabaseConfigured();
  const isRealtime = isConnected && !!tripId;

  // Handle status change from realtime
  const handleStatusChange = useCallback(
    (newStatus: RideStatus, dbStatus: string) => {
      console.log(`[Realtime] Status changed: ${dbStatus} → ${newStatus}`);

      // Update store with new status
      setStatus(newStatus);

      // Handle navigation based on status
      switch (newStatus) {
        case "assigned":
          navigate("/ride/driver");
          break;
        case "arrived":
          toast.success("Driver has arrived!");
          break;
        case "in_trip":
          navigate("/ride/trip");
          break;
        case "completed":
          toast.success("Trip completed!");
          break;
        case "cancelled":
          toast.error("Ride was cancelled");
          navigate("/ride");
          break;
      }
    },
    [navigate, setStatus]
  );

  // Handle driver assignment from realtime
  const handleDriverAssigned = useCallback(
    async (driverId: string) => {
      console.log(`[Realtime] Driver assigned: ${driverId}`);

      const driverInfo = await fetchDriverInfo(driverId);
      if (driverInfo) {
        assignDriver(driverInfo);
      }
    },
    [assignDriver]
  );

  // Subscribe to realtime updates
  useEffect(() => {
    if (!isRealtime) return;

    console.log(`[Realtime] Subscribing to trip: ${tripId}`);

    const callbacks: RideUpdateCallbacks = {
      onStatusChange: handleStatusChange,
      onDriverAssigned: handleDriverAssigned,
      onError: (error) => {
        console.error("[Realtime] Error:", error);
        toast.error("Connection error. Updates may be delayed.");
      },
    };

    cleanupRef.current = subscribeToRide(tripId, callbacks);

    return () => {
      if (cleanupRef.current) {
        console.log(`[Realtime] Unsubscribing from trip: ${tripId}`);
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [tripId, isRealtime, handleStatusChange, handleDriverAssigned]);

  // Mock fallback for demo mode (only on searching page)
  useEffect(() => {
    if (isRealtime || !enableMockFallback) return;
    if (state.status !== "searching") return;

    console.log("[Mock] Starting mock driver assignment simulation");

    mockTimeoutRef.current = setTimeout(() => {
      // This will be handled by the page component's own mock logic
      console.log("[Mock] Mock timeout reached - page should handle this");
    }, mockDelayMs);

    return () => {
      if (mockTimeoutRef.current) {
        clearTimeout(mockTimeoutRef.current);
        mockTimeoutRef.current = null;
      }
    };
  }, [isRealtime, enableMockFallback, mockDelayMs, state.status]);

  return {
    isConnected,
    isRealtime,
    isDemoMode: !isConnected,
  };
};

export default useRideRealtime;
