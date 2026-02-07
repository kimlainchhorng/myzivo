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

    const { data, error } = await supabase
      .from("trips")
      .insert({
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
        status: "requested",
        customer_name: payload.customerName,
        customer_phone: payload.customerPhone,
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    if (!data?.id) {
      throw new Error("No trip ID returned");
    }

    console.log("[supabaseRide] Trip created with ID:", data.id, "rider_id:", user?.id ?? "anonymous");
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
      .select("full_name, rating, vehicle_model, vehicle_plate, avatar_url, total_trips")
      .eq("id", driverId)
      .single();

    if (error || !data) {
      console.error("Error fetching driver:", error);
      return null;
    }

    return {
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
