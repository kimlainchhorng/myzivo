/**
 * useRideRealtime — Subscribes to ride_requests changes for live status updates
 * Replaces mock timer-based flow with real Supabase realtime
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DriverInfo {
  name: string;
  fullName: string;
  initials: string;
  rating: number;
  trips: number;
  vehicle: string;
  plate: string;
  phone: string;
  etaMin: number;
  lat: number | null;
  lng: number | null;
}

export interface RideRealtimeState {
  status: string | null;
  driver: DriverInfo | null;
  driverCoords: { lat: number; lng: number } | null;
  isListening: boolean;
}

const DEFAULT_DRIVER: DriverInfo = {
  name: "Driver",
  fullName: "Your Driver",
  initials: "D",
  rating: 5.0,
  trips: 0,
  vehicle: "Vehicle",
  plate: "---",
  phone: "",
  etaMin: 5,
  lat: null,
  lng: null,
};

/**
 * Subscribe to a ride_request by ID and get live status + driver info
 */
export function useRideRealtime(rideRequestId: string | null) {
  const [state, setState] = useState<RideRealtimeState>({
    status: null,
    driver: null,
    driverCoords: null,
    isListening: false,
  });

  // Fetch driver info when assigned
  const fetchDriverInfo = useCallback(async (driverId: string) => {
    const { data } = await supabase
      .from("drivers")
      .select("full_name, rating, total_trips, vehicle_model, vehicle_color, vehicle_plate, phone, current_lat, current_lng")
      .eq("id", driverId)
      .single();

    if (data) {
      const nameParts = (data.full_name || "Driver").split(" ");
      const initials = nameParts.map((p: string) => p[0]).join("").slice(0, 2).toUpperCase();
      const shortName = nameParts[0] + (nameParts.length > 1 ? ` ${nameParts[1][0]}.` : "");

      const driver: DriverInfo = {
        name: shortName,
        fullName: data.full_name || "Your Driver",
        initials,
        rating: data.rating ?? 5.0,
        trips: data.total_trips ?? 0,
        vehicle: `${data.vehicle_color || ""} ${data.vehicle_model || "Vehicle"}`.trim(),
        plate: data.vehicle_plate || "---",
        phone: data.phone || "",
        etaMin: 5,
        lat: data.current_lat,
        lng: data.current_lng,
      };

      setState((prev) => ({
        ...prev,
        driver,
        driverCoords: data.current_lat && data.current_lng
          ? { lat: data.current_lat, lng: data.current_lng }
          : prev.driverCoords,
      }));
    }
  }, []);

  // Poll driver location every 5s when in en-route or in-progress states
  useEffect(() => {
    if (!rideRequestId || !state.driver || !["driver_en_route", "trip_in_progress", "driver_assigned"].includes(state.status || "")) {
      return;
    }

    const pollDriverLocation = async () => {
      const { data } = await supabase
        .from("ride_requests")
        .select("assigned_driver_id")
        .eq("id", rideRequestId)
        .single();

      if (data?.assigned_driver_id) {
        const { data: driverData } = await supabase
          .from("drivers")
          .select("current_lat, current_lng")
          .eq("id", data.assigned_driver_id)
          .single();

        if (driverData?.current_lat && driverData?.current_lng) {
          setState((prev) => ({
            ...prev,
            driverCoords: { lat: driverData.current_lat!, lng: driverData.current_lng! },
          }));
        }
      }
    };

    const interval = setInterval(pollDriverLocation, 5000);
    return () => clearInterval(interval);
  }, [rideRequestId, state.driver, state.status]);

  // Main realtime subscription
  useEffect(() => {
    if (!rideRequestId) {
      setState({ status: null, driver: null, driverCoords: null, isListening: false });
      return;
    }

    setState((prev) => ({ ...prev, isListening: true }));

    // Fetch initial state
    const fetchInitial = async () => {
      const { data } = await supabase
        .from("ride_requests")
        .select("status, assigned_driver_id")
        .eq("id", rideRequestId)
        .single();

      if (data) {
        setState((prev) => ({ ...prev, status: data.status }));
        if (data.assigned_driver_id) {
          fetchDriverInfo(data.assigned_driver_id);
        }
      }
    };
    fetchInitial();

    // Subscribe to changes
    const channel = supabase
      .channel(`ride-${rideRequestId}`)
      .on(
        "postgres_changes" as any,
        {
          event: "UPDATE",
          schema: "public",
          table: "ride_requests",
          filter: `id=eq.${rideRequestId}`,
        },
        (payload: any) => {
          const newRow = payload.new;
          setState((prev) => ({ ...prev, status: newRow.status }));

          // Fetch driver info when first assigned
          if (newRow.assigned_driver_id && !state.driver) {
            fetchDriverInfo(newRow.assigned_driver_id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      setState((prev) => ({ ...prev, isListening: false }));
    };
  }, [rideRequestId, fetchDriverInfo]); // eslint-disable-line react-hooks/exhaustive-deps

  return state;
}
