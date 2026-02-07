import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type DriverAppStatus = "offline" | "online" | "busy";

export interface DriverProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  vehicle_type: string;
  vehicle_model: string | null;
  vehicle_plate: string;
  avatar_url: string | null;
  rating: number | null;
  total_trips: number | null;
  is_online: boolean | null;
  current_lat: number | null;
  current_lng: number | null;
  status: string | null;
}

export interface TripRequest {
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
  created_at: string;
}

// Hook to get current driver profile
export const useDriverProfile = () => {
  return useQuery({
    queryKey: ["driver-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data as DriverProfile;
    },
  });
};

// Hook to update driver online status
export const useUpdateDriverStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ driverId, isOnline }: { driverId: string; isOnline: boolean }) => {
      const { error } = await supabase
        .from("drivers")
        .update({ 
          is_online: isOnline,
          updated_at: new Date().toISOString()
        })
        .eq("id", driverId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["driver-profile"] });
      toast.success(variables.isOnline ? "You are now online" : "You are now offline");
    },
    onError: (error) => {
      toast.error("Failed to update status: " + error.message);
    },
  });
};

// Hook to update driver location
export const useUpdateDriverLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ driverId, lat, lng }: { driverId: string; lat: number; lng: number }) => {
      const { error } = await supabase
        .from("drivers")
        .update({ 
          current_lat: lat,
          current_lng: lng,
          updated_at: new Date().toISOString()
        })
        .eq("id", driverId);

      if (error) throw error;
    },
    onError: (error) => {
      console.error("Failed to update location:", error);
    },
  });
};

// Hook for location tracking
export const useDriverLocationTracking = (driverId: string | undefined, isOnline: boolean) => {
  const updateLocation = useUpdateDriverLocation();
  const [watchId, setWatchId] = useState<number | null>(null);

  // Simulated location for fallback
  const simulateLocation = useCallback((baseLat: number, baseLng: number) => {
    if (!driverId) return;
    
    const lat = baseLat + (Math.random() - 0.5) * 0.001;
    const lng = baseLng + (Math.random() - 0.5) * 0.001;
    
    updateLocation.mutate({ driverId, lat, lng });
  }, [driverId, updateLocation]);

  useEffect(() => {
    if (!driverId || !isOnline) {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      return;
    }

    // Try to get real location
    if (navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          updateLocation.mutate({
            driverId,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Geolocation error, using simulation:", error);
          // Fallback to simulation - Baton Rouge area
          const interval = setInterval(() => {
            simulateLocation(30.4515, -91.1871);
          }, 5000);
          return () => clearInterval(interval);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        }
      );
      setWatchId(id);
    } else {
      // No geolocation support, use simulation
      const interval = setInterval(() => {
        simulateLocation(30.4515, -91.1871);
      }, 5000);
      return () => clearInterval(interval);
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [driverId, isOnline, updateLocation, simulateLocation, watchId]);
};

// Hook to get available trip requests
export const useAvailableTripRequests = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["available-trip-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("status", "requested")
        .is("driver_id", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TripRequest[];
    },
    enabled,
    refetchInterval: 5000, // Poll every 5 seconds
  });
};

// Hook to accept a trip
export const useAcceptTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, driverId }: { tripId: string; driverId: string }) => {
      const { data, error } = await supabase
        .from("trips")
        .update({ 
          status: "accepted",
          driver_id: driverId,
          updated_at: new Date().toISOString()
        })
        .eq("id", tripId)
        .eq("status", "requested") // Only accept if still requested
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["available-trip-requests"] });
      queryClient.invalidateQueries({ queryKey: ["driver-active-trip"] });
      toast.success("Trip accepted!");
    },
    onError: (error) => {
      toast.error("Failed to accept trip: " + error.message);
    },
  });
};

// Hook to get driver's active trip
export const useDriverActiveTrip = (driverId: string | undefined) => {
  return useQuery({
    queryKey: ["driver-active-trip", driverId],
    queryFn: async () => {
      if (!driverId) return null;

      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("driver_id", driverId)
        .in("status", ["accepted", "en_route", "arrived", "in_progress"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as TripRequest | null;
    },
    enabled: !!driverId,
    refetchInterval: 3000,
  });
};

// Hook to update trip status
export const useUpdateTripStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, status }: { tripId: string; status: string }) => {
      // Cast status to the expected enum type
      const tripStatus = status as "requested" | "accepted" | "en_route" | "arrived" | "in_progress" | "completed" | "cancelled";
      
      const { error } = await supabase
        .from("trips")
        .update({ 
          status: tripStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", tripId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["driver-active-trip"] });
      queryClient.invalidateQueries({ queryKey: ["available-trip-requests"] });
      
      const statusMessages: Record<string, string> = {
        en_route: "Heading to pickup",
        arrived: "Marked as arrived",
        in_progress: "Trip started",
        completed: "Trip completed!",
        cancelled: "Trip cancelled",
      };
      
      toast.success(statusMessages[variables.status] || "Status updated");
    },
    onError: (error) => {
      toast.error("Failed to update trip: " + error.message);
    },
  });
};

// Valid trip status type
export type TripStatusType = "requested" | "accepted" | "en_route" | "arrived" | "in_progress" | "completed" | "cancelled";

// Realtime subscription for available trips
export const useAvailableTripsRealtime = (enabled: boolean = true) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel("available-trips")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trips",
          filter: "status=eq.requested",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["available-trip-requests"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, queryClient]);
};
