/**
 * DriverMapView Component
 * 
 * Shows Mapbox map with driver approaching pickup location.
 * Falls back to static image if Maps fails to load.
 */

import MapboxMap from "@/components/maps/MapboxMap";
import { hasMapboxToken } from "@/services/mapbox";

interface DriverMapViewProps {
  pickupLocation: { lat: number; lng: number };
  driverLocation: { lat: number; lng: number };
  hasArrived: boolean;
  routeCoordinates?: [number, number][];
}

const DriverMapView = ({ 
  pickupLocation, 
  driverLocation, 
  hasArrived,
  routeCoordinates 
}: DriverMapViewProps) => {
  // Show static fallback if Maps not available
  if (!hasMapboxToken()) {
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
      <MapboxMap
        className="w-full h-full"
        center={pickupLocation}
        zoom={15}
        markers={markers}
        routeCoordinates={!hasArrived ? routeCoordinates : undefined}
        fitBounds={true}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950 pointer-events-none" />
    </div>
  );
};

export default DriverMapView;
