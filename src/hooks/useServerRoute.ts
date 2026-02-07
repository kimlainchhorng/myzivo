/**
 * useServerRoute Hook
 * 
 * Server-side route calculation using Google Directions API via edge function.
 * Replaces client-side useGoogleMapsRoute for better security.
 */

import { useState, useCallback } from "react";
import { getRoute, RouteResult } from "@/services/mapsApi";
import { calculateMockTrip } from "@/lib/tripCalculator";

export interface ServerRouteData {
  distance: number; // miles
  duration: number; // minutes
  polyline: string | null;
  pickupCoords: { lat: number; lng: number };
  dropoffCoords: { lat: number; lng: number };
}

interface UseServerRouteReturn {
  routeData: ServerRouteData | null;
  isLoading: boolean;
  error: string | null;
  fetchRoute: (
    pickupCoords: { lat: number; lng: number },
    dropoffCoords: { lat: number; lng: number },
    pickupAddress?: string,
    dropoffAddress?: string
  ) => Promise<ServerRouteData | null>;
  clearRoute: () => void;
}

export function useServerRoute(): UseServerRouteReturn {
  const [routeData, setRouteData] = useState<ServerRouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoute = useCallback(async (
    pickupCoords: { lat: number; lng: number },
    dropoffCoords: { lat: number; lng: number },
    pickupAddress?: string,
    dropoffAddress?: string
  ): Promise<ServerRouteData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getRoute(pickupCoords, dropoffCoords);

      if (result) {
        const data: ServerRouteData = {
          distance: result.distance_miles,
          duration: result.duration_minutes,
          polyline: result.polyline,
          pickupCoords,
          dropoffCoords,
        };
        setRouteData(data);
        return data;
      }

      // Fallback to mock calculation if API fails
      console.warn("[useServerRoute] API failed, using mock data");
      const mockTrip = calculateMockTrip(
        pickupAddress || "Pickup",
        dropoffAddress || "Dropoff"
      );

      const fallbackData: ServerRouteData = {
        distance: mockTrip.distance,
        duration: mockTrip.duration,
        polyline: null,
        pickupCoords,
        dropoffCoords,
      };

      setRouteData(fallbackData);
      return fallbackData;
    } catch (e) {
      console.error("[useServerRoute] Error:", e);
      setError("Failed to calculate route");

      // Fallback to mock calculation
      const mockTrip = calculateMockTrip(
        pickupAddress || "Pickup",
        dropoffAddress || "Dropoff"
      );

      const fallbackData: ServerRouteData = {
        distance: mockTrip.distance,
        duration: mockTrip.duration,
        polyline: null,
        pickupCoords,
        dropoffCoords,
      };

      setRouteData(fallbackData);
      return fallbackData;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearRoute = useCallback(() => {
    setRouteData(null);
    setError(null);
  }, []);

  return {
    routeData,
    isLoading,
    error,
    fetchRoute,
    clearRoute,
  };
}
