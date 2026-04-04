import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UserAccess {
  isAdmin: boolean;
  isDriver: boolean;
  isRestaurantOwner: boolean;
  isCarRentalOwner: boolean;
  isHotelOwner: boolean;
  isFlightManager: boolean;
  isStoreOwner: boolean;
  driverId?: string;
  restaurantId?: string;
  carRentalIds?: string[];
  hotelId?: string;
  storeId?: string;
}

export const useUserAccess = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["userAccess", userId],
    queryFn: async (): Promise<UserAccess> => {
      if (!userId) {
        return {
          isAdmin: false,
          isDriver: false,
          isRestaurantOwner: false,
          isCarRentalOwner: false,
          isHotelOwner: false,
          isFlightManager: false,
          isStoreOwner: false,
        };
      }

      // Check all access in parallel
      const [adminRole, driver, restaurant, carRentals, hotel, storeProfile] = await Promise.all([
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle(),
        supabase
          .from("drivers")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("restaurants")
          .select("id")
          .eq("owner_id", userId)
          .maybeSingle(),
        supabase
          .from("rental_cars")
          .select("id")
          .eq("owner_id", userId),
        supabase
          .from("hotels")
          .select("id")
          .eq("owner_id", userId)
          .maybeSingle(),
        supabase
          .from("store_profiles")
          .select("id")
          .eq("owner_id", userId)
          .maybeSingle(),
      ]);

      return {
        isAdmin: !!adminRole.data,
        isDriver: !!driver.data,
        isRestaurantOwner: !!restaurant.data,
        isCarRentalOwner: (carRentals.data?.length ?? 0) > 0,
        isHotelOwner: !!hotel.data,
        isFlightManager: !!adminRole.data, // For now, only admins can manage flights
        driverId: driver.data?.id,
        restaurantId: restaurant.data?.id,
        carRentalIds: carRentals.data?.map(c => c.id),
        hotelId: hotel.data?.id,
      };
    },
    enabled: !!userId,
  });
};
