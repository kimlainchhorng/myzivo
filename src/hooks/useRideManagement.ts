/**
 * useRideManagement Hook
 * Manages ride CRUD operations with realtime subscriptions for admin dashboard
 */

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type TripStatus = "requested" | "accepted" | "en_route" | "arrived" | "in_progress" | "completed" | "cancelled";

export interface Trip {
  id: string;
  rider_id: string | null;
  driver_id: string | null;
  pickup_address: string | null;
  dropoff_address: string | null;
  pickup_lat: number | null;
  pickup_lng: number | null;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
  fare_amount: number | null;
  distance_km: number | null;
  status: TripStatus | null;
  payment_status: string | null;
  ride_type: string | null;
  created_at: string;
  accepted_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  driver?: {
    id: string;
    full_name: string;
    phone: string;
    vehicle_model: string | null;
    vehicle_plate: string | null;
  } | null;
}

export interface RideFilters {
  status: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  search: string;
}

export function useRideManagement(filters: RideFilters) {
  const queryClient = useQueryClient();

  // Fetch rides with filters
  const { data: rides, isLoading, refetch } = useQuery({
    queryKey: ["admin-rides", filters],
    queryFn: async () => {
      let query = supabase
        .from("trips")
        .select(`
          *,
          driver:drivers(id, full_name, phone, vehicle_model, vehicle_plate)
        `)
        .order("created_at", { ascending: false })
        .limit(200);

      // Apply status filter
      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status as TripStatus);
      }

      // Apply date range filter
      if (filters.dateFrom) {
        query = query.gte("created_at", filters.dateFrom.toISOString());
      }
      if (filters.dateTo) {
        const endOfDay = new Date(filters.dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte("created_at", endOfDay.toISOString());
      }

      // Apply search filter (pickup or dropoff address)
      if (filters.search) {
        query = query.or(`pickup_address.ilike.%${filters.search}%,dropoff_address.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      // Map the response to our Trip interface
      return (data || []).map((item) => ({
        id: item.id,
        rider_id: item.rider_id,
        driver_id: item.driver_id,
        pickup_address: item.pickup_address,
        dropoff_address: item.dropoff_address,
        pickup_lat: item.pickup_lat,
        pickup_lng: item.pickup_lng,
        dropoff_lat: item.dropoff_lat,
        dropoff_lng: item.dropoff_lng,
        fare_amount: item.fare_amount,
        distance_km: item.distance_km,
        status: item.status as TripStatus | null,
        payment_status: item.payment_status,
        ride_type: item.ride_type,
        created_at: item.created_at,
        accepted_at: item.accepted_at,
        started_at: item.started_at,
        completed_at: item.completed_at,
        cancelled_at: item.cancelled_at,
        customer_name: item.customer_name,
        customer_phone: item.customer_phone,
        driver: item.driver,
      })) as Trip[];
    },
    staleTime: 10000,
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("admin-rides-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trips" },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Update ride mutation
  const updateRide = useMutation({
    mutationFn: async ({ tripId, updates }: { tripId: string; updates: Record<string, unknown> }) => {
      const { error } = await supabase
        .from("trips")
        .update(updates)
        .eq("id", tripId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rides"] });
      toast.success("Ride updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update ride: " + error.message);
    },
  });

  // Assign driver to ride
  const assignDriver = useCallback(async (tripId: string, driverId: string) => {
    return updateRide.mutateAsync({
      tripId,
      updates: {
        driver_id: driverId,
        status: "accepted",
        accepted_at: new Date().toISOString(),
      },
    });
  }, [updateRide]);

  // Cancel ride
  const cancelRide = useCallback(async (tripId: string) => {
    return updateRide.mutateAsync({
      tripId,
      updates: {
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
      },
    });
  }, [updateRide]);

  // Mark ride as completed
  const completeRide = useCallback(async (tripId: string) => {
    return updateRide.mutateAsync({
      tripId,
      updates: {
        status: "completed",
        completed_at: new Date().toISOString(),
        payment_status: "paid",
      },
    });
  }, [updateRide]);

  return {
    rides: rides || [],
    isLoading,
    refetch,
    updateRide: updateRide.mutate,
    assignDriver,
    cancelRide,
    completeRide,
    isUpdating: updateRide.isPending,
  };
}

// Fetch online drivers for assignment
export function useOnlineDrivers() {
  return useQuery({
    queryKey: ["online-drivers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("id, full_name, phone, vehicle_model, vehicle_plate, is_online, current_lat, current_lng")
        .eq("is_online", true)
        .eq("status", "verified")
        .order("full_name");

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
