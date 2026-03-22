import { useState, useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

export interface Notification {
  id: string;
  type: "trip" | "order" | "delivery" | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: Record<string, any>;
}

const MAX_NOTIFICATIONS = 50;

export const useNotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Get user's driver record
  const { data: driverData } = useQuery({
    queryKey: ["notification-driver", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("drivers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  // Get user's restaurant
  const { data: restaurantData } = useQuery({
    queryKey: ["notification-restaurant", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("restaurants")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const addNotification = useCallback(async (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
      return updated;
    });
    setUnreadCount(prev => prev + 1);

    // Fire native local notification on iOS/Android so background/lock-screen alerts work
    if (Capacitor.isNativePlatform()) {
      try {
        const perm = await LocalNotifications.checkPermissions();
        if (perm.display !== "granted") {
          await LocalNotifications.requestPermissions();
        }
        await LocalNotifications.schedule({
          notifications: [{
            id: Date.now(),
            title: notification.title,
            body: notification.message,
            schedule: { at: new Date(Date.now() + 100) },
            sound: undefined,
            actionTypeId: "",
            extra: { type: notification.type, ...notification.data },
          }],
        });
      } catch (err) {
        console.warn("[NotificationCenter] Native notification failed:", err);
      }
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Subscribe to trip updates for riders
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`notification-trips-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trips",
          filter: `rider_id=eq.${user.id}`
        },
        (payload) => {
          const trip = payload.new;
          const oldTrip = payload.old;
          
          if (trip.status !== oldTrip.status) {
            const statusMessages: Record<string, string> = {
              accepted: "A driver has accepted your trip request",
              en_route: "Your driver is on the way to pick you up",
              arrived: "Your driver has arrived at the pickup location",
              in_progress: "Your trip has started",
              completed: "Your trip has been completed",
              cancelled: "Your trip has been cancelled"
            };

            if (statusMessages[trip.status]) {
              addNotification({
                type: "trip",
                title: "Trip Update",
                message: statusMessages[trip.status],
                data: { tripId: trip.id, status: trip.status }
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, addNotification]);

  // Subscribe to trip requests for drivers
  useEffect(() => {
    if (!driverData?.id) return;

    const channel = supabase
      .channel(`notification-driver-trips-${driverData.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "trips",
          filter: "status=eq.requested"
        },
        (payload) => {
          addNotification({
            type: "trip",
            title: "New Trip Request",
            message: `New trip from ${payload.new.pickup_address?.slice(0, 30)}...`,
            data: { tripId: payload.new.id }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [driverData?.id, addNotification]);

  // Subscribe to food order updates for customers
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`notification-customer-orders-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "food_orders",
          filter: `customer_id=eq.${user.id}`
        },
        (payload) => {
          const order = payload.new;
          const oldOrder = payload.old;
          
          if (order.status !== oldOrder.status) {
            const statusMessages: Record<string, string> = {
              confirmed: "Your order has been confirmed by the restaurant",
              in_progress: "Your order is being prepared",
              ready_for_pickup: "Your order is ready for pickup",
              completed: "Your order has been delivered",
              cancelled: "Your order has been cancelled"
            };

            if (statusMessages[order.status]) {
              addNotification({
                type: "order",
                title: "Order Update",
                message: statusMessages[order.status],
                data: { orderId: order.id, status: order.status }
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, addNotification]);

  // Subscribe to new orders for restaurants
  useEffect(() => {
    if (!restaurantData?.id) return;

    const channel = supabase
      .channel(`notification-restaurant-orders-${restaurantData.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "food_orders",
          filter: `restaurant_id=eq.${restaurantData.id}`
        },
        (payload) => {
          addNotification({
            type: "order",
            title: "New Order Received",
            message: `New order worth $${payload.new.total_amount?.toFixed(2)}`,
            data: { orderId: payload.new.id }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantData?.id, addNotification]);

  // Subscribe to delivery assignments for drivers
  useEffect(() => {
    if (!driverData?.id) return;

    const channel = supabase
      .channel(`notification-driver-deliveries-${driverData.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "food_orders",
          filter: `driver_id=eq.${driverData.id}`
        },
        (payload) => {
          const order = payload.new;
          const oldOrder = payload.old;
          
          // New delivery assignment
          if (!oldOrder.driver_id && order.driver_id === driverData.id) {
            addNotification({
              type: "delivery",
              title: "New Delivery Assignment",
              message: `You've been assigned a delivery to ${order.delivery_address?.slice(0, 30)}...`,
              data: { orderId: order.id }
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [driverData?.id, addNotification]);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll
  };
};
