/**
 * useEatsArrivalAlert
 * Fires a one-time toast + push notification when the Eats driver enters
 * the delivery zone (isNearDelivery flips to true) while order is out_for_delivery.
 */
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNotificationSound } from "./useNotificationSound";

interface UseEatsArrivalAlertOptions {
  isNearDelivery: boolean;
  orderId: string | undefined;
  orderStatus: string | undefined;
  customerId: string | undefined;
  restaurantName: string;
}

export function useEatsArrivalAlert({
  isNearDelivery,
  orderId,
  orderStatus,
  customerId,
  restaurantName,
}: UseEatsArrivalAlertOptions) {
  const hasAlertedRef = useRef<string | null>(null);
  const { playAlertSound } = useNotificationSound();

  useEffect(() => {
    if (!isNearDelivery) return;
    if (orderStatus !== "out_for_delivery") return;
    if (!orderId || !customerId) return;
    if (hasAlertedRef.current === orderId) return;

    // Mark as alerted for this order
    hasAlertedRef.current = orderId;

    // 1. Play sound
    playAlertSound();

    // 2. In-app toast
    toast.info("🚗 Your driver is arriving!", {
      description: `Your order from ${restaurantName} will be at your door shortly.`,
      duration: 8000,
    });

    // 3. Push notification (fire-and-forget)
    supabase.functions.invoke("send-push-notification", {
      body: {
        user_id: customerId,
        title: "Your driver is arriving!",
        body: `Your order from ${restaurantName} will be at your door shortly.`,
        url: `/eats/orders/${orderId}`,
      },
    }).catch((err) => console.warn("Push notification failed:", err));

    // 4. Insert notification record (fire-and-forget)
    supabase
      .from("notifications")
      .insert({
        user_id: customerId,
        order_id: orderId,
        channel: "in_app",
        category: "transactional",
        template: "driver_arriving",
        title: "Your driver is arriving!",
        body: `Your order from ${restaurantName} will be at your door shortly.`,
        action_url: `/eats/orders/${orderId}`,
        status: "sent",
      } as any)
      .then(({ error }) => {
        if (error) console.warn("Failed to insert notification:", error);
      });
  }, [isNearDelivery, orderId, orderStatus, customerId, restaurantName, playAlertSound]);
}
