import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trip, TripStatus } from "./useTrips";
import { Driver } from "./useDrivers";

// Fetch current driver profile for logged-in user
export const useCurrentDriver = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["current-driver", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data as Driver | null;
    },
    enabled: !!userId,
  });
};

// Fetch available trip requests (unassigned)
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
      return data as Trip[];
    },
    enabled,
    refetchInterval: 5000,
  });
};

// Fetch driver's current/active trip
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
      return data as Trip | null;
    },
    enabled: !!driverId,
    refetchInterval: 10000,
  });
};

// Fetch driver's trip history
export const useDriverTripHistory = (driverId: string | undefined) => {
  return useQuery({
    queryKey: ["driver-trip-history", driverId],
    queryFn: async () => {
      if (!driverId) return [];
      
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .eq("driver_id", driverId)
        .in("status", ["completed", "cancelled"])
        .order("completed_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as Trip[];
    },
    enabled: !!driverId,
  });
};

// Toggle driver online status
export const useToggleOnlineStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ driverId, isOnline, lat, lng }: { 
      driverId: string; 
      isOnline: boolean;
      lat?: number;
      lng?: number;
    }) => {
      const updateData: { is_online: boolean; current_lat?: number; current_lng?: number } = { 
        is_online: isOnline 
      };
      
      if (lat !== undefined && lng !== undefined) {
        updateData.current_lat = lat;
        updateData.current_lng = lng;
      }

      const { error } = await supabase
        .from("drivers")
        .update(updateData)
        .eq("id", driverId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["current-driver"] });
      queryClient.invalidateQueries({ queryKey: ["online-drivers"] });
      toast.success(variables.isOnline ? "You're now online" : "You're now offline");
    },
    onError: (error) => {
      toast.error("Failed to update status: " + error.message);
    },
  });
};

// Update driver location
export const useUpdateDriverLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ driverId, lat, lng }: { driverId: string; lat: number; lng: number }) => {
      const { error } = await supabase
        .from("drivers")
        .update({ current_lat: lat, current_lng: lng })
        .eq("id", driverId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-driver"] });
    },
  });
};

// Accept a trip request
export const useAcceptTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, driverId }: { tripId: string; driverId: string }) => {
      const { error } = await supabase
        .from("trips")
        .update({ 
          driver_id: driverId, 
          status: "accepted" as TripStatus 
        })
        .eq("id", tripId)
        .eq("status", "requested")
        .is("driver_id", null);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["available-trip-requests"] });
      queryClient.invalidateQueries({ queryKey: ["driver-active-trip"] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.success("Trip accepted!");
    },
    onError: (error) => {
      toast.error("Failed to accept trip: " + error.message);
    },
  });
};

// Update trip status (for driver flow)
export const useUpdateDriverTripStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, status }: { tripId: string; status: TripStatus }) => {
      const updateData: { status: TripStatus; started_at?: string; completed_at?: string } = { status };
      
      if (status === "in_progress") {
        updateData.started_at = new Date().toISOString();
      }
      if (status === "completed") {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("trips")
        .update(updateData)
        .eq("id", tripId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["driver-active-trip"] });
      queryClient.invalidateQueries({ queryKey: ["driver-trip-history"] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      
      const messages: Record<string, string> = {
        en_route: "Heading to pickup",
        arrived: "Marked as arrived",
        in_progress: "Trip started",
        completed: "Trip completed!",
      };
      toast.success(messages[variables.status] || "Status updated");
    },
    onError: (error) => {
      toast.error("Failed to update trip: " + error.message);
    },
  });
};

// Calculate today's earnings
export const useDriverEarnings = (driverId: string | undefined) => {
  return useQuery({
    queryKey: ["driver-earnings", driverId],
    queryFn: async () => {
      if (!driverId) return { today: 0, week: 0, trips_today: 0 };
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("trips")
        .select("fare_amount, completed_at")
        .eq("driver_id", driverId)
        .eq("status", "completed")
        .gte("completed_at", weekAgo.toISOString());

      if (error) throw error;

      const todayTrips = data?.filter(t => 
        t.completed_at && new Date(t.completed_at) >= today
      ) || [];
      
      return {
        today: todayTrips.reduce((sum, t) => sum + (t.fare_amount || 0), 0),
        week: data?.reduce((sum, t) => sum + (t.fare_amount || 0), 0) || 0,
        trips_today: todayTrips.length,
      };
    },
    enabled: !!driverId,
  });
};

