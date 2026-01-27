import { useQuery } from "@tanstack/react-query";
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

export const useOnlineDrivers = () => {
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
    refetchInterval: 10000, // Refresh every 10 seconds for live updates
  });
};

export const useActiveTripsWithLocations = () => {
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
