/**
 * RestaurantDriverMap Component
 * 
 * Compact map for restaurant dashboard showing drivers approaching for pickup.
 * Subscribes to active orders with assigned drivers and their live locations.
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import GoogleMap, { MapMarker } from "@/components/maps/GoogleMap";
import FloatingEtaCard from "@/components/maps/FloatingEtaCard";
import { haversineMiles } from "@/services/mapsApi";
import { MapPin, Truck } from "lucide-react";

interface RestaurantDriverMapProps {
  restaurantId: string;
  restaurantLat?: number;
  restaurantLng?: number;
}

interface DriverApproaching {
  orderId: string;
  driverId: string;
  lat: number;
  lng: number;
  heading: number | null;
  distanceMiles: number;
}

const AVG_SPEED_MPM = 0.5; // 30 mph

export default function RestaurantDriverMap({
  restaurantId,
  restaurantLat = 40.7128,
  restaurantLng = -73.9857,
}: RestaurantDriverMapProps) {
  const [drivers, setDrivers] = useState<DriverApproaching[]>([]);

  useEffect(() => {
    if (!restaurantId) return;

    const fetchDrivers = async () => {
      // Get active orders with assigned drivers
      const { data: orders } = await supabase
        .from("food_orders")
        .select("id, driver_id")
        .eq("restaurant_id", restaurantId)
        .in("status", ["ready", "confirmed", "preparing"])
        .not("driver_id", "is", null);

      if (!orders?.length) {
        setDrivers([]);
        return;
      }

      const driverIds = orders.map((o) => o.driver_id!).filter(Boolean);

      // Get driver locations
      const { data: locations } = await supabase
        .from("driver_locations")
        .select("driver_id, lat, lng, heading")
        .in("driver_id", driverIds);

      if (!locations?.length) {
        setDrivers([]);
        return;
      }

      const result: DriverApproaching[] = locations.map((loc) => {
        const order = orders.find((o) => o.driver_id === loc.driver_id);
        const dist = haversineMiles(loc.lat, loc.lng, restaurantLat, restaurantLng);
        return {
          orderId: order?.id ?? "",
          driverId: loc.driver_id,
          lat: loc.lat,
          lng: loc.lng,
          heading: loc.heading,
          distanceMiles: dist,
        };
      });

      setDrivers(result.sort((a, b) => a.distanceMiles - b.distanceMiles));
    };

    fetchDrivers();

    // Realtime subscription for order changes
    const channel = supabase
      .channel(`restaurant-drivers-${restaurantId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "food_orders",
        filter: `restaurant_id=eq.${restaurantId}`,
      }, () => fetchDrivers())
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "driver_locations",
      }, () => fetchDrivers())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [restaurantId, restaurantLat, restaurantLng]);

  const restaurantPos = { lat: restaurantLat, lng: restaurantLng };
  
  const markers: MapMarker[] = [
    { id: "restaurant", position: restaurantPos, type: "pickup", title: "Your Restaurant" },
    ...drivers.map((d) => ({
      id: `driver-${d.driverId}`,
      position: { lat: d.lat, lng: d.lng },
      type: "driver" as const,
      title: `Driver • ${d.distanceMiles.toFixed(1)} mi away`,
    })),
  ];

  const nearest = drivers[0];
  const nearestEta = nearest ? Math.max(1, Math.ceil(nearest.distanceMiles / AVG_SPEED_MPM)) : null;

  if (drivers.length === 0) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 flex flex-col items-center justify-center min-h-[200px] gap-3 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
        <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center">
          <Truck className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground text-center">No drivers approaching right now</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 overflow-hidden bg-card/50 backdrop-blur-sm">
      <div className="p-4 border-b border-border/50 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-eats" />
        <h3 className="font-semibold text-sm">Drivers Approaching</h3>
        <span className="ml-auto text-xs text-muted-foreground">{drivers.length} active</span>
      </div>
      <div className="relative h-[250px]">
        <GoogleMap
          className="w-full h-full"
          center={restaurantPos}
          zoom={14}
          markers={markers}
          showControls={false}
          darkMode={false}
        />
        <FloatingEtaCard
          etaMinutes={nearestEta}
          distanceMiles={nearest?.distanceMiles}
          statusLabel="Nearest driver"
        />
      </div>
    </div>
  );
}
