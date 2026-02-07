/**
 * useDispatchDrivers Hook
 * Fetches drivers with realtime updates for dispatch panel
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface DispatchDriver {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  vehicle_type: string;
  vehicle_model: string | null;
  vehicle_plate: string;
  is_online: boolean | null;
  status: string | null;
  current_lat: number | null;
  current_lng: number | null;
  rating: number | null;
  total_trips: number | null;
  updated_at: string;
  last_active_at: string | null;
  activeOrder?: {
    id: string;
    status: string;
    restaurant_name: string;
  } | null;
}

export const useDispatchDrivers = (onlineOnly?: boolean) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["dispatch-drivers", onlineOnly],
    queryFn: async () => {
      let q = supabase
        .from("drivers")
        .select(`
          id,
          user_id,
          full_name,
          email,
          phone,
          avatar_url,
          vehicle_type,
          vehicle_model,
          vehicle_plate,
          is_online,
          status,
          current_lat,
          current_lng,
          rating,
          total_trips,
          updated_at,
          last_active_at
        `)
        .eq("status", "verified")
        .order("is_online", { ascending: false })
        .order("updated_at", { ascending: false });

      if (onlineOnly) {
        q = q.eq("is_online", true);
      }

      const { data: drivers, error } = await q;
      if (error) throw error;

      // Fetch active orders for each driver
      const driverIds = (drivers || []).map((d) => d.id);
      const { data: activeOrders } = await supabase
        .from("food_orders")
        .select(`
          id,
          status,
          driver_id,
          restaurants:restaurant_id (name)
        `)
        .in("driver_id", driverIds)
        .in("status", ["confirmed", "ready_for_pickup", "in_progress"]);

      // Map active orders to drivers
      const ordersByDriver = new Map<string, any>();
      for (const order of activeOrders || []) {
        if (order.driver_id) {
          ordersByDriver.set(order.driver_id, {
            id: order.id,
            status: order.status,
            restaurant_name: (order.restaurants as any)?.name || "Unknown",
          });
        }
      }

      return (drivers || []).map((driver) => ({
        ...driver,
        activeOrder: ordersByDriver.get(driver.id) || null,
      })) as DispatchDriver[];
    },
    refetchInterval: 15000, // Refresh every 15s
  });

  // Realtime subscription for driver updates
  useEffect(() => {
    const channel = supabase
      .channel("dispatch-drivers-realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "drivers",
        },
        (payload) => {
          console.log("[Dispatch] Driver update:", payload.new);
          queryClient.invalidateQueries({ queryKey: ["dispatch-drivers"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

// Get online drivers count
export const useOnlineDriversCount = () => {
  const { data: drivers } = useDispatchDrivers(true);
  return drivers?.length || 0;
};
