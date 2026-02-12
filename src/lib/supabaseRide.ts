import { supabase } from "@/integrations/supabase/client";
import { RideStatus, DriverInfo } from "@/types/rideTypes";
import { RealtimeChannel } from "@supabase/supabase-js";
import {
  SupabaseErrorInfo,
  categorizeError,
  withRetry,
  isOnline,
} from "./supabaseErrors";

// Check if Supabase is configured (client exists with valid URL)
export const isSupabaseConfigured = (): boolean => {
  try {
    // The client is hardcoded, so it's always available
    return true;
  } catch {
    return false;
  }
};

// Re-export error types for convenience
export type { SupabaseErrorInfo } from "./supabaseErrors";
export { categorizeError } from "./supabaseErrors";

// Map database trip_status to frontend RideStatus
export const mapDbStatusToFrontend = (dbStatus: string): RideStatus => {
  const statusMap: Record<string, RideStatus> = {
    requested_unpaid: "searching", // NEW - treat as searching but not dispatched yet
    requested: "searching",
    accepted: "assigned",
    en_route: "assigned",
    arrived: "arrived",
    in_progress: "in_trip",
    completed: "completed",
    cancelled: "cancelled",
  };
  return statusMap[dbStatus] || "idle";
};

// Map frontend RideStatus to database trip_status
export const mapFrontendStatusToDb = (frontendStatus: RideStatus): string => {
  const statusMap: Record<RideStatus, string> = {
    idle: "requested",
    searching: "requested",
    assigned: "accepted",
    arrived: "arrived",
    in_trip: "in_progress",
    completed: "completed",
    cancelled: "cancelled",
  };
  return statusMap[frontendStatus] || "requested";
};

// Create a ride in the database
export interface CreateRideDbPayload {
  pickup: string;
  destination: string;
  pickupCoords?: { lat: number; lng: number };
  dropoffCoords?: { lat: number; lng: number };
  rideType: string;
  price: number;
  distance: number;
  duration: number;
  customerName?: string;
  customerPhone?: string;
  initialStatus?: "requested" | "requested_unpaid"; // NEW - allows creating unpaid rides
  surgeMultiplier?: number;
  surgeLevel?: string;
  // Quote-based pricing data
  insuranceFee?: number;
  bookingFee?: number;
  zoneName?: string;
  zoneId?: string;
  multipliers?: {
    rideType: number;
    time: number;
    weather: number;
    surge: number;
    event: number;
    longTrip: number;
    combined: number;
  };
}

// Result type for createRideInDb with full error info
export interface CreateRideResult {
  tripId: string | null;
  error: SupabaseErrorInfo | null;
  attempts: number;
}

// Options for createRideInDb
export interface CreateRideOptions {
  enableRetry?: boolean;
  maxAttempts?: number;
  onRetry?: (attempt: number, error: SupabaseErrorInfo) => void;
}

