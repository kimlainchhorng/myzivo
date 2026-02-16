/**
 * Google Maps Service
 * 
 * Centralized service for Google Maps API calls including
 * geocoding, directions, and places autocomplete.
 * 
 * NOTE: For client-side map rendering, use GoogleMapProvider which
 * fetches the API key from the edge function. This service is for
 * fallback geocoding when edge functions aren't available.
 */

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Cache storage
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

// Track if we've verified API key availability
let apiKeyVerified: boolean | null = null;

/**
 * Check if Google Maps API key is available
 * Returns true if env var is set OR if we've successfully loaded maps before
 */
export function hasGoogleMapsKey(): boolean {
  // If we've previously verified the key works, return true
  if (apiKeyVerified === true) return true;
  
  // Check env var
  if (GOOGLE_MAPS_API_KEY) {
    apiKeyVerified = true;
    return true;
  }
  
  // Check if Google Maps was already loaded (by GoogleMapProvider)
  if (typeof window !== 'undefined' && window.google?.maps) {
    apiKeyVerified = true;
    return true;
  }
  
  // Return true to allow GoogleMapProvider to try fetching the key
  // The provider will handle the actual key fetching
  return true;
}

/**
 * Mark API key as verified (called when maps successfully loads)
 */
export function setApiKeyVerified(verified: boolean): void {
  apiKeyVerified = verified;
}

/**
 * Get cached data or null if expired/missing
 */
function getFromCache<T>(key: string): T | null {
  // Try memory cache first
  const memEntry = memoryCache.get(key);
  if (memEntry && Date.now() - memEntry.timestamp < CACHE_TTL) {
    return memEntry.data as T;
  }

  // Try localStorage
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const entry = JSON.parse(stored) as CacheEntry<T>;
      if (Date.now() - entry.timestamp < CACHE_TTL) {
        memoryCache.set(key, entry);
        return entry.data;
      }
    }
  } catch {
    // Ignore storage errors
  }

  return null;
}

/**
 * Save data to cache
 */
function saveToCache<T>(key: string, data: T): void {
  const entry = { data, timestamp: Date.now() };
  memoryCache.set(key, entry);

  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Hash a string for cache keys
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Geocode an address to coordinates
 */
export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  if (!hasGoogleMapsKey() || !address.trim()) return null;

  const cacheKey = `zivo_geo_${hashString(address.toLowerCase())}`;
  const cached = getFromCache<{ lat: number; lng: number }>(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results?.length > 0) {
      const location = data.results[0].geometry.location;
      const result = { lat: location.lat, lng: location.lng };
      saveToCache(cacheKey, result);
      return result;
    }

    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to address
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string | null> {
  if (!hasGoogleMapsKey()) return null;

  const cacheKey = `zivo_rgeo_${lat.toFixed(4)}_${lng.toFixed(4)}`;
  const cached = getFromCache<string>(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results?.length > 0) {
      const address = data.results[0].formatted_address;
      saveToCache(cacheKey, address);
      return address;
    }

    return null;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}

export interface RouteResult {
  distanceMeters: number;
  distanceMiles: number;
  durationSeconds: number;
  durationMinutes: number;
  coordinates: [number, number][]; // [lng, lat] pairs for compatibility
  encodedPolyline: string;
}

/**
 * Get route between two points using Directions API
 */
export async function getRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<RouteResult | null> {
  if (!hasGoogleMapsKey()) return null;

  const cacheKey = `zivo_route_${origin.lat.toFixed(4)}_${origin.lng.toFixed(4)}_${destination.lat.toFixed(4)}_${destination.lng.toFixed(4)}`;
  const cached = getFromCache<RouteResult>(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.routes?.length > 0) {
      const route = data.routes[0];
      const leg = route.legs[0];

      const distanceMeters = leg.distance.value;
      const durationSeconds = leg.duration.value;

      // Decode the overview polyline
      const coordinates = decodePolyline(route.overview_polyline.points);

      const result: RouteResult = {
        distanceMeters,
        distanceMiles: distanceMeters / 1609.344,
        durationSeconds,
        durationMinutes: Math.ceil(durationSeconds / 60),
        coordinates,
        encodedPolyline: route.overview_polyline.points,
      };

      saveToCache(cacheKey, result);
      return result;
    }

    return null;
  } catch (error) {
    console.error("Directions error:", error);
    return null;
  }
}

