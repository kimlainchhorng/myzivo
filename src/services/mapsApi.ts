/**
 * Server-Side Maps API Client
 * 
 * Wraps edge functions for secure Google Maps API access.
 * API key is kept server-side for security.
 */

import { supabase } from "@/integrations/supabase/client";

export interface PlaceSuggestion {
  description: string;
  place_id: string;
  main_text: string;
}

export interface PlaceDetails {
  address: string;
  name: string;
  lat: number;
  lng: number;
}

export interface RouteResult {
  distance_miles: number;
  duration_minutes: number;
  polyline: string | null;
  start_address?: string;
  end_address?: string;
}

/**
 * Get address autocomplete suggestions
 */
export async function getAutocompleteSuggestions(
  input: string,
  proximity?: { lat: number; lng: number }
): Promise<PlaceSuggestion[]> {
  if (!input || input.trim().length < 2) {
    return [];
  }

  try {
    const { data, error } = await supabase.functions.invoke("maps-autocomplete", {
      body: { input: input.trim(), proximity },
    });

    if (error) {
      console.error("[mapsApi] Autocomplete invoke error:", error);
      return [];
    }

    if (!data?.ok) {
      console.warn("[mapsApi] Autocomplete returned error:", data?.error);
      return [];
    }

    return data.suggestions ?? [];
  } catch (e) {
    console.error("[mapsApi] Autocomplete exception:", e);
    return [];
  }
}

/**
 * Get place details (coordinates) from a place ID
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  if (!placeId) {
    return null;
  }

  try {
    const { data, error } = await supabase.functions.invoke("maps-place-details", {
      body: { place_id: placeId },
    });

    if (error) {
      console.error("[mapsApi] Place details invoke error:", error);
      return null;
    }

    if (!data?.ok) {
      console.warn("[mapsApi] Place details returned error:", data?.error);
      return null;
    }

    return {
      address: data.address,
      name: data.name,
      lat: data.lat,
      lng: data.lng,
    };
  } catch (e) {
    console.error("[mapsApi] Place details exception:", e);
    return null;
  }
}

/**
 * Get driving route between two coordinates
 */
export async function getRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<RouteResult | null> {
  try {
    const { data, error } = await supabase.functions.invoke("maps-route", {
      body: {
        origin_lat: origin.lat,
        origin_lng: origin.lng,
        dest_lat: destination.lat,
        dest_lng: destination.lng,
      },
    });

    if (error) {
      console.error("[mapsApi] Route invoke error:", error);
      return null;
    }

    if (!data?.ok) {
      console.warn("[mapsApi] Route returned error:", data?.error);
      return null;
    }

    return {
      distance_miles: data.distance_miles,
      duration_minutes: data.duration_minutes,
      polyline: data.polyline,
      start_address: data.start_address,
      end_address: data.end_address,
    };
  } catch (e) {
    console.error("[mapsApi] Route exception:", e);
    return null;
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */
export function haversineMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8; // Earth radius in miles
  const toRad = (x: number) => (x * Math.PI) / 180;
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Check if driver is within arrival threshold of a location
 */
export function isWithinArrivalThreshold(
  driverLat: number,
  driverLng: number,
  targetLat: number,
  targetLng: number,
  thresholdMiles: number = 0.10
): boolean {
  const distance = haversineMiles(driverLat, driverLng, targetLat, targetLng);
  return distance <= thresholdMiles;
}
