import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type OrderStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

const orderStatusMessages: Record<OrderStatus, { title: string; description: string; type: "success" | "info" | "warning" }> = {
  pending: { title: "Order Placed", description: "Your order is being reviewed", type: "info" },
  confirmed: { title: "Order Confirmed", description: "Restaurant is preparing your food", type: "success" },
  in_progress: { title: "Order In Progress", description: "Your order is being prepared", type: "info" },
  completed: { title: "Order Delivered", description: "Enjoy your meal!", type: "success" },
  cancelled: { title: "Order Cancelled", description: "Your order has been cancelled", type: "warning" },
};

/**
 * Real-time sync for food orders - used by customers
 */
export const useCustomerOrdersRealtime = (customerId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!customerId) return;

    const channel = supabase
      .channel(`customer-orders-${customerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "food_orders",
          filter: `customer_id=eq.${customerId}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const newStatus = payload.new.status as OrderStatus;
            const oldStatus = payload.old?.status as OrderStatus | undefined;

            if (newStatus && newStatus !== oldStatus) {
              const message = orderStatusMessages[newStatus];
              if (message) {
                switch (message.type) {
                  case "success":
                    toast.success(message.title, { description: message.description });
                    break;
                  case "warning":
                    toast.warning(message.title, { description: message.description });
                    break;
                  default:
                    toast.info(message.title, { description: message.description });
                }
              }
            }
          }

          // Invalidate all order-related queries
          queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
          queryClient.invalidateQueries({ queryKey: ["food-orders"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [customerId, queryClient]);
};

/**
 * Real-time sync for restaurant orders - used by restaurant dashboard
 */
export const useRestaurantOrdersRealtime = (restaurantId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!restaurantId) return;

    const channel = supabase
      .channel(`restaurant-orders-${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "food_orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            toast.info("New Order!", { 
              description: "You have a new food order",
              duration: 10000,
            });
          } else if (payload.eventType === "UPDATE") {
            const newStatus = payload.new.status as OrderStatus;
            if (newStatus === "cancelled") {
              toast.warning("Order Cancelled", { description: "An order was cancelled" });
            }
          }

          queryClient.invalidateQueries({ queryKey: ["restaurant-orders"] });
          queryClient.invalidateQueries({ queryKey: ["food-orders"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId, queryClient]);
};

/**
 * Real-time sync for delivery driver - food orders assigned to them
 */
export const useDriverDeliveryRealtime = (driverId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!driverId) return;

    const channel = supabase
      .channel(`driver-deliveries-${driverId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "food_orders",
          filter: `driver_id=eq.${driverId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT" || 
              (payload.eventType === "UPDATE" && payload.new.driver_id && !payload.old?.driver_id)) {
            toast.info("New Delivery Assignment!", { 
              description: "You have a new delivery order",
              duration: 10000,
            });
          }

          queryClient.invalidateQueries({ queryKey: ["driver-deliveries"] });
          queryClient.invalidateQueries({ queryKey: ["food-orders"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [driverId, queryClient]);
};

/**
 * Real-time sync for all online drivers - used by admin and rider apps
 */
export const useOnlineDriversRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("online-drivers")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "drivers",
        },
        (payload) => {
          // Invalidate driver-related queries when any driver updates
          queryClient.invalidateQueries({ queryKey: ["online-drivers"] });
          queryClient.invalidateQueries({ queryKey: ["drivers"] });
          queryClient.invalidateQueries({ queryKey: ["available-drivers"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};

/**
 * Real-time sync for all trips - used by admin dashboard
 */
export const useAllOrdersRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("all-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "food_orders",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["food-orders"] });
          queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};

/**
 * Combined real-time hook for cross-app synchronization
 * Use this in layouts/providers to enable all relevant subscriptions
 */
export const useCrossAppSync = (options: {
  userId?: string;
  driverId?: string;
  restaurantId?: string;
  isAdmin?: boolean;
}) => {
  const { userId, driverId, restaurantId, isAdmin } = options;

  // Customer order updates
  useCustomerOrdersRealtime(userId);

  // Driver delivery updates
  useDriverDeliveryRealtime(driverId);

  // Restaurant order updates
  useRestaurantOrdersRealtime(restaurantId);

  // Admin sees all
  if (isAdmin) {
    useAllOrdersRealtime();
    useOnlineDriversRealtime();
  }
};
