/**
 * useMapboxRoute Hook
 * 
 * Fetches and caches route data between two points using Mapbox Directions API
 */

import { useState, useEffect, useCallback } from "react";
import { getRoute, geocodeAddress } from "@/services/mapbox";
import { calculateMockTrip } from "@/lib/tripCalculator";

export interface RouteData {
  distance: number; // miles
  duration: number; // minutes
  coordinates: [number, number][]; // [lng, lat] pairs
  pickupCoords: { lat: number; lng: number };
  dropoffCoords: { lat: number; lng: number };
}

interface UseMapboxRouteReturn {
  routeData: RouteData | null;
  isLoading: boolean;
  error: string | null;
  fetchRoute: (pickup: string, dropoff: string) => Promise<RouteData | null>;
}

export function useMapboxRoute(): UseMapboxRouteReturn {
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoute = useCallback(async (pickup: string, dropoff: string): Promise<RouteData | null> => {
    if (!pickup.trim() || !dropoff.trim()) {
      setRouteData(null);
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Geocode both addresses in parallel
      const [pickupResult, dropoffResult] = await Promise.all([
        geocodeAddress(pickup),
        geocodeAddress(dropoff),
      ]);

      if (!pickupResult || !dropoffResult) {
        // Fallback to mock data if geocoding fails
        console.warn("Geocoding failed, using mock data");
        const mockTrip = calculateMockTrip(pickup, dropoff);
        const fallbackData: RouteData = {
          distance: mockTrip.distance,
          duration: mockTrip.duration,
          coordinates: [],
          pickupCoords: { lat: 40.7484, lng: -73.9857 },
          dropoffCoords: { lat: 40.7127, lng: -74.0134 },
        };
        setRouteData(fallbackData);
        setIsLoading(false);
        return fallbackData;
      }

      // Get route between the two points
      const route = await getRoute(
        { lat: pickupResult.lat, lng: pickupResult.lng },
        { lat: dropoffResult.lat, lng: dropoffResult.lng }
      );

      if (!route) {
        // Fallback to mock data if directions fail
        console.warn("Directions failed, using mock data");
        const mockTrip = calculateMockTrip(pickup, dropoff);
        const fallbackData: RouteData = {
          distance: mockTrip.distance,
          duration: mockTrip.duration,
          coordinates: [],
          pickupCoords: { lat: pickupResult.lat, lng: pickupResult.lng },
          dropoffCoords: { lat: dropoffResult.lat, lng: dropoffResult.lng },
        };
        setRouteData(fallbackData);
        setIsLoading(false);
        return fallbackData;
      }

      const data: RouteData = {
        distance: Math.round(route.distanceMiles * 10) / 10, // Round to 1 decimal
        duration: route.durationMinutes,
        coordinates: route.coordinates,
        pickupCoords: { lat: pickupResult.lat, lng: pickupResult.lng },
        dropoffCoords: { lat: dropoffResult.lat, lng: dropoffResult.lng },
      };

      setRouteData(data);
      setIsLoading(false);
      return data;
    } catch (err) {
      console.error("Route fetch error:", err);
      setError("Failed to get route");
      
      // Fallback to mock data
      const mockTrip = calculateMockTrip(pickup, dropoff);
      const fallbackData: RouteData = {
        distance: mockTrip.distance,
        duration: mockTrip.duration,
        coordinates: [],
          pickupCoords: { lat: 40.7484, lng: -73.9857 },
          dropoffCoords: { lat: 40.7127, lng: -74.0134 },
      };
      setRouteData(fallbackData);
      setIsLoading(false);
      return fallbackData;
    }
  }, []);

  return {
    routeData,
    isLoading,
    error,
    fetchRoute,
  };
}
