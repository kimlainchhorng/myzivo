import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SupabaseErrorInfo } from "@/lib/supabaseErrors";
import {
  acceptTripWithRetry,
  updateTripStatusWithRetry,
  updateDriverStatusWithRetry,
} from "@/lib/supabaseDriverOperations";

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

// Hook to update driver online status with retry
export const useUpdateDriverStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ driverId, isOnline }: { driverId: string; isOnline: boolean }) => {
      const result = await updateDriverStatusWithRetry(driverId, isOnline);
      
      if (result.error) {
        const err = new Error(result.error.userMessage);
        (err as any).errorInfo = result.error;
        (err as any).attempts = result.attempts;
        throw err;
      }
      
      return { isOnline };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["driver-profile"] });
      toast.success(data.isOnline ? "You are now online" : "You are now offline");
    },
    onError: (error: Error & { errorInfo?: SupabaseErrorInfo; attempts?: number }) => {
      const info = error.errorInfo;
      
      if (info?.isRetryable) {
        toast.error("Failed to update status", {
          description: info.userMessage,
        });
      } else {
        toast.error(info?.userMessage || error.message);
      }
    },
  });
};

// Hook to update driver location via edge function (with GPS spoof detection)
export const useUpdateDriverLocation = () => {
  const locationFailuresRef = useRef(0);
  const [isSuspended, setIsSuspended] = useState(false);

  const mutation = useMutation({
    mutationFn: async ({ driverId, lat, lng, heading, speed, accuracy }: { 
      driverId: string; 
      lat: number; 
      lng: number;
      heading?: number | null;
      speed?: number | null;
      accuracy?: number | null;
    }) => {
      // Call edge function for GPS spoof detection
      const { data, error } = await supabase.functions.invoke("update-driver-location", {
        body: { lat, lng, heading, speed, accuracy },
      });

      if (error) {
        locationFailuresRef.current++;
        
        // Only warn after 3 consecutive failures
        if (locationFailuresRef.current >= 3) {
          console.warn("[Location] Multiple update failures, driver may appear offline to riders");
        }
        
        throw new Error("Location update failed");
      }

      // Check for suspension
      if (data?.suspended) {
        setIsSuspended(true);
        throw new Error("Account suspended");
      }

      // Reset on success
      locationFailuresRef.current = 0;
      
      return { 
        lat, 
        lng, 
        suspicious: data?.suspicious ?? false,
        speed_mph: data?.speed_mph ?? null,
      };
    },
    onError: (error: Error) => {
      if (error.message === "Account suspended") {
        toast.error("Account Suspended", {
          description: "Your account has been suspended due to GPS anomalies. Contact support.",
        });
      }
      // Silent failure for other location update errors
    },
  });

  return { ...mutation, isSuspended };
};

// Hook for location tracking with GPS spoof detection
export const useDriverLocationTracking = (driverId: string | undefined, isOnline: boolean) => {
  const { mutate: updateLocation, isSuspended } = useUpdateDriverLocation();
  const [watchId, setWatchId] = useState<number | null>(null);

  // Simulated location for fallback
  const simulateLocation = useCallback((baseLat: number, baseLng: number) => {
    if (!driverId) return;
    
    const lat = baseLat + (Math.random() - 0.5) * 0.001;
    const lng = baseLng + (Math.random() - 0.5) * 0.001;
    
    updateLocation({ driverId, lat, lng, heading: null, speed: null, accuracy: null });
  }, [driverId, updateLocation]);

  useEffect(() => {
    if (!driverId || !isOnline || isSuspended) {
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
          updateLocation({
            driverId,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            heading: position.coords.heading,
            speed: position.coords.speed,
            accuracy: position.coords.accuracy,
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
  }, [driverId, isOnline, isSuspended, updateLocation, simulateLocation, watchId]);

  return { isSuspended };
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

// Hook to accept a trip with retry and race condition handling
export const useAcceptTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, driverId }: { tripId: string; driverId: string }) => {
      const result = await acceptTripWithRetry(tripId, driverId);
      
      if (result.error) {
        const err = new Error(result.error.userMessage);
        (err as any).errorInfo = result.error;
        (err as any).attempts = result.attempts;
        throw err;
      }
      
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["available-trip-requests"] });
      queryClient.invalidateQueries({ queryKey: ["driver-active-trip"] });
      toast.success("Trip accepted!");
    },
    onError: (error: Error & { errorInfo?: SupabaseErrorInfo; attempts?: number }) => {
      const info = error.errorInfo;
      
      if (info?.message === "Trip already taken") {
        toast.error("Ride unavailable", {
          description: "Another driver accepted this trip.",
        });
      } else if (info?.isRetryable) {
        toast.error("Failed to accept", {
          description: info.userMessage,
        });
      } else {
        toast.error(info?.userMessage || error.message);
      }
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

// Hook to update trip status with retry
export const useUpdateTripStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, status }: { tripId: string; status: string }) => {
      const result = await updateTripStatusWithRetry(tripId, status);
      
      if (result.error) {
        const err = new Error(result.error.userMessage);
        (err as any).errorInfo = result.error;
        (err as any).attempts = result.attempts;
        throw err;
      }
      
      return { status };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["driver-active-trip"] });
      queryClient.invalidateQueries({ queryKey: ["available-trip-requests"] });
      
      const statusMessages: Record<string, string> = {
        en_route: "Heading to pickup",
        arrived: "Marked as arrived",
        in_progress: "Trip started",
        completed: "Trip completed!",
        cancelled: "Trip cancelled",
      };
      
      toast.success(statusMessages[data.status] || "Status updated");
    },
    onError: (error: Error & { errorInfo?: SupabaseErrorInfo; attempts?: number }) => {
      const info = error.errorInfo;
      
      if (info?.isRetryable) {
        toast.error("Failed to update status", {
          description: info.userMessage,
        });
      } else {
        toast.error(info?.userMessage || error.message);
      }
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
