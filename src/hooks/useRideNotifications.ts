/**
 * useRideNotifications — Ride-specific notification helpers
 * Wraps local + server push for ride lifecycle events
 * Works on iOS, Android (Capacitor) and Web (PWA)
 */
import { useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type RideEvent =
  | "driver_assigned"
  | "driver_en_route"
  | "driver_arrived"
  | "trip_started"
  | "trip_completed"
  | "trip_cancelled"
  | "surge_alert"
  | "promo_available";

const eventMessages: Record<RideEvent, { title: string; body: string }> = {
  driver_assigned: { title: "Driver Found!", body: "Your driver is on the way to your pickup location." },
  driver_en_route: { title: "Driver En Route", body: "Your driver is heading to pick you up." },
  driver_arrived: { title: "Driver Arrived", body: "Your driver has arrived at the pickup point." },
  trip_started: { title: "Trip Started", body: "You're on your way! Enjoy your ride." },
  trip_completed: { title: "Trip Complete", body: "You've arrived at your destination. Rate your ride!" },
  trip_cancelled: { title: "Ride Cancelled", body: "Your ride has been cancelled." },
  surge_alert: { title: "Prices Dropping", body: "Demand is decreasing in your area. Check for lower fares!" },
  promo_available: { title: "New Promo!", body: "A new promo code is available for your next ride." },
};

export function useRideNotifications() {
  const { user } = useAuth();

  const notify = useCallback(async (event: RideEvent, extra?: { body?: string; userId?: string }) => {
    const msg = eventMessages[event];
    const body = extra?.body || msg.body;
    const targetUserId = extra?.userId || user?.id;

    // Always show in-app toast (foreground)
    toast.info(msg.title, { description: body });

    // Try native local notification on Capacitor (immediate, works offline)
    if (Capacitor.isNativePlatform()) {
      try {
        const perm = await LocalNotifications.checkPermissions();
        if (perm.display !== "granted") {
          await LocalNotifications.requestPermissions();
        }
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Date.now(),
              title: msg.title,
              body,
              schedule: { at: new Date(Date.now() + 100) },
              sound: undefined,
              actionTypeId: "",
              extra: { type: event },
            },
          ],
        });
      } catch (err) {
        console.warn("[RideNotifications] Local notification failed:", err);
      }
    }

    // Also send server-side push (reaches background/closed app on all platforms)
    if (targetUserId) {
      try {
        await supabase.functions.invoke("send-push-notification", {
          body: {
            user_id: targetUserId,
            notification_type: event,
            title: msg.title,
            body,
            data: { type: event },
          },
        });
      } catch (err) {
        console.warn("[RideNotifications] Server push failed:", err);
      }
    }
  }, [user?.id]);

  return { notify };
}
