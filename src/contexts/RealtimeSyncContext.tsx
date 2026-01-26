import { createContext, useContext, ReactNode, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  useCustomerOrdersRealtime, 
  useRestaurantOrdersRealtime, 
  useDriverDeliveryRealtime,
  useOnlineDriversRealtime,
  useAllOrdersRealtime 
} from "@/hooks/useCrossAppRealtime";
import { 
  useRiderTripRealtime, 
  useDriverTripRealtime, 
  useAllTripsRealtime 
} from "@/hooks/useTripRealtime";
import { useNotificationSound } from "@/hooks/useNotificationSound";

interface RealtimeSyncContextType {
  isConnected: boolean;
}

const RealtimeSyncContext = createContext<RealtimeSyncContextType>({
  isConnected: false,
});

export const useRealtimeSync = () => useContext(RealtimeSyncContext);

interface RealtimeSyncProviderProps {
  children: ReactNode;
}

export const RealtimeSyncProvider = ({ children }: RealtimeSyncProviderProps) => {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const { playNewTripSound, playNewOrderSound } = useNotificationSound();
  const previousTripsRef = useRef<string[]>([]);
  const previousOrdersRef = useRef<string[]>([]);

  // Get user's driver record if they have one
  const { data: driverData } = useQuery({
    queryKey: ["user-driver", user?.id],
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

  // Get user's restaurant if they own one
  const { data: restaurantData } = useQuery({
    queryKey: ["user-restaurant", user?.id],
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

  // Sound notification for drivers - new trip requests
  useEffect(() => {
    if (!driverData?.id) return;

    const channel = supabase
      .channel(`driver-trip-sounds-${driverData.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "trips",
          filter: "status=eq.requested"
        },
        (payload) => {
          const newTripId = payload.new.id;
          if (!previousTripsRef.current.includes(newTripId)) {
            previousTripsRef.current.push(newTripId);
            // Keep only last 50 trip IDs
            if (previousTripsRef.current.length > 50) {
              previousTripsRef.current = previousTripsRef.current.slice(-50);
            }
            playNewTripSound();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [driverData?.id, playNewTripSound]);

  // Sound notification for restaurants - new orders
  useEffect(() => {
    if (!restaurantData?.id) return;

    const channel = supabase
      .channel(`restaurant-order-sounds-${restaurantData.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "food_orders",
          filter: `restaurant_id=eq.${restaurantData.id}`
        },
        (payload) => {
          const newOrderId = payload.new.id;
          if (!previousOrdersRef.current.includes(newOrderId)) {
            previousOrdersRef.current.push(newOrderId);
            // Keep only last 50 order IDs
            if (previousOrdersRef.current.length > 50) {
              previousOrdersRef.current = previousOrdersRef.current.slice(-50);
            }
            playNewOrderSound();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantData?.id, playNewOrderSound]);

  // Enable real-time subscriptions based on user roles

  // Customer: receive order updates
  useCustomerOrdersRealtime(user?.id);

  // Rider: receive trip updates
  useRiderTripRealtime(user?.id);

  // Driver: receive trip and delivery updates
  useDriverTripRealtime(driverData?.id);
  useDriverDeliveryRealtime(driverData?.id);

  // Restaurant owner: receive order updates
  useRestaurantOrdersRealtime(restaurantData?.id);

  // Admin: see everything
  useAllTripsRealtime(isAdmin);
  if (isAdmin) {
    useAllOrdersRealtime();
    useOnlineDriversRealtime();
  }

  return (
    <RealtimeSyncContext.Provider value={{ isConnected: true }}>
      {children}
    </RealtimeSyncContext.Provider>
  );
};
