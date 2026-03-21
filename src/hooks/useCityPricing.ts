/**
 * useCityPricing — Fetch ride pricing from admin-configured city_pricing table
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CityPricingRow {
  id: string;
  city: string;
  ride_type: string;
  base_fare: number;
  per_mile: number;
  per_minute: number;
  booking_fee: number;
  minimum_fare: number;
  is_active: boolean;
}

// Map DB ride_type → frontend vehicle id
const DB_TO_VEHICLE_ID: Record<string, string> = {
  standard: "economy",
  share: "share",
  comfort: "comfort",
  ev: "ev",
  xl: "xl",
  black: "black-lane",
  black_suv: "black-xl",
  luxury_xl: "luxury-xl",
  pet: "pet",
  wheelchair: "wheelchair",
  tuktuk: "tuktuk",
};

export function useCityPricing(city?: string) {
  return useQuery({
    queryKey: ["city-pricing", city || "default"],
    queryFn: async () => {
      // Fetch both city-specific and default pricing
      const { data, error } = await supabase
        .from("city_pricing")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;

      const rows = (data || []) as CityPricingRow[];
      
      // Build a map: vehicleId → pricing
      // Priority: city-specific > default
      const pricingMap: Record<string, CityPricingRow> = {};
      
      // First, apply defaults
      for (const row of rows) {
        if (row.city === "default") {
          const vehicleId = DB_TO_VEHICLE_ID[row.ride_type];
          if (vehicleId) pricingMap[vehicleId] = row;
        }
      }
      
      // Then override with city-specific if available
      if (city) {
        for (const row of rows) {
          if (row.city?.toLowerCase() === city.toLowerCase()) {
            const vehicleId = DB_TO_VEHICLE_ID[row.ride_type];
            if (vehicleId) pricingMap[vehicleId] = row;
          }
        }
      }

      return pricingMap;
    },
    staleTime: 5 * 60 * 1000, // cache for 5 min
  });
}
