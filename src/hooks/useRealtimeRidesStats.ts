import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface RealtimeRidesStats {
  totalRidesToday: number;
  activeRides: number;
  completedRides: number;
  cancelledRides: number;
  onlineDrivers: number;
  totalRevenue: number;
  platformCommission: number; // 15% of revenue
  avgFare: number;
  isLoading: boolean;
}

const COMMISSION_RATE = 0.15; // 15% platform commission

export function useRealtimeRidesStats() {
  const [stats, setStats] = useState<RealtimeRidesStats>({
    totalRidesToday: 0,
    activeRides: 0,
    completedRides: 0,
    cancelledRides: 0,
    onlineDrivers: 0,
    totalRevenue: 0,
    platformCommission: 0,
    avgFare: 0,
    isLoading: true,
  });

  const fetchStats = useCallback(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const activeStatuses = ["requested", "accepted", "en_route", "arrived", "in_progress"];

    try {
      const [tripsResult, driversResult] = await Promise.all([
        supabase
          .from("trips")
          .select("id, status, fare_amount, payment_status, created_at")
          .gte("created_at", todayISO),
        supabase
          .from("drivers")
          .select("id", { count: "exact", head: true })
          .eq("is_online", true),
      ]);

      const todayTrips = tripsResult.data || [];
      
      const activeRides = todayTrips.filter(t => 
        activeStatuses.includes(t.status || "")
      ).length;
      
      const completedRides = todayTrips.filter(t => 
        t.status === "completed"
      ).length;
      
      const cancelledRides = todayTrips.filter(t => 
        t.status === "cancelled"
      ).length;

      // Calculate revenue from paid trips
      const paidTrips = todayTrips.filter(t => t.payment_status === "paid");
      const totalRevenue = paidTrips.reduce(
        (sum, t) => sum + (t.fare_amount || 0), 
        0
      );

      const avgFare = paidTrips.length > 0 
        ? totalRevenue / paidTrips.length 
        : 0;

      setStats({
        totalRidesToday: todayTrips.length,
        activeRides,
        completedRides,
        cancelledRides,
        onlineDrivers: driversResult.count || 0,
        totalRevenue,
        platformCommission: totalRevenue * COMMISSION_RATE,
        avgFare,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching realtime stats:", error);
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchStats();

    // Subscribe to trips changes
    const tripsChannel = supabase
      .channel("admin-realtime-trips")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trips" },
        () => fetchStats()
      )
      .subscribe();

    // Subscribe to drivers changes (online status)
    const driversChannel = supabase
      .channel("admin-realtime-drivers")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "drivers" },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tripsChannel);
      supabase.removeChannel(driversChannel);
    };
  }, [fetchStats]);

  return stats;
}
