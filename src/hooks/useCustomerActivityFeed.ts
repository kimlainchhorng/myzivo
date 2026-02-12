import { useEffect, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { TimelineItem } from "@/components/shared/ActivityTimeline";
import { Car, UtensilsCrossed, Package, MapPin, CheckCircle2, Clock, Truck } from "lucide-react";

const tripStatusMap: Record<string, { title: string; icon: typeof Car; color: string; status: TimelineItem["status"] }> = {
  requested: { title: "Ride Requested", icon: Car, color: "primary", status: "pending" },
  accepted: { title: "Driver Assigned", icon: Car, color: "primary", status: "active" },
  arriving: { title: "Driver Arriving", icon: MapPin, color: "primary", status: "active" },
  in_progress: { title: "Trip In Progress", icon: Car, color: "primary", status: "active" },
  completed: { title: "Trip Completed", icon: CheckCircle2, color: "emerald-500", status: "completed" },
  cancelled: { title: "Trip Cancelled", icon: Car, color: "destructive", status: "completed" },
};

const orderStatusMap: Record<string, { title: string; icon: typeof UtensilsCrossed; color: string; status: TimelineItem["status"] }> = {
  placed: { title: "Order Placed", icon: UtensilsCrossed, color: "orange-500", status: "pending" },
  confirmed: { title: "Order Confirmed", icon: UtensilsCrossed, color: "orange-500", status: "active" },
  preparing: { title: "Preparing Your Food", icon: UtensilsCrossed, color: "orange-500", status: "active" },
  ready: { title: "Order Ready", icon: CheckCircle2, color: "orange-500", status: "active" },
  out_for_delivery: { title: "Out for Delivery", icon: Truck, color: "orange-500", status: "active" },
  delivered: { title: "Order Delivered", icon: CheckCircle2, color: "emerald-500", status: "completed" },
  cancelled: { title: "Order Cancelled", icon: UtensilsCrossed, color: "destructive", status: "completed" },
};

export function useCustomerActivityFeed() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const twoHoursAgo = new Date();
  twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
  const since = twoHoursAgo.toISOString();

  const { data: feedData } = useQuery({
    queryKey: ["customer-activity-feed", user?.id],
    queryFn: async (): Promise<TimelineItem[]> => {
      if (!user?.id) return [];

      const [tripsRes, ordersRes] = await Promise.all([
        supabase
          .from("trips")
          .select("id, status, pickup_address, dropoff_address, updated_at, created_at")
          .eq("rider_id", user.id)
          .gte("updated_at", since)
          .order("updated_at", { ascending: false })
          .limit(20),
        supabase
          .from("food_orders")
          .select("id, status, delivery_address, updated_at, created_at")
          .eq("customer_id", user.id)
          .gte("updated_at", since)
          .order("updated_at", { ascending: false })
          .limit(20),
      ]);

      const items: TimelineItem[] = [];

      tripsRes.data?.forEach((t) => {
        const cfg = tripStatusMap[t.status] || tripStatusMap.requested;
        items.push({
          id: `trip-${t.id}`,
          icon: cfg.icon,
          iconColor: cfg.color,
          title: cfg.title,
          subtitle: `${t.pickup_address || "Pickup"} → ${t.dropoff_address || "Dropoff"}`,
          timestamp: new Date(t.updated_at || t.created_at),
          status: cfg.status,
        });
      });

      ordersRes.data?.forEach((o) => {
        const cfg = orderStatusMap[o.status] || orderStatusMap.placed;
        items.push({
          id: `order-${o.id}`,
          icon: cfg.icon,
          iconColor: cfg.color,
          title: cfg.title,
          subtitle: o.delivery_address || "Delivery order",
          timestamp: new Date(o.updated_at || o.created_at),
          status: cfg.status,
        });
      });

      items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      return items.slice(0, 50);
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  // Realtime subscriptions
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`customer-activity-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "trips", filter: `rider_id=eq.${user.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["customer-activity-feed", user.id] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "food_orders", filter: `customer_id=eq.${user.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["customer-activity-feed", user.id] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, queryClient]);

  const items = feedData || [];
  const hasActiveItems = items.some((i) => i.status === "active" || i.status === "pending");

  return { items, hasActiveItems };
}
