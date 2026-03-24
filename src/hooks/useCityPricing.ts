/**
 * useCityPricing — Fetch ride pricing from admin-configured city_pricing table
 * 
 * Cambodia pricing is stored in KHR and auto-converted to USD for the fare engine.
 * Cambodia-specific ride types (tuktuk, moto) map to frontend vehicle IDs (economy, share).
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
  card_fee_pct: number;
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
  // Cambodia-specific: tuktuk IS the economy vehicle, moto IS share
  tuktuk: "economy",
  tuktuk_ev: "share",
  moto: "share",
  share_xl: "share-xl",
};

// Cambodia cities where pricing is stored in KHR (Riel)
const KHR_CITIES = ["phnom penh", "siem reap", "sihanoukville", "battambang"];
const KHR_RATE = 4062.5;

/** Check if a city stores pricing in KHR */
function isCambodiaCity(city: string): boolean {
  return KHR_CITIES.includes(city.toLowerCase());
}

/** Convert a KHR pricing row to USD for the fare engine */
function convertKhrToUsd(row: CityPricingRow): CityPricingRow {
  return {
    ...row,
    base_fare: row.base_fare / KHR_RATE,
    // per_mile in DB is actually per-km in KHR → convert to per-mile USD
    per_mile: (row.per_mile / KHR_RATE) * 1.60934,
    per_minute: row.per_minute / KHR_RATE,
    booking_fee: row.booking_fee / KHR_RATE,
    minimum_fare: row.minimum_fare / KHR_RATE,
  };
}

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
      
      // First, apply defaults (stored in USD)
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
            if (!vehicleId) continue;
            
            // Cambodia cities store KHR values → convert to USD for fare engine
            const converted = isCambodiaCity(row.city) ? convertKhrToUsd(row) : row;
            pricingMap[vehicleId] = converted;
          }
        }
      }

      return pricingMap;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000,
  });
}
