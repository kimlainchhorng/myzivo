/**
 * Owner Earnings Dashboard Hooks
 * Fetch earnings, payouts, and stats for owner dashboard
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCarOwnerProfile } from "./useCarOwner";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export interface EarningsSummary {
  totalEarnings: number;
  totalCommissionPaid: number;
  pendingPayouts: number;
  completedPayouts: number;
  currentMonthEarnings: number;
  lastMonthEarnings: number;
  totalBookings: number;
  completedBookings: number;
  occupancyRate: number;
  averageBookingValue: number;
}

export interface PayoutItem {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  processed_at: string | null;
  booking_id: string;
  booking_start: string;
  booking_end: string;
  vehicle_make: string;
  vehicle_model: string;
}

export interface EarningsChartData {
  month: string;
  earnings: number;
  bookings: number;
}

// Fetch owner earnings summary
export function useOwnerEarningsSummary() {
  const { data: profile } = useCarOwnerProfile();

  return useQuery({
    queryKey: ["ownerEarningsSummary", profile?.id],
    queryFn: async (): Promise<EarningsSummary> => {
      if (!profile?.id) {
        return {
          totalEarnings: 0,
          totalCommissionPaid: 0,
          pendingPayouts: 0,
          completedPayouts: 0,
          currentMonthEarnings: 0,
          lastMonthEarnings: 0,
          totalBookings: 0,
          completedBookings: 0,
          occupancyRate: 0,
          averageBookingValue: 0,
        };
      }

      const now = new Date();
      const currentMonthStart = startOfMonth(now).toISOString();
      const currentMonthEnd = endOfMonth(now).toISOString();
      const lastMonthStart = startOfMonth(subMonths(now, 1)).toISOString();
      const lastMonthEnd = endOfMonth(subMonths(now, 1)).toISOString();

      // Fetch all bookings for this owner
      const { data: bookings, error } = await supabase
        .from("p2p_bookings")
        .select("id, total_amount, owner_payout, platform_fee, status, payment_status, pickup_date, return_date, created_at")
        .eq("owner_id", profile.id);

      if (error) throw error;

      const completedBookings = (bookings || []).filter(b => 
        b.status === "completed" && b.payment_status === "captured"
      );

      const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.owner_payout || 0), 0);
      const totalCommissionPaid = completedBookings.reduce((sum, b) => sum + (b.platform_fee || 0), 0);

      // Current month
      const currentMonthBookings = completedBookings.filter(b => 
        b.created_at && b.created_at >= currentMonthStart && b.created_at <= currentMonthEnd
      );
      const currentMonthEarnings = currentMonthBookings.reduce((sum, b) => sum + (b.owner_payout || 0), 0);

      // Last month
      const lastMonthBookings = completedBookings.filter(b => 
        b.created_at && b.created_at >= lastMonthStart && b.created_at <= lastMonthEnd
      );
      const lastMonthEarnings = lastMonthBookings.reduce((sum, b) => sum + (b.owner_payout || 0), 0);

      // Fetch payouts
      const { data: payouts } = await supabase
        .from("p2p_payouts")
        .select("amount, status")
        .eq("owner_id", profile.id);

      const pendingPayouts = payouts?.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0) || 0;
      const completedPayouts = payouts?.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0) || 0;

      // Calculate occupancy (simplified - percentage of days booked vs available)
      const { data: vehicles } = await supabase
        .from("p2p_vehicles")
        .select("id")
        .eq("owner_id", profile.id);

      const vehicleCount = vehicles?.length || 0;
      const totalPossibleDays = vehicleCount * 30; // Last 30 days
      const bookedDays = completedBookings.reduce((sum, b) => {
        const start = new Date(b.pickup_date);
        const end = new Date(b.return_date);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);

      const occupancyRate = totalPossibleDays > 0 ? (bookedDays / totalPossibleDays) * 100 : 0;
      const averageBookingValue = completedBookings.length > 0 
        ? totalEarnings / completedBookings.length 
        : 0;

      return {
        totalEarnings,
        totalCommissionPaid,
        pendingPayouts,
        completedPayouts,
        currentMonthEarnings,
        lastMonthEarnings,
        totalBookings: bookings?.length || 0,
        completedBookings: completedBookings.length,
        occupancyRate: Math.round(occupancyRate * 10) / 10,
        averageBookingValue: Math.round(averageBookingValue * 100) / 100,
      };
    },
    enabled: !!profile?.id,
  });
}

// Fetch owner payouts list
export function useOwnerPayoutsList() {
  const { data: profile } = useCarOwnerProfile();

  return useQuery({
    queryKey: ["ownerPayoutsList", profile?.id],
    queryFn: async (): Promise<PayoutItem[]> => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from("p2p_payouts")
        .select(`
          id, amount, status, created_at, processed_at, booking_id,
          booking:p2p_bookings!p2p_payouts_booking_id_fkey(
            pickup_date, return_date,
            vehicle:p2p_vehicles!p2p_bookings_vehicle_id_fkey(make, model)
          )
        `)
        .eq("owner_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map(p => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        created_at: p.created_at,
        processed_at: p.processed_at,
        booking_id: p.booking_id,
        booking_start: (p.booking as any)?.pickup_date || "",
        booking_end: (p.booking as any)?.return_date || "",
        vehicle_make: (p.booking as any)?.vehicle?.make || "",
        vehicle_model: (p.booking as any)?.vehicle?.model || "",
      }));
    },
    enabled: !!profile?.id,
  });
}

// Fetch earnings chart data (last 6 months)
export function useOwnerEarningsChart() {
  const { data: profile } = useCarOwnerProfile();

  return useQuery({
    queryKey: ["ownerEarningsChart", profile?.id],
    queryFn: async (): Promise<EarningsChartData[]> => {
      if (!profile?.id) return [];

      const now = new Date();
      const sixMonthsAgo = subMonths(now, 5);

      const { data: bookings, error } = await supabase
        .from("p2p_bookings")
        .select("owner_payout, created_at")
        .eq("owner_id", profile.id)
        .eq("status", "completed")
        .eq("payment_status", "captured")
        .gte("created_at", startOfMonth(sixMonthsAgo).toISOString());

      if (error) throw error;

      // Group by month
      const monthlyData: Record<string, { earnings: number; bookings: number }> = {};

      for (let i = 0; i < 6; i++) {
        const month = subMonths(now, 5 - i);
        const key = format(month, "MMM yyyy");
        monthlyData[key] = { earnings: 0, bookings: 0 };
      }

      (bookings || []).forEach(b => {
        const month = format(new Date(b.created_at), "MMM yyyy");
        if (monthlyData[month]) {
          monthlyData[month].earnings += b.owner_payout || 0;
          monthlyData[month].bookings += 1;
        }
      });

      return Object.entries(monthlyData).map(([month, data]) => ({
        month,
        earnings: data.earnings,
        bookings: data.bookings,
      }));
    },
    enabled: !!profile?.id,
  });
}
