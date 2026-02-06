import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePricing, Pricing } from "./usePricing";

export type Location = {
  address: string;
  lat: number;
  lng: number;
};

export type FareEstimate = {
  vehicleType: string;
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeMultiplier: number;
  totalFare: number;
  estimatedDuration: number;
  estimatedDistance: number;
};

// Google Maps API Key (loaded via provider in App.tsx)
const getGoogleMapsApiKey = () => import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

export const useLocationSearch = () => {
  const [isSearching, setIsSearching] = useState(false);

  const searchLocations = useCallback(async (query: string): Promise<Location[]> => {
    if (!query || query.length < 3) return [];
    
    const apiKey = getGoogleMapsApiKey();
    if (!apiKey) {
      console.error("Google Maps API key not configured");
      return [];
    }

    setIsSearching(true);
    try {
      // Use Google Places Autocomplete API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${apiKey}&types=address`
      );
      const data = await response.json();
      
      if (data.status !== "OK" || !data.predictions) {
        return [];
      }

      // Get place details for each prediction to get coordinates
      const locations: Location[] = [];
      for (const prediction of data.predictions.slice(0, 5)) {
        try {
          const detailsResponse = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&fields=geometry,formatted_address&key=${apiKey}`
          );
          const details = await detailsResponse.json();
          
          if (details.status === "OK" && details.result) {
            locations.push({
              address: details.result.formatted_address || prediction.description,
              lat: details.result.geometry.location.lat,
              lng: details.result.geometry.location.lng,
            });
          }
        } catch (e) {
          console.error("Error fetching place details:", e);
        }
      }
      
      return locations;
    } catch (error) {
      console.error("Location search error:", error);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  return { searchLocations, isSearching };
};

// Simple in-memory cache for route calculations to avoid duplicate API calls
const routeCache = new Map<string, { distance: number; duration: number; geometry: any }>();

const buildCacheKey = (pickup: Location, dropoff: Location) =>
  `${pickup.lat.toFixed(5)},${pickup.lng.toFixed(5)}-${dropoff.lat.toFixed(5)},${dropoff.lng.toFixed(5)}`;

export const useRouteCalculation = () => {
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateRoute = useCallback(async (
    pickup: Location,
    dropoff: Location
  ): Promise<{ distance: number; duration: number; geometry: any } | null> => {
    const cacheKey = buildCacheKey(pickup, dropoff);

    // Return cached result instantly
    const cached = routeCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const apiKey = getGoogleMapsApiKey();
    if (!apiKey) {
      console.error("Google Maps API key not configured");
      return null;
    }

    setIsCalculating(true);
    try {
      // Use Google Directions API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${pickup.lat},${pickup.lng}&destination=${dropoff.lat},${dropoff.lng}&key=${apiKey}`
      );
      const data = await response.json();
      
      if (data.status === "OK" && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs[0];
        const result = {
          distance: leg.distance.value / 1000, // Convert meters to km
          duration: leg.duration.value / 60, // Convert seconds to minutes
          geometry: route.overview_polyline, // Encoded polyline
        };
        // Cache for future lookups
        routeCache.set(cacheKey, result);
        // Limit cache size to 20 entries
        if (routeCache.size > 20) {
          const firstKey = routeCache.keys().next().value;
          if (firstKey) routeCache.delete(firstKey);
        }
        return result;
      }
      return null;
    } catch (error) {
      console.error("Route calculation error:", error);
      return null;
    } finally {
      setIsCalculating(false);
    }
  }, []);

  return { calculateRoute, isCalculating };
};

// 5% discount to beat Uber/Lyft pricing
const COMPETITOR_DISCOUNT = 0.95;

export const useFareEstimation = () => {
  const { data: pricingData } = usePricing();

  const calculateFares = useCallback((
    distanceKm: number,
    durationMinutes: number
  ): FareEstimate[] => {
    if (!pricingData) return [];

    return pricingData
      .filter(p => p.is_active)
      .map(pricing => {
        const baseFare = pricing.base_fare;
        const distanceFare = pricing.per_km_rate * distanceKm;
        const timeFare = pricing.per_minute_rate * durationMinutes;
        const subtotal = baseFare + distanceFare + timeFare;
        const rawFare = Math.max(subtotal * pricing.surge_multiplier, pricing.minimum_fare);
        // Apply 5% discount to beat competitor pricing
        const totalFare = Number((rawFare * COMPETITOR_DISCOUNT).toFixed(2));

        return {
          vehicleType: pricing.vehicle_type,
          baseFare,
          distanceFare,
          timeFare,
          surgeMultiplier: pricing.surge_multiplier,
          totalFare,
          estimatedDuration: durationMinutes,
          estimatedDistance: distanceKm,
        };
      })
      .sort((a, b) => a.totalFare - b.totalFare);
  }, [pricingData]);

  return { calculateFares, pricingData };
};

export const useCreateTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pickup,
      dropoff,
      fareAmount,
      distanceKm,
      durationMinutes,
    }: {
      pickup: Location;
      dropoff: Location;
      fareAmount: number;
      distanceKm: number;
      durationMinutes: number;
    }) => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Auth error:", authError);
        throw new Error("Authentication failed. Please sign in again.");
      }
      
      if (!user) throw new Error("You must be logged in to book a trip");

      console.log("Creating trip for user:", user.id);

      const { data, error } = await supabase
        .from("trips")
        .insert({
          rider_id: user.id,
          pickup_address: pickup.address,
          pickup_lat: pickup.lat,
          pickup_lng: pickup.lng,
          dropoff_address: dropoff.address,
          dropoff_lat: dropoff.lat,
          dropoff_lng: dropoff.lng,
          fare_amount: fareAmount,
          distance_km: distanceKm,
          duration_minutes: Math.round(durationMinutes),
          status: "requested",
          payment_status: "pending",
        })
        .select()
        .single();

      if (error) {
        console.error("Trip creation error:", error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rider-trips"] });
      toast.success("Trip requested! Looking for a driver...");
    },
    onError: (error) => {
      toast.error("Failed to book trip: " + error.message);
    },
  });
};

export const useRiderTrips = () => {
  const queryClient = useQueryClient();

  return {
    queryClient,
  };
};
