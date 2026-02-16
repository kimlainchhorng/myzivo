/**
 * Delivery Replay Page
 * Full-screen map showing the route a driver took for a completed delivery
 */
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Loader2, AlertTriangle } from "lucide-react";
import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";
import { useGoogleMaps } from "@/components/maps/GoogleMapProvider";
import { useLiveEatsOrder } from "@/hooks/useLiveEatsOrder";
import { useDeliveryReplay } from "@/hooks/useDeliveryReplay";
import { format } from "date-fns";
import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";

const darkMapStyles: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a1a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#666666" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2a2a" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#333333" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e0e0e" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

export default function EatsDeliveryReplay() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { order, loading: orderLoading } = useLiveEatsOrder(id);
  const { isLoaded } = useGoogleMaps();
  const mapRef = useRef<google.maps.Map | null>(null);

  const pickupLat = order?.pickup_lat ?? order?.restaurants?.lat;
  const pickupLng = order?.pickup_lng ?? order?.restaurants?.lng;

  const {
    data: replay,
    isLoading: replayLoading,
  } = useDeliveryReplay(
    id,
    order?.driver_id,
    order?.picked_up_at,
    order?.delivered_at,
    pickupLat,
    pickupLng,
    order?.delivery_lat,
    order?.delivery_lng
  );

  // Fit bounds when data loads
  useEffect(() => {
    if (!mapRef.current || !replay || !window.google) return;
    const bounds = new google.maps.LatLngBounds();

    replay.routePoints.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
    replay.eventMarkers.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }));

    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds, 60);
    }
  }, [replay]);

  const loading = orderLoading || replayLoading || !isLoaded;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!order || order.status !== "delivered") {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-6">
        <MapPin className="w-16 h-16 text-zinc-600 mb-4" />
        <h2 className="text-xl font-bold mb-2">Route Not Available</h2>
        <p className="text-zinc-500 mb-6 text-center">
          Delivery route is only available for completed orders.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="text-orange-400 font-medium"
        >
          Go Back
        </button>
      </div>
    );
  }

  const restaurantName = order.restaurants?.name || "Restaurant";

  // Build polyline path
  const polylinePath =
    replay && replay.routePoints.length > 0
      ? replay.routePoints.map((p) => ({ lat: p.lat, lng: p.lng }))
      : // Fallback: straight line between pickup and delivery
        pickupLat != null &&
          pickupLng != null &&
          order.delivery_lat != null &&
          order.delivery_lng != null
        ? [
            { lat: pickupLat, lng: pickupLng },
            { lat: order.delivery_lat, lng: order.delivery_lng },
          ]
        : [];

  const defaultCenter =
    pickupLat != null && pickupLng != null
      ? { lat: pickupLat, lng: pickupLng }
      : { lat: 40.7128, lng: -73.9857 };

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative">
      <SEOHead
        title={`Delivery Route — ${restaurantName} — ZIVO Eats`}
        description="View your delivery route"
      />

      {/* Map */}
      <div className="absolute inset-0">
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={defaultCenter}
            zoom={14}
            options={{
              styles: darkMapStyles,
              disableDefaultUI: true,
              zoomControl: true,
              gestureHandling: "greedy",
            }}
            onLoad={(map) => {
              mapRef.current = map;
              // Fit bounds immediately if replay data is already available
              if (replay && window.google) {
                const bounds = new google.maps.LatLngBounds();
                replay.routePoints.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
                replay.eventMarkers.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }));
                if (!bounds.isEmpty()) map.fitBounds(bounds, 60);
              }
            }}
          >
            {/* Route polyline */}
            {polylinePath.length > 0 && (
              <Polyline
                path={polylinePath}
                options={{
                  strokeColor: "#f97316",
                  strokeOpacity: replay?.hasDetailedRoute ? 0.85 : 0.5,
                  strokeWeight: 5,
                  geodesic: true,
                  ...(replay?.hasDetailedRoute
                    ? {}
                    : {
                        strokeOpacity: 0,
                        icons: [
                          {
                            icon: {
                              path: "M 0,-1 0,1",
                              strokeOpacity: 0.6,
                              strokeColor: "#f97316",
                              scale: 3,
                            },
                            offset: "0",
                            repeat: "16px",
                          },
                        ],
                      }),
                }}
              />
            )}

            {/* Event markers */}
            {replay?.eventMarkers.map((marker, i) => (
              <Marker
                key={i}
                position={{ lat: marker.lat, lng: marker.lng }}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: marker.color,
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: 3,
                }}
                title={`${marker.label} — ${format(new Date(marker.timestamp), "h:mm a")}`}
              />
            ))}
          </GoogleMap>
        )}
      </div>

      {/* Header overlay */}
      <div className="absolute top-0 inset-x-0 z-10">
        <div className="bg-gradient-to-b from-zinc-950/90 via-zinc-950/60 to-transparent px-4 pt-4 pb-12">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/eats/orders/${id}`)}
              className="w-10 h-10 rounded-full bg-zinc-900/80 backdrop-blur border border-white/10 flex items-center justify-center shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold text-lg">Delivery Route</h1>
              <p className="text-xs text-zinc-400">{restaurantName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom legend card */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute bottom-0 inset-x-0 z-10 p-4"
      >
        <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-3">
          {/* Approximate route warning */}
          {replay && !replay.hasDetailedRoute && (
            <div className="flex items-center gap-2 text-yellow-400 mb-1">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="text-xs">Detailed route not available</span>
            </div>
          )}

          {/* Event timeline */}
          <div className="space-y-3">
            {replay?.eventMarkers.map((marker, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className="w-3 h-3 rounded-full border-2 border-white"
                    style={{ backgroundColor: marker.color }}
                  />
                  {i < (replay.eventMarkers.length - 1) && (
                    <div className="w-0.5 h-4 bg-zinc-700 mt-1" />
                  )}
                </div>
                <div className="flex-1 flex justify-between items-center">
                  <span className="text-sm font-medium">{marker.label}</span>
                  <span className="text-xs text-zinc-400">
                    {format(new Date(marker.timestamp), "h:mm a")}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Route stats */}
          {replay && replay.routePoints.length > 0 && (
            <div className="border-t border-white/10 pt-2 flex justify-between text-xs text-zinc-500">
              <span>{replay.routePoints.length} GPS points recorded</span>
              {replay.isApproximate && <span>Approximate route</span>}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
