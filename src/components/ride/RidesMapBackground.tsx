/**
 * RidesMapBackground Component
 * 
 * Displays a Google Map as a background for the Rides page with user location marker.
 * Falls back to static image if Maps fails to load.
 */

import { GoogleMap, useGoogleMaps } from "@/components/maps";

interface RidesMapBackgroundProps {
  userLocation: { lat: number; lng: number } | null;
}

const RidesMapBackground = ({ userLocation }: RidesMapBackgroundProps) => {
  const { isLoaded, loadError } = useGoogleMaps();
  
  // Default to Baton Rouge if no user location
  const center = userLocation || { lat: 30.4515, lng: -91.1871 };
  
  // Show static fallback if Maps not loaded or error
  if (!isLoaded || loadError) {
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

  return (
    <GoogleMap
      className="w-full h-full opacity-70"
      center={center}
      zoom={15}
      darkMode={true}
      showControls={false}
      markers={userLocation ? [
        {
          id: "user-location",
          position: userLocation,
          type: "pickup",
          title: "Your Location",
        }
      ] : []}
      fitBounds={false}
    />
  );
};

export default RidesMapBackground;
