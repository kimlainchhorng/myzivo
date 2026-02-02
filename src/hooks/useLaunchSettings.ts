/**
 * Launch Settings Hooks
 * React Query hooks for managing the Public Launch System
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type {
  LaunchSettings,
  GlobalLaunchMode,
  EmergencyPausePayload,
  AnnouncementSettingsPayload,
  BookingLimitsPayload,
  CityLaunchReadiness,
  LaunchReadinessCheck,
  PostLaunchStats,
} from "@/types/launchSettings";

// Query key constants
const LAUNCH_SETTINGS_KEY = ["launch-settings"];
const LAUNCH_READINESS_KEY = ["launch-readiness"];
const POST_LAUNCH_STATS_KEY = ["post-launch-stats"];

/**
 * Fetch current launch settings
 */
export function useLaunchSettings() {
  return useQuery({
    queryKey: LAUNCH_SETTINGS_KEY,
    queryFn: async (): Promise<LaunchSettings | null> => {
      const { data, error } = await supabase
        .from("launch_settings")
        .select("*")
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching launch settings:", error);
        return null;
      }

      return data as LaunchSettings;
    },
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Update launch mode (beta ↔ live)
 */
export function useUpdateLaunchMode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newMode: GlobalLaunchMode) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("launch_settings")
        .update({
          global_mode: newMode,
          mode_changed_at: new Date().toISOString(),
          mode_changed_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .not("id", "is", null); // Update the single row

      if (error) throw error;
    },
    onSuccess: (_, newMode) => {
      queryClient.invalidateQueries({ queryKey: LAUNCH_SETTINGS_KEY });
      toast.success(
        newMode === "live"
          ? "🚀 Switched to Public Live mode!"
          : "Switched back to Private Beta mode"
      );
    },
    onError: (error) => {
      console.error("Failed to update launch mode:", error);
      toast.error("Failed to update launch mode");
    },
  });
}

/**
 * Toggle emergency pause
 */
export function useEmergencyPause() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: EmergencyPausePayload) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const updateData: Record<string, unknown> = {
        emergency_pause: payload.emergency_pause,
        updated_at: new Date().toISOString(),
      };

      if (payload.emergency_pause) {
        updateData.emergency_pause_reason = payload.emergency_pause_reason || null;
        updateData.emergency_pause_at = new Date().toISOString();
        updateData.emergency_pause_by = user.id;
      } else {
        updateData.emergency_pause_reason = null;
        updateData.emergency_pause_at = null;
        updateData.emergency_pause_by = null;
      }

      const { error } = await supabase
        .from("launch_settings")
        .update(updateData)
        .not("id", "is", null);

      if (error) throw error;
    },
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: LAUNCH_SETTINGS_KEY });
      if (payload.emergency_pause) {
        toast.warning("⚠️ All bookings paused!");
      } else {
        toast.success("✅ Bookings resumed");
      }
    },
    onError: (error) => {
      console.error("Failed to toggle emergency pause:", error);
      toast.error("Failed to update emergency pause");
    },
  });
}

/**
 * Update announcement settings
 */
export function useUpdateAnnouncementSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AnnouncementSettingsPayload) => {
      const { error } = await supabase
        .from("launch_settings")
        .update({
          announcement_enabled: payload.announcement_enabled,
          announcement_text: payload.announcement_text || null,
          announcement_cities: payload.announcement_cities || null,
          updated_at: new Date().toISOString(),
        })
        .not("id", "is", null);

      if (error) throw error;
    },
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: LAUNCH_SETTINGS_KEY });
      toast.success(
        payload.announcement_enabled
          ? "Announcement banner enabled"
          : "Announcement banner disabled"
      );
    },
    onError: (error) => {
      console.error("Failed to update announcement:", error);
      toast.error("Failed to update announcement settings");
    },
  });
}

/**
 * Update booking limits
 */
