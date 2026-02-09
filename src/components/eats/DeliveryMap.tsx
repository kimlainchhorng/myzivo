/**
 * Delivery Map Component
 * Shows driver location and delivery destination on a map
 */
import { useEffect, useRef, useState } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useGoogleMaps } from "@/components/maps/GoogleMapProvider";
import { MapPin, Navigation, Loader2 } from "lucide-react";

interface DeliveryStop {
  lat: number;
  lng: number;
  stopOrder: number;
  status: "pending" | "current" | "delivered";
}

interface DeliveryMapProps {
  driverLat?: number | null;
  driverLng?: number | null;
  driverHeading?: number | null;
  deliveryAddress?: string;
  deliveryLat?: number;
  deliveryLng?: number;
  restaurantLat?: number;
  restaurantLng?: number;
  isLocationStale?: boolean;
  // Multi-stop support
  deliveryStops?: DeliveryStop[];
  isMultiStop?: boolean;
  currentStopIndex?: number;
  className?: string;
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "16px",
};

const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a1a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#666666" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#2a2a2a" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#333333" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0e0e0e" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#1f1f1f" }],
  },
];

export function DeliveryMap({
  driverLat,
  driverLng,
  driverHeading,
  deliveryAddress,
  deliveryLat = 40.7128,
  deliveryLng = -73.006,
  restaurantLat,
  restaurantLng,
  isLocationStale = false,
  deliveryStops,
  isMultiStop = false,
  currentStopIndex = 0,
  className,
}: DeliveryMapProps) {
  const { isLoaded, loadError } = useGoogleMaps();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [center, setCenter] = useState({ lat: deliveryLat, lng: deliveryLng });

  const hasDriverLocation = driverLat != null && driverLng != null;

  const hasRestaurantLocation = restaurantLat != null && restaurantLng != null;

  useEffect(() => {
    if (mapRef.current) {
      const bounds = new google.maps.LatLngBounds();
      
      // Always include delivery location
      bounds.extend({ lat: deliveryLat, lng: deliveryLng });
      
      // Include driver if available
      if (hasDriverLocation) {
        bounds.extend({ lat: driverLat!, lng: driverLng! });
      }
      
      // Include restaurant if available
      if (hasRestaurantLocation) {
        bounds.extend({ lat: restaurantLat!, lng: restaurantLng! });
      }
      
      mapRef.current.fitBounds(bounds, 60);
    }
  }, [driverLat, driverLng, deliveryLat, deliveryLng, restaurantLat, restaurantLng, hasDriverLocation, hasRestaurantLocation]);

  if (loadError) {
    return (
      <div className={`bg-zinc-800 rounded-2xl flex items-center justify-center ${className}`}>
        <p className="text-zinc-500 text-sm">Failed to load map</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`bg-zinc-800 rounded-2xl flex items-center justify-center ${className}`}>
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={14}
        options={{
          styles: darkMapStyles,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
        onLoad={(map) => {
          mapRef.current = map;
        }}
      >
        {/* Restaurant Location Marker */}
        {hasRestaurantLocation && (
          <Marker
            position={{ lat: restaurantLat!, lng: restaurantLng! }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#f97316",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            }}
          />
        )}

        {/* Delivery Location Marker */}
        <Marker
          position={{ lat: deliveryLat, lng: deliveryLng }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#22c55e",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          }}
        />

        {/* Driver Location Marker with heading rotation */}
        {hasDriverLocation && (
          <Marker
            position={{ lat: driverLat!, lng: driverLng! }}
            icon={{
              path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: "#f97316",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              rotation: driverHeading ?? 0,
            }}
          />
        )}
      </GoogleMap>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2 justify-between">
        <div className="flex items-center gap-2 bg-zinc-900/90 backdrop-blur px-3 py-2 rounded-lg">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-xs text-white">Delivery</span>
        </div>
        {hasRestaurantLocation && (
          <div className="flex items-center gap-2 bg-zinc-900/90 backdrop-blur px-3 py-2 rounded-lg">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-xs text-white">Restaurant</span>
          </div>
        )}
        {hasDriverLocation && (
          <div className="flex items-center gap-2 bg-zinc-900/90 backdrop-blur px-3 py-2 rounded-lg">
            <Navigation className="w-3 h-3 text-orange-500" />
            <span className="text-xs text-white">Driver</span>
          </div>
        )}
      </div>

      {/* Stale Location Warning */}
      {isLocationStale && hasDriverLocation && (
        <div className="absolute top-3 left-3 right-3">
          <div className="bg-yellow-500/20 border border-yellow-500/30 backdrop-blur px-3 py-2 rounded-lg flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
            <span className="text-xs text-yellow-400">Updating driver location...</span>
          </div>
        </div>
      )}

      {/* No Driver Overlay */}
      {!hasDriverLocation && (
        <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center px-6">
            <MapPin className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
            <p className="text-sm text-zinc-400">
              Live tracking will appear once a driver is assigned
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
