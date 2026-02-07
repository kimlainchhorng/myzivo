/**
 * DriverMapView Component
 * 
 * Shows Google Map with driver approaching pickup location.
 * Falls back to static image if Maps fails to load.
 */

import { GoogleMapProvider, useGoogleMaps } from "@/components/maps/GoogleMapProvider";
import GoogleMap, { MapMarker, MapRoute } from "@/components/maps/GoogleMap";
import { hasGoogleMapsKey } from "@/services/googleMaps";

interface DriverMapViewProps {
  pickupLocation: { lat: number; lng: number };
  driverLocation: { lat: number; lng: number };
  hasArrived: boolean;
  routeCoordinates?: [number, number][];
}

const DriverMapViewInner = ({ 
  pickupLocation, 
  driverLocation, 
  hasArrived,
}: DriverMapViewProps) => {
  const { isLoaded, loadError } = useGoogleMaps();

  // Show static fallback if Maps not available
  if (!hasGoogleMapsKey() || loadError) {
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

  const markers: MapMarker[] = [
    {
      id: "pickup",
      position: pickupLocation,
      type: "pickup",
      title: "Pickup Location",
    },
    {
      id: "driver",
      position: driverLocation,
      type: "driver",
      title: hasArrived ? "Driver Arrived" : "Driver En Route",
    },
  ];

  const route: MapRoute | undefined = !hasArrived ? {
    origin: driverLocation,
    destination: pickupLocation,
    color: "#3b82f6",
  } : undefined;

  return (
    <div className="relative h-[40vh] w-full">
      <GoogleMap
        className="w-full h-full"
        center={pickupLocation}
        zoom={15}
        markers={markers}
        route={route}
        fitBounds={true}
        showControls={false}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950 pointer-events-none" />
    </div>
  );
};

const DriverMapView = (props: DriverMapViewProps) => {
  return (
    <GoogleMapProvider>
      <DriverMapViewInner {...props} />
    </GoogleMapProvider>
  );
};

export default DriverMapView;
