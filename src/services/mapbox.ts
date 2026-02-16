/**
 * Mapbox Service
 * 
 * Centralized service for all Mapbox API calls with caching
 */

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

// Cache TTL: 30 minutes
const CACHE_TTL = 30 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface GeocodingResult {
  lat: number;
  lng: number;
  placeName: string;
}

interface RouteResult {
  distance: number; // meters
  duration: number; // seconds
  distanceMiles: number;
  durationMinutes: number;
  geometry: GeoJSON.LineString;
  coordinates: [number, number][]; // [lng, lat] pairs
}

interface AddressSuggestion {
  id: string;
  placeName: string;
  text: string;
  center: [number, number]; // [lng, lat]
}

// Simple cache implementation
const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
  
  // Also persist to localStorage for cross-session cache
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // localStorage full or unavailable
  }
}

function getLocalStorageCache<T>(key: string): T | null {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    const entry = JSON.parse(stored) as CacheEntry<T>;
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

/**
 * Check if Mapbox token is available
 */
export function hasMapboxToken(): boolean {
  return Boolean(MAPBOX_TOKEN);
}

/**
 * Forward geocoding: Convert address string to coordinates
 */
export async function geocodeAddress(query: string): Promise<GeocodingResult | null> {
  if (!MAPBOX_TOKEN || !query.trim()) return null;
  
  const cacheKey = `zivo_geo_${query.toLowerCase().replace(/\s+/g, '_')}`;
  
  // Check memory cache first
  const cached = getCached<GeocodingResult>(cacheKey);
  if (cached) return cached;
  
  // Check localStorage cache
  const lsCached = getLocalStorageCache<GeocodingResult>(cacheKey);
  if (lsCached) {
    cache.set(cacheKey, { data: lsCached, timestamp: Date.now() });
    return lsCached;
  }
  
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=1&country=us`
    );
    
    if (!response.ok) throw new Error('Geocoding failed');
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) return null;
    
    const feature = data.features[0];
    const result: GeocodingResult = {
      lat: feature.center[1],
      lng: feature.center[0],
      placeName: feature.place_name,
    };
    
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Reverse geocoding: Convert coordinates to address
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  if (!MAPBOX_TOKEN) return null;
  
  const cacheKey = `zivo_revgeo_${lat.toFixed(4)}_${lng.toFixed(4)}`;
  
  const cached = getCached<string>(cacheKey);
  if (cached) return cached;
  
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&limit=1`
    );
    
    if (!response.ok) throw new Error('Reverse geocoding failed');
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
    
    const placeName = data.features[0].place_name;
    setCache(cacheKey, placeName);
    return placeName;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

/**
 * Get route between two points using Mapbox Directions API
 */
export async function getRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<RouteResult | null> {
  if (!MAPBOX_TOKEN) return null;
  
  const cacheKey = `zivo_route_${origin.lat.toFixed(4)}_${origin.lng.toFixed(4)}_${destination.lat.toFixed(4)}_${destination.lng.toFixed(4)}`;
  
  // Check memory cache
  const cached = getCached<RouteResult>(cacheKey);
  if (cached) return cached;
  
  // Check localStorage cache
  const lsCached = getLocalStorageCache<RouteResult>(cacheKey);
  if (lsCached) {
    cache.set(cacheKey, { data: lsCached, timestamp: Date.now() });
    return lsCached;
  }
  
  try {
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?access_token=${MAPBOX_TOKEN}&geometries=geojson&overview=full`
    );
    
    if (!response.ok) throw new Error('Directions request failed');
    
    const data = await response.json();
    
    if (!data.routes || data.routes.length === 0) return null;
    
    const route = data.routes[0];
    const result: RouteResult = {
      distance: route.distance, // meters
      duration: route.duration, // seconds
      distanceMiles: route.distance / 1609.344, // Convert to miles
      durationMinutes: Math.ceil(route.duration / 60), // Convert to minutes
      geometry: route.geometry,
      coordinates: route.geometry.coordinates as [number, number][],
    };
    
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Directions error:', error);
    return null;
  }
}

/**
 * Get address suggestions for autocomplete
 */
export async function getAddressSuggestions(
  query: string,
  proximity?: { lat: number; lng: number }
): Promise<AddressSuggestion[]> {
  if (!MAPBOX_TOKEN || !query.trim() || query.length < 3) return [];
  
  try {
    let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=6&country=us&types=address,poi,place`;
    
    if (proximity) {
      url += `&proximity=${proximity.lng},${proximity.lat}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('Suggestions request failed');
    
    const data = await response.json();
    
    if (!data.features) return [];
    
    return data.features.map((feature: {
      id: string;
      place_name: string;
      text: string;
      center: [number, number];
    }) => ({
      id: feature.id,
      placeName: feature.place_name,
      text: feature.text,
      center: feature.center,
    }));
  } catch (error) {
    console.error('Suggestions error:', error);
    return [];
  }
}

/**
 * Interpolate a position along a route based on progress (0-1)
 */
export function interpolateRoutePosition(
  coordinates: [number, number][],
  progress: number
): { lat: number; lng: number } {
  if (coordinates.length === 0) {
    return { lat: 40.7128, lng: -73.9857 }; // Default NYC
  }
  
  if (progress <= 0) {
    return { lat: coordinates[0][1], lng: coordinates[0][0] };
  }
  
  if (progress >= 1) {
    const last = coordinates[coordinates.length - 1];
    return { lat: last[1], lng: last[0] };
  }
  
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
  
  // Find the segment at this progress
  const targetDistance = totalDistance * progress;
  let accumulatedDistance = 0;
  
  for (let i = 0; i < segmentDistances.length; i++) {
    if (accumulatedDistance + segmentDistances[i] >= targetDistance) {
      // Interpolate within this segment
      const segmentProgress = (targetDistance - accumulatedDistance) / segmentDistances[i];
      const start = coordinates[i];
      const end = coordinates[i + 1];
      
      return {
        lat: start[1] + (end[1] - start[1]) * segmentProgress,
        lng: start[0] + (end[0] - start[0]) * segmentProgress,
      };
    }
    accumulatedDistance += segmentDistances[i];
  }
  
  // Fallback to last point
  const last = coordinates[coordinates.length - 1];
  return { lat: last[1], lng: last[0] };
}
