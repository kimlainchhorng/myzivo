import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Navigation, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Clock, 
  DollarSign,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { Trip, TripStatus } from "@/hooks/useTrips";

interface ActiveTripPanelProps {
  trip: Trip;
  onUpdateStatus: (status: TripStatus) => void;
  isUpdating: boolean;
}

const MAPBOX_TOKEN = "pk.eyJ1IjoibG92YWJsZS1kZW1vIiwiYSI6ImNsNHoxZzl2YzFyaHQza29hMGZzYWdqcHoifQ.SR4M8qPT-wXTR6IPq8oYkg";

const statusFlow: { status: TripStatus; label: string; nextLabel: string }[] = [
  { status: "accepted", label: "Trip Accepted", nextLabel: "Start Navigation" },
  { status: "en_route", label: "En Route to Pickup", nextLabel: "I've Arrived" },
  { status: "arrived", label: "Waiting for Rider", nextLabel: "Start Trip" },
  { status: "in_progress", label: "Trip in Progress", nextLabel: "Complete Trip" },
];

const ActiveTripPanel = ({ trip, onUpdateStatus, isUpdating }: ActiveTripPanelProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const currentStep = statusFlow.find(s => s.status === trip.status);
  const currentIndex = statusFlow.findIndex(s => s.status === trip.status);

  const getNextStatus = (): TripStatus | null => {
    switch (trip.status) {
      case "accepted": return "en_route";
      case "en_route": return "arrived";
      case "arrived": return "in_progress";
      case "in_progress": return "completed";
      default: return null;
    }
  };

  const getDestination = () => {
    if (["accepted", "en_route", "arrived"].includes(trip.status || "")) {
      return { 
        lat: trip.pickup_lat, 
        lng: trip.pickup_lng, 
        address: trip.pickup_address,
        label: "Pickup"
      };
    }
    return { 
      lat: trip.dropoff_lat, 
      lng: trip.dropoff_lng, 
      address: trip.dropoff_address,
      label: "Dropoff"
    };
  };

  const destination = getDestination();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/navigation-night-v1",
      center: [destination.lng, destination.lat],
      zoom: 14,
    });

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update markers when trip changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(m => m.remove());

    // Add pickup marker
    const pickupEl = document.createElement("div");
    pickupEl.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-green-500 border-2 border-white shadow-lg flex items-center justify-center">
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
        </svg>
      </div>
    `;
    new mapboxgl.Marker(pickupEl)
      .setLngLat([trip.pickup_lng, trip.pickup_lat])
      .addTo(map.current);

    // Add dropoff marker
    const dropoffEl = document.createElement("div");
    dropoffEl.innerHTML = `
      <div class="w-8 h-8 bg-foreground rounded-sm shadow-lg flex items-center justify-center">
        <div class="w-3 h-3 bg-background rounded-sm"></div>
      </div>
    `;
    new mapboxgl.Marker(dropoffEl)
      .setLngLat([trip.dropoff_lng, trip.dropoff_lat])
      .addTo(map.current);

    // Fit bounds
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([trip.pickup_lng, trip.pickup_lat]);
    bounds.extend([trip.dropoff_lng, trip.dropoff_lat]);
    map.current.fitBounds(bounds, { padding: 80 });
  }, [trip, mapLoaded]);

  const handleNextStep = () => {
    const nextStatus = getNextStatus();
    if (nextStatus) {
      onUpdateStatus(nextStatus);
    }
  };

  const openNavigation = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`;
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Map */}
      <div ref={mapContainer} className="h-[40vh] min-h-[250px]" />

      {/* Trip Details */}
      <div className="flex-1 bg-card p-4 space-y-4 overflow-y-auto">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-sm">
            {currentStep?.label || trip.status}
          </Badge>
          <div className="flex items-center gap-1 text-lg font-bold">
            <DollarSign className="w-5 h-5" />
            {trip.fare_amount?.toFixed(2)}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          {statusFlow.map((step, i) => (
            <div key={step.status} className="flex items-center flex-1">
              <div className={`w-3 h-3 rounded-full ${
                i <= currentIndex ? "bg-primary" : "bg-muted"
              }`} />
              {i < statusFlow.length - 1 && (
                <div className={`flex-1 h-0.5 ${
                  i < currentIndex ? "bg-primary" : "bg-muted"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Destination Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                destination.label === "Pickup" ? "bg-green-500/10" : "bg-foreground/10"
              }`}>
                <MapPin className={`w-5 h-5 ${
                  destination.label === "Pickup" ? "text-green-500" : "text-foreground"
                }`} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{destination.label} Location</p>
                <p className="font-medium">{destination.address}</p>
              </div>
              <Button variant="outline" size="icon" onClick={openNavigation}>
                <Navigation className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Trip Info */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <Navigation className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-bold">{trip.distance_km?.toFixed(1)} km</p>
              <p className="text-xs text-muted-foreground">Distance</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Clock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-bold">{trip.duration_minutes} min</p>
              <p className="text-xs text-muted-foreground">Est. Time</p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Rider */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1">
            <Phone className="w-4 h-4 mr-2" />
            Call
          </Button>
          <Button variant="outline" className="flex-1">
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
        </div>

        {/* Action Button */}
        <Button 
          className="w-full" 
          size="lg"
          onClick={handleNextStep}
          disabled={isUpdating}
        >
          {isUpdating ? (
            "Updating..."
          ) : trip.status === "in_progress" ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Complete Trip
            </>
          ) : (
            <>
              {currentStep?.nextLabel}
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ActiveTripPanel;
