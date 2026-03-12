/**
 * useDriverDashboardData - Aggregated driver stats from Supabase
 * Replaces useTodayStats, useDailyGoal, useDriverRating from reference project
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TodayStats {
  todayEarnings: number;
  todayDeliveries: number;
  todayTips: number;
  weekEarnings: number;
  weekDeliveries: number;
  weekTips: number;
  hoursOnline: number;
  acceptanceRate: number;
  rating: number;
  dailyGoal: number;
}

const DEFAULT_STATS: TodayStats = {
  todayEarnings: 0,
  todayDeliveries: 0,
  todayTips: 0,
  weekEarnings: 0,
  weekDeliveries: 0,
  weekTips: 0,
  hoursOnline: 0,
  acceptanceRate: 100,
  rating: 5.0,
  dailyGoal: 150,
};

export function useDriverDashboardData() {
  const [stats, setStats] = useState<TodayStats>(DEFAULT_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [driverId, setDriverId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setDriverId(data.user?.id ?? null);
    });
  }, []);

  const fetchStats = useCallback(async () => {
    if (!driverId) return;
    setIsLoading(true);

    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      // Fetch driver profile
      const { data: driver } = await supabase
        .from("drivers")
        .select("rating, total_trips")
        .eq("id", driverId)
        .maybeSingle();

      // Fetch today's completed food orders
      const { data: todayOrders } = await supabase
        .from("food_orders")
        .select("delivery_fee, tip_amount, completed_at")
        .eq("driver_id", driverId)
        .gte("completed_at", todayStart.toISOString())
        .in("status", ["delivered", "completed"]);

      // Fetch week's completed food orders
      const { data: weekOrders } = await supabase
        .from("food_orders")
        .select("delivery_fee, tip_amount, completed_at")
        .eq("driver_id", driverId)
        .gte("completed_at", weekStart.toISOString())
        .in("status", ["delivered", "completed"]);

      const todayEarnings = (todayOrders || []).reduce((sum, o) => sum + (o.delivery_fee || 0), 0);
      const todayTips = (todayOrders || []).reduce((sum, o) => sum + (o.tip_amount || 0), 0);
      const weekEarnings = (weekOrders || []).reduce((sum, o) => sum + (o.delivery_fee || 0), 0);
      const weekTips = (weekOrders || []).reduce((sum, o) => sum + (o.tip_amount || 0), 0);

      setStats({
        todayEarnings: todayEarnings + todayTips,
        todayDeliveries: todayOrders?.length || 0,
        todayTips,
        weekEarnings: weekEarnings + weekTips,
        weekDeliveries: weekOrders?.length || 0,
        weekTips,
        hoursOnline: 0, // Would need a work session tracker
        acceptanceRate: 100,
        rating: driver?.rating || 5.0,
        dailyGoal: 150,
      });
    } catch (err) {
      console.error("Failed to fetch driver stats:", err);
    } finally {
      setIsLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, refetch: fetchStats, driverId };
}
