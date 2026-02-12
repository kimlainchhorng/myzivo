import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import ActivityTimeline, { type TimelineItem } from "@/components/shared/ActivityTimeline";
import { Car, UtensilsCrossed, Package, CheckCircle2, DollarSign, MapPin, Truck } from "lucide-react";

interface Props {
  driverId: string | undefined;
}

const DriverSessionFeed = ({ driverId }: Props) => {
  const [sessionEvents, setSessionEvents] = useState<TimelineItem[]>([]);
  const eventCountRef = useRef(0);

  const addEvent = useCallback((event: Omit<TimelineItem, "id">) => {
    eventCountRef.current += 1;
    const newItem: TimelineItem = { ...event, id: `session-${eventCountRef.current}-${Date.now()}` };
    setSessionEvents((prev) => [newItem, ...prev].slice(0, 50));
  }, []);

  useEffect(() => {
    if (!driverId) return;

    const channel = supabase
      .channel(`driver-session-${driverId}`)
      // Trip events
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "trips", filter: `driver_id=eq.${driverId}`,
      }, (payload) => {
        addEvent({
          icon: Car, iconColor: "primary", title: "New Ride Request",
          subtitle: (payload.new as any).pickup_address || "Pickup location",
          timestamp: new Date(), status: "active",
        });
      })
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "trips", filter: `driver_id=eq.${driverId}`,
      }, (payload) => {
        const trip = payload.new as any;
        if (trip.status === "in_progress") {
          addEvent({
            icon: Car, iconColor: "primary", title: "Trip Started",
            subtitle: `${trip.pickup_address || "Pickup"} → ${trip.dropoff_address || "Dropoff"}`,
            timestamp: new Date(), status: "active",
          });
        } else if (trip.status === "completed") {
          addEvent({
            icon: CheckCircle2, iconColor: "emerald-500", title: "Trip Completed",
            subtitle: trip.fare_amount ? `Earned $${trip.fare_amount.toFixed(2)}` : "Trip finished",
            timestamp: new Date(), status: "completed",
          });
        }
      })
      // Food order delivery events
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "food_orders", filter: `driver_id=eq.${driverId}`,
      }, (payload) => {
        const order = payload.new as any;
        if (order.status === "ready") {
          addEvent({
            icon: UtensilsCrossed, iconColor: "orange-500", title: "Pickup Ready",
            subtitle: order.delivery_address || "Restaurant pickup",
            timestamp: new Date(), status: "active",
          });
        } else if (order.status === "delivered") {
          addEvent({
            icon: CheckCircle2, iconColor: "emerald-500", title: "Delivery Completed",
            subtitle: order.delivery_fee ? `Earned $${order.delivery_fee.toFixed(2)}` : "Delivered",
            timestamp: new Date(), status: "completed",
          });
        }
      })
      // Earnings
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "driver_earnings", filter: `driver_id=eq.${driverId}`,
      }, (payload) => {
        const earning = payload.new as any;
        addEvent({
          icon: DollarSign, iconColor: "amber-500", title: "Earnings Credited",
          subtitle: earning.description || `$${(earning.net_amount || 0).toFixed(2)}`,
          timestamp: new Date(), status: "completed",
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [driverId, addEvent]);

  return (
    <div>
      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
        <Car className="w-3.5 h-3.5 text-primary" />
        Session Activity
      </h3>
      <ActivityTimeline
        items={sessionEvents}
        maxHeight="400px"
        emptyMessage="No activity yet this session"
      />
    </div>
  );
};

export default DriverSessionFeed;
