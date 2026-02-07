/**
 * TripMapView Component
 * 
 * Shows Mapbox map with route from pickup to destination during active trip.
 * Falls back to static image if Maps fails to load.
 */

import { motion } from "framer-motion";
import MapboxMap from "@/components/maps/MapboxMap";
import { hasMapboxToken } from "@/services/mapbox";

interface TripMapViewProps {
  pickupLocation: { lat: number; lng: number };
  destinationLocation: { lat: number; lng: number };
  carPosition: { lat: number; lng: number };
  isArrived: boolean;
  routeCoordinates?: [number, number][];
}

const TripMapView = ({ 
  pickupLocation, 
  destinationLocation, 
  carPosition, 
  isArrived,
  routeCoordinates 
}: TripMapViewProps) => {
  // Show static fallback if Maps not available
  if (!hasMapboxToken()) {
    return (
      <div className="relative h-[45vh] w-full">
        <img
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=600&fit=crop"
          alt="Map view"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950" />
        
        {/* Fallback animated car */}
        <motion.div
          animate={!isArrived ? {
            left: ["25%", "55%", "70%"],
            top: ["65%", "45%", "30%"],
          } : {}}
          transition={{ duration: 8, ease: "easeInOut" }}
          className="absolute"
          style={{ left: isArrived ? "70%" : "25%", top: isArrived ? "30%" : "65%" }}
        >
          <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/40">
            <span className="text-lg">🚗</span>
          </div>
        </motion.div>
      </div>
    );
  }

  const markers = [
    {
      id: "pickup",
      position: pickupLocation,
      type: "pickup" as const,
      title: "Pickup",
    },
    {
      id: "destination",
      position: destinationLocation,
      type: "dropoff" as const,
      title: "Destination",
    },
    {
      id: "car",
      position: carPosition,
      type: "driver" as const,
      title: isArrived ? "Arrived" : "Your Ride",
    },
  ];

  return (
    <div className="relative h-[45vh] w-full">
      <MapboxMap
        className="w-full h-full"
        center={destinationLocation}
        zoom={14}
        markers={markers}
        routeCoordinates={routeCoordinates}
        fitBounds={true}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950 pointer-events-none" />
    </div>
  );
};

export default TripMapView;
