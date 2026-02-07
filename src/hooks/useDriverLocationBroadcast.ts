/**
 * useDriverLocationBroadcast Hook
 * 
 * Watches device geolocation and broadcasts updates to the server
 * when the driver is online. Includes throttling and significant
 * movement detection.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LocationState {
  lat: number;
  lng: number;
  heading: number | null;
  speed: number | null;
  accuracy: number;
  timestamp: number;
}

interface UseDriverLocationBroadcastOptions {
  isOnline: boolean;
  intervalMs?: number; // Default 15000 (15s)
  minMovementMeters?: number; // Default 50m
}

interface UseDriverLocationBroadcastReturn {
  location: LocationState | null;
  isWatching: boolean;
  error: string | null;
  permissionDenied: boolean;
  refresh: () => void;
  lastSentAt: Date | null;
}

const DEFAULT_INTERVAL = 15000; // 15 seconds
const MIN_MOVEMENT_METERS = 50;

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (x: number) => (x * Math.PI) / 180;
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useDriverLocationBroadcast({
  isOnline,
  intervalMs = DEFAULT_INTERVAL,
  minMovementMeters = MIN_MOVEMENT_METERS,
}: UseDriverLocationBroadcastOptions): UseDriverLocationBroadcastReturn {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [lastSentAt, setLastSentAt] = useState<Date | null>(null);
  
  const lastSentLocation = useRef<{ lat: number; lng: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const sendLocationUpdate = useCallback(async (loc: LocationState) => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "update-driver-location",
        {
          body: {
            lat: loc.lat,
            lng: loc.lng,
            heading: loc.heading,
            speed: loc.speed,
            accuracy: loc.accuracy,
          },
        }
      );

      if (fnError) {
        console.error("[LocationBroadcast] Error:", fnError);
        setError("Failed to send location update");
        return;
      }

      if (data?.suspended) {
        setError("Account suspended: " + (data.reason || "GPS anomalies detected"));
        return;
      }

      lastSentLocation.current = { lat: loc.lat, lng: loc.lng };
      setLastSentAt(new Date());
      setError(null);
    } catch (err) {
      console.error("[LocationBroadcast] Exception:", err);
      setError("Location update failed");
    }
  }, []);

  const handlePositionUpdate = useCallback((position: GeolocationPosition) => {
    const newLocation: LocationState = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      heading: position.coords.heading,
      speed: position.coords.speed,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    };

    setLocation(newLocation);
    setError(null);

    // Check if significant movement occurred
    if (lastSentLocation.current) {
      const distance = haversineDistance(
        lastSentLocation.current.lat,
        lastSentLocation.current.lng,
        newLocation.lat,
        newLocation.lng
      );

      // Send immediately if moved more than threshold
      if (distance >= minMovementMeters) {
        sendLocationUpdate(newLocation);
      }
    } else {
      // First location, send immediately
      sendLocationUpdate(newLocation);
    }
  }, [sendLocationUpdate, minMovementMeters]);

  const handlePositionError = useCallback((err: GeolocationPositionError) => {
    console.error("[LocationBroadcast] Geolocation error:", err);
    
    switch (err.code) {
      case err.PERMISSION_DENIED:
        setError("Location permission denied");
        setPermissionDenied(true);
        break;
      case err.POSITION_UNAVAILABLE:
        setError("Location unavailable");
        break;
      case err.TIMEOUT:
        setError("Location request timed out");
        break;
      default:
        setError("Unknown location error");
    }
  }, []);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    setIsWatching(true);
    setError(null);
    setPermissionDenied(false);

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      handlePositionError,
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 20000,
      }
    );

    // Also set up interval for periodic updates
    intervalRef.current = setInterval(() => {
      if (location) {
        sendLocationUpdate(location);
      }
    }, intervalMs);
  }, [handlePositionUpdate, handlePositionError, location, sendLocationUpdate, intervalMs]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsWatching(false);
  }, []);

  const refresh = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: LocationState = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          heading: position.coords.heading,
          speed: position.coords.speed,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        setLocation(newLocation);
        sendLocationUpdate(newLocation);
      },
      handlePositionError,
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );
  }, [sendLocationUpdate, handlePositionError]);

  // Start/stop watching based on online status
  useEffect(() => {
    if (isOnline) {
      startWatching();
    } else {
      stopWatching();
    }

    return () => {
      stopWatching();
    };
  }, [isOnline, startWatching, stopWatching]);

  return {
    location,
    isWatching,
    error,
    permissionDenied,
    refresh,
    lastSentAt,
  };
}

export default useDriverLocationBroadcast;
