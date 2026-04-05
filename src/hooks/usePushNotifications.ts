/**
 * Push Notifications Hook
 * Handles push notification registration and management for Capacitor apps
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from "@capacitor/push-notifications";
import { supabase, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/integrations/supabase/client";
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

type IncomingCallPayload = {
  type: "incoming_call";
  call_id?: string;
  caller_id?: string;
  call_type?: "voice" | "video";
  caller_name?: string;
  caller_avatar?: string;
};

const normalizeIncomingCallPayload = (
  rawData: Record<string, any> | undefined,
  fallbackTitle?: string,
  fallbackBody?: string,
): IncomingCallPayload | null => {
  if (!rawData) return null;

  const nested = typeof rawData.data === "object" && rawData.data !== null
    ? rawData.data as Record<string, any>
    : {};

  const merged = { ...nested, ...rawData };
  const type = String(merged.type || merged.notification_type || "").toLowerCase();

  const hasCallHints = Boolean(merged.call_id || merged.caller_id || merged.call_type);
  const textHint = `${fallbackTitle || ""} ${fallbackBody || ""}`.toLowerCase();
  const looksLikeCallText = textHint.includes("calling") && textHint.includes("you");

  if (type !== "incoming_call" && !(hasCallHints && looksLikeCallText)) {
    return null;
  }

  const callType = merged.call_type === "video" ? "video" : "voice";

  return {
    type: "incoming_call",
    call_id: typeof merged.call_id === "string" ? merged.call_id : undefined,
    caller_id: typeof merged.caller_id === "string" ? merged.caller_id : undefined,
    call_type: callType,
    caller_name: typeof merged.caller_name === "string" ? merged.caller_name : fallbackTitle,
    caller_avatar: typeof merged.caller_avatar === "string" ? merged.caller_avatar : undefined,
  };
};

export const usePushNotifications = () => {
  const { user, session } = useAuth();
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isRegistered: false,
    token: null,
    permission: "unknown",
  });
  const [notifications, setNotifications] = useState<PushNotificationSchema[]>([]);
  const tokenRetryAttemptsRef = useRef<Record<string, number>>({});
  const pendingNativeTokenRef = useRef<string | null>(null);
  const recentIncomingPushRef = useRef<Record<string, number>>({});

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

  // Save token to database so server-side push delivery can target this device.
  const saveToken = useCallback(async (token: string, saveAttempt = 0) => {
    if (!user?.id) return;

    try {
      const platform = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'
      const { data: { session: storedSession } } = await supabase.auth.getSession();
      const activeSession = session ?? storedSession;

      // Native auth/session hydration can lag behind registration event after app launch.
      // Retry a few times so token registration doesn't silently fail with 401.
      if (!activeSession?.access_token) {
        const sessionRetryAttempt = (tokenRetryAttemptsRef.current[token] || 0) + 1;
        tokenRetryAttemptsRef.current[token] = sessionRetryAttempt;

        if (sessionRetryAttempt <= 8) {
          setTimeout(() => {
            void saveToken(token);
          }, 700 * sessionRetryAttempt);
          return;
        }

        console.error("[Push] Could not register token: auth session unavailable");
        return;
      }
      
      setState(prev => ({ ...prev, isRegistered: true, token }));

      const now = new Date().toISOString();
      const response = await fetch(`${SUPABASE_URL}/rest/v1/device_tokens?on_conflict=user_id,token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${activeSession.access_token}`,
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify({
          user_id: user.id,
          token,
          platform,
          is_active: true,
          last_used_at: now,
          updated_at: now,
        }),
      });

      const rawText = await response.text();
      let responseBody: unknown = null;

      try {
        responseBody = rawText ? JSON.parse(rawText) : null;
      } catch {
        responseBody = rawText;
      }

      if (!response.ok) {
        const errorMessage = typeof responseBody === "string"
          ? responseBody
          : JSON.stringify(responseBody);

        console.error("[Push] Error saving token to server:", {
          status: response.status,
          body: responseBody,
        });

        const msg = `${response.status} ${errorMessage}`.toLowerCase();
        if ((msg.includes("401") || msg.includes("invalid") || msg.includes("expired")) && saveAttempt < 2) {
          setTimeout(() => {
            void saveToken(token, saveAttempt + 1);
          }, 800);
        }
      } else {
        delete tokenRetryAttemptsRef.current[token];
        pendingNativeTokenRef.current = null;
        console.log(`[Push] ${platform} token registered successfully`);
      }
    } catch (error) {
      console.error("[Push] Error saving token:", error);
    }
  }, [session, user?.id]);

  useEffect(() => {
    if (!user?.id || !pendingNativeTokenRef.current) return;
    void saveToken(pendingNativeTokenRef.current);
  }, [user?.id, saveToken]);

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
        if (!user?.id) {
          pendingNativeTokenRef.current = token.value;
          return;
        }
        void saveToken(token.value);
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

        const payloadData = notification.data as Record<string, any> | undefined;
        const incomingCall = normalizeIncomingCallPayload(payloadData, notification.title, notification.body);

        if (incomingCall) {
          const dedupeKey = incomingCall.call_id || `${incomingCall.caller_id || "unknown"}:${incomingCall.call_type || "voice"}`;
          const now = Date.now();
          const lastSeen = recentIncomingPushRef.current[dedupeKey] || 0;
          if (now - lastSeen < 4000) return;
          recentIncomingPushRef.current[dedupeKey] = now;

          window.dispatchEvent(new CustomEvent("incoming-call-push", {
            detail: {
              call_id: incomingCall.call_id,
              caller_id: incomingCall.caller_id,
              call_type: incomingCall.call_type,
              caller_name: incomingCall.caller_name || notification.title,
              caller_avatar: incomingCall.caller_avatar,
            },
          }));
          return;
        }

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
      // Second attempt helps when iOS permission/session setup races at launch.
      setTimeout(() => {
        void register();
      }, 2000);
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
    const rawData = action.notification.data as Record<string, any>;
    const incomingCall = normalizeIncomingCallPayload(rawData, action.notification.title, action.notification.body);
    const data = incomingCall ? { ...rawData, ...incomingCall, type: "incoming_call" } : rawData;
    
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

        // Calling
        case "incoming_call":
          window.dispatchEvent(new CustomEvent("incoming-call-push", {
            detail: {
              call_id: data.call_id,
              caller_id: data.caller_id,
              call_type: data.call_type,
              caller_name: data.caller_name || action.notification.title,
              caller_avatar: data.caller_avatar,
            },
          }));
          window.location.href = `/chat`;
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
