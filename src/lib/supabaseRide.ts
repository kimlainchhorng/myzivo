import { supabase } from "@/integrations/supabase/client";
import { RideStatus, DriverInfo } from "@/types/rideTypes";
import { RealtimeChannel } from "@supabase/supabase-js";

// Check if Supabase is configured (client exists with valid URL)
export const isSupabaseConfigured = (): boolean => {
  try {
    // The client is hardcoded, so it's always available
    return true;
  } catch {
    return false;
  }
};

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

export const createRideInDb = async (payload: CreateRideDbPayload): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from("trips")
      .insert({
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
      console.error("Error creating ride in DB:", error);
      return null;
    }

    return data?.id || null;
  } catch (err) {
    console.error("Failed to create ride in DB:", err);
    return null;
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

// Update ride status in database
export const updateRideStatusInDb = async (tripId: string, status: RideStatus): Promise<boolean> => {
  try {
    const dbStatus = mapFrontendStatusToDb(status) as DbTripStatus;
    const { error } = await supabase
      .from("trips")
      .update({ status: dbStatus, updated_at: new Date().toISOString() })
      .eq("id", tripId);

    if (error) {
      console.error("Error updating ride status:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Failed to update ride status:", err);
    return false;
  }
};

// Cancel a ride in the database
export const cancelRideInDb = async (tripId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("trips")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", tripId);

    if (error) {
      console.error("Error cancelling ride:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Failed to cancel ride:", err);
    return false;
  }
};
