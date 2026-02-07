/**
 * RidesMapBackground Component
 * 
 * Displays a Mapbox map as a background for the Rides page with user location marker.
 * Falls back to static image if Maps fails to load.
 */

import MapboxMap from "@/components/maps/MapboxMap";
import { hasMapboxToken } from "@/services/mapbox";

interface RidesMapBackgroundProps {
  userLocation: { lat: number; lng: number } | null;
  pickupCoords?: { lat: number; lng: number } | null;
  dropoffCoords?: { lat: number; lng: number } | null;
  routeCoordinates?: [number, number][];
}

const RidesMapBackground = ({ 
  userLocation,
  pickupCoords,
  dropoffCoords,
  routeCoordinates 
}: RidesMapBackgroundProps) => {
  // Default to Baton Rouge if no user location
  const center = userLocation || { lat: 30.4515, lng: -91.1871 };
  
  // Show static fallback if Maps not available
  if (!hasMapboxToken()) {
    return (
      <>
        <img 
          src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=2000"
          alt="City background"
          className="w-full h-full object-cover opacity-60"
        />
        {/* Pulsing "Current Location" Dot for fallback */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 bg-primary rounded-full animate-location-pulse absolute" />
          <div className="w-4 h-4 bg-primary rounded-full relative border-2 border-white shadow-[0_0_20px_hsl(217_91%_60%/0.5)]" />
        </div>
      </>
    );
  }

  // Build markers array
  const markers = [];
  
  if (pickupCoords) {
    markers.push({
      id: "pickup",
      position: pickupCoords,
      type: "pickup" as const,
      title: "Pickup",
    });
  } else if (userLocation) {
    markers.push({
      id: "user-location",
      position: userLocation,
      type: "pickup" as const,
      title: "Your Location",
    });
  }
  
  if (dropoffCoords) {
    markers.push({
      id: "dropoff",
      position: dropoffCoords,
      type: "dropoff" as const,
      title: "Destination",
    });
  }

  return (
    <MapboxMap
      className="w-full h-full opacity-70"
      center={pickupCoords || center}
      zoom={markers.length > 1 ? 12 : 15}
      markers={markers}
      routeCoordinates={routeCoordinates}
      fitBounds={markers.length > 1}
    />
  );
};

export default RidesMapBackground;
