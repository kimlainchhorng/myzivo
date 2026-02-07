/**
 * RidesMapBackground Component
 * 
 * Displays a Google Map as a background for the Rides page with user location marker.
 * Falls back to static image if Maps fails to load.
 */

import { GoogleMapProvider } from "@/components/maps/GoogleMapProvider";
import GoogleMap from "@/components/maps/GoogleMap";

interface RidesMapBackgroundProps {
  userLocation: { lat: number; lng: number } | null;
  pickupCoords?: { lat: number; lng: number } | null;
  dropoffCoords?: { lat: number; lng: number } | null;
  routeCoordinates?: [number, number][];
}

const RidesMapBackgroundInner = ({ 
  userLocation,
  pickupCoords,
  dropoffCoords,
  routeCoordinates,
}: RidesMapBackgroundProps) => {
  // Default to Baton Rouge if no user location
  const defaultCenter = { lat: 30.4515, lng: -91.1871 };
  
  // Determine center and pickup
  const center = pickupCoords || userLocation || defaultCenter;
  const pickup = pickupCoords || userLocation || undefined;
  const dropoff = dropoffCoords || undefined;
  
  // Convert route coordinates from [lng, lat] to {lat, lng}
  const routePath = routeCoordinates?.map(([lng, lat]) => ({ lat, lng }));

  return (
    <div className="absolute inset-0 z-0">
      <GoogleMap
        center={center}
        pickup={pickup}
        dropoff={dropoff}
        routePath={routePath}
        className="w-full h-full"
        zoom={pickup && dropoff ? 12 : 15}
        darkMode={true}
        showControls={false}
      />
      {/* Extra bottom fade behind sheet */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black/80 to-transparent" />
    </div>
  );
};

const RidesMapBackground = (props: RidesMapBackgroundProps) => {
  return (
    <GoogleMapProvider>
      <RidesMapBackgroundInner {...props} />
    </GoogleMapProvider>
  );
};

export default RidesMapBackground;
