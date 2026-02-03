/**
 * ZIVO Geo-Location Detection Hook
 * Auto-detect user location for service availability
 */

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Country } from "@/types/global";

interface GeoLocation {
  countryCode: string | null;
  countryName: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  latitude: number | null;
  longitude: number | null;
  isDetected: boolean;
  isLoading: boolean;
  error: string | null;
}

interface GeoIPResponse {
  country_code: string;
  country_name: string;
  region_name: string;
  city: string;
  time_zone: string;
  latitude: number;
  longitude: number;
}

const GEO_STORAGE_KEY = "zivo_geo_location";
const GEO_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function useGeoLocation() {
  const [geoLocation, setGeoLocation] = useState<GeoLocation>({
    countryCode: null,
    countryName: null,
    region: null,
    city: null,
    timezone: null,
    latitude: null,
    longitude: null,
    isDetected: false,
    isLoading: true,
    error: null,
  });

  // Check for cached location
  const getCachedLocation = useCallback((): GeoLocation | null => {
    try {
      const cached = localStorage.getItem(GEO_STORAGE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < GEO_CACHE_DURATION) {
          return { ...data, isLoading: false };
        }
      }
    } catch {
      // Ignore cache errors
    }
    return null;
  }, []);

  // Cache location
  const cacheLocation = useCallback((location: GeoLocation) => {
    try {
      localStorage.setItem(
        GEO_STORAGE_KEY,
        JSON.stringify({ data: location, timestamp: Date.now() })
      );
    } catch {
      // Ignore cache errors
    }
  }, []);

  // Detect location via IP
  const detectLocation = useCallback(async () => {
    // Check cache first
    const cached = getCachedLocation();
    if (cached) {
      setGeoLocation(cached);
      return cached;
    }

    setGeoLocation((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Use a free IP geolocation API
      // In production, consider using a more reliable paid service
      const response = await fetch("https://api.ipgeolocation.io/ipgeo?apiKey=free", {
        method: "GET",
      });

      if (!response.ok) {
        // Fallback to browser timezone detection
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const fallbackLocation: GeoLocation = {
          countryCode: null,
          countryName: null,
          region: null,
          city: null,
          timezone,
          latitude: null,
          longitude: null,
          isDetected: false,
          isLoading: false,
          error: "IP detection unavailable",
        };
        setGeoLocation(fallbackLocation);
        return fallbackLocation;
      }

      const data: GeoIPResponse = await response.json();
      
      const newLocation: GeoLocation = {
        countryCode: data.country_code,
        countryName: data.country_name,
        region: data.region_name,
        city: data.city,
        timezone: data.time_zone,
        latitude: data.latitude,
        longitude: data.longitude,
        isDetected: true,
        isLoading: false,
        error: null,
      };

      setGeoLocation(newLocation);
      cacheLocation(newLocation);
      return newLocation;
    } catch (error) {
      // Fallback to browser timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const fallbackLocation: GeoLocation = {
        countryCode: null,
        countryName: null,
        region: null,
        city: null,
        timezone,
        latitude: null,
        longitude: null,
        isDetected: false,
        isLoading: false,
        error: error instanceof Error ? error.message : "Detection failed",
      };
      setGeoLocation(fallbackLocation);
      return fallbackLocation;
    }
  }, [getCachedLocation, cacheLocation]);

  // Detect on mount
  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  // Clear cached location
  const clearCache = useCallback(() => {
    localStorage.removeItem(GEO_STORAGE_KEY);
    setGeoLocation({
      countryCode: null,
      countryName: null,
      region: null,
      city: null,
      timezone: null,
      latitude: null,
      longitude: null,
      isDetected: false,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...geoLocation,
    refresh: detectLocation,
    clearCache,
  };
}

// Hook to get available services for detected country
export function useAvailableServices() {
  const { countryCode, isDetected, isLoading: geoLoading } = useGeoLocation();

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["available-services", countryCode],
    queryFn: async () => {
      if (!countryCode) return null;

      const { data, error } = await supabase.rpc("get_country_services", {
        p_country_code: countryCode,
      });

      if (error) throw error;
      return data as { service_type: string; is_enabled: boolean; is_beta: boolean }[];
    },
    enabled: !!countryCode && isDetected,
  });

  return {
    services: services || [],
    isLoading: geoLoading || servicesLoading,
    countryCode,
    isDetected,
    isServiceAvailable: (serviceType: string) =>
      services?.some((s) => s.service_type === serviceType && s.is_enabled) ?? false,
    isServiceBeta: (serviceType: string) =>
      services?.some((s) => s.service_type === serviceType && s.is_beta) ?? false,
  };
}

// Hook to save user locale preferences
export function useSaveLocalePreferences() {
  return useMutation({
    mutationFn: async ({
      countryCode,
      languageCode,
      currencyCode,
      timezone,
    }: {
      countryCode?: string;
      languageCode?: string;
      currencyCode?: string;
      timezone?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_locale_preferences")
        .upsert({
          user_id: user.id,
          country_code: countryCode,
          language_code: languageCode || "en",
          currency_code: currencyCode || "USD",
          timezone,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });
}

// Hook to get user's saved locale preferences
export function useUserLocalePreferences() {
  return useQuery({
    queryKey: ["user-locale-preferences"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_locale_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });
}
