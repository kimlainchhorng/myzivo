/**
 * useDispatchOrders Hook
 * Fetches food orders with realtime subscription for dispatch panel
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export type DispatchOrderStatus = "pending" | "confirmed" | "ready_for_pickup" | "in_progress" | "completed" | "cancelled" | "refunded";

export interface DispatchOrder {
  id: string;
  status: DispatchOrderStatus;
  created_at: string;
  assigned_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  delivery_address: string;
  delivery_lat: number | null;
  delivery_lng: number | null;
  total_amount_cents: number;
  driver_payout_cents: number | null;
  customer_id: string | null;
  driver_id: string | null;
  restaurant_id: string;
  restaurant?: {
    id: string;
    name: string;
    address: string;
  };
  driver?: {
    id: string;
    full_name: string;
    phone: string;
  } | null;
  customer?: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export interface DispatchOrderFilters {
  status?: DispatchOrderStatus | "all";
  restaurantId?: string;
  driverId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export const useDispatchOrders = (filters?: DispatchOrderFilters) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["dispatch-orders", filters],
    queryFn: async () => {
      let q = supabase
        .from("food_orders")
        .select(`
          id,
          status,
          created_at,
          assigned_at,
          picked_up_at,
          delivered_at,
          cancelled_at,
          delivery_address,
          delivery_lat,
          delivery_lng,
          total_amount_cents,
          driver_payout_cents,
          customer_id,
          driver_id,
          restaurant_id,
          restaurants:restaurant_id (
            id,
            name,
            address
          ),
          drivers:driver_id (
            id,
            full_name,
            phone
          ),
          profiles:customer_id (
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false })
        .limit(200);

      // Apply filters
      if (filters?.status && filters.status !== "all") {
        q = q.eq("status", filters.status as any);
      }
      if (filters?.restaurantId) {
        q = q.eq("restaurant_id", filters.restaurantId);
      }
      if (filters?.driverId) {
        q = q.eq("driver_id", filters.driverId);
      }
      if (filters?.dateFrom) {
        q = q.gte("created_at", filters.dateFrom);
      }
      if (filters?.dateTo) {
        q = q.lte("created_at", filters.dateTo);
      }

      const { data, error } = await q;
      if (error) throw error;

      // Map response to typed orders
      return (data || []).map((order: any) => ({
        ...order,
        restaurant: order.restaurants,
        driver: order.drivers,
        customer: order.profiles,
      })) as DispatchOrder[];
    },
    refetchInterval: 30000, // Refetch every 30s as backup
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("dispatch-orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "food_orders",
        },
        (payload) => {
          console.log("[Dispatch] Order change:", payload.eventType);
          // Invalidate and refetch
          queryClient.invalidateQueries({ queryKey: ["dispatch-orders"] });
          queryClient.invalidateQueries({ queryKey: ["dispatch-stats"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

// Get orders grouped by status for kanban
export const useDispatchOrdersByStatus = (filters?: DispatchOrderFilters) => {
  const { data: orders, ...rest } = useDispatchOrders(filters);

  const grouped = {
    pending: orders?.filter((o) => o.status === "pending" && !o.driver_id) || [],
    confirmed: orders?.filter((o) => (o.status === "confirmed" || o.status === "ready_for_pickup") && o.driver_id) || [],
    in_progress: orders?.filter((o) => o.status === "in_progress") || [],
    completed: orders?.filter((o) => o.status === "completed") || [],
    cancelled: orders?.filter((o) => o.status === "cancelled") || [],
  };

  return { grouped, orders, ...rest };
};
