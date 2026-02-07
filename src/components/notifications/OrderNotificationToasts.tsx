/**
 * Order Notification Toasts Component
 * Subscribes to real-time notifications and shows toast alerts
 */
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Package, Truck, CheckCircle, XCircle, UserCheck } from "lucide-react";

const eventIcons = {
  order_created: Package,
  order_assigned: UserCheck,
  order_picked_up: Truck,
  order_delivered: CheckCircle,
  order_cancelled: XCircle,
};

const eventColors = {
  order_created: "text-blue-500",
  order_assigned: "text-green-500",
  order_picked_up: "text-amber-500",
  order_delivered: "text-emerald-500",
  order_cancelled: "text-red-500",
};

export function OrderNotificationToasts() {
  const { user } = useAuth();
  const lastEventRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`user-order-notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new as any;
          
          // Only show in-app notifications
          if (notification.channel !== "in_app") return;
          
          // Prevent duplicate toasts
          const eventKey = `${notification.id}-${notification.event_type}`;
          if (lastEventRef.current === eventKey) return;
          lastEventRef.current = eventKey;

          const eventType = notification.event_type as keyof typeof eventIcons;
          const Icon = eventIcons[eventType] || Package;
          const colorClass = eventColors[eventType] || "text-primary";

          toast(notification.title, {
            description: notification.body,
            icon: <Icon className={`h-5 w-5 ${colorClass}`} />,
            action: notification.action_url
              ? {
                  label: "View",
                  onClick: () => {
                    window.location.href = notification.action_url;
                  },
                }
              : undefined,
            duration: 6000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return null;
}

export default OrderNotificationToasts;