export function useUpdateBookingLimits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BookingLimitsPayload) => {
      const { error } = await supabase
        .from("launch_settings")
        .update({
          daily_booking_limit_per_city: payload.daily_booking_limit_per_city,
          enforce_supply_minimum: payload.enforce_supply_minimum,
          min_owners_for_launch: payload.min_owners_for_launch,
          min_vehicles_for_launch: payload.min_vehicles_for_launch,
          updated_at: new Date().toISOString(),
        })
        .not("id", "is", null);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LAUNCH_SETTINGS_KEY });
      toast.success("Booking limits updated");
    },
    onError: (error) => {
      console.error("Failed to update booking limits:", error);
      toast.error("Failed to update booking limits");
    },
  });
}

/**
 * Check launch readiness (beta checklist + city supply)
 */
export function useLaunchReadinessCheck() {
  return useQuery({
    queryKey: LAUNCH_READINESS_KEY,
    queryFn: async (): Promise<LaunchReadinessCheck> => {
      const blockers: string[] = [];

      // 1. Check beta checklist completion
      const { data: checklist } = await supabase
        .from("beta_launch_checklist")
        .select("*")
        .limit(1)
        .single();

      const betaChecklistComplete = checklist
        ? Boolean(
            checklist.day1_completed_at &&
            checklist.day2_completed_at &&
            checklist.day3_completed_at &&
            checklist.day4_completed_at &&
            checklist.day5_completed_at &&
            checklist.day6_completed_at &&
            checklist.day7_completed_at
          )
        : false;

      if (!betaChecklistComplete) {
        blockers.push("Beta launch checklist not complete");
      }

      // 2. Get launch settings for minimums
      const { data: settings } = await supabase
        .from("launch_settings")
        .select("min_owners_for_launch, min_vehicles_for_launch")
        .limit(1)
        .single();

      const minOwners = settings?.min_owners_for_launch || 5;
      const minVehicles = settings?.min_vehicles_for_launch || 10;

      // 3. Check live cities and their supply (using launch_status column)
      const { data: cities } = await supabase
        .from("p2p_launch_cities")
        .select("id, name, state, launch_status, daily_booking_limit, bookings_today")
        .eq("launch_status", "live");

      const liveCitiesCount = cities?.length || 0;

      if (liveCitiesCount === 0) {
        blockers.push("No cities marked as LIVE");
      }

      // 4. Check supply for each live city
      const citiesReady: CityLaunchReadiness[] = [];

      if (cities) {
        for (const city of cities) {
          // Count verified owners in this city (status = 'verified')
          const { count: ownerCount } = await supabase
            .from("car_owner_profiles")
            .select("*", { count: "exact", head: true })
            .eq("city", city.name)
            .eq("status", "verified");

          // Count approved/active vehicles (status = 'active' or 'approved')
          // rental_cars uses 'status' column with values like 'active'
          const { count: vehicleCount } = await supabase
            .from("rental_cars")
            .select("*", { count: "exact", head: true })
            .eq("status", "active");

          const approvedOwners = ownerCount || 0;
          const approvedVehicles = vehicleCount || 0;
          const ownersMet = approvedOwners >= minOwners;
          const vehiclesMet = approvedVehicles >= minVehicles;

          citiesReady.push({
            cityId: city.id,
            cityName: city.name,
            state: city.state,
            status: city.launch_status,
            approvedOwners,
            approvedVehicles,
            minOwners,
            minVehicles,
            ownersMet,
            vehiclesMet,
            isReady: ownersMet && vehiclesMet,
            dailyBookingLimit: city.daily_booking_limit || 20,
            bookingsToday: city.bookings_today || 0,
          });

          if (!ownersMet || !vehiclesMet) {
            const ownersNeeded = Math.max(0, minOwners - approvedOwners);
            const vehiclesNeeded = Math.max(0, minVehicles - approvedVehicles);
            blockers.push(
              `${city.name}, ${city.state}: Need ${ownersNeeded} more owners, ${vehiclesNeeded} more vehicles`
            );
          }
        }
      }

      const allCitiesMeetMinimums = citiesReady.length > 0 && citiesReady.every((c) => c.isReady);

      return {
        betaChecklistComplete,
        liveCitiesCount,
        citiesReady,
        allCitiesMeetMinimums,
        canGoLive: betaChecklistComplete && liveCitiesCount > 0 && allCitiesMeetMinimums,
        blockers,
      };
    },
    staleTime: 60000, // 1 minute
  });
}

