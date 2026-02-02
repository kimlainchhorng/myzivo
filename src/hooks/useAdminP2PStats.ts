/**
 * Admin P2P Statistics Hook
 * Fetches counts for owners, vehicles, and bookings
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface P2PStats {
  owners: {
    total: number;
    pending: number;
    verified: number;
  };
  vehicles: {
    total: number;
    pending: number;
    approved: number;
  };
  bookings: {
    total: number;
    pending: number;
    active: number;
    completed: number;
  };
}

export function useAdminP2PStats() {
  return useQuery({
    queryKey: ["adminP2PStats"],
    queryFn: async (): Promise<P2PStats> => {
      // Fetch owner counts
      const [
        { count: totalOwners },
        { count: pendingOwners },
        { count: verifiedOwners },
      ] = await Promise.all([
        supabase.from("car_owner_profiles").select("*", { count: "exact", head: true }),
        supabase.from("car_owner_profiles").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("car_owner_profiles").select("*", { count: "exact", head: true }).eq("status", "verified"),
      ]);

      // Fetch vehicle counts
      const [
        { count: totalVehicles },
        { count: pendingVehicles },
        { count: approvedVehicles },
      ] = await Promise.all([
        supabase.from("p2p_vehicles").select("*", { count: "exact", head: true }),
        supabase.from("p2p_vehicles").select("*", { count: "exact", head: true }).eq("approval_status", "pending"),
        supabase.from("p2p_vehicles").select("*", { count: "exact", head: true }).eq("approval_status", "approved"),
      ]);

      // Fetch booking counts
      const [
        { count: totalBookings },
        { count: pendingBookings },
        { count: activeBookings },
        { count: completedBookings },
      ] = await Promise.all([
        supabase.from("p2p_bookings").select("*", { count: "exact", head: true }),
        supabase.from("p2p_bookings").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("p2p_bookings").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("p2p_bookings").select("*", { count: "exact", head: true }).eq("status", "completed"),
      ]);

      return {
        owners: {
          total: totalOwners || 0,
          pending: pendingOwners || 0,
          verified: verifiedOwners || 0,
        },
        vehicles: {
          total: totalVehicles || 0,
          pending: pendingVehicles || 0,
          approved: approvedVehicles || 0,
        },
        bookings: {
          total: totalBookings || 0,
          pending: pendingBookings || 0,
          active: activeBookings || 0,
          completed: completedBookings || 0,
        },
      };
    },
    staleTime: 30000, // 30 seconds
  });
}
