import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type OnlineDriver = {
  id: string;
  full_name: string;
  vehicle_type: string;
  vehicle_model: string | null;
  vehicle_plate: string;
  current_lat: number | null;
  current_lng: number | null;
  is_online: boolean | null;
  status: string | null;
  avatar_url: string | null;
  rating: number | null;
  phone: string;
};

export const useOnlineDrivers = (enableRealtime: boolean = true) => {
  const queryClient = useQueryClient();

  // Subscribe to realtime driver updates
  useEffect(() => {
    if (!enableRealtime) return;

    const channel = supabase
      .channel("online-drivers-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "drivers",
        },
        () => {
          // Invalidate and refetch on any driver change
          queryClient.invalidateQueries({ queryKey: ["online-drivers"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enableRealtime, queryClient]);

  return useQuery({
    queryKey: ["online-drivers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("id, full_name, vehicle_type, vehicle_model, vehicle_plate, current_lat, current_lng, is_online, status, avatar_url, rating, phone")
        .eq("is_online", true)
        .eq("status", "verified")
        .not("current_lat", "is", null)
        .not("current_lng", "is", null);

      if (error) throw error;
      return data as OnlineDriver[];
    },
    refetchInterval: 10000,
  });
};

// Fetch all drivers with location for admin map view (regardless of online status)
export const useAllDriversWithLocation = (enableRealtime: boolean = true) => {
  const queryClient = useQueryClient();

  // Subscribe to realtime driver updates
  useEffect(() => {
    if (!enableRealtime) return;

    const channel = supabase
      .channel("all-drivers-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "drivers",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["all-drivers-location"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enableRealtime, queryClient]);

  return useQuery({
    queryKey: ["all-drivers-location"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("id, full_name, vehicle_type, vehicle_model, vehicle_plate, current_lat, current_lng, is_online, status, avatar_url, rating, phone")
        .not("current_lat", "is", null)
        .not("current_lng", "is", null);

      if (error) throw error;
      return data as OnlineDriver[];
    },
    refetchInterval: 15000,
  });
};

export const useActiveTripsWithLocations = (enableRealtime: boolean = true) => {
  const queryClient = useQueryClient();

  // Subscribe to realtime trip updates
  useEffect(() => {
    if (!enableRealtime) return;

    const channel = supabase
      .channel("active-trips-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trips",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["active-trips-locations"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enableRealtime, queryClient]);

  return useQuery({
    queryKey: ["active-trips-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select(`
          id,
          pickup_lat,
          pickup_lng,
          pickup_address,
          dropoff_lat,
          dropoff_lng,
          dropoff_address,
          status,
          driver:drivers(id, full_name, current_lat, current_lng, vehicle_type)
        `)
        .in("status", ["requested", "accepted", "en_route", "arrived", "in_progress"]);

      if (error) throw error;
      return data;
    },
    refetchInterval: 10000,
  });
};
