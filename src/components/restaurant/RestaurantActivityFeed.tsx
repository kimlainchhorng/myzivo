import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ActivityTimeline, { type TimelineItem } from "@/components/shared/ActivityTimeline";
import { UtensilsCrossed, Truck, CheckCircle2, UserCheck, Package } from "lucide-react";

const statusConfig: Record<string, { title: string; icon: typeof UtensilsCrossed; color: string; status: TimelineItem["status"] }> = {
  placed: { title: "New Order Received", icon: UtensilsCrossed, color: "orange-500", status: "active" },
  confirmed: { title: "Order Confirmed", icon: CheckCircle2, color: "orange-500", status: "active" },
  preparing: { title: "Preparing Order", icon: UtensilsCrossed, color: "amber-500", status: "active" },
  ready: { title: "Order Ready for Pickup", icon: Package, color: "emerald-500", status: "active" },
  out_for_delivery: { title: "Order Picked Up", icon: Truck, color: "sky-500", status: "active" },
  delivered: { title: "Order Delivered", icon: CheckCircle2, color: "emerald-500", status: "completed" },
  cancelled: { title: "Order Cancelled", icon: UtensilsCrossed, color: "destructive", status: "completed" },
};

interface Props {
  restaurantId: string | undefined;
}

const RestaurantActivityFeed = ({ restaurantId }: Props) => {
  const queryClient = useQueryClient();

  const { data: feedData } = useQuery({
    queryKey: ["restaurant-activity-feed", restaurantId],
    queryFn: async (): Promise<TimelineItem[]> => {
      if (!restaurantId) return [];

      const fourHoursAgo = new Date();
      fourHoursAgo.setHours(fourHoursAgo.getHours() - 4);

      const { data } = await supabase
        .from("food_orders")
        .select("id, status, delivery_address, updated_at, created_at, driver_id")
        .eq("restaurant_id", restaurantId)
        .gte("updated_at", fourHoursAgo.toISOString())
        .order("updated_at", { ascending: false })
        .limit(50);

      if (!data) return [];

      return data.map((o) => {
        const cfg = statusConfig[o.status] || statusConfig.placed;
        let subtitle = o.delivery_address || "Order";
        if (o.driver_id && o.status === "ready") subtitle = "Driver arriving for pickup";
        return {
          id: `order-${o.id}-${o.status}`,
          icon: cfg.icon,
          iconColor: cfg.color,
          title: cfg.title,
          subtitle,
          timestamp: new Date(o.updated_at || o.created_at),
          status: cfg.status,
        };
      });
    },
    enabled: !!restaurantId,
    refetchInterval: 30000,
  });

  // Realtime
  useEffect(() => {
    if (!restaurantId) return;

    const channel = supabase
      .channel(`restaurant-feed-${restaurantId}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "food_orders",
        filter: `restaurant_id=eq.${restaurantId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["restaurant-activity-feed", restaurantId] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [restaurantId, queryClient]);

  return (
    <div>
      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
        <UtensilsCrossed className="w-3.5 h-3.5 text-orange-500" />
        Live Orders
      </h3>
      <ActivityTimeline
        items={feedData || []}
        maxHeight="500px"
        emptyMessage="No recent orders"
      />
    </div>
  );
};

export default RestaurantActivityFeed;
