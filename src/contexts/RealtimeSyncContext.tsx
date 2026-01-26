import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
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
