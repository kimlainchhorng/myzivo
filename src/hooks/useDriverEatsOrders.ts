/**
 * useDriverEatsOrders Hook
 * Fetches active Eats delivery orders assigned to a driver
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "sonner";

export interface DriverEatsOrder {
  id: string;
  status: string;
  delivery_address: string | null;
  delivery_lat: number | null;
  delivery_lng: number | null;
  total_amount: number;
  driver_payout_cents: number | null;
  eta_pickup: string | null;
  eta_dropoff: string | null;
  eta_minutes: number | null;
  assigned_at: string | null;
  picked_up_at: string | null;
  created_at: string;
  customer_id: string | null;
  restaurant: {
    id: string;
    name: string;
    address: string | null;
    lat: number | null;
    lng: number | null;
    phone: string | null;
  } | null;
  customer?: {
    full_name: string | null;
    phone: string | null;
  } | null;
}

export function useDriverEatsOrders(driverId: string | undefined) {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ["driver-eats-orders", driverId],
    queryFn: async () => {
      if (!driverId) return [];

      const { data, error } = await supabase
        .from("food_orders")
        .select(`
          id,
          status,
          delivery_address,
          delivery_lat,
          delivery_lng,
          total_amount,
          driver_payout_cents,
          eta_pickup,
          eta_dropoff,
          eta_minutes,
          assigned_at,
          picked_up_at,
          created_at,
          customer_id,
          restaurants:restaurant_id (
            id,
            name,
            address,
            lat,
            lng,
            phone
          ),
          profiles:customer_id (
            full_name,
            phone
          )
        `)
        .eq("driver_id", driverId)
        .in("status", ["confirmed", "ready_for_pickup", "in_progress"])
        .order("created_at", { ascending: true });

      if (error) throw error;

      return (data || []).map((order: any) => ({
        ...order,
        restaurant: order.restaurants,
        customer: order.profiles,
      })) as DriverEatsOrder[];
    },
    enabled: !!driverId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Realtime subscription for order updates
  useEffect(() => {
    if (!driverId) return;

    const channel = supabase
      .channel(`driver-eats-orders-${driverId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "food_orders",
          filter: `driver_id=eq.${driverId}`,
        },
        (payload) => {
          console.log("[DriverEatsOrders] Order update:", payload.eventType);
          queryClient.invalidateQueries({ queryKey: ["driver-eats-orders", driverId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [driverId, queryClient]);

  // Mark order as picked up
  const markPickedUp = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("food_orders")
        .update({
          status: "in_progress",
          picked_up_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .eq("driver_id", driverId);

      if (error) throw error;

      // Log event
      await supabase.from("order_events").insert({
        order_id: orderId,
        type: "picked_up",
        data: { driver_id: driverId },
      });

      return orderId;
    },
    onSuccess: () => {
      toast.success("Order picked up! Head to delivery.");
      queryClient.invalidateQueries({ queryKey: ["driver-eats-orders", driverId] });
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  // Mark order as delivered
  const markDelivered = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("food_orders")
        .update({
          status: "delivered",
          delivered_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .eq("driver_id", driverId);

      if (error) throw error;

      // Log event
      await supabase.from("order_events").insert({
        order_id: orderId,
        type: "delivered",
        data: { driver_id: driverId },
      });

      return orderId;
    },
    onSuccess: () => {
      toast.success("Order delivered! Great job!");
      queryClient.invalidateQueries({ queryKey: ["driver-eats-orders", driverId] });
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  // Cancel/unassign order (driver rejection)
  const unassignOrder = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("food_orders")
        .update({
          driver_id: null,
          status: "ready_for_pickup",
          assigned_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .eq("driver_id", driverId);

      if (error) throw error;

      // Log event
      await supabase.from("order_events").insert({
        order_id: orderId,
        type: "driver_unassigned",
        data: { driver_id: driverId, reason: "driver_rejected" },
      });

      // Trigger re-dispatch
      const supabaseUrl = "https://slirphzzwcogdbkeicff.supabase.co";
      await fetch(`${supabaseUrl}/functions/v1/eats-auto-dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, exclude_driver_ids: [driverId] }),
      }).catch(() => {});

      return orderId;
    },
    onSuccess: () => {
      toast.info("Order unassigned. It will be reassigned to another driver.");
      queryClient.invalidateQueries({ queryKey: ["driver-eats-orders", driverId] });
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  return {
    orders: ordersQuery.data || [],
    isLoading: ordersQuery.isLoading,
    error: ordersQuery.error,
    markPickedUp,
    markDelivered,
    unassignOrder,
  };
}
