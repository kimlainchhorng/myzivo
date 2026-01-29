import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AdminStats {
  // Drivers
  totalDrivers: number;
  onlineDrivers: number;
  pendingDrivers: number;
  pendingDocuments: number;
  pendingVehicles: number;
  
  // Trips & Rides
  totalTrips: number;
  activeTrips: number;
  pendingTrips: number;
  
  // Food & Restaurants
  totalFoodOrders: number;
  activeFoodOrders: number;
  totalRestaurants: number;
  totalMenuItems: number;
  
  // Travel Services
  totalCarRentals: number;
  activeCarRentals: number;
  totalRentalCars: number;
  totalHotelBookings: number;
  totalHotels: number;
  totalFlightBookings: number;
  
  // Support & Engagement
  openTickets: number;
  activeAnnouncements: number;
  activePromotions: number;
  pendingFeedback: number;
  
  // Financial
  pendingWithdrawals: number;
  totalEarningsRecords: number;
  earningsToday: number;
  
  // System & Security
  totalAuditLogs: number;
  unresolvedAlerts: number;
  recentSecurityEvents: number;
  unreadNotifications: number;
  
  // Users
  totalUsers: number;
  pendingReferrals: number;
}

async function fetchAdminStats(): Promise<AdminStats> {
  const [
    // Drivers
    driversResult,
    onlineDriversResult,
    pendingDriversResult,
    pendingDocsResult,
    pendingVehiclesResult,
    // Trips
    tripsResult,
    activeTripsResult,
    pendingTripsResult,
    // Food
    foodOrdersResult,
    activeFoodOrdersResult,
    restaurantsResult,
    menuItemsResult,
    // Travel
    carRentalsResult,
    activeCarRentalsResult,
    rentalCarsResult,
    hotelBookingsResult,
    hotelsResult,
    flightBookingsResult,
    // Support
    ticketsResult,
    announcementsResult,
    promotionsResult,
    feedbackResult,
    // Financial
    withdrawalsResult,
    earningsResult,
    // System
    auditLogsResult,
    alertsResult,
    securityEventsResult,
    notificationsResult,
    // Users
    profilesResult,
    referralsResult,
  ] = await Promise.all([
    // Drivers
    supabase.from("drivers").select("*", { count: "exact", head: true }),
    supabase.from("drivers").select("*", { count: "exact", head: true }).eq("is_online", true),
    supabase.from("drivers").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("driver_documents").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("vehicles").select("*", { count: "exact", head: true }).eq("approval_status", "pending"),
    // Trips
    supabase.from("trips").select("*", { count: "exact", head: true }),
    supabase.from("trips").select("*", { count: "exact", head: true }).eq("status", "in_progress"),
    supabase.from("trips").select("*", { count: "exact", head: true }).eq("status", "requested"),
    // Food
    supabase.from("food_orders").select("*", { count: "exact", head: true }),
    supabase.from("food_orders").select("*", { count: "exact", head: true }).in("status", ["pending", "confirmed", "in_progress", "ready_for_pickup"]),
    supabase.from("restaurants").select("*", { count: "exact", head: true }),
    supabase.from("menu_items").select("*", { count: "exact", head: true }),
    // Travel
    supabase.from("car_rentals").select("*", { count: "exact", head: true }),
    supabase.from("car_rentals").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
    supabase.from("rental_cars").select("*", { count: "exact", head: true }),
    supabase.from("hotel_bookings").select("*", { count: "exact", head: true }),
    supabase.from("hotels").select("*", { count: "exact", head: true }),
    supabase.from("flight_bookings").select("*", { count: "exact", head: true }),
    // Support
    supabase.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("announcements").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("promotions").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("customer_feedback").select("*", { count: "exact", head: true }).is("responded_at", null),
    // Financial
    supabase.from("driver_withdrawals").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("driver_earnings").select("*", { count: "exact", head: true }),
    // System
    supabase.from("audit_logs").select("*", { count: "exact", head: true }),
    supabase.from("admin_security_alerts").select("*", { count: "exact", head: true }).eq("is_resolved", false),
    supabase.from("security_events").select("*", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    supabase.from("driver_notifications").select("*", { count: "exact", head: true }).eq("is_read", false),
    // Users
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("driver_referrals").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  // Fetch today's earnings sum
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data: earningsTodayData } = await supabase
    .from("driver_earnings")
    .select("net_amount")
    .gte("created_at", today.toISOString());
  
  const earningsToday = earningsTodayData?.reduce((sum, e) => sum + (e.net_amount || 0), 0) ?? 0;

  return {
    // Drivers
    totalDrivers: driversResult.count ?? 0,
    onlineDrivers: onlineDriversResult.count ?? 0,
    pendingDrivers: pendingDriversResult.count ?? 0,
    pendingDocuments: pendingDocsResult.count ?? 0,
    pendingVehicles: pendingVehiclesResult.count ?? 0,
    // Trips
    totalTrips: tripsResult.count ?? 0,
    activeTrips: activeTripsResult.count ?? 0,
    pendingTrips: pendingTripsResult.count ?? 0,
    // Food
    totalFoodOrders: foodOrdersResult.count ?? 0,
    activeFoodOrders: activeFoodOrdersResult.count ?? 0,
    totalRestaurants: restaurantsResult.count ?? 0,
    totalMenuItems: menuItemsResult.count ?? 0,
    // Travel
    totalCarRentals: carRentalsResult.count ?? 0,
    activeCarRentals: activeCarRentalsResult.count ?? 0,
    totalRentalCars: rentalCarsResult.count ?? 0,
    totalHotelBookings: hotelBookingsResult.count ?? 0,
    totalHotels: hotelsResult.count ?? 0,
    totalFlightBookings: flightBookingsResult.count ?? 0,
    // Support
    openTickets: ticketsResult.count ?? 0,
    activeAnnouncements: announcementsResult.count ?? 0,
    activePromotions: promotionsResult.count ?? 0,
    pendingFeedback: feedbackResult.count ?? 0,
    // Financial
    pendingWithdrawals: withdrawalsResult.count ?? 0,
    totalEarningsRecords: earningsResult.count ?? 0,
    earningsToday,
    // System
    totalAuditLogs: auditLogsResult.count ?? 0,
    unresolvedAlerts: alertsResult.count ?? 0,
    recentSecurityEvents: securityEventsResult.count ?? 0,
    unreadNotifications: notificationsResult.count ?? 0,
    // Users
    totalUsers: profilesResult.count ?? 0,
    pendingReferrals: referralsResult.count ?? 0,
  };
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchAdminStats,
    refetchInterval: 10000, // Refresh every 10 seconds for real-time feel
    staleTime: 5000, // Consider data stale after 5 seconds
  });
}
