/**
 * Maps Components
 * 
 * Map integrations for ZIVO using @react-google-maps/api
 */

// Google Maps (primary)
export { GoogleMapProvider, useGoogleMaps } from "./GoogleMapProvider";
export { default as GoogleMap } from "./GoogleMap";
export type { GoogleMapProps, GoogleMapRef, MapMarker, MapRoute } from "./GoogleMap";

// Custom markers
export { default as ZivoPickupMarker } from "./ZivoPickupMarker";
export { default as DriverDots } from "./DriverDots";

// Mapbox (legacy fallback)
export { default as MapboxMap } from "./MapboxMap";
export type { MapboxMapProps, MapMarker as MapboxMarker } from "./MapboxMap";