// Fetch driver's active Eats order
export const useDriverActiveEatsOrder = (driverId: string | undefined) => {
  return useQuery({
    queryKey: ["driver-active-eats-order", driverId],
    queryFn: async () => {
      if (!driverId) return null;
      
      const { data, error } = await supabase
        .from("food_orders")
        .select(`
          *,
          restaurant:restaurants (
            id,
            name,
            address,
            lat,
            lng,
            phone
          )
        `)
        .eq("driver_id", driverId)
        .not("status", "in", "(completed,cancelled,delivered)")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!driverId,
    refetchInterval: 10000,
  });
};

// Fetch driver's active package delivery
export const useDriverActivePackageDelivery = (driverId: string | undefined) => {
  return useQuery({
    queryKey: ["driver-active-package-delivery", driverId],
    queryFn: async () => {
      if (!driverId) return null;
      
      const { data, error } = await supabase
        .from("package_deliveries")
        .select("*")
        .eq("driver_id", driverId)
        .in("status", ["accepted", "at_pickup", "picked_up", "at_dropoff"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!driverId,
    refetchInterval: 10000,
  });
};

// Eats order status mapping: driver flow -> database enum
type EatsDriverStatus = "ready_for_pickup" | "in_progress" | "completed" | "cancelled";

// Update Eats order status (for driver flow)
export const useUpdateDriverEatsOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status, proofPhotoUrl }: { 
      orderId: string; 
      status: EatsDriverStatus;
      proofPhotoUrl?: string;
    }) => {
      const updateData: { 
        status: EatsDriverStatus; 
        delivered_at?: string; 
        delivery_photo_url?: string;
        picked_up_at?: string;
      } = { status };
      
      if (status === "completed") {
        updateData.delivered_at = new Date().toISOString();
        if (proofPhotoUrl) updateData.delivery_photo_url = proofPhotoUrl;
      }
      if (status === "in_progress") {
        updateData.picked_up_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("food_orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["driver-active-eats-order"] });
      queryClient.invalidateQueries({ queryKey: ["food-orders"] });
      
      const messages: Record<string, string> = {
        ready_for_pickup: "Arrived at restaurant",
        in_progress: "Order picked up, heading to customer",
        completed: "Order delivered!",
      };
      toast.success(messages[variables.status] || "Status updated");
    },
    onError: (error) => {
      toast.error("Failed to update order: " + error.message);
    },
  });
};

// Update package delivery status (for driver flow)
export const useUpdateDriverPackageDeliveryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ deliveryId, status, proofPhotoUrl, signatureUrl }: { 
      deliveryId: string; 
      status: string;
      proofPhotoUrl?: string;
      signatureUrl?: string;
    }) => {
      const updateData: { 
        status: string; 
        delivered_at?: string; 
        pickup_photo_url?: string;
        delivery_photo_url?: string;
        signature_url?: string;
      } = { status };
      
      if (status === "delivered") {
        updateData.delivered_at = new Date().toISOString();
        if (proofPhotoUrl) updateData.delivery_photo_url = proofPhotoUrl;
        if (signatureUrl) updateData.signature_url = signatureUrl;
      }
      if (status === "picked_up" && proofPhotoUrl) {
        updateData.pickup_photo_url = proofPhotoUrl;
      }

      const { error } = await supabase
        .from("package_deliveries")
        .update(updateData)
        .eq("id", deliveryId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["driver-active-package-delivery"] });
      queryClient.invalidateQueries({ queryKey: ["package-deliveries"] });
      
      const messages: Record<string, string> = {
        at_pickup: "Arrived at pickup",
        picked_up: "Package picked up",
        at_dropoff: "Arrived at dropoff",
        delivered: "Package delivered!",
      };
      toast.success(messages[variables.status] || "Status updated");
    },
    onError: (error) => {
      toast.error("Failed to update delivery: " + error.message);
    },
  });
};
