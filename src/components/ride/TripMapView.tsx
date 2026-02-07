/**
 * TripMapView Component
 * 
 * Shows Google Map with route from pickup to destination during active trip.
 * Falls back to static image if Maps fails to load.
 */

import { motion } from "framer-motion";
import { GoogleMapProvider, useGoogleMaps } from "@/components/maps/GoogleMapProvider";
import GoogleMap, { MapMarker, MapRoute } from "@/components/maps/GoogleMap";
import { hasGoogleMapsKey } from "@/services/googleMaps";

interface TripMapViewProps {
  pickupLocation: { lat: number; lng: number };
  destinationLocation: { lat: number; lng: number };
  carPosition: { lat: number; lng: number };
  isArrived: boolean;
  routeCoordinates?: [number, number][];
}

const TripMapViewInner = ({ 
  pickupLocation, 
  destinationLocation, 
  carPosition, 
  isArrived,
}: TripMapViewProps) => {
  const { isLoaded, loadError } = useGoogleMaps();

  // Show static fallback if Maps not available
  if (!hasGoogleMapsKey() || loadError) {
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

  const route: MapRoute = {
    origin: pickupLocation,
    destination: destinationLocation,
    color: "#3b82f6",
  };

  return (
    <div className="relative h-[45vh] w-full">
      <GoogleMap
        className="w-full h-full"
        center={destinationLocation}
        zoom={14}
        markers={markers}
        route={route}
        fitBounds={true}
        showControls={false}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950 pointer-events-none" />
    </div>
  );
};

const TripMapView = (props: TripMapViewProps) => {
  return (
    <GoogleMapProvider>
      <TripMapViewInner {...props} />
    </GoogleMapProvider>
  );
};

export default TripMapView;
