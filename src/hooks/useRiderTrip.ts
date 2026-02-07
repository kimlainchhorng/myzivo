import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CreateTripData {
  pickup_address: string;
  dropoff_address: string;
  pickup_lat?: number;
  pickup_lng?: number;
  dropoff_lat?: number;
  dropoff_lng?: number;
  fare_amount: number;
  distance_km: number;
  duration_minutes: number;
  ride_type: string;
  customer_name?: string;
  customer_phone?: string;
}

export interface TripWithDriver {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
  fare_amount: number | null;
  distance_km: number | null;
  duration_minutes: number | null;
  ride_type: string | null;
  status: string;
  customer_name: string | null;
  customer_phone: string | null;
  driver_id: string | null;
  created_at: string;
  driver?: {
    id: string;
    full_name: string;
    phone: string;
    vehicle_type: string;
    vehicle_model: string | null;
    vehicle_plate: string;
    avatar_url: string | null;
    rating: number | null;
    current_lat: number | null;
    current_lng: number | null;
  } | null;
}

const TRIP_ID_KEY = "zivo_active_trip_id";

// Hook to create a new trip request
export const useCreateTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tripData: CreateTripData) => {
      const { data, error } = await supabase
        .from("trips")
        .insert({
          pickup_address: tripData.pickup_address,
          dropoff_address: tripData.dropoff_address,
          pickup_lat: tripData.pickup_lat,
          pickup_lng: tripData.pickup_lng,
          dropoff_lat: tripData.dropoff_lat,
          dropoff_lng: tripData.dropoff_lng,
          fare_amount: tripData.fare_amount,
          distance_km: tripData.distance_km,
          duration_minutes: tripData.duration_minutes,
          ride_type: tripData.ride_type,
          customer_name: tripData.customer_name,
          customer_phone: tripData.customer_phone,
          status: "requested",
        })
        .select()
        .single();

      if (error) throw error;
      
      // Store trip ID in localStorage
      localStorage.setItem(TRIP_ID_KEY, data.id);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-rider-trip"] });
    },
    onError: (error) => {
      toast.error("Failed to request ride: " + error.message);
    },
  });
};

// Hook to get a trip by ID with driver info
export const useTripById = (tripId: string | null) => {
  return useQuery({
    queryKey: ["trip", tripId],
    queryFn: async () => {
      if (!tripId) return null;

      const { data, error } = await supabase
        .from("trips")
        .select(`
          *,
          driver:drivers(
            id,
            full_name,
            phone,
            vehicle_type,
            vehicle_model,
            vehicle_plate,
            avatar_url,
            rating,
            current_lat,
            current_lng
          )
        `)
        .eq("id", tripId)
        .single();

      if (error) throw error;
      return data as TripWithDriver;
    },
    enabled: !!tripId,
    refetchInterval: 3000, // Poll every 3 seconds for updates
  });
};

// Hook to get stored trip ID
export const useStoredTripId = () => {
  const [tripId, setTripId] = useState<string | null>(() => {
    return localStorage.getItem(TRIP_ID_KEY);
  });

  const clearTripId = useCallback(() => {
    localStorage.removeItem(TRIP_ID_KEY);
    setTripId(null);
  }, []);

  const saveTripId = useCallback((id: string) => {
    localStorage.setItem(TRIP_ID_KEY, id);
    setTripId(id);
  }, []);

  return { tripId, saveTripId, clearTripId };
};

// Hook to cancel a trip
export const useCancelTrip = () => {
  const queryClient = useQueryClient();
  const { clearTripId } = useStoredTripId();

  return useMutation({
    mutationFn: async (tripId: string) => {
      const { error } = await supabase
        .from("trips")
        .update({ 
          status: "cancelled",
          updated_at: new Date().toISOString()
        })
        .eq("id", tripId);

      if (error) throw error;
    },
    onSuccess: () => {
      clearTripId();
      queryClient.invalidateQueries({ queryKey: ["trip"] });
      queryClient.invalidateQueries({ queryKey: ["active-rider-trip"] });
      toast.info("Ride cancelled");
    },
    onError: (error) => {
      toast.error("Failed to cancel ride: " + error.message);
    },
  });
};

// Hook to get driver location updates
export const useDriverLocation = (driverId: string | null) => {
  return useQuery({
    queryKey: ["driver-location", driverId],
    queryFn: async () => {
      if (!driverId) return null;

      const { data, error } = await supabase
        .from("drivers")
        .select("current_lat, current_lng")
        .eq("id", driverId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!driverId,
    refetchInterval: 2000, // Poll every 2 seconds for location updates
  });
};
