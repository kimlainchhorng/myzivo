/**
 * useDispatchStats Hook
 * KPI calculations for dispatch dashboard
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, subMinutes } from "date-fns";

export interface DispatchStats {
  newOrders: number;
  assignedOrders: number;
  pickedUpOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  onlineDrivers: number;
  idleDrivers: number;
  unassignedOver5Min: number;
}

export const useDispatchStats = () => {
  return useQuery({
    queryKey: ["dispatch-stats"],
    queryFn: async (): Promise<DispatchStats> => {
      const todayStart = startOfDay(new Date()).toISOString();
      const fiveMinutesAgo = subMinutes(new Date(), 5).toISOString();

      // Get order counts by status for today
      const { data: orders, error: ordersError } = await supabase
        .from("food_orders")
        .select("id, status, driver_id, created_at")
        .gte("created_at", todayStart);

      if (ordersError) throw ordersError;

      // Get online drivers
      const { data: onlineDrivers, error: driversError } = await supabase
        .from("drivers")
        .select("id")
        .eq("is_online", true)
        .eq("status", "verified");

      if (driversError) throw driversError;

      // Get drivers with active orders
      const { data: activeDriverOrders } = await supabase
        .from("food_orders")
        .select("driver_id")
        .in("status", ["confirmed", "ready_for_pickup", "in_progress"])
        .not("driver_id", "is", null);

      const activeDriverIds = new Set((activeDriverOrders || []).map((o) => o.driver_id));
      const onlineDriverIds = (onlineDrivers || []).map((d) => d.id);
      const idleDrivers = onlineDriverIds.filter((id) => !activeDriverIds.has(id)).length;

      // Count orders by status
      const newOrders = (orders || []).filter(
        (o) => o.status === "pending" && !o.driver_id
      ).length;

      const assignedOrders = (orders || []).filter(
        (o) => (o.status === "confirmed" || o.status === "ready_for_pickup") && o.driver_id
      ).length;

      const pickedUpOrders = (orders || []).filter(
        (o) => o.status === "in_progress"
      ).length;

      const deliveredOrders = (orders || []).filter(
        (o) => o.status === "completed"
      ).length;

      const cancelledOrders = (orders || []).filter(
        (o) => o.status === "cancelled"
      ).length;

      // Count unassigned orders older than 5 minutes
      const unassignedOver5Min = (orders || []).filter(
        (o) =>
          o.status === "pending" &&
          !o.driver_id &&
          o.created_at < fiveMinutesAgo
      ).length;

      return {
        newOrders,
        assignedOrders,
        pickedUpOrders,
        deliveredOrders,
        cancelledOrders,
        onlineDrivers: onlineDrivers?.length || 0,
        idleDrivers,
        unassignedOver5Min,
      };
    },
    refetchInterval: 10000, // Refresh every 10s
  });
};

// Attention items for dashboard
export interface AttentionItem {
  id: string;
  type: "unassigned_order" | "idle_driver";
  title: string;
  description: string;
  actionLabel: string;
  orderId?: string;
  driverId?: string;
}

export const useAttentionItems = () => {
  return useQuery({
    queryKey: ["dispatch-attention"],
    queryFn: async (): Promise<AttentionItem[]> => {
      const fiveMinutesAgo = subMinutes(new Date(), 5).toISOString();
      const items: AttentionItem[] = [];

      // Get unassigned orders older than 5 minutes
      const { data: staleOrders } = await supabase
        .from("food_orders")
        .select(`
          id,
          created_at,
          restaurants:restaurant_id (name)
        `)
        .eq("status", "pending")
        .is("driver_id", null)
        .lt("created_at", fiveMinutesAgo)
        .order("created_at", { ascending: true })
        .limit(10);

      for (const order of staleOrders || []) {
        const minutesAgo = Math.floor(
          (Date.now() - new Date(order.created_at).getTime()) / 60000
        );
        items.push({
          id: `order-${order.id}`,
          type: "unassigned_order",
          title: `Order waiting ${minutesAgo}+ min`,
          description: `From ${(order.restaurants as any)?.name || "Unknown restaurant"}`,
          actionLabel: "Assign Driver",
          orderId: order.id,
        });
      }

      // Get online drivers with no active order
      const { data: allOnlineDrivers } = await supabase
        .from("drivers")
        .select("id, full_name, updated_at")
        .eq("is_online", true)
        .eq("status", "verified");

      const { data: activeOrders } = await supabase
        .from("food_orders")
        .select("driver_id")
        .in("status", ["confirmed", "ready_for_pickup", "in_progress"])
        .not("driver_id", "is", null);

      const busyDriverIds = new Set((activeOrders || []).map((o) => o.driver_id));
      const idleDrivers = (allOnlineDrivers || []).filter(
        (d) => !busyDriverIds.has(d.id)
      );

      for (const driver of idleDrivers.slice(0, 5)) {
        items.push({
          id: `driver-${driver.id}`,
          type: "idle_driver",
          title: `${driver.full_name} is idle`,
          description: "Online with no active orders",
          actionLabel: "Assign Order",
          driverId: driver.id,
        });
      }

      return items;
    },
    refetchInterval: 15000,
  });
};