/**
 * Fetch post-launch monitoring stats
 */
export function usePostLaunchStats() {
  return useQuery({
    queryKey: POST_LAUNCH_STATS_KEY,
    queryFn: async (): Promise<PostLaunchStats> => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const last24h = new Date();
      last24h.setHours(last24h.getHours() - 24);

      // Bookings today
      const { count: bookingsToday } = await supabase
        .from("p2p_bookings")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      // Bookings yesterday
      const { count: bookingsYesterday } = await supabase
        .from("p2p_bookings")
        .select("*", { count: "exact", head: true })
        .gte("created_at", yesterday.toISOString())
        .lt("created_at", today.toISOString());

      // Failed payments - check bookings with status indicating cancellation/issues
      // Using 'cancelled' as the closest available status for failed scenarios
      const { count: failedPayments24h } = await supabase
        .from("p2p_bookings")
        .select("*", { count: "exact", head: true })
        .eq("status", "cancelled")
        .gte("created_at", last24h.toISOString());

      // Open disputes
      const { count: openDisputes } = await supabase
        .from("p2p_disputes")
        .select("*", { count: "exact", head: true })
        .eq("status", "open");

      // Pending owner verifications (status = 'pending')
      const { count: pendingOwnerVerifications } = await supabase
        .from("car_owner_profiles")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Pending renter verifications (verification_status = 'pending')
      const { count: pendingRenterVerifications } = await supabase
        .from("renter_profiles")
        .select("*", { count: "exact", head: true })
        .eq("verification_status", "pending");

      // Active cars (use status column for rental_cars)
      const { data: carData } = await supabase
        .from("rental_cars")
        .select("id")
        .eq("status", "active");

      // Group by would need RPC, so just count total for now
      const activeCarsByCity: Record<string, number> = {
        "All Cities": carData?.length || 0,
      };

      // New owners today
      const { count: newOwnersToday } = await supabase
        .from("car_owner_profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      // New renters today
      const { count: newRentersToday } = await supabase
        .from("renter_profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      return {
        bookingsToday: bookingsToday || 0,
        bookingsYesterday: bookingsYesterday || 0,
        failedPayments24h: failedPayments24h || 0,
        openDisputes: openDisputes || 0,
        pendingOwnerVerifications: pendingOwnerVerifications || 0,
        pendingRenterVerifications: pendingRenterVerifications || 0,
        activeCarsByCity,
        newOwnersToday: newOwnersToday || 0,
        newRentersToday: newRentersToday || 0,
      };
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Check if booking is allowed (for use in booking flow)
 */
export async function checkBookingAllowed(cityId: string): Promise<{ allowed: boolean; reason?: string }> {
  // Check emergency pause
  const { data: settings } = await supabase
    .from("launch_settings")
    .select("emergency_pause")
    .limit(1)
    .single();

  if (settings?.emergency_pause) {
    return {
      allowed: false,
      reason: "Bookings are temporarily paused. Please try again later.",
    };
  }

  // Check daily limit for city
  const { data: city } = await supabase
    .from("p2p_launch_cities")
    .select("daily_booking_limit, bookings_today, name")
    .eq("id", cityId)
    .single();

  if (city && city.bookings_today >= city.daily_booking_limit) {
    return {
      allowed: false,
      reason: `Daily booking limit reached for ${city.name}. Please try tomorrow.`,
    };
  }

  return { allowed: true };
}

/**
 * Increment booking counter for city
 */
export async function incrementCityBookingCount(cityId: string): Promise<void> {
  const today = new Date().toISOString().split("T")[0];

  // Get current city data
  const { data: city } = await supabase
    .from("p2p_launch_cities")
    .select("bookings_today, last_booking_reset")
    .eq("id", cityId)
    .single();

  if (!city) return;

  // Reset counter if it's a new day
  const lastReset = city.last_booking_reset;
  const newCount = lastReset === today ? (city.bookings_today || 0) + 1 : 1;

  await supabase
    .from("p2p_launch_cities")
    .update({
      bookings_today: newCount,
      last_booking_reset: today,
    })
    .eq("id", cityId);
}
