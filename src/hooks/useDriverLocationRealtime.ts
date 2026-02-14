import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DriverLocationState {
  lat: number | null;
  lng: number | null;
  heading: number | null;
  lastSeen: string | null;
  driverState: string | null;
  staleSec: number;
}

/**
 * Subscribe to realtime location updates from drivers_status for a given driver_id.
 * Returns null when driverId is null (no driver assigned yet).
 */
export function useDriverLocationRealtime(driverId: string | null): DriverLocationState | null {
  const [loc, setLoc] = useState<DriverLocationState | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Compute staleness every second
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!loc?.lastSeen) return;

    const tick = () => {
      if (!loc?.lastSeen) return;
      const sec = Math.floor((Date.now() - new Date(loc.lastSeen).getTime()) / 1000);
      setLoc((prev) => (prev ? { ...prev, staleSec: sec } : prev));
    };
    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [loc?.lastSeen]);

  // Initial fetch
  useEffect(() => {
    if (!driverId) { setLoc(null); return; }

    supabase
      .from("drivers_status")
      .select("lat, lng, heading, last_seen, driver_state")
      .eq("driver_id", driverId)
      .single()
      .then(({ data }) => {
        if (data) {
          setLoc({
            lat: data.lat,
            lng: data.lng,
            heading: data.heading,
            lastSeen: data.last_seen,
            driverState: data.driver_state,
            staleSec: data.last_seen
              ? Math.floor((Date.now() - new Date(data.last_seen).getTime()) / 1000)
              : 0,
          });
        }
      });
  }, [driverId]);

  // Realtime subscription
  useEffect(() => {
    if (!driverId) return;

    const channel = supabase
      .channel(`driver-loc-${driverId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "drivers_status",
          filter: `driver_id=eq.${driverId}`,
        },
        (payload) => {
          const d = payload.new as any;
          setLoc({
            lat: d.lat,
            lng: d.lng,
            heading: d.heading,
            lastSeen: d.last_seen,
            driverState: d.driver_state,
            staleSec: d.last_seen
              ? Math.floor((Date.now() - new Date(d.last_seen).getTime()) / 1000)
              : 0,
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [driverId]);

  return driverId ? loc : null;
}
