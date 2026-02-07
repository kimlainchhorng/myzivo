/**
 * useOrderTracking Hook
 * 
 * Provides real-time order status and driver location tracking
 * for customer order tracking page.
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface DriverLocation {
  driver_id: string;
  driver_name: string;
  driver_lat: number | null;
  driver_lng: number | null;
  driver_vehicle_type: string | null;
  driver_avatar_url: string | null;
  last_updated: string;
}

interface OrderDetails {
  id: string;
  status: string;
  restaurant_name: string;
  restaurant_address: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  delivery_address: string;
  delivery_lat: number | null;
  delivery_lng: number | null;
  distance_miles: number;
  duration_minutes: number;
  driver_id: string | null;
  created_at: string;
  assigned_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  estimated_delivery_at: string | null;
}

interface UseOrderTrackingReturn {
  order: OrderDetails | null;
  driverLocation: DriverLocation | null;
  isLoading: boolean;
  error: string | null;
  refetchDriver: () => void;
}

export function useOrderTracking(orderId: string | undefined): UseOrderTrackingReturn {
  const queryClient = useQueryClient();
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [driverError, setDriverError] = useState<string | null>(null);

  // Fetch order details
  const {
    data: order,
    isLoading,
    error: orderError,
  } = useQuery({
    queryKey: ["order-tracking", orderId],
    queryFn: async () => {
      if (!orderId) throw new Error("No order ID");

      const { data, error } = await supabase
        .from("food_orders")
        .select(`
          id,
          status,
          delivery_address,
          delivery_lat,
          delivery_lng,
          pickup_lat,
          pickup_lng,
          distance_miles,
          duration_minutes,
          driver_id,
          created_at,
          assigned_at,
          picked_up_at,
          delivered_at,
          restaurants:restaurant_id (
            name,
            address
          )
        `)
        .eq("id", orderId)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Order not found");

      // Calculate estimated delivery from created_at + duration
      const createdAt = new Date(data.created_at);
      const estimatedDeliveryAt = data.duration_minutes 
        ? new Date(createdAt.getTime() + (data.duration_minutes || 30) * 60000).toISOString()
        : null;

      return {
        id: data.id,
        status: data.status || "pending",
        restaurant_name: (data.restaurants as any)?.name || "Restaurant",
        restaurant_address: (data.restaurants as any)?.address || "",
        pickup_lat: data.pickup_lat,
        pickup_lng: data.pickup_lng,
        delivery_address: data.delivery_address || "",
        delivery_lat: data.delivery_lat,
        delivery_lng: data.delivery_lng,
        distance_miles: data.distance_miles || 0,
        duration_minutes: data.duration_minutes || 0,
        driver_id: data.driver_id,
        created_at: data.created_at,
        assigned_at: data.assigned_at,
        picked_up_at: data.picked_up_at,
        delivered_at: data.delivered_at,
        estimated_delivery_at: estimatedDeliveryAt,
      } as OrderDetails;
    },
    enabled: !!orderId,
    refetchInterval: 30000, // Refetch every 30s
  });

  // Fetch driver location via secure RPC
  const fetchDriverLocation = useCallback(async () => {
    if (!orderId || !order?.driver_id) {
      setDriverLocation(null);
      return;
    }

    // Only fetch if order is in active delivery phase
    if (!["confirmed", "ready_for_pickup", "in_progress"].includes(order.status)) {
      setDriverLocation(null);
      return;
    }

    try {
      const { data, error } = await supabase.rpc("get_order_driver_location", {
        p_order_id: orderId,
      });

      if (error) {
        console.error("[OrderTracking] Driver location error:", error);
        setDriverError("Could not get driver location");
        return;
      }

      if (data && data.length > 0) {
        setDriverLocation(data[0]);
        setDriverError(null);
      } else {
        setDriverLocation(null);
      }
    } catch (err) {
      console.error("[OrderTracking] Exception:", err);
      setDriverError("Failed to track driver");
    }
  }, [orderId, order?.driver_id, order?.status]);

  // Poll driver location every 5 seconds
  useEffect(() => {
    if (!order?.driver_id) return;

    fetchDriverLocation();

    const interval = setInterval(fetchDriverLocation, 5000);
    return () => clearInterval(interval);
  }, [fetchDriverLocation, order?.driver_id]);

  // Subscribe to order status changes
  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`order-tracking-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "food_orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          console.log("[OrderTracking] Order update:", payload.new);
          queryClient.invalidateQueries({ queryKey: ["order-tracking", orderId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, queryClient]);

  return {
    order,
    driverLocation,
    isLoading,
    error: orderError?.message || driverError,
    refetchDriver: fetchDriverLocation,
  };
}

export default useOrderTracking;
