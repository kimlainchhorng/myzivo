/**
 * useDelayNotification Hook
 * Triggers push notification when order delay is detected
 * Prevents duplicate notifications using localStorage
 */
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { DelayLevel } from "./useOrderDelayDetection";

interface DelayNotificationOptions {
  orderId: string | undefined;
  isDelayed: boolean;
  delayLevel: DelayLevel;
  newEtaMin: number | null;
  newEtaMax: number | null;
  restaurantName: string | undefined;
  customerId: string | undefined;
}

const NOTIFICATION_STORAGE_PREFIX = "zivo_delay_notified_";

function getNotificationKey(orderId: string, level: DelayLevel): string {
  return `${NOTIFICATION_STORAGE_PREFIX}${orderId}_${level}`;
}

function hasNotified(orderId: string, level: DelayLevel): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(getNotificationKey(orderId, level)) === "true";
}

function markNotified(orderId: string, level: DelayLevel): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getNotificationKey(orderId, level), "true");
}

export function useDelayNotification({
  orderId,
  isDelayed,
  delayLevel,
  newEtaMin,
  newEtaMax,
  restaurantName,
  customerId,
}: DelayNotificationOptions): void {
  const isNotifyingRef = useRef(false);

  useEffect(() => {
    // Only process delayed orders
    if (!orderId || !isDelayed || delayLevel === "none" || !customerId) return;
    
    // Skip if already notifying or already notified for this level
    if (isNotifyingRef.current || hasNotified(orderId, delayLevel)) return;

    // Prevent duplicate calls
    isNotifyingRef.current = true;

    const sendNotification = async () => {
      try {
        // Build notification message
        const etaText = newEtaMin && newEtaMax 
          ? `Updated ETA: ${newEtaMin}–${newEtaMax} min.`
          : "We're working on it.";

        const title = delayLevel === "critical"
          ? "Order Significantly Delayed"
          : "Delivery Delayed ⏰";

        const body = delayLevel === "critical"
          ? `We're sorry — your ${restaurantName || "food"} order is taking longer than expected. Tap for details.`
          : `Your order from ${restaurantName || "the restaurant"} is delayed. ${etaText}`;

        // Call send-notification edge function
        const { error } = await supabase.functions.invoke("send-notification", {
          body: {
            user_id: customerId,
            title,
            body,
            action_url: `/eats/orders/${orderId}`,
            event_type: delayLevel === "critical" ? "order_delayed_critical" : "order_delayed",
            priority: delayLevel === "critical" ? "critical" : "normal",
            meta: {
              order_id: orderId,
              delay_level: delayLevel,
              eta_min: newEtaMin,
              eta_max: newEtaMax,
            },
          },
        });

        if (error) {
          console.error("[DelayNotification] Failed to send:", error);
        } else {
          // Mark as notified to prevent duplicates
          markNotified(orderId, delayLevel);
          console.log("[DelayNotification] Sent for order:", orderId, "level:", delayLevel);
        }
      } catch (err) {
        console.error("[DelayNotification] Exception:", err);
      } finally {
        isNotifyingRef.current = false;
      }
    };

    sendNotification();
  }, [orderId, isDelayed, delayLevel, newEtaMin, newEtaMax, restaurantName, customerId]);
}

/**
 * Clean up notification flags when order is completed/cancelled
 */
export function clearDelayNotificationFlags(orderId: string): void {
  if (typeof window === "undefined") return;
  
  const levels: DelayLevel[] = ["warning", "delayed", "critical"];
  levels.forEach((level) => {
    localStorage.removeItem(getNotificationKey(orderId, level));
  });
}
