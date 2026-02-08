/**
 * useRidePricingSettings Hook
 * Fetches ride pricing settings from the database
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RidePricingSettings {
  base_fare: number;
  per_mile_rate: number;
  per_minute_rate: number;
  minimum_fare: number;
  booking_fee: number;
  service_fee_percent: number;
  standard_multiplier: number;
  xl_multiplier: number;
  premium_multiplier: number;
}

// Default fallback values matching the plan
const DEFAULT_SETTINGS: RidePricingSettings = {
  base_fare: 3.50,
  per_mile_rate: 1.75,
  per_minute_rate: 0.35,
  minimum_fare: 7.00,
  booking_fee: 2.50,
  service_fee_percent: 0,
  standard_multiplier: 1.0,
  xl_multiplier: 1.3,
  premium_multiplier: 1.6,
};

interface PricingSettingRow {
  setting_key: string;
  setting_value: string | number | null;
}

async function fetchRidePricingSettings(): Promise<RidePricingSettings> {
  try {
    // Use REST API directly to avoid type instantiation issues
    const url = `${(supabase as unknown as { supabaseUrl: string }).supabaseUrl}/rest/v1/pricing_settings?service_type=eq.rides&is_active=eq.true&select=setting_key,setting_value`;
    
    const response = await fetch(url, {
      headers: {
        'apikey': (supabase as unknown as { supabaseKey: string }).supabaseKey,
        'Authorization': `Bearer ${(supabase as unknown as { supabaseKey: string }).supabaseKey}`,
      },
    });

    if (!response.ok) {
      console.error("[useRidePricingSettings] Error fetching settings:", response.statusText);
      return DEFAULT_SETTINGS;
    }

    const data: PricingSettingRow[] = await response.json();

    if (!data || data.length === 0) {
      console.warn("[useRidePricingSettings] No settings found, using defaults");
      return DEFAULT_SETTINGS;
    }

    // Convert array of {setting_key, setting_value} to object
    const settingsMap: Record<string, number> = {};
    data.forEach((row) => {
      settingsMap[row.setting_key] = parseFloat(String(row.setting_value)) || 0;
    });

    return {
      base_fare: settingsMap.base_fare ?? DEFAULT_SETTINGS.base_fare,
      per_mile_rate: settingsMap.per_mile ?? DEFAULT_SETTINGS.per_mile_rate,
      per_minute_rate: settingsMap.per_minute ?? DEFAULT_SETTINGS.per_minute_rate,
      minimum_fare: settingsMap.minimum_fare ?? DEFAULT_SETTINGS.minimum_fare,
      booking_fee: settingsMap.booking_fee ?? DEFAULT_SETTINGS.booking_fee,
      service_fee_percent: settingsMap.service_fee_percent ?? DEFAULT_SETTINGS.service_fee_percent,
      standard_multiplier: settingsMap.standard_multiplier ?? DEFAULT_SETTINGS.standard_multiplier,
      xl_multiplier: settingsMap.xl_multiplier ?? DEFAULT_SETTINGS.xl_multiplier,
      premium_multiplier: settingsMap.premium_multiplier ?? DEFAULT_SETTINGS.premium_multiplier,
    };
  } catch (error) {
    console.error("[useRidePricingSettings] Error:", error);
    return DEFAULT_SETTINGS;
  }
}

export function useRidePricingSettings() {
  return useQuery({
    queryKey: ["ride-pricing-settings"],
    queryFn: fetchRidePricingSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
  });
}

export { DEFAULT_SETTINGS as DEFAULT_RIDE_PRICING };
