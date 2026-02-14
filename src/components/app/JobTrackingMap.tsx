/**
 * JobTrackingMap Component
 *
 * Live Google Map showing pickup, dropoff, and animated driver marker.
 * Subscribes to trip_locations for real-time driver position.
 */

import { useState, useEffect, useCallback } from "react";
import GoogleMap from "@/components/maps/GoogleMap";
import AnimatedDriverMarker from "@/components/maps/AnimatedDriverMarker";
import ZivoPickupMarker from "@/components/maps/ZivoPickupMarker";
import ZivoDropoffMarker from "@/components/maps/ZivoDropoffMarker";
import { supabase } from "@/integrations/supabase/client";
import { MapPin } from "lucide-react";

interface JobTrackingMapProps {
  jobId: string;
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

const JobTrackingMap = ({
  jobId,
  pickupLat,
  pickupLng,
  dropoffLat,
  dropoffLng,
  className = "",
}: JobTrackingMapProps) => {
  const [driverPos, setDriverPos] = useState<DriverPos | null>(null);
  const [waitingForLocation, setWaitingForLocation] = useState(true);

  // Fetch latest location on mount
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
          setDriverPos({ lat: Number(row.lat), lng: Number(row.lng), heading: row.heading ? Number(row.heading) : null });
          setWaitingForLocation(false);
        }
      });
  }, [jobId]);

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
          setDriverPos({
            lat: Number(row.lat),
            lng: Number(row.lng),
            heading: row.heading ? Number(row.heading) : null,
          });
          setWaitingForLocation(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId]);

  const hasPickup = pickupLat != null && pickupLng != null;
  const hasDropoff = dropoffLat != null && dropoffLng != null;

  const center = hasPickup
    ? { lat: pickupLat!, lng: pickupLng! }
    : { lat: 40.7128, lng: -74.006 };

  const pickup = hasPickup ? { lat: pickupLat!, lng: pickupLng! } : undefined;
  const dropoff = hasDropoff ? { lat: dropoffLat!, lng: dropoffLng! } : undefined;

  // Build markers for driver (rendered via AnimatedDriverMarker inside GoogleMap)
  const driverMarkers = driverPos
    ? [{ id: "driver", position: { lat: driverPos.lat, lng: driverPos.lng }, type: "driver" as const, title: "Driver" }]
    : [];

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-border ${className}`}>
      <GoogleMap
        className="w-full h-full"
        center={center}
        zoom={14}
        pickup={pickup}
        dropoff={dropoff}
        markers={driverMarkers}
        fitBounds
        darkMode
      />

      {/* Waiting overlay */}
      {waitingForLocation && (
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
