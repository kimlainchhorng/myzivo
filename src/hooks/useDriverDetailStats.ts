import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DriverDetailStats {
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  totalEarnings: number;
  platformCommission: number; // 15% of earnings
  completionRate: number; // percentage
  avgRating: number;
  avgFare: number;
}

export interface DriverTrip {
  id: string;
  pickup_address: string;
  dropoff_address: string;
  fare_amount: number | null;
  status: string | null;
  created_at: string;
  completed_at: string | null;
}

const COMMISSION_RATE = 0.15;

export function useDriverDetailStats(driverId: string | undefined) {
  return useQuery({
    queryKey: ["driver-detail-stats", driverId],
    queryFn: async () => {
      if (!driverId) throw new Error("Driver ID required");

      // Fetch all trips for this driver
      const { data: trips, error } = await supabase
        .from("trips")
        .select("id, fare_amount, status, payment_status, created_at, completed_at")
        .eq("driver_id", driverId);

      if (error) throw error;

      const allTrips = trips || [];
      const completedTrips = allTrips.filter(t => t.status === "completed");
      const cancelledTrips = allTrips.filter(t => t.status === "cancelled");
      const paidTrips = allTrips.filter(t => t.payment_status === "paid");

      const totalEarnings = paidTrips.reduce(
        (sum, t) => sum + (t.fare_amount || 0), 
        0
      );

      const avgFare = paidTrips.length > 0 
        ? totalEarnings / paidTrips.length 
        : 0;

      const completionRate = allTrips.length > 0
        ? (completedTrips.length / allTrips.length) * 100
        : 0;

      // Fetch driver's rating
      const { data: driver } = await supabase
        .from("drivers")
        .select("rating")
        .eq("id", driverId)
        .single();

      const stats: DriverDetailStats = {
        totalRides: allTrips.length,
        completedRides: completedTrips.length,
        cancelledRides: cancelledTrips.length,
        totalEarnings,
        platformCommission: totalEarnings * COMMISSION_RATE,
        completionRate,
        avgRating: driver?.rating || 0,
        avgFare,
      };

      return stats;
    },
    enabled: !!driverId,
  });
}

export function useDriverRecentTrips(driverId: string | undefined, limit = 20) {
  return useQuery({
    queryKey: ["driver-recent-trips", driverId, limit],
    queryFn: async () => {
      if (!driverId) throw new Error("Driver ID required");

      const { data, error } = await supabase
        .from("trips")
        .select("id, pickup_address, dropoff_address, fare_amount, status, created_at, completed_at")
        .eq("driver_id", driverId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as DriverTrip[];
    },
    enabled: !!driverId,
  });
}
