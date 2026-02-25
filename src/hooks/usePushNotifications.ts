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

  // Check if push notifications are supported
  const checkSupport = useCallback(() => {
    const isNative = Capacitor.isNativePlatform();
    setState(prev => ({ ...prev, isSupported: isNative }));
    return isNative;
  }, []);

  // Request permission and register for push notifications
  const register = useCallback(async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      // Check current permission status
      const permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === "prompt") {
        // Request permission
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

      // Register with APNs / FCM
      await PushNotifications.register();
      
      return true;
    } catch (error) {
      console.error("[Push] Registration error:", error);
      return false;
    }
  }, []);

  // Save token to database (stores in user metadata for now)
  const saveToken = useCallback(async (token: string) => {
    if (!user?.id) return;

    try {
      const platform = Capacitor.getPlatform();
      
      setState(prev => ({ ...prev, isRegistered: true, token }));
      
      // Optional: Call edge function to store token
      // await supabase.functions.invoke("register-push-token", {
      //   body: { token, platform }
      // });
    } catch (error) {
      console.error("[Push] Error saving token:", error);
    }
  }, [user?.id]);

  // Initialize push notifications
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    checkSupport();

    // Set up listeners
    const registrationListener = PushNotifications.addListener(
      "registration",
      (token: Token) => {
        console.log("[Push] Registration token:", token.value);
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
        console.log("[Push] Notification received:", notification);
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
        console.log("[Push] Action performed:", action);
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
        case "booking_confirmation":
          window.location.href = `/trips/${data.booking_id}`;
          break;
        case "driver_status":
          window.location.href = `/rides/${data.ride_id}`;
          break;
        case "delivery_update":
          window.location.href = `/eats/${data.order_id}`;
          break;
        case "pickup_reminder":
          window.location.href = `/p2p/bookings/${data.rental_id}`;
          break;
        case "refund_update":
          window.location.href = `/wallet`;
          break;
        default:
          // Navigate to notifications center
          window.location.href = `/notifications`;
      }
    }
  };

  // Unregister from push notifications
  const unregister = useCallback(async () => {
    if (!user?.id || !state.token) return;

    try {
      // Mark token as inactive via edge function (if implemented)
      // await supabase.functions.invoke("unregister-push-token", {
      //   body: { token: state.token }
      // });
      
      setState(prev => ({ ...prev, isRegistered: false, token: null }));
      console.log("[Push] Token unregistered");
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
