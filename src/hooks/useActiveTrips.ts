/**
 * Hook to fetch active trips for admin map overlay
 * Shows trips that are assigned, in_progress, or awaiting pickup
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ActiveTrip {
  id: string;
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_address: string;
  dropoff_lat: number;
  dropoff_lng: number;
  status: string;
  driver_id: string | null;
  rider_id: string | null;
  fare_amount: number | null;
  service_type: string | null;
  created_at: string;
  driver?: {
    id: string;
    full_name: string;
    vehicle_type: string;
    vehicle_plate: string | null;
    current_lat: number | null;
    current_lng: number | null;
  };
}

export function useActiveTrips(regionId?: string | null) {
  return useQuery({
    queryKey: ["active-trips", regionId],
    queryFn: async (): Promise<ActiveTrip[]> => {
      let query = supabase
        .from("trips")
        .select(`
          id,
          pickup_address,
          pickup_lat,
          pickup_lng,
          dropoff_address,
          dropoff_lat,
          dropoff_lng,
          status,
          driver_id,
          rider_id,
          fare_amount,
          service_type,
          created_at,
          drivers:driver_id (
            id,
            full_name,
            vehicle_type,
            vehicle_plate,
            current_lat,
            current_lng
          )
        `)
        .in("status", ["accepted", "arrived", "en_route", "in_progress"])
        .order("created_at", { ascending: false })
        .limit(50);

      if (regionId) {
        query = query.eq("region_id", regionId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching active trips:", error);
        throw error;
      }

      // Transform the data to flatten the driver relation
      return (data || []).map((trip: any) => ({
        ...trip,
        driver: trip.drivers || undefined,
        drivers: undefined
      }));
    },
    refetchInterval: 15000, // Refresh every 15 seconds
    staleTime: 10000,
  });
}

export function useUnassignedTrips(regionId?: string | null) {
  return useQuery({
    queryKey: ["unassigned-trips", regionId],
    queryFn: async (): Promise<ActiveTrip[]> => {
      let query = supabase
        .from("trips")
        .select(`
          id,
          pickup_address,
          pickup_lat,
          pickup_lng,
          dropoff_address,
          dropoff_lat,
          dropoff_lng,
          status,
          driver_id,
          rider_id,
          fare_amount,
          service_type,
          created_at
        `)
        .eq("status", "requested")
        .is("driver_id", null)
        .order("created_at", { ascending: true })
        .limit(20);

      if (regionId) {
        query = query.eq("region_id", regionId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching unassigned trips:", error);
        throw error;
      }

      return data || [];
    },
    refetchInterval: 10000, // Refresh every 10 seconds for urgent dispatch
    staleTime: 5000,
  });
}