export const createRideInDb = async (
  payload: CreateRideDbPayload,
  options: CreateRideOptions = {}
): Promise<CreateRideResult> => {
  const { enableRetry = true, maxAttempts = 3, onRetry } = options;

  // Check if we're online first
  if (!isOnline()) {
    return {
      tripId: null,
      error: {
        type: "network",
        message: "Device is offline",
        userMessage: "No internet connection. Please check your network.",
        isRetryable: true,
      },
      attempts: 0,
    };
  }

  const operation = async (): Promise<string> => {
    // Get current authenticated user if available
    const { data: { user } } = await supabase.auth.getUser();

    // Use provided status or default to 'requested'
    const initialStatus = payload.initialStatus || "requested";

    // Note: We cast the insert object to allow 'requested_unpaid' status
    // which may not be in generated types until DB types are regenerated
    // Calculate platform fee and driver earning
    const platformFee = Math.round(payload.price * 0.15 * 100) / 100;
    const driverEarning = Math.round((payload.price - platformFee) * 100) / 100;

    const insertData = {
      rider_id: user?.id ?? null,
      pickup_address: payload.pickup,
      dropoff_address: payload.destination,
      pickup_lat: payload.pickupCoords?.lat,
      pickup_lng: payload.pickupCoords?.lng,
      dropoff_lat: payload.dropoffCoords?.lat,
      dropoff_lng: payload.dropoffCoords?.lng,
      ride_type: payload.rideType,
      fare_amount: payload.price,
      distance_km: payload.distance * 1.60934, // miles to km
      duration_minutes: payload.duration,
      status: initialStatus,
      customer_name: payload.customerName,
      customer_phone: payload.customerPhone,
      // Surge pricing fields
      surge_multiplier: payload.surgeMultiplier || payload.multipliers?.surge || 1,
      surged_fare: payload.price, // finalPrice already includes surge
      // Quote-based pricing data
      insurance_fee: payload.insuranceFee || 0,
      zone_id: payload.zoneId || null,
      zone_name: payload.zoneName || null,
      // Full multipliers JSON for auditing
      multipliers: payload.multipliers ? JSON.stringify(payload.multipliers) : null,
      // Platform fee (15%) and driver earning (85%)
      commission_amount: platformFee,
      platform_fee: platformFee,
      driver_earning: driverEarning,
    };

    const { data, error } = await supabase
      .from("trips")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert([insertData as any])
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    if (!data?.id) {
      throw new Error("No trip ID returned");
    }

    console.log("[supabaseRide] Trip created with ID:", data.id, "status:", initialStatus, "rider_id:", user?.id ?? "anonymous");

    // Only trigger auto-dispatch if status is 'requested' (already paid/ready)
    // Skip dispatch for 'requested_unpaid' - will be triggered after payment
    if (initialStatus === "requested") {
      try {
        const dispatchResponse = await fetch(
          `https://slirphzzwcogdbkeicff.supabase.co/functions/v1/auto-dispatch`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaXJwaHp6d2NvZ2Ria2VpY2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDUzMzgsImV4cCI6MjA4NTAyMTMzOH0.44uwdZZxQZYmmHr9yUALGO4Vr6mJVaVfSQW_pzJ0uoI`,
            },
            body: JSON.stringify({ trip_id: data.id }),
          }
        );
        const dispatchResult = await dispatchResponse.json();
        console.log("[supabaseRide] Auto-dispatch result:", dispatchResult);
      } catch (dispatchError) {
        // Don't fail the trip creation if dispatch fails - it will stay in 'requested' status
        console.warn("[supabaseRide] Auto-dispatch failed, trip remains in requested status:", dispatchError);
      }
    } else {
      console.log("[supabaseRide] Skipping auto-dispatch for unpaid ride, waiting for payment completion");
    }

    return data.id;
  };

  if (enableRetry) {
    const result = await withRetry(operation, { maxAttempts, onRetry });
    return {
      tripId: result.data,
      error: result.error,
      attempts: result.attempts,
    };
  }

  // Single attempt without retry
  try {
    const tripId = await operation();
    return { tripId, error: null, attempts: 1 };
  } catch (err) {
    console.error("Failed to create ride in DB:", err);
    return { tripId: null, error: categorizeError(err), attempts: 1 };
  }
};

// Fetch driver info from database
export const fetchDriverInfo = async (driverId: string): Promise<DriverInfo | null> => {
  try {
    const { data, error } = await supabase
      .from("drivers")
      .select("id, full_name, rating, vehicle_model, vehicle_plate, avatar_url, total_trips")
      .eq("id", driverId)
      .single();

    if (error || !data) {
      console.error("Error fetching driver:", error);
      return null;
    }

    return {
      id: data.id,
      name: data.full_name,
      rating: data.rating || 4.8,
      car: data.vehicle_model || "Vehicle",
      plate: data.vehicle_plate,
      avatar: data.avatar_url || undefined,
      trips: data.total_trips || 0,
    };
  } catch (err) {
    console.error("Failed to fetch driver info:", err);
    return null;
  }
};

// Subscribe to ride updates
export interface RideUpdateCallbacks {
  onStatusChange: (status: RideStatus, dbStatus: string) => void;
  onDriverAssigned: (driverId: string) => void;
  onError?: (error: Error) => void;
}

export const subscribeToRide = (
  tripId: string,
  callbacks: RideUpdateCallbacks
): (() => void) => {
  const channel: RealtimeChannel = supabase
    .channel(`ride-${tripId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "trips",
        filter: `id=eq.${tripId}`,
      },
      (payload) => {
        const newData = payload.new as { status?: string; driver_id?: string };
        
        if (newData.status) {
          const frontendStatus = mapDbStatusToFrontend(newData.status);
          callbacks.onStatusChange(frontendStatus, newData.status);
        }

        if (newData.driver_id) {
          callbacks.onDriverAssigned(newData.driver_id);
        }
      }
    )
    .subscribe((status) => {
      if (status === "CHANNEL_ERROR") {
        callbacks.onError?.(new Error("Realtime subscription error"));
      }
    });

  // Return cleanup function
  return () => {
    supabase.removeChannel(channel);
  };
};

// Database trip status type
type DbTripStatus = "requested" | "accepted" | "en_route" | "arrived" | "in_progress" | "completed" | "cancelled";

// Result type for status update operations
export interface UpdateRideResult {
  success: boolean;
  error: SupabaseErrorInfo | null;
  attempts: number;
}

// Options for update/cancel operations
export interface UpdateRideOptions {
  enableRetry?: boolean;
  maxAttempts?: number;
  onRetry?: (attempt: number, error: SupabaseErrorInfo) => void;
}

// Update ride status in database with retry
export const updateRideStatusInDb = async (
  tripId: string,
  status: RideStatus,
  options: UpdateRideOptions = {}
): Promise<UpdateRideResult> => {
  const { enableRetry = true, maxAttempts = 3, onRetry } = options;

  // Check if we're online first
  if (!isOnline()) {
    return {
      success: false,
      error: {
        type: "network",
        message: "Device is offline",
        userMessage: "No internet connection. Please check your network.",
        isRetryable: true,
      },
      attempts: 0,
    };
  }

  const operation = async (): Promise<boolean> => {
    const dbStatus = mapFrontendStatusToDb(status) as DbTripStatus;
    const { error } = await supabase
      .from("trips")
      .update({ status: dbStatus, updated_at: new Date().toISOString() })
      .eq("id", tripId);

    if (error) throw error;
    return true;
  };

  if (enableRetry) {
    const result = await withRetry(operation, {
      maxAttempts,
      onRetry: (attempt, err) => {
        console.log(`[updateRideStatus] Retry ${attempt}...`);
        onRetry?.(attempt, err);
      },
    });
    return {
      success: result.data ?? false,
      error: result.error,
      attempts: result.attempts,
    };
  }

  // Single attempt without retry
  try {
    await operation();
    return { success: true, error: null, attempts: 1 };
  } catch (err) {
    console.error("Failed to update ride status:", err);
    return { success: false, error: categorizeError(err), attempts: 1 };
  }
};

// Save rating and feedback to the database
export interface SaveRatingPayload {
  tripId: string;
  rating: number; // 1-5
  feedback?: string; // Optional comment
  ratingCategories?: {
    driving?: number;
    cleanliness?: number;
    friendliness?: number;
    navigation?: number;
  };
  ratingTags?: string[];
}

export const saveRideRating = async (
  payload: SaveRatingPayload
): Promise<UpdateRideResult> => {
  // Check if we're online first
  if (!isOnline()) {
    return {
      success: false,
      error: {
        type: "network",
        message: "Device is offline",
        userMessage: "No internet connection. Please check your network.",
        isRetryable: true,
      },
      attempts: 0,
    };
  }

  try {
    const updateData: Record<string, unknown> = {
      rating: payload.rating,
      feedback: payload.feedback || null,
      updated_at: new Date().toISOString(),
    };

    if (payload.ratingCategories) {
      updateData.rating_categories = payload.ratingCategories;
    }
    if (payload.ratingTags && payload.ratingTags.length > 0) {
      updateData.rating_tags = payload.ratingTags;
    }

    const { error } = await supabase
      .from("trips")
      .update(updateData as any)
      .eq("id", payload.tripId);

    if (error) throw error;
    return { success: true, error: null, attempts: 1 };
  } catch (err) {
    console.error("Failed to save rating:", err);
    return { success: false, error: categorizeError(err), attempts: 1 };
  }
};

// Cancel a ride in the database with retry
export const cancelRideInDb = async (
  tripId: string,
  options: UpdateRideOptions = {}
): Promise<UpdateRideResult> => {
  const { enableRetry = true, maxAttempts = 3, onRetry } = options;

  // Check if we're online first
  if (!isOnline()) {
    return {
      success: false,
      error: {
        type: "network",
        message: "Device is offline",
        userMessage: "No internet connection. Please check your network.",
        isRetryable: true,
      },
      attempts: 0,
    };
  }

  const operation = async (): Promise<boolean> => {
    const { error } = await supabase
      .from("trips")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", tripId);

    if (error) throw error;
    return true;
  };

  if (enableRetry) {
    const result = await withRetry(operation, {
      maxAttempts,
      onRetry: (attempt, err) => {
        console.log(`[cancelRide] Retry ${attempt}...`);
        onRetry?.(attempt, err);
      },
    });
    return {
      success: result.data ?? false,
      error: result.error,
      attempts: result.attempts,
    };
  }

  // Single attempt without retry
  try {
    await operation();
    return { success: true, error: null, attempts: 1 };
  } catch (err) {
    console.error("Failed to cancel ride:", err);
    return { success: false, error: categorizeError(err), attempts: 1 };
  }
};

// Fetch a trip by ID (for restoring state after redirect from payments app)
export const fetchTripById = async (tripId: string) => {
  try {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .single();

    if (error) {
      console.error("[fetchTripById] Error:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("[fetchTripById] Exception:", err);
    return null;
  }
};

// Update ride status to 'requested' and trigger auto-dispatch
// Used when returning from payments app to activate the ride
export const updateRideStatusAndDispatch = async (
  tripId: string
): Promise<UpdateRideResult> => {
  // Check if we're online first
  if (!isOnline()) {
    return {
      success: false,
      error: {
        type: "network",
        message: "Device is offline",
        userMessage: "No internet connection. Please check your network.",
        isRetryable: true,
      },
      attempts: 0,
    };
  }

  try {
    // Update status to 'requested' (payment confirmed)
    const { error } = await supabase
      .from("trips")
      .update({ status: "requested", updated_at: new Date().toISOString() })
      .eq("id", tripId);

    if (error) {
      console.error("[updateRideStatusAndDispatch] Update error:", error);
      return { success: false, error: categorizeError(error), attempts: 1 };
    }

    console.log("[updateRideStatusAndDispatch] Status updated to 'requested' for trip:", tripId);

    // Trigger auto-dispatch to find and assign nearest driver
    try {
      const dispatchResponse = await fetch(
        `https://slirphzzwcogdbkeicff.supabase.co/functions/v1/auto-dispatch`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaXJwaHp6d2NvZ2Ria2VpY2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDUzMzgsImV4cCI6MjA4NTAyMTMzOH0.44uwdZZxQZYmmHr9yUALGO4Vr6mJVaVfSQW_pzJ0uoI`,
          },
          body: JSON.stringify({ trip_id: tripId }),
        }
      );
      const dispatchResult = await dispatchResponse.json();
      console.log("[updateRideStatusAndDispatch] Auto-dispatch result:", dispatchResult);
    } catch (dispatchError) {
      // Don't fail if dispatch fails - ride is in 'requested' status and can be retried
      console.warn("[updateRideStatusAndDispatch] Auto-dispatch failed:", dispatchError);
    }

    return { success: true, error: null, attempts: 1 };
  } catch (err) {
    console.error("[updateRideStatusAndDispatch] Exception:", err);
    return { success: false, error: categorizeError(err), attempts: 1 };
  }
};

// Save a tip for a completed ride
export const saveRideTip = async (
  tripId: string,
  tipAmount: number
): Promise<UpdateRideResult> => {
  if (!isOnline()) {
    return {
      success: false,
      error: {
        type: "network",
        message: "Device is offline",
        userMessage: "No internet connection. Please check your network.",
        isRetryable: true,
      },
      attempts: 0,
    };
  }

  try {
    // Try to update existing driver_earnings row for this trip
    const { data: existing, error: fetchError } = await supabase
      .from("driver_earnings")
      .select("id")
      .eq("trip_id", tripId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existing) {
      const { error } = await supabase
        .from("driver_earnings")
        .update({ tip_amount: tipAmount })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      // Fetch trip to get driver_id
      const { data: trip, error: tripError } = await supabase
        .from("trips")
        .select("driver_id, fare_amount")
        .eq("id", tripId)
        .single();

      if (tripError || !trip?.driver_id) {
        console.warn("[saveRideTip] No trip or driver found for trip:", tripId);
        return { success: false, error: categorizeError(tripError || new Error("No driver found")), attempts: 1 };
      }

      const { error } = await supabase
        .from("driver_earnings")
        .insert({
          driver_id: trip.driver_id,
          trip_id: tripId,
          tip_amount: tipAmount,
          amount: trip.fare_amount || 0,
          earning_type: "ride",
        } as any);
      if (error) throw error;
    }

    console.log("[saveRideTip] Tip saved:", tipAmount, "for trip:", tripId);
    return { success: true, error: null, attempts: 1 };
  } catch (err) {
    console.error("[saveRideTip] Failed:", err);
    return { success: false, error: categorizeError(err), attempts: 1 };
  }
};
