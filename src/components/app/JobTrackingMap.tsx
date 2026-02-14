/**
 * JobTrackingMap Component
 *
 * Live Google Map with pickup/dropoff markers, animated driver marker,
 * route polyline from Google Directions (via maps-route edge function),
 * and real-time ETA + distance display.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import GoogleMap from "@/components/maps/GoogleMap";
import { supabase } from "@/integrations/supabase/client";
import { decodePolyline } from "@/services/googleMaps";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock, Navigation2 } from "lucide-react";
import type { JobStatus } from "@/hooks/useJobRequest";

interface JobTrackingMapProps {
  jobId: string;
  jobStatus: JobStatus;
  pickupLat: number | null;
  pickupLng: number | null;
  dropoffLat: number | null;
  dropoffLng: number | null;
  className?: string;
}

interface DriverPos {
  lat: number;
  lng: number;
  heading: number | null;
}

interface RouteInfo {
  polylinePath: google.maps.LatLngLiteral[];
  durationMinutes: number;
  distanceMiles: number;
  trafficLevel: string;
}

const SUPABASE_URL = "https://slirphzzwcogdbkeicff.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaXJwaHp6d2NvZ2Ria2VpY2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDUzMzgsImV4cCI6MjA4NTAyMTMzOH0.44uwdZZxQZYmmHr9yUALGO4Vr6mJVaVfSQW_pzJ0uoI";

// Minimum interval between route API calls (ms)
const ROUTE_THROTTLE_MS = 25_000;

async function fetchRoute(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): Promise<RouteInfo | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/maps-route`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON,
      },
      body: JSON.stringify({
        origin_lat: originLat,
        origin_lng: originLng,
        dest_lat: destLat,
        dest_lng: destLng,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!data.ok || !data.polyline) return null;

    const decoded = decodePolyline(data.polyline);
    const polylinePath = decoded.map(([lng, lat]) => ({ lat, lng }));

    return {
      polylinePath,
      durationMinutes: data.duration_in_traffic_minutes ?? data.duration_minutes,
      distanceMiles: data.distance_miles,
      trafficLevel: data.traffic_level ?? "moderate",
    };
  } catch (e) {
    console.warn("[JobTrackingMap] fetchRoute error:", e);
    return null;
  }
}

const JobTrackingMap = ({
  jobId,
  jobStatus,
  pickupLat,
  pickupLng,
  dropoffLat,
  dropoffLng,
  className = "",
}: JobTrackingMapProps) => {
  const [driverPos, setDriverPos] = useState<DriverPos | null>(null);
  const [waitingForLocation, setWaitingForLocation] = useState(true);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastRouteCallRef = useRef<number>(0);
  const jobStatusRef = useRef(jobStatus);
  jobStatusRef.current = jobStatus;

  const hasPickup = pickupLat != null && pickupLng != null;
  const hasDropoff = dropoffLat != null && dropoffLng != null;

  // Determine route destination based on status
  const getRouteDestination = useCallback((): { lat: number; lng: number } | null => {
    const s = jobStatusRef.current;
    if ((s === "assigned" || s === "arrived") && hasPickup) {
      return { lat: pickupLat!, lng: pickupLng! };
    }
    if (s === "in_progress" && hasDropoff) {
      return { lat: dropoffLat!, lng: dropoffLng! };
    }
    return null;
  }, [hasPickup, hasDropoff, pickupLat, pickupLng, dropoffLat, dropoffLng]);

  // Fetch route with throttle
  const refreshRoute = useCallback(async (
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    force = false
  ) => {
    const now = Date.now();
    if (!force && now - lastRouteCallRef.current < ROUTE_THROTTLE_MS) return;
    lastRouteCallRef.current = now;

    const info = await fetchRoute(originLat, originLng, destLat, destLng);
    if (info) setRouteInfo(info);
  }, []);

  // Initial pickup→dropoff preview route when assigned
  useEffect(() => {
    if (
      (jobStatus === "assigned" || jobStatus === "arrived" || jobStatus === "in_progress") &&
      hasPickup &&
      hasDropoff &&
      !routeInfo
    ) {
      refreshRoute(pickupLat!, pickupLng!, dropoffLat!, dropoffLng!, true);
    }
  }, [jobStatus, hasPickup, hasDropoff, pickupLat, pickupLng, dropoffLat, dropoffLng, routeInfo, refreshRoute]);

  // Fetch latest driver location on mount
  useEffect(() => {
    if (!jobId) return;

    supabase
      .from("trip_locations" as any)
      .select("lat, lng, heading, recorded_at")
      .eq("job_id", jobId)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const row = data[0] as any;
          const pos = {
            lat: Number(row.lat),
            lng: Number(row.lng),
            heading: row.heading ? Number(row.heading) : null,
          };
          setDriverPos(pos);
          setWaitingForLocation(false);

          // Fetch driver→dest route
          const dest = getRouteDestination();
          if (dest) refreshRoute(pos.lat, pos.lng, dest.lat, dest.lng, true);
        }
      });
  }, [jobId, getRouteDestination, refreshRoute]);

  // Realtime subscription to trip_locations
  useEffect(() => {
    if (!jobId) return;

    const channel = supabase
      .channel(`trip-loc-${jobId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "trip_locations",
          filter: `job_id=eq.${jobId}`,
        },
        (payload) => {
          const row = payload.new as any;
          const pos = {
            lat: Number(row.lat),
            lng: Number(row.lng),
            heading: row.heading ? Number(row.heading) : null,
          };
          setDriverPos(pos);
          setWaitingForLocation(false);

          // Throttled route refresh on each new location
          const dest = getRouteDestination();
          if (dest) refreshRoute(pos.lat, pos.lng, dest.lat, dest.lng);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId, getRouteDestination, refreshRoute]);

  // Manual refresh
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (driverPos) {
        const dest = getRouteDestination();
        if (dest) {
          await refreshRoute(driverPos.lat, driverPos.lng, dest.lat, dest.lng, true);
        }
      } else if (hasPickup && hasDropoff) {
        await refreshRoute(pickupLat!, pickupLng!, dropoffLat!, dropoffLng!, true);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const center = hasPickup
    ? { lat: pickupLat!, lng: pickupLng! }
    : { lat: 40.7128, lng: -74.006 };

  const pickup = hasPickup ? { lat: pickupLat!, lng: pickupLng! } : undefined;
  const dropoff = hasDropoff ? { lat: dropoffLat!, lng: dropoffLng! } : undefined;

  const driverMarkers = driverPos
    ? [{ id: "driver", position: { lat: driverPos.lat, lng: driverPos.lng }, type: "driver" as const, title: "Driver" }]
    : [];

  // Determine what label to show
  const etaLabel =
    jobStatus === "assigned" || jobStatus === "arrived"
      ? "to pickup"
      : jobStatus === "in_progress"
      ? "to dropoff"
      : "";

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-border ${className}`}>
      <GoogleMap
        className="w-full h-full"
        center={center}
        zoom={14}
        pickup={pickup}
        dropoff={dropoff}
        markers={driverMarkers}
        routePath={routeInfo?.polylinePath}
        fitBounds
        darkMode
      />

      {/* ETA + Distance overlay */}
      {routeInfo && (
        <div className="absolute top-3 left-3 right-3 z-10 flex gap-2">
          <div className="flex-1 rounded-xl bg-card/90 backdrop-blur-md border border-border px-3 py-2 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
            <div>
              <span className="text-sm font-bold text-foreground">{routeInfo.durationMinutes} min</span>
              {etaLabel && (
                <span className="text-[10px] text-muted-foreground ml-1">{etaLabel}</span>
              )}
            </div>
          </div>
          <div className="flex-1 rounded-xl bg-card/90 backdrop-blur-md border border-border px-3 py-2 flex items-center gap-2">
            <Navigation2 className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-sm font-bold text-foreground">{routeInfo.distanceMiles} mi</span>
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="rounded-xl bg-card/90 backdrop-blur-md border border-border px-2.5 py-2 flex items-center justify-center hover:bg-accent/50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      )}

      {/* Waiting overlay */}
      {waitingForLocation && jobStatus !== "requested" && (
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <div className="rounded-xl bg-card/90 backdrop-blur-md border border-border px-4 py-2.5 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground">
              Waiting for driver location...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobTrackingMap;
