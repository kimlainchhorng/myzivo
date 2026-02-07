/**
 * Driver-side database operations with retry logic
 * Ensures drivers don't miss rides due to transient network issues
 */

import { withRetry, isOnline, SupabaseErrorInfo } from "./supabaseErrors";
import { supabase } from "@/integrations/supabase/client";

// Result type for operations with error info
export interface DriverOperationResult<T = void> {
  data: T | null;
  error: SupabaseErrorInfo | null;
  attempts: number;
}

/**
 * Accept trip with retry and race condition handling
 * Handles the case where another driver already accepted the trip
 */
export const acceptTripWithRetry = async (
  tripId: string,
  driverId: string,
  options?: { maxAttempts?: number }
): Promise<DriverOperationResult<{ id: string }>> => {
  if (!isOnline()) {
    return {
      data: null,
      error: {
        type: "network",
        message: "Offline",
        userMessage: "No connection. Check your network.",
        isRetryable: true,
      },
      attempts: 0,
    };
  }

  const operation = async () => {
    const { data, error } = await supabase
      .from("trips")
      .update({
        status: "accepted",
        driver_id: driverId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tripId)
      .eq("status", "requested")
      .is("driver_id", null)
      .select("id")
      .single();

    if (error) throw error;
    if (!data) throw new Error("TRIP_ALREADY_TAKEN");
    return data;
  };

  const result = await withRetry(operation, {
    maxAttempts: options?.maxAttempts ?? 3,
    onRetry: (attempt) => console.log(`[acceptTrip] Retry ${attempt}...`),
  });

  // Handle "TRIP_ALREADY_TAKEN" as non-retryable
  if (result.error?.message === "TRIP_ALREADY_TAKEN") {
    return {
      data: null,
      error: {
        type: "database",
        message: "Trip already taken",
        userMessage: "This ride was accepted by another driver.",
        isRetryable: false,
      },
      attempts: result.attempts,
    };
  }

  return result;
};

/**
 * Update trip status with retry
 * Used for status transitions: arrived, in_progress, completed, cancelled
 */
export const updateTripStatusWithRetry = async (
  tripId: string,
  status: string,
  options?: { maxAttempts?: number }
): Promise<DriverOperationResult> => {
  if (!isOnline()) {
    return {
      data: null,
      error: {
        type: "network",
        message: "Offline",
        userMessage: "No connection. Status will sync when online.",
        isRetryable: true,
      },
      attempts: 0,
    };
  }

  const operation = async () => {
    const tripStatus = status as "requested" | "accepted" | "en_route" | "arrived" | "in_progress" | "completed" | "cancelled";
    
    const { error } = await supabase
      .from("trips")
      .update({
        status: tripStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tripId);

    if (error) throw error;
  };

  return withRetry(operation, { 
    maxAttempts: options?.maxAttempts ?? 3,
    onRetry: (attempt) => console.log(`[updateTripStatus] Retry ${attempt}...`),
  });
};

/**
 * Update driver location with silent retry
 * Uses shorter delays since these are high-frequency updates
 * Returns boolean for success/failure (no toasts on failure)
 */
export const updateLocationWithRetry = async (
  driverId: string,
  lat: number,
  lng: number
): Promise<boolean> => {
  // Skip retry if offline - location will update on next cycle
  if (!isOnline()) return false;

  const operation = async () => {
    const { error } = await supabase
      .from("drivers")
      .update({
        current_lat: lat,
        current_lng: lng,
        updated_at: new Date().toISOString(),
      })
      .eq("id", driverId);

    if (error) throw error;
    return true;
  };

  const result = await withRetry(operation, {
    maxAttempts: 2,
    baseDelayMs: 500, // Shorter delay for location updates
  });

  return result.data ?? false;
};

/**
 * Update driver online status with retry
 * Critical for going online/offline
 */
export const updateDriverStatusWithRetry = async (
  driverId: string,
  isOnlineStatus: boolean,
  options?: { maxAttempts?: number }
): Promise<DriverOperationResult> => {
  if (!isOnline()) {
    return {
      data: null,
      error: {
        type: "network",
        message: "Offline",
        userMessage: "Cannot go online without internet connection.",
        isRetryable: true,
      },
      attempts: 0,
    };
  }

  const operation = async () => {
    const { error } = await supabase
      .from("drivers")
      .update({
        is_online: isOnlineStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", driverId);

    if (error) throw error;
  };

  return withRetry(operation, { 
    maxAttempts: options?.maxAttempts ?? 3,
    onRetry: (attempt) => console.log(`[updateDriverStatus] Retry ${attempt}...`),
  });
};

/**
 * Upsert driver profile with retry
 * Used during driver signup/profile creation
 */
export const upsertDriverProfileWithRetry = async (
  userId: string,
  email: string,
  options?: { maxAttempts?: number }
): Promise<DriverOperationResult<{ id: string }>> => {
  if (!isOnline()) {
    return {
      data: null,
      error: {
        type: "network",
        message: "Offline",
        userMessage: "Cannot create profile without internet connection.",
        isRetryable: true,
      },
      attempts: 0,
    };
  }

  const operation = async () => {
    // Check if driver already exists
    const { data: existing } = await supabase
      .from("drivers")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existing) {
      return { id: existing.id };
    }

    // Create new driver profile with defaults
    const { data, error } = await supabase
      .from("drivers")
      .insert({
        user_id: userId,
        full_name: email.split("@")[0],
        email: email,
        phone: "",
        license_number: "PENDING",
        vehicle_type: "sedan",
        vehicle_plate: "PENDING",
        rating: 4.8,
        is_online: false,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) throw error;
    if (!data) throw new Error("Failed to create driver profile");
    
    return { id: data.id };
  };

  return withRetry(operation, {
    maxAttempts: options?.maxAttempts ?? 3,
    onRetry: (attempt) => console.log(`[upsertDriverProfile] Retry ${attempt}...`),
  });
};
