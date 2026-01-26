import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trip } from "./useTrips";

export const useRiderTripHistory = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["rider-trip-history", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("trips")
        .select(`
          *,
          driver:drivers(full_name, vehicle_model, vehicle_plate, rating, avatar_url)
        `)
        .eq("rider_id", userId)
        .in("status", ["completed", "cancelled"])
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as (Trip & { driver: { full_name: string; vehicle_model: string; vehicle_plate: string; rating: number; avatar_url: string | null } | null })[];
    },
    enabled: !!userId,
  });
};
