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
export { default as ZivoDropoffMarker } from "./ZivoDropoffMarker";
export { default as AnimatedDriverMarker } from "./AnimatedDriverMarker";
export { default as FloatingEtaCard } from "./FloatingEtaCard";
export { default as NearbyCars } from "./NearbyCars";
export { default as DriverDots } from "./DriverDots"; // Legacy

// Mapbox (legacy fallback)
export { default as MapboxMap } from "./MapboxMap";
export type { MapboxMapProps, MapMarker as MapboxMarker } from "./MapboxMap";
