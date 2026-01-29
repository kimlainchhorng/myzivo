import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AdminStats {
  // Drivers
  totalDrivers: number;
  onlineDrivers: number;
  pendingDocuments: number;
  
  // Trips
  totalTrips: number;
  activeTrips: number;
  
  // Food
  totalFoodOrders: number;
  totalRestaurants: number;
  activeFoodOrders: number;
  
  // Travel
  totalCarRentals: number;
  activeCarRentals: number;
  
  // Support
  openTickets: number;
  
  // Engagement
  activeAnnouncements: number;
  activePromotions: number;
  
  // System
  totalAuditLogs: number;
  
  // Users
  totalUsers: number;
  
  // Referrals
  pendingReferrals: number;
  
  // Security
  unresolvedAlerts: number;
}

async function fetchAdminStats(): Promise<AdminStats> {
  const [
    driversResult,
    onlineDriversResult,
    pendingDocsResult,
    tripsResult,
    activeTripsResult,
    foodOrdersResult,
    activeFoodOrdersResult,
    restaurantsResult,
    carRentalsResult,
    activeCarRentalsResult,
    ticketsResult,
    announcementsResult,
    promotionsResult,
    auditLogsResult,
    profilesResult,
    referralsResult,
    alertsResult,
  ] = await Promise.all([
    supabase.from("drivers").select("*", { count: "exact", head: true }),
    supabase.from("drivers").select("*", { count: "exact", head: true }).eq("is_online", true),
    supabase.from("driver_documents").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("trips").select("*", { count: "exact", head: true }),
    supabase.from("trips").select("*", { count: "exact", head: true }).eq("status", "in_progress"),
    supabase.from("food_orders").select("*", { count: "exact", head: true }),
    supabase.from("food_orders").select("*", { count: "exact", head: true }).in("status", ["pending", "confirmed", "in_progress", "ready_for_pickup"]),
    supabase.from("restaurants").select("*", { count: "exact", head: true }),
    supabase.from("car_rentals").select("*", { count: "exact", head: true }),
    supabase.from("car_rentals").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
    supabase.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("announcements").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("promotions").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("audit_logs").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("driver_referrals").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("admin_security_alerts").select("*", { count: "exact", head: true }).eq("is_resolved", false),
  ]);

  return {
    totalDrivers: driversResult.count ?? 0,
    onlineDrivers: onlineDriversResult.count ?? 0,
    pendingDocuments: pendingDocsResult.count ?? 0,
    totalTrips: tripsResult.count ?? 0,
    activeTrips: activeTripsResult.count ?? 0,
    totalFoodOrders: foodOrdersResult.count ?? 0,
    activeFoodOrders: activeFoodOrdersResult.count ?? 0,
    totalRestaurants: restaurantsResult.count ?? 0,
    totalCarRentals: carRentalsResult.count ?? 0,
    activeCarRentals: activeCarRentalsResult.count ?? 0,
    openTickets: ticketsResult.count ?? 0,
    activeAnnouncements: announcementsResult.count ?? 0,
    activePromotions: promotionsResult.count ?? 0,
    totalAuditLogs: auditLogsResult.count ?? 0,
    totalUsers: profilesResult.count ?? 0,
    pendingReferrals: referralsResult.count ?? 0,
    unresolvedAlerts: alertsResult.count ?? 0,
  };
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchAdminStats,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
}
