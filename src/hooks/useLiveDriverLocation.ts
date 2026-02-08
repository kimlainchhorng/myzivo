/**
 * useLiveDriverLocation Hook
 * Real-time driver location tracking with stale detection
 * Subscribes to driver_locations table for efficient updates
 */
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DriverLocation {
  lat: number;
  lng: number;
  heading: number | null;
  speed: number | null;
  updated_at: string;
}

// Stale threshold: 60 seconds without update
const STALE_THRESHOLD_MS = 60000;
// How often to check for stale status
const STALE_CHECK_INTERVAL_MS = 10000;

export function useLiveDriverLocation(
  driverId: string | null | undefined,
  orderStatus: string | undefined
) {
  const [location, setLocation] = useState<DriverLocation | null>(null);
  const [isStale, setIsStale] = useState(false);
  const locationRef = useRef<DriverLocation | null>(null);

  // Only track when order is out_for_delivery or ready_for_pickup
  const shouldTrack = driverId && 
    (orderStatus === "out_for_delivery" || orderStatus === "ready_for_pickup");

  useEffect(() => {
    if (!shouldTrack || !driverId) {
      setLocation(null);
      setIsStale(false);
      return;
    }

    let channel: ReturnType<typeof supabase.channel> | null = null;
    let staleInterval: NodeJS.Timeout | null = null;

    // Initial fetch from driver_locations
    const fetchLocation = async () => {
      const { data, error } = await supabase
        .from("driver_locations")
        .select("lat, lng, heading, speed, updated_at")
        .eq("driver_id", driverId)
        .maybeSingle();

      if (data && !error) {
        const loc = data as DriverLocation;
        setLocation(loc);
        locationRef.current = loc;
        
        // Check if already stale on initial load
        const age = Date.now() - new Date(loc.updated_at).getTime();
        setIsStale(age > STALE_THRESHOLD_MS);
      }
    };

    fetchLocation();

    // Realtime subscription to driver_locations
    channel = supabase
      .channel(`live-driver-location-${driverId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "driver_locations",
          filter: `driver_id=eq.${driverId}`,
        },
        (payload) => {
          if (payload.new) {
            const newLoc = payload.new as DriverLocation;
            setLocation(newLoc);
            locationRef.current = newLoc;
            setIsStale(false); // Fresh update received
          }
        }
      )
      .subscribe();

    // Stale detection interval
    staleInterval = setInterval(() => {
      const currentLoc = locationRef.current;
      if (currentLoc?.updated_at) {
        const age = Date.now() - new Date(currentLoc.updated_at).getTime();
        setIsStale(age > STALE_THRESHOLD_MS);
      }
    }, STALE_CHECK_INTERVAL_MS);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      if (staleInterval) {
        clearInterval(staleInterval);
      }
    };
  }, [driverId, shouldTrack]);

  return { location, isStale };
}
