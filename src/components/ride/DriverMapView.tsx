/**
 * DriverMapView Component
 * 
 * Shows Google Map with driver approaching pickup location.
 * Falls back to static image if Maps fails to load.
 */

import { GoogleMap, useGoogleMaps } from "@/components/maps";

interface DriverMapViewProps {
  pickupLocation: { lat: number; lng: number };
  driverLocation: { lat: number; lng: number };
  hasArrived: boolean;
}

const DriverMapView = ({ pickupLocation, driverLocation, hasArrived }: DriverMapViewProps) => {
  const { isLoaded, loadError } = useGoogleMaps();

  // Show static fallback if Maps not loaded or error
  if (!isLoaded || loadError) {
    return (
      <div className="relative h-[40vh] w-full">
        <img
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=600&fit=crop"
          alt="Map view"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950" />
      </div>
    );
  }

  const markers = [
    {
      id: "pickup",
      position: pickupLocation,
      type: "pickup" as const,
      title: "Pickup Location",
    },
    {
      id: "driver",
      position: driverLocation,
      type: "driver" as const,
      title: hasArrived ? "Driver Arrived" : "Driver En Route",
    },
  ];

  return (
    <div className="relative h-[40vh] w-full">
      <GoogleMap
        className="w-full h-full"
        center={pickupLocation}
        zoom={15}
        darkMode={true}
        showControls={false}
        markers={markers}
        route={!hasArrived ? {
          origin: driverLocation,
          destination: pickupLocation,
        } : undefined}
        fitBounds={true}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950 pointer-events-none" />
    </div>
  );
};

export default DriverMapView;
