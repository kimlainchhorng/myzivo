/**
 * Realtime Order Toasts
 * Toast notifications for realtime dispatch events
 */

import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const RealtimeOrderToasts = () => {
  const lastEventRef = useRef<string | null>(null);

  useEffect(() => {
    // Subscribe to food_orders changes
    const ordersChannel = supabase
      .channel("dispatch-toasts-orders")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "food_orders",
        },
        (payload) => {
          const eventKey = `insert-${payload.new.id}`;
          if (lastEventRef.current === eventKey) return;
          lastEventRef.current = eventKey;
          toast.info("🆕 New order received", {
            description: `Order #${(payload.new.id as string).slice(0, 8)}`,
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "food_orders",
        },
        (payload) => {
          const oldStatus = payload.old?.status;
          const newStatus = payload.new?.status;

          if (oldStatus === newStatus) return;

          const eventKey = `update-${payload.new.id}-${newStatus}`;
          if (lastEventRef.current === eventKey) return;
          lastEventRef.current = eventKey;

          switch (newStatus) {
            case "confirmed":
              toast.success("✓ Order assigned", {
                description: `Order #${(payload.new.id as string).slice(0, 8)}`,
              });
              break;
            case "in_progress":
              toast.info("📦 Order picked up", {
                description: `Order #${(payload.new.id as string).slice(0, 8)}`,
              });
              break;
            case "completed":
              toast.success("✅ Order delivered", {
                description: `Order #${(payload.new.id as string).slice(0, 8)}`,
              });
              break;
            case "cancelled":
              toast.error("Order cancelled", {
                description: `Order #${(payload.new.id as string).slice(0, 8)}`,
              });
              break;
          }
        }
      )
      .subscribe();

    // Subscribe to driver online/offline changes
    const driversChannel = supabase
      .channel("dispatch-toasts-drivers")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "drivers",
        },
        (payload) => {
          const oldOnline = payload.old?.is_online;
          const newOnline = payload.new?.is_online;

          if (oldOnline === newOnline) return;

          const driverName = payload.new?.full_name || "Driver";
          const eventKey = `driver-${payload.new.id}-${newOnline}`;
          if (lastEventRef.current === eventKey) return;
          lastEventRef.current = eventKey;

          if (newOnline) {
            toast.info(`🟢 ${driverName} is now online`);
          } else {
            toast.info(`⚪ ${driverName} went offline`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(driversChannel);
    };
  }, []);

  return null;
};

export default RealtimeOrderToasts;
