/**
 * Admin Revenue Dashboard Hooks
 * Platform-wide revenue metrics and analytics
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export interface PlatformRevenueSummary {
  totalGrossRevenue: number;
  totalCommissionEarned: number;
  totalOwnerPayouts: number;
  pendingPayouts: number;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  averageBookingValue: number;
  currentMonthRevenue: number;
  lastMonthRevenue: number;
  monthOverMonthGrowth: number;
}

export interface TopPerformingCar {
  id: string;
  make: string;
  model: string;
  year: number;
  owner_name: string;
  total_bookings: number;
  total_revenue: number;
  commission_earned: number;
  average_rating: number | null;
  image_url: string | null;
}

export interface RevenueChartData {
  month: string;
  grossRevenue: number;
  commission: number;
  bookings: number;
}

export interface CommissionByCategory {
  category: string;
  revenue: number;
  commission: number;
  bookings: number;
}

// Fetch platform revenue summary
export function usePlatformRevenueSummary() {
  return useQuery({
    queryKey: ["platformRevenueSummary"],
    queryFn: async (): Promise<PlatformRevenueSummary> => {
      const now = new Date();
      const currentMonthStart = startOfMonth(now).toISOString();
      const currentMonthEnd = endOfMonth(now).toISOString();
      const lastMonthStart = startOfMonth(subMonths(now, 1)).toISOString();
      const lastMonthEnd = endOfMonth(subMonths(now, 1)).toISOString();

      // Fetch all bookings
      const { data: bookings, error } = await supabase
        .from("p2p_bookings")
        .select("id, total_amount, owner_payout, platform_fee, status, payment_status, created_at");

      if (error) throw error;

      const allBookings = bookings || [];
      const completedBookings = allBookings.filter(b => 
        b.status === "completed" && b.payment_status === "captured"
      );
      const cancelledBookings = allBookings.filter(b => b.status === "cancelled");

      const totalGrossRevenue = completedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
      const totalCommissionEarned = completedBookings.reduce((sum, b) => sum + (b.platform_fee || 0), 0);
      const totalOwnerPayouts = completedBookings.reduce((sum, b) => sum + (b.owner_payout || 0), 0);

      // Current month
      const currentMonthBookings = completedBookings.filter(b =>
        b.created_at >= currentMonthStart && b.created_at <= currentMonthEnd
      );
      const currentMonthRevenue = currentMonthBookings.reduce((sum, b) => sum + (b.platform_fee || 0), 0);

      // Last month
      const lastMonthBookings = completedBookings.filter(b =>
        b.created_at >= lastMonthStart && b.created_at <= lastMonthEnd
      );
      const lastMonthRevenue = lastMonthBookings.reduce((sum, b) => sum + (b.platform_fee || 0), 0);

      // Pending payouts
      const { data: payouts } = await supabase
        .from("p2p_payouts")
        .select("amount, status")
        .eq("status", "pending");

      const pendingPayouts = payouts?.reduce((sum, p) => sum + p.amount, 0) || 0;

      const monthOverMonthGrowth = lastMonthRevenue > 0 
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      const averageBookingValue = completedBookings.length > 0
        ? totalGrossRevenue / completedBookings.length
        : 0;

      return {
        totalGrossRevenue,
        totalCommissionEarned,
        totalOwnerPayouts,
        pendingPayouts,
        totalBookings: allBookings.length,
        completedBookings: completedBookings.length,
        cancelledBookings: cancelledBookings.length,
        averageBookingValue: Math.round(averageBookingValue * 100) / 100,
        currentMonthRevenue,
        lastMonthRevenue,
        monthOverMonthGrowth: Math.round(monthOverMonthGrowth * 10) / 10,
      };
    },
  });
}

// Fetch top performing cars
export function useTopPerformingCars(limit: number = 10) {
  return useQuery({
    queryKey: ["topPerformingCars", limit],
    queryFn: async (): Promise<TopPerformingCar[]> => {
      // Get bookings grouped by vehicle
      const { data: bookings, error } = await supabase
        .from("p2p_bookings")
        .select(`
          vehicle_id, total_amount, platform_fee, status, payment_status,
          vehicle:p2p_vehicles!p2p_bookings_vehicle_id_fkey(
            id, make, model, year, images,
            owner:car_owner_profiles!p2p_vehicles_owner_id_fkey(full_name)
          )
        `)
        .eq("status", "completed")
        .eq("payment_status", "captured");

      if (error) throw error;

      // Aggregate by vehicle
      const vehicleStats: Record<string, {
        vehicle: any;
        total_bookings: number;
        total_revenue: number;
        commission_earned: number;
      }> = {};

      (bookings || []).forEach(b => {
        if (!b.vehicle) return;
        const vid = b.vehicle_id;
        
        if (!vehicleStats[vid]) {
          vehicleStats[vid] = {
            vehicle: b.vehicle,
            total_bookings: 0,
            total_revenue: 0,
            commission_earned: 0,
          };
        }
        
        vehicleStats[vid].total_bookings++;
        vehicleStats[vid].total_revenue += b.total_amount || 0;
        vehicleStats[vid].commission_earned += b.platform_fee || 0;
      });

      // Convert to array and sort
      const sorted = Object.entries(vehicleStats)
        .map(([id, stats]) => ({
          id,
          make: stats.vehicle.make,
          model: stats.vehicle.model,
          year: stats.vehicle.year,
          owner_name: stats.vehicle.owner?.full_name || "Unknown",
          total_bookings: stats.total_bookings,
          total_revenue: stats.total_revenue,
          commission_earned: stats.commission_earned,
          average_rating: null, // Would need to fetch from reviews
          image_url: stats.vehicle.images?.[0] || null,
        }))
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, limit);

      return sorted;
    },
  });
}

// Fetch revenue chart data (last 6 months)
export function useRevenueChart() {
  return useQuery({
    queryKey: ["revenueChart"],
    queryFn: async (): Promise<RevenueChartData[]> => {
      const now = new Date();
      const sixMonthsAgo = subMonths(now, 5);

      const { data: bookings, error } = await supabase
        .from("p2p_bookings")
        .select("total_amount, platform_fee, created_at")
        .eq("status", "completed")
        .eq("payment_status", "captured")
        .gte("created_at", startOfMonth(sixMonthsAgo).toISOString());

      if (error) throw error;

      // Initialize months
      const monthlyData: Record<string, RevenueChartData> = {};
      for (let i = 0; i < 6; i++) {
        const month = subMonths(now, 5 - i);
        const key = format(month, "MMM yyyy");
        monthlyData[key] = { month: key, grossRevenue: 0, commission: 0, bookings: 0 };
      }

      (bookings || []).forEach(b => {
        const month = format(new Date(b.created_at), "MMM yyyy");
        if (monthlyData[month]) {
          monthlyData[month].grossRevenue += b.total_amount || 0;
          monthlyData[month].commission += b.platform_fee || 0;
          monthlyData[month].bookings += 1;
        }
      });

      return Object.values(monthlyData);
    },
  });
}

// Fetch commission by vehicle category
export function useCommissionByCategory() {
  return useQuery({
    queryKey: ["commissionByCategory"],
    queryFn: async (): Promise<CommissionByCategory[]> => {
      const { data: bookings, error } = await supabase
        .from("p2p_bookings")
        .select(`
          total_amount, platform_fee,
          vehicle:p2p_vehicles!p2p_bookings_vehicle_id_fkey(category)
        `)
        .eq("status", "completed")
        .eq("payment_status", "captured");

      if (error) throw error;

      const categoryStats: Record<string, CommissionByCategory> = {};

      (bookings || []).forEach(b => {
        const category = b.vehicle?.category || "standard";
        
        if (!categoryStats[category]) {
          categoryStats[category] = {
            category,
            revenue: 0,
            commission: 0,
            bookings: 0,
          };
        }
        
        categoryStats[category].revenue += b.total_amount || 0;
        categoryStats[category].commission += b.platform_fee || 0;
        categoryStats[category].bookings += 1;
      });

      return Object.values(categoryStats).sort((a, b) => b.commission - a.commission);
    },
  });
}
