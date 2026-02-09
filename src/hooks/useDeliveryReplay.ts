/**
 * useDeliveryReplay Hook
 * Fetches driver GPS trail and key event markers for a completed delivery
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RoutePoint {
  lat: number;
  lng: number;
  recorded_at: string;
}

export interface EventMarker {
  label: string;
  lat: number;
  lng: number;
  timestamp: string;
  color: string; // hex
}

interface DeliveryReplayData {
  routePoints: RoutePoint[];
  eventMarkers: EventMarker[];
  isApproximate: boolean;
  hasDetailedRoute: boolean;
}

export function useDeliveryReplay(
  orderId: string | undefined,
  driverId: string | null | undefined,
  pickedUpAt: string | null | undefined,
  deliveredAt: string | null | undefined,
  pickupLat: number | null | undefined,
  pickupLng: number | null | undefined,
  deliveryLat: number | null | undefined,
  deliveryLng: number | null | undefined
) {
  return useQuery<DeliveryReplayData>({
    queryKey: ["delivery-replay", orderId],
    queryFn: async () => {
      const eventMarkers: EventMarker[] = [];

      // Add pickup marker
      if (pickupLat != null && pickupLng != null && pickedUpAt) {
        eventMarkers.push({
          label: "Picked Up",
          lat: pickupLat,
          lng: pickupLng,
          timestamp: pickedUpAt,
          color: "#f97316", // orange
        });
      }

      // Add delivery marker
      if (deliveryLat != null && deliveryLng != null && deliveredAt) {
        eventMarkers.push({
          label: "Delivered",
          lat: deliveryLat,
          lng: deliveryLng,
          timestamp: deliveredAt,
          color: "#22c55e", // green
        });
      }

      // Fetch GPS trail
      if (!driverId || !pickedUpAt || !deliveredAt) {
        return {
          routePoints: [],
          eventMarkers,
          isApproximate: true,
          hasDetailedRoute: false,
        };
      }

      const { data, error } = await supabase
        .from("driver_location_history")
        .select("lat, lng, recorded_at")
        .eq("driver_id", driverId)
        .gte("recorded_at", pickedUpAt)
        .lte("recorded_at", deliveredAt)
        .order("recorded_at", { ascending: true });

      if (error) {
        console.error("[useDeliveryReplay] Error fetching route:", error);
        throw error;
      }

      const routePoints: RoutePoint[] = (data || []).map((p: any) => ({
        lat: p.lat,
        lng: p.lng,
        recorded_at: p.recorded_at,
      }));

      return {
        routePoints,
        eventMarkers,
        isApproximate: routePoints.length < 3,
        hasDetailedRoute: routePoints.length >= 3,
      };
    },
    enabled: !!orderId && !!pickedUpAt && !!deliveredAt,
    staleTime: Infinity, // Historical data doesn't change
  });
}
