/**
 * useTrafficAwareEta Hook
 * 
 * Fetches real traffic-aware ETAs via Google Directions API (throttled to 60s),
 * blends with live Haversine distance between API calls for smooth updates.
 */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getRoute, RouteResult } from "@/services/mapsApi";
import { haversineMiles } from "@/services/mapsApi";

interface UseTrafficAwareEtaOptions {
  driverLat: number | null | undefined;
  driverLng: number | null | undefined;
  destLat: number | null | undefined;
  destLng: number | null | undefined;
  enabled: boolean;
}

interface TrafficAwareEtaState {
  /** Best available ETA in minutes */
  etaMinutes: number | null;
  /** Traffic level from last API call */
  trafficLevel: "light" | "moderate" | "heavy" | null;
  /** Whether current ETA is based on real route data */
  isTrafficBased: boolean;
  /** Timestamp of last route API call */
  lastRouteUpdate: Date;
  /** Traffic multiplier for use by other hooks (1.0 = normal) */
  trafficMultiplier: number;
}

const THROTTLE_MS = 60_000; // 60 seconds between API calls
const AVG_SPEED_MILES_PER_MIN = 0.5; // 30 mph fallback

const TRAFFIC_MULTIPLIERS: Record<string, number> = {
  light: 1.0,
  moderate: 1.2,
  heavy: 1.5,
};

export function useTrafficAwareEta({
  driverLat,
  driverLng,
  destLat,
  destLng,
  enabled,
}: UseTrafficAwareEtaOptions): TrafficAwareEtaState {
  const [lastRoute, setLastRoute] = useState<RouteResult | null>(null);
  const [lastRouteUpdate, setLastRouteUpdate] = useState<Date>(new Date());
  const lastCallTime = useRef<number>(0);
  const lastCallCoords = useRef<{ lat: number; lng: number } | null>(null);

  const hasCoords =
    driverLat != null && driverLng != null &&
    destLat != null && destLng != null;

  // Fetch route from API (throttled)
  const fetchRoute = useCallback(async () => {
    if (!hasCoords || !enabled) return;

    const now = Date.now();
    if (now - lastCallTime.current < THROTTLE_MS) return;

    lastCallTime.current = now;
    lastCallCoords.current = { lat: driverLat!, lng: driverLng! };

    try {
      const result = await getRoute(
        { lat: driverLat!, lng: driverLng! },
        { lat: destLat!, lng: destLng! }
      );
      if (result) {
        setLastRoute(result);
        setLastRouteUpdate(new Date());
      }
    } catch (e) {
      console.error("[useTrafficAwareEta] Route fetch failed:", e);
    }
  }, [driverLat, driverLng, destLat, destLng, hasCoords, enabled]);

  // Trigger API call when driver location changes (respects throttle)
  useEffect(() => {
    if (enabled && hasCoords) {
      fetchRoute();
    }
  }, [driverLat, driverLng, enabled, hasCoords, fetchRoute]);

  // Blend: use last API result + current Haversine distance for smooth ETA
  const result = useMemo<TrafficAwareEtaState>(() => {
    if (!hasCoords || !enabled) {
      return {
        etaMinutes: null,
        trafficLevel: null,
        isTrafficBased: false,
        lastRouteUpdate,
        trafficMultiplier: 1.0,
      };
    }

    const currentDistance = haversineMiles(driverLat!, driverLng!, destLat!, destLng!);

    if (lastRoute && lastCallCoords.current) {
      // Blend: ratio of current distance to distance at last API call
      const apiDistance = lastRoute.distance_miles;
      const trafficEta = lastRoute.duration_in_traffic_minutes ?? lastRoute.duration_minutes;

      if (apiDistance > 0 && trafficEta > 0) {
        const ratio = Math.max(0, currentDistance / apiDistance);
        const blendedEta = Math.max(1, Math.ceil(trafficEta * ratio));
        const multiplier = TRAFFIC_MULTIPLIERS[lastRoute.traffic_level ?? "moderate"] ?? 1.0;

        return {
          etaMinutes: blendedEta,
          trafficLevel: lastRoute.traffic_level,
          isTrafficBased: true,
          lastRouteUpdate,
          trafficMultiplier: multiplier,
        };
      }
    }

    // Fallback: Haversine-based ETA
    const fallbackEta = Math.max(1, Math.ceil(currentDistance / AVG_SPEED_MILES_PER_MIN));
    return {
      etaMinutes: fallbackEta,
      trafficLevel: null,
      isTrafficBased: false,
      lastRouteUpdate,
      trafficMultiplier: 1.0,
    };
  }, [driverLat, driverLng, destLat, destLng, hasCoords, enabled, lastRoute, lastRouteUpdate]);

  return result;
}
