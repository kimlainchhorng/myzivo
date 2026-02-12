/**
 * TripMapView Component
 * 
 * Shows Google Map with route from pickup to destination during active trip.
 * Uses @react-google-maps/api for declarative rendering.
 */

import GoogleMap, { MapMarker } from "@/components/maps/GoogleMap";
import FloatingEtaCard from "@/components/maps/FloatingEtaCard";

interface TripMapViewProps {
  pickupLocation: { lat: number; lng: number };
  destinationLocation: { lat: number; lng: number };
  carPosition: { lat: number; lng: number };
  isArrived: boolean;
  routeCoordinates?: [number, number][];
  etaMinutes?: number | null;
  distanceMiles?: number | null;
  trafficLevel?: "light" | "moderate" | "heavy" | null;
}

const TripMapView = ({ 
  pickupLocation, 
  destinationLocation, 
  carPosition, 
  isArrived,
  routeCoordinates,
  etaMinutes,
  distanceMiles,
  trafficLevel,
}: TripMapViewProps) => {
  const markers: MapMarker[] = [
    {
      id: "pickup",
      position: pickupLocation,
      type: "pickup",
      title: "Pickup",
    },
    {
      id: "destination",
      position: destinationLocation,
      type: "dropoff",
      title: "Destination",
    },
    {
      id: "car",
      position: carPosition,
      type: "driver",
      title: isArrived ? "Arrived" : "Your Ride",
    },
  ];

  // Convert route coordinates from [lng, lat] to {lat, lng}
  const routePath = routeCoordinates?.map(([lng, lat]) => ({ lat, lng }));

  return (
    <div className="relative h-[45vh] w-full">
      <GoogleMap
        className="w-full h-full"
        center={destinationLocation}
        zoom={14}
        markers={markers}
        routePath={routePath}
        showControls={false}
        darkMode={true}
      />
      <FloatingEtaCard
        etaMinutes={etaMinutes ?? null}
        distanceMiles={distanceMiles}
        trafficLevel={trafficLevel}
        statusLabel={isArrived ? "Arrived" : "To destination"}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />
    </div>
  );
};

export default TripMapView;
