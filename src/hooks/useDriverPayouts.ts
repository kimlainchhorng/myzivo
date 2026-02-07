/**
 * useDriverPayouts Hook
 * Manages driver payout calculations and CRUD operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DRIVER_SHARE_RATE, PLATFORM_COMMISSION_RATE } from "@/config/adminConfig";

export interface Payout {
  id: string;
  driver_id: string | null;
  amount: number | null;
  currency: string | null;
  status: string | null;
  payout_method: string | null;
  reference_id: string | null;
  notes: string | null;
  processed_by: string | null;
  processed_at: string | null;
  created_at: string;
  driver?: {
    id: string;
    full_name: string;
    phone: string;
  } | null;
}

export interface DriverBalance {
  driverId: string;
  driverName: string;
  totalEarnings: number;
  driverShare: number;
  platformCommission: number;
  totalPaid: number;
  balance: number;
}

export interface PayoutFilters {
  status: string;
  driverId?: string;
}

// Fetch all payouts
export function usePayouts(filters: PayoutFilters) {
  return useQuery({
    queryKey: ["admin-payouts", filters],
    queryFn: async () => {
      let query = supabase
        .from("payouts")
        .select(`
          *,
          driver:drivers(id, full_name, phone)
        `)
        .order("created_at", { ascending: false })
        .limit(200);

      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters.driverId) {
        query = query.eq("driver_id", filters.driverId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Payout[];
    },
  });
}

// Calculate driver balance
export function useDriverBalance(driverId: string | null) {
  return useQuery({
    queryKey: ["driver-balance", driverId],
    queryFn: async (): Promise<DriverBalance | null> => {
      if (!driverId) return null;

      // Get driver info
      const { data: driver } = await supabase
        .from("drivers")
        .select("id, full_name")
        .eq("id", driverId)
        .single();

      // Get total earnings from completed rides
      const { data: trips } = await supabase
        .from("trips")
        .select("fare_amount")
        .eq("driver_id", driverId)
        .eq("status", "completed")
        .eq("payment_status", "paid");

      const totalEarnings = trips?.reduce((sum, t) => sum + (t.fare_amount || 0), 0) || 0;
      const driverShare = totalEarnings * DRIVER_SHARE_RATE;
      const platformCommission = totalEarnings * PLATFORM_COMMISSION_RATE;

      // Get paid payouts
      const { data: payouts } = await supabase
        .from("payouts")
        .select("amount")
        .eq("driver_id", driverId)
        .eq("status", "paid");

      const totalPaid = payouts?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      return {
        driverId,
        driverName: driver?.full_name || "Unknown",
        totalEarnings,
        driverShare,
        platformCommission,
        totalPaid,
        balance: driverShare - totalPaid,
      };
    },
    enabled: !!driverId,
  });
}

// Calculate all drivers' balances
export function useAllDriverBalances() {
  return useQuery({
    queryKey: ["all-driver-balances"],
    queryFn: async (): Promise<DriverBalance[]> => {
      // Get all drivers
      const { data: drivers } = await supabase
        .from("drivers")
        .select("id, full_name")
        .order("full_name");

      if (!drivers) return [];

      // Get all completed trips grouped by driver
      const { data: trips } = await supabase
        .from("trips")
        .select("driver_id, fare_amount")
        .eq("status", "completed")
        .eq("payment_status", "paid");

      // Get all paid payouts grouped by driver
      const { data: payouts } = await supabase
        .from("payouts")
        .select("driver_id, amount")
        .eq("status", "paid");

      // Calculate balances for each driver
      return drivers.map((driver) => {
        const driverTrips = trips?.filter((t) => t.driver_id === driver.id) || [];
        const driverPayouts = payouts?.filter((p) => p.driver_id === driver.id) || [];

        const totalEarnings = driverTrips.reduce((sum, t) => sum + (t.fare_amount || 0), 0);
        const driverShare = totalEarnings * DRIVER_SHARE_RATE;
        const platformCommission = totalEarnings * PLATFORM_COMMISSION_RATE;
        const totalPaid = driverPayouts.reduce((sum, p) => sum + (p.amount || 0), 0);

        return {
          driverId: driver.id,
          driverName: driver.full_name,
          totalEarnings,
          driverShare,
          platformCommission,
          totalPaid,
          balance: driverShare - totalPaid,
        };
      }).filter((d) => d.totalEarnings > 0 || d.balance !== 0);
    },
  });
}

// Create payout mutation
export function useCreatePayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ driverId, amount, notes }: { driverId: string; amount: number; notes?: string }) => {
      const { data, error } = await supabase
        .from("payouts")
        .insert({
          driver_id: driverId,
          amount,
          status: "pending",
          notes,
          currency: "USD",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["driver-balance"] });
      queryClient.invalidateQueries({ queryKey: ["all-driver-balances"] });
      toast.success("Payout created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create payout: " + error.message);
    },
  });
}

// Update payout status mutation
export function useUpdatePayoutStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ payoutId, status }: { payoutId: string; status: string }) => {
      const updates: Record<string, unknown> = { status };
      
      if (status === "paid") {
        updates.processed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("payouts")
        .update(updates)
        .eq("id", payoutId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });
      queryClient.invalidateQueries({ queryKey: ["driver-balance"] });
      queryClient.invalidateQueries({ queryKey: ["all-driver-balances"] });
      toast.success("Payout status updated");
    },
    onError: (error) => {
      toast.error("Failed to update payout: " + error.message);
    },
  });
}

// Weekly stats hook
export function useWeeklyStats() {
  return useQuery({
    queryKey: ["admin-weekly-stats"],
    queryFn: async () => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: trips } = await supabase
        .from("trips")
        .select("fare_amount, status, payment_status")
        .gte("created_at", weekAgo.toISOString())
        .eq("status", "completed")
        .eq("payment_status", "paid");

      const grossRevenue = trips?.reduce((sum, t) => sum + (t.fare_amount || 0), 0) || 0;

      return {
        completedLast7Days: trips?.length || 0,
        grossRevenue,
        platformCommission: grossRevenue * PLATFORM_COMMISSION_RATE,
        driverEarnings: grossRevenue * DRIVER_SHARE_RATE,
      };
    },
    staleTime: 60000, // 1 minute
  });
}