export interface PlaceSuggestion {
  id: string;
  placeName: string;
  text: string;
  center: [number, number]; // [lng, lat]
}

/**
 * Get address suggestions using Places Autocomplete
 */
export async function getAddressSuggestions(
  query: string,
  proximity?: { lat: number; lng: number }
): Promise<PlaceSuggestion[]> {
  if (!hasGoogleMapsKey() || !query.trim() || query.length < 3) {
    return [];
  }

  try {
    let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}&types=geocode`;

    if (proximity) {
      url += `&location=${proximity.lat},${proximity.lng}&radius=50000`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.predictions?.length > 0) {
      // Get place details for coordinates
      const suggestions: PlaceSuggestion[] = [];

      for (const prediction of data.predictions.slice(0, 5)) {
        suggestions.push({
          id: prediction.place_id,
          placeName: prediction.description,
          text: prediction.structured_formatting?.main_text || prediction.description.split(",")[0],
          center: [0, 0], // Will be filled when selected
        });
      }

      return suggestions;
    }

    return [];
  } catch (error) {
    console.error("Places autocomplete error:", error);
    return [];
  }
}

/**
 * Decode Google's encoded polyline format
 * @param encoded - The encoded polyline string
 * @returns Array of [lng, lat] coordinate pairs
 */
export function decodePolyline(encoded: string): [number, number][] {
  const coordinates: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    // Decode latitude
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    // Decode longitude
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    // Google uses precision of 5, so divide by 1e5
    // Return as [lng, lat] for Mapbox/GeoJSON compatibility
    coordinates.push([lng / 1e5, lat / 1e5]);
  }

  return coordinates;
}

/**
 * Interpolate a position along a route based on progress (0-1)
 */
export function interpolateRoutePosition(
  coordinates: [number, number][],
  progress: number
): { lat: number; lng: number } {
  if (!coordinates || coordinates.length === 0) {
    return { lat: 40.7128, lng: -73.9857 }; // Default NYC
  }

  if (coordinates.length === 1) {
    return { lat: coordinates[0][1], lng: coordinates[0][0] };
  }

  // Clamp progress between 0 and 1
  const clampedProgress = Math.max(0, Math.min(1, progress));

  // Calculate total distance
  let totalDistance = 0;
  const segmentDistances: number[] = [];

  for (let i = 1; i < coordinates.length; i++) {
    const dx = coordinates[i][0] - coordinates[i - 1][0];
    const dy = coordinates[i][1] - coordinates[i - 1][1];
    const dist = Math.sqrt(dx * dx + dy * dy);
    segmentDistances.push(dist);
    totalDistance += dist;
  }

  // Find target distance
  const targetDistance = totalDistance * clampedProgress;

  // Find segment containing target distance
  let accumulatedDistance = 0;
  for (let i = 0; i < segmentDistances.length; i++) {
    if (accumulatedDistance + segmentDistances[i] >= targetDistance) {
      // Interpolate within this segment
      const segmentProgress = (targetDistance - accumulatedDistance) / segmentDistances[i];
      const lng =
        coordinates[i][0] + (coordinates[i + 1][0] - coordinates[i][0]) * segmentProgress;
      const lat =
        coordinates[i][1] + (coordinates[i + 1][1] - coordinates[i][1]) * segmentProgress;
      return { lat, lng };
    }
    accumulatedDistance += segmentDistances[i];
  }

  // Return last coordinate
  const lastCoord = coordinates[coordinates.length - 1];
  return { lat: lastCoord[1], lng: lastCoord[0] };
}
