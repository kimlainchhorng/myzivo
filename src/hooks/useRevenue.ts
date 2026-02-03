/**
 * Revenue Analytics Hook
 * Track ZIVO platform revenue across all services
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

export interface RevenueRecord {
  id: string;
  service_type: string;
  revenue_type: string;
  reference_type: string | null;
  reference_id: string | null;
  partner_type: string | null;
  partner_id: string | null;
  gross_transaction: number;
  zivo_revenue: number;
  currency: string;
  period_date: string;
  created_at: string;
}

export interface DailyRevenue {
  report_date: string;
  service_type: string;
  total_gmv: number;
  total_revenue: number;
  total_commissions: number;
  total_service_fees: number;
  total_subscriptions: number;
  transaction_count: number;
}

export interface RevenueSummary {
  totalGMV: number;
  totalRevenue: number;
  revenueByService: Record<string, number>;
  gmvByService: Record<string, number>;
  topPartners: Array<{
    partner_id: string;
    partner_type: string;
    total_gmv: number;
    zivo_revenue: number;
  }>;
  dailyTrend: Array<{
    date: string;
    gmv: number;
    revenue: number;
  }>;
}

// Fetch revenue summary for a date range
export function useRevenueSummary(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: ["revenue-summary", startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      // Fetch daily aggregates
      const { data: dailyData, error: dailyError } = await (supabase as any)
        .from("zivo_revenue_daily")
        .select("*")
        .gte("report_date", format(startDate, "yyyy-MM-dd"))
        .lte("report_date", format(endDate, "yyyy-MM-dd"))
        .order("report_date");

      if (dailyError) throw dailyError;

      // Calculate totals from daily data
      let totalGMV = 0;
      let totalRevenue = 0;
      const revenueByService: Record<string, number> = {};
      const gmvByService: Record<string, number> = {};
      const dailyMap: Record<string, { gmv: number; revenue: number }> = {};

      (dailyData || []).forEach((d: DailyRevenue) => {
        totalGMV += Number(d.total_gmv);
        totalRevenue += Number(d.total_revenue);

        revenueByService[d.service_type] =
          (revenueByService[d.service_type] || 0) + Number(d.total_revenue);
        gmvByService[d.service_type] =
          (gmvByService[d.service_type] || 0) + Number(d.total_gmv);

        if (!dailyMap[d.report_date]) {
          dailyMap[d.report_date] = { gmv: 0, revenue: 0 };
        }
        dailyMap[d.report_date].gmv += Number(d.total_gmv);
        dailyMap[d.report_date].revenue += Number(d.total_revenue);
      });

      // Format daily trend
      const dailyTrend = Object.entries(dailyMap).map(([date, data]) => ({
        date,
        gmv: data.gmv,
        revenue: data.revenue,
      }));

      // Fetch top partners
      const { data: partnerData } = await (supabase as any)
        .from("zivo_revenue")
        .select("partner_id, partner_type")
        .gte("period_date", format(startDate, "yyyy-MM-dd"))
        .lte("period_date", format(endDate, "yyyy-MM-dd"))
        .not("partner_id", "is", null)
        .limit(100);

      // Aggregate partner revenue (simplified)
      const partnerRevenue: Record<
        string,
        { partner_type: string; total_gmv: number; zivo_revenue: number }
      > = {};

      // Note: In production, this would be a proper aggregate query
      const topPartners = Object.entries(partnerRevenue)
        .map(([partner_id, data]) => ({
          partner_id,
          partner_type: data.partner_type,
          total_gmv: data.total_gmv,
          zivo_revenue: data.zivo_revenue,
        }))
        .sort((a, b) => b.zivo_revenue - a.zivo_revenue)
        .slice(0, 10);

      return {
        totalGMV,
        totalRevenue,
        revenueByService,
        gmvByService,
        topPartners,
        dailyTrend,
      } as RevenueSummary;
    },
  });
}

// Quick stats for dashboard
export function useRevenueQuickStats() {
  return useQuery({
    queryKey: ["revenue-quick-stats"],
    queryFn: async () => {
      const today = new Date();
      const yesterday = subDays(today, 1);
      const thisMonthStart = startOfMonth(today);
      const lastMonthStart = startOfMonth(subDays(thisMonthStart, 1));
      const lastMonthEnd = endOfMonth(subDays(thisMonthStart, 1));

      // Today's revenue
      const { data: todayData } = await (supabase as any)
        .from("zivo_revenue_daily")
        .select("total_gmv, total_revenue")
        .eq("report_date", format(today, "yyyy-MM-dd"));

      // Yesterday's revenue
      const { data: yesterdayData } = await (supabase as any)
        .from("zivo_revenue_daily")
        .select("total_gmv, total_revenue")
        .eq("report_date", format(yesterday, "yyyy-MM-dd"));

      // This month's revenue
      const { data: thisMonthData } = await (supabase as any)
        .from("zivo_revenue_daily")
        .select("total_gmv, total_revenue")
        .gte("report_date", format(thisMonthStart, "yyyy-MM-dd"))
        .lte("report_date", format(today, "yyyy-MM-dd"));

      // Last month's revenue
      const { data: lastMonthData } = await (supabase as any)
        .from("zivo_revenue_daily")
        .select("total_gmv, total_revenue")
        .gte("report_date", format(lastMonthStart, "yyyy-MM-dd"))
        .lte("report_date", format(lastMonthEnd, "yyyy-MM-dd"));

      const sumRevenue = (data: any[]) =>
        (data || []).reduce(
          (acc, d) => ({
            gmv: acc.gmv + Number(d.total_gmv),
            revenue: acc.revenue + Number(d.total_revenue),
          }),
          { gmv: 0, revenue: 0 }
        );

      const todayStats = sumRevenue(todayData || []);
      const yesterdayStats = sumRevenue(yesterdayData || []);
      const thisMonthStats = sumRevenue(thisMonthData || []);
      const lastMonthStats = sumRevenue(lastMonthData || []);

      // Calculate growth
      const dailyGrowth =
        yesterdayStats.revenue > 0
          ? ((todayStats.revenue - yesterdayStats.revenue) / yesterdayStats.revenue) * 100
          : 0;

      const monthlyGrowth =
        lastMonthStats.revenue > 0
          ? ((thisMonthStats.revenue - lastMonthStats.revenue) / lastMonthStats.revenue) * 100
          : 0;

      return {
        today: todayStats,
        yesterday: yesterdayStats,
        thisMonth: thisMonthStats,
        lastMonth: lastMonthStats,
        dailyGrowth,
        monthlyGrowth,
      };
    },
  });
}

// Revenue by service breakdown
export function useRevenueByService(days = 30) {
  return useQuery({
    queryKey: ["revenue-by-service", days],
    queryFn: async () => {
      const startDate = subDays(new Date(), days);

      const { data, error } = await (supabase as any)
        .from("zivo_revenue_daily")
        .select("service_type, total_gmv, total_revenue, transaction_count")
        .gte("report_date", format(startDate, "yyyy-MM-dd"));

      if (error) throw error;

      // Aggregate by service
      const byService: Record<
        string,
        { gmv: number; revenue: number; transactions: number }
      > = {};

      (data || []).forEach((d: any) => {
        if (!byService[d.service_type]) {
          byService[d.service_type] = { gmv: 0, revenue: 0, transactions: 0 };
        }
        byService[d.service_type].gmv += Number(d.total_gmv);
        byService[d.service_type].revenue += Number(d.total_revenue);
        byService[d.service_type].transactions += d.transaction_count;
      });

      return Object.entries(byService).map(([service, data]) => ({
        service,
        ...data,
        margin: data.gmv > 0 ? (data.revenue / data.gmv) * 100 : 0,
      }));
    },
  });
}

// Service labels and colors
export const SERVICE_COLORS: Record<string, string> = {
  flights: "#3B82F6",
  cars: "#F97316",
  p2p_cars: "#10B981",
  rides: "#EAB308",
  eats: "#EF4444",
  move: "#8B5CF6",
  hotels: "#14B8A6",
};

export const SERVICE_LABELS: Record<string, string> = {
  flights: "Flights",
  cars: "Car Rental",
  p2p_cars: "P2P Cars",
  rides: "Rides",
  eats: "Eats",
  move: "Move",
  hotels: "Hotels",
};
