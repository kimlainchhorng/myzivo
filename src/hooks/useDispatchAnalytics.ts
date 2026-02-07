/**
 * useDispatchAnalytics - Analytics data hooks for Dispatch Dashboard
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, subDays, format, eachDayOfInterval } from "date-fns";
import { useEffect } from "react";

export interface DateRange {
  start: Date;
  end: Date;
}

export interface AnalyticsKPIs {
  ordersTotal: number;
  ordersDelivered: number;
  ordersCancelled: number;
  revenueTotal: number;
  profitTotal: number;
  driversOnline: number;
  avgOrderValue: number;
  completionRate: number;
}

export interface DailyMetrics {
  date: string;
  orders: number;
  revenue: number;
  profit: number;
  delivered: number;
  cancelled: number;
}

export interface DriverStats {
  driverId: string;
  driverName: string;
  totalOrders: number;
  totalEarnings: number;
}

export interface MerchantStats {
  merchantId: string;
  merchantName: string;
  totalOrders: number;
  totalRevenue: number;
}

export const useAnalyticsKPIs = (dateRange: DateRange) => {
  const query = useQuery({
    queryKey: ["dispatch-analytics-kpis", dateRange.start.toISOString(), dateRange.end.toISOString()],
    queryFn: async (): Promise<AnalyticsKPIs> => {
      const startISO = dateRange.start.toISOString();
      const endISO = dateRange.end.toISOString();

      // Get orders in date range
      const { data: orders, error: ordersError } = await supabase
        .from("food_orders")
        .select("id, status, total_amount, platform_fee")
        .gte("created_at", startISO)
        .lte("created_at", endISO);

      if (ordersError) throw ordersError;

      // Get online drivers
      const { data: onlineDrivers, error: driversError } = await supabase
        .from("drivers")
        .select("id")
        .eq("is_online", true)
        .eq("status", "verified");

      if (driversError) throw driversError;

      const ordersTotal = orders?.length || 0;
      const deliveredOrders = (orders || []).filter(o => o.status === "completed");
      const cancelledOrders = (orders || []).filter(o => o.status === "cancelled");
      
      const revenueTotal = deliveredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
      const profitTotal = deliveredOrders.reduce((sum, o) => sum + (o.platform_fee || 0), 0);
      const avgOrderValue = deliveredOrders.length > 0 ? revenueTotal / deliveredOrders.length : 0;
      const completionRate = ordersTotal > 0 
        ? (deliveredOrders.length / (deliveredOrders.length + cancelledOrders.length)) * 100 
        : 0;

      return {
        ordersTotal,
        ordersDelivered: deliveredOrders.length,
        ordersCancelled: cancelledOrders.length,
        revenueTotal,
        profitTotal,
        driversOnline: onlineDrivers?.length || 0,
        avgOrderValue,
        completionRate: isNaN(completionRate) ? 0 : completionRate,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return query;
};

export const useDailyMetrics = (dateRange: DateRange) => {
  return useQuery({
    queryKey: ["dispatch-analytics-daily", dateRange.start.toISOString(), dateRange.end.toISOString()],
    queryFn: async (): Promise<DailyMetrics[]> => {
      const startISO = dateRange.start.toISOString();
      const endISO = dateRange.end.toISOString();

      const { data: orders, error } = await supabase
        .from("food_orders")
        .select("id, status, total_amount, platform_fee, created_at")
        .gte("created_at", startISO)
        .lte("created_at", endISO);

      if (error) throw error;

      // Generate all dates in range
      const dates = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
      
      // Aggregate by date
      const dailyMap: Record<string, DailyMetrics> = {};
      
      dates.forEach(date => {
        const dateStr = format(date, "yyyy-MM-dd");
        dailyMap[dateStr] = {
          date: dateStr,
          orders: 0,
          revenue: 0,
          profit: 0,
          delivered: 0,
          cancelled: 0,
        };
      });

      (orders || []).forEach(order => {
        const dateStr = format(new Date(order.created_at), "yyyy-MM-dd");
        if (dailyMap[dateStr]) {
          dailyMap[dateStr].orders += 1;
          
          if (order.status === "completed") {
            dailyMap[dateStr].delivered += 1;
            dailyMap[dateStr].revenue += order.total_amount || 0;
            dailyMap[dateStr].profit += order.platform_fee || 0;
          } else if (order.status === "cancelled") {
            dailyMap[dateStr].cancelled += 1;
          }
        }
      });

      return Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
    },
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useTopDrivers = (dateRange: DateRange, limit: number = 10) => {
  return useQuery({
    queryKey: ["dispatch-analytics-top-drivers", dateRange.start.toISOString(), dateRange.end.toISOString(), limit],
    queryFn: async (): Promise<DriverStats[]> => {
      const startISO = dateRange.start.toISOString();
      const endISO = dateRange.end.toISOString();

      // Get driver earnings in date range
      const { data: earnings, error } = await supabase
        .from("driver_earnings")
        .select(`
          driver_id,
          net_amount,
          drivers:driver_id (full_name)
        `)
        .gte("created_at", startISO)
        .lte("created_at", endISO);

      if (error) throw error;

      // Aggregate by driver
      const driverMap: Record<string, { totalEarnings: number; orderCount: number; name: string }> = {};
      
      (earnings || []).forEach(e => {
        if (!e.driver_id) return;
        if (!driverMap[e.driver_id]) {
          driverMap[e.driver_id] = {
            totalEarnings: 0,
            orderCount: 0,
            name: (e.drivers as any)?.full_name || "Unknown",
          };
        }
        driverMap[e.driver_id].totalEarnings += e.net_amount || 0;
        driverMap[e.driver_id].orderCount += 1;
      });

      return Object.entries(driverMap)
        .map(([driverId, data]) => ({
          driverId,
          driverName: data.name,
          totalOrders: data.orderCount,
          totalEarnings: data.totalEarnings,
        }))
        .sort((a, b) => b.totalEarnings - a.totalEarnings)
        .slice(0, limit);
    },
  });
};

export const useTopMerchants = (dateRange: DateRange, limit: number = 10) => {
  return useQuery({
    queryKey: ["dispatch-analytics-top-merchants", dateRange.start.toISOString(), dateRange.end.toISOString(), limit],
    queryFn: async (): Promise<MerchantStats[]> => {
      const startISO = dateRange.start.toISOString();
      const endISO = dateRange.end.toISOString();

      // Get delivered orders with restaurant info
      const { data: orders, error } = await supabase
        .from("food_orders")
        .select(`
          restaurant_id,
          total_amount,
          restaurants:restaurant_id (name)
        `)
        .eq("status", "completed")
        .gte("created_at", startISO)
        .lte("created_at", endISO);

      if (error) throw error;

      // Aggregate by merchant
      const merchantMap: Record<string, { totalRevenue: number; orderCount: number; name: string }> = {};
      
      (orders || []).forEach(o => {
        if (!o.restaurant_id) return;
        if (!merchantMap[o.restaurant_id]) {
          merchantMap[o.restaurant_id] = {
            totalRevenue: 0,
            orderCount: 0,
            name: (o.restaurants as any)?.name || "Unknown",
          };
        }
        merchantMap[o.restaurant_id].totalRevenue += o.total_amount || 0;
        merchantMap[o.restaurant_id].orderCount += 1;
      });

      return Object.entries(merchantMap)
        .map(([merchantId, data]) => ({
          merchantId,
          merchantName: data.name,
          totalOrders: data.orderCount,
          totalRevenue: data.totalRevenue,
        }))
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, limit);
    },
  });
};

export const useOrderStatusBreakdown = (dateRange: DateRange) => {
  return useQuery({
    queryKey: ["dispatch-analytics-status", dateRange.start.toISOString(), dateRange.end.toISOString()],
    queryFn: async () => {
      const startISO = dateRange.start.toISOString();
      const endISO = dateRange.end.toISOString();

      const { data: orders, error } = await supabase
        .from("food_orders")
        .select("status")
        .gte("created_at", startISO)
        .lte("created_at", endISO);

      if (error) throw error;

      const statusCounts: Record<string, number> = {};
      (orders || []).forEach(o => {
        statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
      });

      return [
        { name: "Delivered", value: statusCounts["completed"] || 0, color: "hsl(var(--chart-2))" },
        { name: "Cancelled", value: statusCounts["cancelled"] || 0, color: "hsl(var(--destructive))" },
        { name: "In Progress", value: statusCounts["in_progress"] || 0, color: "hsl(var(--chart-3))" },
        { name: "Pending", value: statusCounts["pending"] || 0, color: "hsl(var(--chart-4))" },
        { name: "Confirmed", value: statusCounts["confirmed"] || 0, color: "hsl(var(--chart-5))" },
      ].filter(s => s.value > 0);
    },
  });
};

// Real-time subscription hook for live updates
export const useAnalyticsRealtime = (onUpdate: () => void) => {
  useEffect(() => {
    const ordersChannel = supabase
      .channel("analytics-orders-realtime")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "food_orders",
      }, () => {
        onUpdate();
      })
      .subscribe();

    const driversChannel = supabase
      .channel("analytics-drivers-realtime")
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "drivers",
      }, () => {
        onUpdate();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(driversChannel);
    };
  }, [onUpdate]);
};
