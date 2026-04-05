/**
 * Push Notifications Hook
 * Handles push notification registration and management for Capacitor apps
 */
import { useState, useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from "@capacitor/push-notifications";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { safeInternalPath } from "@/lib/urlSafety";

export interface NotificationData {
  title: string;
  body: string;
  type?: string;
  data?: Record<string, any>;
}

export interface PushNotificationState {
  isSupported: boolean;
  isRegistered: boolean;
  token: string | null;
  permission: "granted" | "denied" | "prompt" | "unknown";
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isRegistered: false,
    token: null,
    permission: "unknown",
  });
  const [notifications, setNotifications] = useState<PushNotificationSchema[]>([]);

  // Check if push notifications are supported (native or web with service worker)
  const checkSupport = useCallback(() => {
    const isNative = Capacitor.isNativePlatform();
    const hasWebPush = !isNative && "serviceWorker" in navigator && "PushManager" in window;
    setState(prev => ({ ...prev, isSupported: isNative || hasWebPush }));
    return isNative || hasWebPush;
  }, []);

  // Request permission and register for push notifications
  const register = useCallback(async (): Promise<boolean> => {
    // --- Native (Capacitor) registration ---
    if (Capacitor.isNativePlatform()) {
      try {
        const permStatus = await PushNotifications.checkPermissions();
        
        if (permStatus.receive === "prompt") {
          const requestResult = await PushNotifications.requestPermissions();
          if (requestResult.receive !== "granted") {
            setState(prev => ({ ...prev, permission: "denied" }));
            return false;
          }
        } else if (permStatus.receive !== "granted") {
          setState(prev => ({ ...prev, permission: "denied" }));
          return false;
        }

        setState(prev => ({ ...prev, permission: "granted" }));
        await PushNotifications.register();
        return true;
      } catch (error) {
        console.error("[Push] Native registration error:", error);
        return false;
      }
    }

    // --- Web Push (VAPID / Service Worker) registration ---
    if ("serviceWorker" in navigator && "PushManager" in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setState(prev => ({ ...prev, permission: "denied" }));
          return false;
        }

        setState(prev => ({ ...prev, permission: "granted" }));

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY || undefined,
        });

        // Send subscription to server
        const subJson = subscription.toJSON();
        if (subJson.endpoint && subJson.keys) {
          const { error } = await supabase.functions.invoke("register-web-push", {
            body: {
              endpoint: subJson.endpoint,
              keys: {
                p256dh: subJson.keys.p256dh,
                auth: subJson.keys.auth,
              },
            },
          });

          if (error) {
            console.error("[Push] Web push registration error:", error);
          } else {
            setState(prev => ({ ...prev, isRegistered: true, token: subJson.endpoint }));
            console.log("[Push] Web push subscription registered");
          }
        }
        return true;
      } catch (error) {
        console.error("[Push] Web push registration error:", error);
        return false;
      }
    }

    return false;
  }, []);

  // Save token to database via edge function
  const saveToken = useCallback(async (token: string) => {
    if (!user?.id) return;

    try {
      const platform = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'
      const { data: { session } } = await supabase.auth.getSession();
      
      setState(prev => ({ ...prev, isRegistered: true, token }));
      
      // Persist token to Supabase so server can send push notifications
      const { error } = await supabase.functions.invoke("register-push-token", {
        body: { token, platform },
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : undefined,
      });

      if (error) {
        console.error("[Push] Error saving token to server:", error);
      } else {
        console.log(`[Push] ${platform} token registered successfully`);
      }
    } catch (error) {
      console.error("[Push] Error saving token:", error);
    }
  }, [user?.id]);

  // Initialize push notifications
  useEffect(() => {
    checkSupport();

    if (!Capacitor.isNativePlatform()) {
      // For web: auto-register if user is logged in
      if (user?.id && "serviceWorker" in navigator && "PushManager" in window) {
        register();
      }
      return;
    }

    // Set up listeners
    const registrationListener = PushNotifications.addListener(
      "registration",
      (token: Token) => {
        
        saveToken(token.value);
      }
    );

    const registrationErrorListener = PushNotifications.addListener(
      "registrationError",
      (error) => {
        console.error("[Push] Registration error:", error);
        toast.error("Failed to register for notifications");
      }
    );

    const notificationReceivedListener = PushNotifications.addListener(
      "pushNotificationReceived",
      (notification: PushNotificationSchema) => {
        
        setNotifications(prev => [notification, ...prev].slice(0, 50));
        
        // Show in-app toast for foreground notifications
        toast.info(notification.title || "Notification", {
          description: notification.body,
        });
      }
    );

    const notificationActionListener = PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (action: ActionPerformed) => {
        
        handleNotificationAction(action);
      }
    );

    // Auto-register if user is logged in
    if (user?.id) {
      register();
    }

    return () => {
      registrationListener.then(l => l.remove());
      registrationErrorListener.then(l => l.remove());
      notificationReceivedListener.then(l => l.remove());
      notificationActionListener.then(l => l.remove());
    };
  }, [user?.id, checkSupport, register, saveToken]);

  // Handle notification action (when user taps notification)
  const handleNotificationAction = (action: ActionPerformed) => {
    const data = action.notification.data as Record<string, any>;
    
    if (data?.type) {
      switch (data.type) {
        // Ride notifications
        case "driver_assigned":
        case "driver_en_route":
        case "driver_arrived":
        case "trip_started":
        case "trip_completed":
        case "driver_status":
          window.location.href = safeInternalPath('/rides/tracking', data.trip_id, '/rides');
          break;
        case "trip_cancelled":
          window.location.href = `/rides`;
          break;

        // Flight notifications
        case "booking_confirmed":
        case "booking_confirmation":
        case "checkin_reminder":
        case "gate_change":
        case "flight_delayed":
        case "flight_cancelled":
        case "boarding_soon":
        case "flight_departed":
        case "flight_landed":
        case "itinerary_update":
          window.location.href = safeInternalPath('/bookings', data.booking_id, '/bookings');
          break;
        case "price_drop":
          window.location.href = `/flights`;
          break;
        case "refund_processed":
        case "refund_update":
          window.location.href = `/wallet`;
          break;

        // Food delivery
        case "delivery_update":
        case "order_placed":
        case "order_confirmed":
        case "order_preparing":
        case "order_ready":
        case "driver_pickup":
        case "out_for_delivery":
        case "order_delivered":
        case "order_cancelled":
        case "new_order_restaurant":
        case "new_delivery_driver":
          window.location.href = safeInternalPath('/eats', data.order_id, '/eats');
          break;
        case "pickup_reminder":
          window.location.href = safeInternalPath('/p2p/bookings', data.rental_id, '/p2p');
          break;

        // Promos
        case "surge_alert":
        case "promo_available":
          window.location.href = `/rides`;
          break;

        default:
          window.location.href = `/notifications`;
      }
    }
  };

  // Unregister from push notifications
  const unregister = useCallback(async () => {
    if (!user?.id || !state.token) return;

    try {
      // Mark token as inactive on server
      await supabase.functions.invoke("register-push-token", {
        body: { token: state.token, platform: Capacitor.getPlatform(), deactivate: true }
      });
      
      setState(prev => ({ ...prev, isRegistered: false, token: null }));
      
    } catch (error) {
      console.error("[Push] Error unregistering:", error);
    }
  }, [user?.id, state.token]);

  // Get delivered notifications
  const getDeliveredNotifications = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return [];
    
    const result = await PushNotifications.getDeliveredNotifications();
    return result.notifications;
  }, []);

  // Remove all delivered notifications
  const removeAllDeliveredNotifications = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;
    
    await PushNotifications.removeAllDeliveredNotifications();
  }, []);

  return {
    ...state,
    notifications,
    register,
    unregister,
    getDeliveredNotifications,
    removeAllDeliveredNotifications,
  };
};

// Notification types for the app
export type NotificationType = 
  | "booking_confirmation"
  | "driver_status"
  | "delivery_update"
  | "pickup_reminder"
  | "schedule_change"
  | "refund_update"
  | "promo"
  | "general";
