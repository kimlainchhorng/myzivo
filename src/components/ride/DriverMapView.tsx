/**
 * DriverMapView Component
 * 
 * Shows Google Map with driver approaching pickup location.
 * Uses @react-google-maps/api for declarative rendering.
 */

import GoogleMap, { MapMarker } from "@/components/maps/GoogleMap";

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
  routeCoordinates,
}: DriverMapViewProps) => {
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

  // Convert route coordinates from [lng, lat] to {lat, lng}
  const routePath = !hasArrived && routeCoordinates 
    ? routeCoordinates.map(([lng, lat]) => ({ lat, lng }))
    : undefined;

  return (
    <div className="relative h-[40vh] w-full">
      <GoogleMap
        className="w-full h-full"
        center={pickupLocation}
        zoom={15}
        markers={markers}
        routePath={routePath}
        showControls={false}
        darkMode={true}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />
    </div>
  );
};

export default DriverMapView;
