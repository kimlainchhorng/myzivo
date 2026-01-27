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

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

export const useLocationSearch = () => {
  const [isSearching, setIsSearching] = useState(false);

  const searchLocations = useCallback(async (query: string): Promise<Location[]> => {
    if (!query || query.length < 3) return [];
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=5`
      );
      const data = await response.json();
      
      return data.features?.map((feature: any) => ({
        address: feature.place_name,
        lat: feature.center[1],
        lng: feature.center[0],
      })) || [];
    } catch (error) {
      console.error("Location search error:", error);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  return { searchLocations, isSearching };
};

export const useRouteCalculation = () => {
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateRoute = useCallback(async (
    pickup: Location,
    dropoff: Location
  ): Promise<{ distance: number; duration: number; geometry: any } | null> => {
    setIsCalculating(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
      );
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        return {
          distance: route.distance / 1000, // Convert to km
          duration: route.duration / 60, // Convert to minutes
          geometry: route.geometry,
        };
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
        const totalFare = Math.max(subtotal * pricing.surge_multiplier, pricing.minimum_fare);

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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("You must be logged in to book a trip");

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
          duration_minutes: durationMinutes,
          status: "requested",
          payment_status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
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
