import { useEffect, useRef, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useRideStore } from "@/stores/rideStore";
import {
  isSupabaseConfigured,
  subscribeToRide,
  fetchDriverInfo,
  RideUpdateCallbacks,
  SupabaseErrorInfo,
} from "@/lib/supabaseRide";
import { RideStatus } from "@/types/rideTypes";

interface UseRideRealtimeOptions {
  tripId: string | null;
  enableMockFallback?: boolean;
  mockDelayMs?: number;
}

interface UseRideRealtimeReturn {
  isConnected: boolean;
  isRealtime: boolean;
  isDemoMode: boolean;
  connectionError: SupabaseErrorInfo | null;
  isReconnecting: boolean;
  reconnect: () => void;
}

export const useRideRealtime = ({
  tripId,
  enableMockFallback = true,
  mockDelayMs = 5000,
}: UseRideRealtimeOptions): UseRideRealtimeReturn => {
  const navigate = useNavigate();
  const { state, assignDriver, setStatus } = useRideStore();
  const cleanupRef = useRef<(() => void) | null>(null);
  const mockTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Connection state
  const [connectionError, setConnectionError] = useState<SupabaseErrorInfo | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);

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

  // Reconnection logic with exponential backoff
  const reconnect = useCallback(async () => {
    if (!tripId || isReconnecting) return;

    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log("[Realtime] Max reconnection attempts reached");
      setConnectionError({
        type: "network",
        message: "Max reconnection attempts",
        userMessage: "Unable to reconnect. Tap to retry.",
        isRetryable: true,
      });
      return;
    }

    setIsReconnecting(true);
    reconnectAttemptsRef.current++;

    // Exponential backoff
    const delay = 1000 * Math.pow(2, reconnectAttemptsRef.current - 1);
    console.log(`[Realtime] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
    
    await new Promise((r) => setTimeout(r, delay));

    // Cleanup previous subscription
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    // Create new subscription
    const callbacks: RideUpdateCallbacks = {
      onStatusChange: handleStatusChange,
      onDriverAssigned: handleDriverAssigned,
      onError: (error) => {
        console.error("[Realtime] Subscription error:", error);
        setConnectionError({
          type: "network",
          message: error.message,
          userMessage: "Connection lost. Reconnecting...",
          isRetryable: true,
        });
        // Try to reconnect automatically
        reconnect();
      },
    };

    cleanupRef.current = subscribeToRide(tripId, callbacks);
    
    // Clear error on successful reconnection
    setConnectionError(null);
    setIsReconnecting(false);
    reconnectAttemptsRef.current = 0;
    console.log("[Realtime] Reconnected successfully");
  }, [tripId, isReconnecting, handleStatusChange, handleDriverAssigned]);

  // Manual reset of reconnection attempts (for manual retry button)
  const handleManualReconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    setConnectionError(null);
    reconnect();
  }, [reconnect]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!isRealtime) return;

    console.log(`[Realtime] Subscribing to trip: ${tripId}`);

    const callbacks: RideUpdateCallbacks = {
      onStatusChange: handleStatusChange,
      onDriverAssigned: handleDriverAssigned,
      onError: (error) => {
        console.error("[Realtime] Error:", error);
        setConnectionError({
          type: "network",
          message: error.message,
          userMessage: "Connection error. Updates may be delayed.",
          isRetryable: true,
        });
        toast.error("Connection error", {
          description: "Attempting to reconnect...",
        });
        // Attempt automatic reconnection
        reconnect();
      },
    };

    cleanupRef.current = subscribeToRide(tripId, callbacks);

    // Reset connection state on new subscription
    setConnectionError(null);
    reconnectAttemptsRef.current = 0;

    return () => {
      if (cleanupRef.current) {
        console.log(`[Realtime] Unsubscribing from trip: ${tripId}`);
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [tripId, isRealtime, handleStatusChange, handleDriverAssigned, reconnect]);

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
    connectionError,
    isReconnecting,
    reconnect: handleManualReconnect,
  };
};

export default useRideRealtime;
