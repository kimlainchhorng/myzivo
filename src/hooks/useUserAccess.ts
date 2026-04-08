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
  isSupport: boolean;
  isModerator: boolean;
  isOperations: boolean;
  roles: string[];
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
          isSupport: false,
          isModerator: false,
          isOperations: false,
          roles: [],
        };
      }

      // Check all access in parallel
      const [userRoles, driver, restaurant, carRentals, hotel, storeProfile] = await Promise.all([
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId),
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

      const roles = (userRoles.data || []).map(r => r.role);

      return {
        isAdmin: roles.includes("admin") || roles.includes("super_admin"),
        isDriver: !!driver.data,
        isRestaurantOwner: !!restaurant.data,
        isCarRentalOwner: (carRentals.data?.length ?? 0) > 0,
        isHotelOwner: !!hotel.data,
        isFlightManager: roles.includes("admin") || roles.includes("super_admin"),
        isStoreOwner: !!storeProfile.data,
        isSupport: roles.includes("support"),
        isModerator: roles.includes("moderator"),
        isOperations: roles.includes("operations"),
        roles,
        driverId: driver.data?.id,
        restaurantId: restaurant.data?.id,
        carRentalIds: carRentals.data?.map(c => c.id),
        hotelId: hotel.data?.id,
        storeId: storeProfile.data?.id,
      };
    },
    enabled: !!userId,
  });
};
