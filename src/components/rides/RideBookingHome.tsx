/**
 * RideBookingHome — Complete ride booking flow
 * Flow: home → search → route-preview → vehicle → pickup-confirm → matching → tracking → complete
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Navigation, ChevronRight, ArrowLeft, Home,
  Building2, Car, Crown, Users, Zap,
  CheckCircle, History, ChevronDown, Clock,
  CreditCard, User, CalendarClock, Map,
  Star, Phone, MessageSquare, Shield, Banknote,
  Smartphone, Wallet, X, Baby, Sparkles,
  Route, Timer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import RideMap from "@/components/maps/RideMap";
import { AddressAutocomplete } from "@/components/shared/AddressAutocomplete";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";

/* ─── Types ─── */
interface PlaceData {
  address: string;
  lat: number;
  lng: number;
}

interface RouteData {
  distance_miles: number;
  duration_minutes: number;
  polyline: string | null;
  traffic_level?: string;
}

type ViewStep = "home" | "search" | "route-preview" | "vehicle" | "pickup-confirm" | "matching" | "tracking" | "complete";
type RideTab = "book" | "reserve" | "map" | "history";

/* ─── Data ─── */
const savedPlaces = [
  { id: "home", name: "Home", address: "1234 Main St", icon: Home },
  { id: "work", name: "Work", address: "400 Tech Blvd", icon: Building2 },
];

const recentDestinations = [
  { id: "1", address: "Downtown Gym, 55 Fitness Ave", time: "Yesterday, 6:30 PM" },
  { id: "2", address: "Grand Hotel, 200 Park Ave", time: "3 days ago" },
  { id: "3", address: "Central Mall, 88 Shopping Dr", time: "Last week" },
];

const vehicleOptions = [
  { id: "economy", name: "ZIVO Economy", desc: "Affordable everyday rides", etaMin: 4, pricePerMile: 1.50, basePrice: 3.50, capacity: 4, icon: Car, carSeat: false },
  { id: "xl", name: "ZIVO XL", desc: "Extra space for groups", etaMin: 5, pricePerMile: 1.80, basePrice: 4.50, capacity: 6, icon: Users, carSeat: false },
  { id: "comfort", name: "ZIVO Comfort", desc: "Extra legroom, top-rated drivers", etaMin: 5, pricePerMile: 2.20, basePrice: 5.00, capacity: 4, icon: Sparkles, carSeat: false },
  { id: "luxury", name: "ZIVO Luxury", desc: "Premium with professional drivers", etaMin: 6, pricePerMile: 3.80, basePrice: 8.00, capacity: 4, icon: Crown, carSeat: false },
  { id: "car-seat", name: "ZIVO Car Seat", desc: "Equipped with 1 child car seat", etaMin: 6, pricePerMile: 1.80, basePrice: 5.50, capacity: 4, icon: Car, carSeat: true },
  { id: "xl-car-seat", name: "ZIVO XL Car Seat", desc: "Larger vehicle with 1 child car seat", etaMin: 7, pricePerMile: 2.20, basePrice: 6.50, capacity: 6, icon: Users, carSeat: true },
  { id: "black-car-seat", name: "ZIVO Black Car Seat", desc: "Premium ride with 1 child car seat", etaMin: 8, pricePerMile: 4.20, basePrice: 10.00, capacity: 4, icon: Crown, carSeat: true },
];

const rideTabs: { id: RideTab; label: string; icon: React.ElementType }[] = [
  { id: "book", label: "Book", icon: Car },
  { id: "reserve", label: "Reserve", icon: CalendarClock },
  { id: "map", label: "Map", icon: Map },
  { id: "history", label: "History", icon: History },
];

/* ─── Price calculator ─── */
function calcPrice(vehicle: typeof vehicleOptions[0], distanceMiles: number): number {
  const raw = vehicle.basePrice + vehicle.pricePerMile * distanceMiles;
  return Math.round(raw * 100) / 100;
}

/* ─── Mock driver for matching simulation ─── */
const MOCK_DRIVER = {
  name: "Marcus T.",
  initials: "MT",
  rating: 4.92,
  trips: 2847,
  vehicle: "Silver Toyota Camry",
  plate: "ABC 1234",
  phone: "+1 (555) 123-4567",
};

/* ─── Map Section Wrapper ─── */
function MapSection({
  pickupCoords,
  dropoffCoords,
  driverCoords,
  userLocation,
  routePolyline,
  onLocateUser,
  compact = false,
  children,
}: {
  pickupCoords?: { lat: number; lng: number } | null;
  dropoffCoords?: { lat: number; lng: number } | null;
  driverCoords?: { lat: number; lng: number } | null;
  userLocation?: { lat: number; lng: number } | null;
  routePolyline?: string | null;
  onLocateUser?: () => void;
  compact?: boolean;
  children?: React.ReactNode;
}) {
  const mapRef = useRef<google.maps.Map | null>(null);

  const handleZoomIn = () => {
    const map = mapRef.current;
    if (!map) return;
    map.setZoom(Math.min((map.getZoom() ?? 14) + 1, 20));
  };

  const handleZoomOut = () => {
    const map = mapRef.current;
    if (!map) return;
    map.setZoom(Math.max((map.getZoom() ?? 14) - 1, 3));
  };

  const handleLocateClick = () => {
    onLocateUser?.();
    if (mapRef.current && userLocation) {
      mapRef.current.panTo(userLocation);
      mapRef.current.setZoom(15);
    }
  };

  return (
    <div className={cn(
      "relative w-full overflow-hidden",
      compact ? "flex-1 min-h-[200px]" : "flex-[2] min-h-[180px] max-h-[40vh]"
    )}>
      <RideMap
        pickupCoords={pickupCoords || null}
        dropoffCoords={dropoffCoords || null}
        driverCoords={driverCoords || null}
        userLocation={userLocation || null}
        routePolyline={routePolyline || null}
        onMapReady={(map) => {
          mapRef.current = map;
        }}
        className="absolute inset-0"
      />

      <div className="absolute right-3 bottom-20 z-20 flex flex-col gap-1">
        <button onClick={handleZoomIn} className="w-9 h-9 rounded-lg bg-card border border-border/30 shadow-sm flex items-center justify-center text-foreground font-bold text-base hover:bg-card/80 transition-colors" aria-label="Zoom in">+</button>
        <button onClick={handleZoomOut} className="w-9 h-9 rounded-lg bg-card border border-border/30 shadow-sm flex items-center justify-center text-foreground font-bold text-base hover:bg-card/80 transition-colors" aria-label="Zoom out">−</button>
      </div>

      <div className="absolute top-14 right-3 z-20">
        <button
          onClick={handleLocateClick}
          className="w-9 h-9 rounded-full bg-card border border-border/30 shadow-sm flex items-center justify-center"
          aria-label="Center on my location"
        >
          <Navigation className="w-4 h-4 text-primary" />
        </button>
      </div>

      {children}
    </div>
  );
}

/* ─── Vehicle Row ─── */
function VehicleRow({
  vehicle,
  selected,
  onSelect,
  price,
}: {
  vehicle: (typeof vehicleOptions)[0];
  selected: boolean;
  onSelect: () => void;
  price: number;
}) {
  const Icon = vehicle.icon;
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-4 text-left transition-all border-b border-border/15 last:border-0",
        selected ? "bg-muted/30" : "hover:bg-muted/10"
      )}
    >
      <div className="w-16 h-12 flex items-center justify-center shrink-0">
        <Icon className="w-10 h-10 text-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-foreground">{vehicle.name}</span>
          {vehicle.carSeat && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-600 text-[10px] font-bold">
              <Baby className="w-3 h-3" />
              Car seat
            </span>
          )}
          <div className="flex items-center gap-0.5">
            <User className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{vehicle.capacity}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {vehicle.etaMin} min · {vehicle.desc}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-base font-bold text-foreground">${price.toFixed(2)}</p>
      </div>
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center shrink-0 ml-1"
        >
          <CheckCircle className="w-3.5 h-3.5 text-background" />
        </motion.div>
      )}
    </button>
  );
}

/* ─── Main Component ─── */
export default function RideBookingHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getCurrentLocation } = useCurrentLocation();

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [viewStep, setViewStep] = useState<ViewStep>("home");
  const [activeTab, setActiveTab] = useState<RideTab>("book");
  const [pickup, setPickup] = useState<PlaceData | null>(null);
  const [destination, setDestination] = useState<PlaceData | null>(null);
  const [pickupDisplay, setPickupDisplay] = useState("");
  const [destinationDisplay, setDestinationDisplay] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("economy");
  const [rideRequestId, setRideRequestId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [carSeatFilter, setCarSeatFilter] = useState(false);

  // Route data
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Matching state
  const [matchPhase, setMatchPhase] = useState<"searching" | "found">("searching");

  // Tracking state
  const [trackingStatus, setTrackingStatus] = useState<"arriving" | "waiting" | "in_transit" | "almost_there">("arriving");
  const [trackingEta, setTrackingEta] = useState(4);
  const [driverCoords, setDriverCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Fetch user location on mount
  useEffect(() => {
    getCurrentLocation()
      .then((loc) => setUserLocation({ lat: loc.lat, lng: loc.lng }))
      .catch(() => {}); // silently fail — map will use default center
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLocateUser = useCallback(() => {
    getCurrentLocation()
      .then((loc) => setUserLocation({ lat: loc.lat, lng: loc.lng }))
      .catch(() => toast.error("Could not get your location"));
  }, [getCurrentLocation]);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const userName = user?.user_metadata?.full_name?.split(" ")[0] || "there";

  const filteredVehicles = carSeatFilter
    ? vehicleOptions.filter((v) => v.carSeat)
    : vehicleOptions;
  const currentVehicle = vehicleOptions.find((v) => v.id === selectedVehicle)!;
  const currentPrice = routeData ? calcPrice(currentVehicle, routeData.distance_miles) : currentVehicle.basePrice;

  const handleTabChange = (tab: RideTab) => {
    setActiveTab(tab);
    if (tab === "reserve") navigate("/rides/reserve");
    else if (tab === "history") navigate("/rides/history");
  };

  const handlePickupSelect = useCallback((place: PlaceData) => {
    setPickup(place);
    setPickupDisplay(place.address);
  }, []);

  const handleDestinationSelect = useCallback((place: PlaceData) => {
    setDestination(place);
    setDestinationDisplay(place.address);

    // Auto-set pickup to current location if not set
    let pickupData = pickup;
    if (!pickupData) {
      pickupData = userLocation
        ? { address: "Current Location", lat: userLocation.lat, lng: userLocation.lng }
        : { address: "Current Location", lat: 40.7128, lng: -73.9857 };
      setPickup(pickupData);
      setPickupDisplay("Current Location");
    }

    // Auto-fetch route and go to preview
    if (pickupData && place.lat && place.lng) {
      fetchRoute(pickupData, place);
    }
  }, [pickup, userLocation]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSavedPlace = (address: string) => {
    setDestinationDisplay(address);
    setDestination({ address, lat: 40.758, lng: -73.9855 });
    setPickupDisplay("Current Location");
    const pickupData = userLocation
      ? { address: "Current Location", lat: userLocation.lat, lng: userLocation.lng }
      : { address: "Current Location", lat: 40.7128, lng: -73.9857 };
    setPickup(pickupData);
    fetchRoute(pickupData, { address, lat: 40.758, lng: -73.9855 });
  };

  /* ─── Fetch route from edge function ─── */
  const fetchRoute = async (from: PlaceData, to: PlaceData) => {
    if (!from.lat || !to.lat) return;
    setIsLoadingRoute(true);
    setRouteData(null);

    try {
      const { data, error } = await supabase.functions.invoke("maps-route", {
        body: {
          origin_lat: from.lat,
          origin_lng: from.lng,
          dest_lat: to.lat,
          dest_lng: to.lng,
        },
      });

      if (error) throw error;

      if (data?.ok) {
        setRouteData({
          distance_miles: data.distance_miles,
          duration_minutes: data.duration_minutes,
          polyline: data.polyline,
          traffic_level: data.traffic_level,
        });
      } else {
        // Fallback with estimated values
        const distKm = haversineKm(from.lat, from.lng, to.lat, to.lng);
        const distMiles = distKm * 0.621371;
        setRouteData({
          distance_miles: Math.round(distMiles * 10) / 10,
          duration_minutes: Math.max(5, Math.round(distMiles * 3)),
          polyline: null,
        });
      }
    } catch (err) {
      console.error("[RideBooking] Route fetch error:", err);
      // Fallback estimate
      const distKm = haversineKm(from.lat, from.lng, to.lat, to.lng);
      const distMiles = distKm * 0.621371;
      setRouteData({
        distance_miles: Math.round(distMiles * 10) / 10,
        duration_minutes: Math.max(5, Math.round(distMiles * 3)),
        polyline: null,
      });
    } finally {
      setIsLoadingRoute(false);
    }

    setViewStep("route-preview");
  };

  /* ─── Proceed from search to route preview ─── */
  const handleConfirmSearch = () => {
    if (!pickup || !destination) return;
    fetchRoute(pickup, destination);
  };

  /* ─── Request Ride — Supabase Insert ─── */
  const handleRequestRide = async () => {
    if (!user || !pickup || !destination) {
      toast.error("Please sign in and select locations");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.from("ride_requests").insert({
        user_id: user.id,
        pickup_address: pickup.address,
        pickup_lat: pickup.lat,
        pickup_lng: pickup.lng,
        dropoff_address: destination.address,
        dropoff_lat: destination.lat,
        dropoff_lng: destination.lng,
        ride_type: selectedVehicle,
        quoted_total: currentPrice,
        distance_miles: routeData?.distance_miles ?? null,
        duration_minutes: routeData?.duration_minutes ?? null,
        status: "searching",
        customer_name: user.user_metadata?.full_name || "",
        customer_phone: user.user_metadata?.phone || "",
        requires_car_seat: currentVehicle.carSeat,
        car_seat_type: currentVehicle.carSeat ? "standard" : null,
      }).select("id").single();

      if (error) throw error;

      setRideRequestId(data.id);
      setViewStep("matching");
      setMatchPhase("searching");

      // Simulate driver matching after 4 seconds
      setTimeout(async () => {
        setMatchPhase("found");
        if (data.id) {
          await supabase.from("ride_requests").update({ status: "driver_assigned" }).eq("id", data.id);
        }
      }, 4000);
    } catch (err: any) {
      console.error("[RideBooking] Request error:", err);
      toast.error("Failed to request ride. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─── Start tracking after driver found ─── */
  const startTracking = () => {
    setViewStep("tracking");
    setTrackingStatus("arriving");
    setTrackingEta(4);

    if (pickup) {
      const startLat = pickup.lat + 0.01;
      const startLng = pickup.lng - 0.008;
      setDriverCoords({ lat: startLat, lng: startLng });

      let step = 0;
      const interval = setInterval(() => {
        step++;
        const progress = Math.min(step / 20, 1);
        setDriverCoords({
          lat: startLat + (pickup.lat - startLat) * progress,
          lng: startLng + (pickup.lng - startLng) * progress,
        });
        setTrackingEta(Math.max(1, 4 - Math.floor(progress * 4)));

        if (progress >= 0.5) setTrackingStatus("waiting");
        if (progress >= 1) {
          clearInterval(interval);
          setTrackingStatus("waiting");
          setTrackingEta(0);
        }
      }, 1500);
    }
  };

  /* ─── Complete trip ─── */
  const handleCompleteTrip = async () => {
    setViewStep("complete");
    if (rideRequestId) {
      await supabase.from("ride_requests").update({ status: "completed" }).eq("id", rideRequestId);
    }
  };

  /* ─── Payment ─── */
  const handlePayment = async (method: string) => {
    toast.success(`Payment via ${method} processed!`);
    if (rideRequestId) {
      await supabase.from("ride_requests").update({ payment_status: "paid" }).eq("id", rideRequestId);
    }
    setTimeout(() => {
      setViewStep("home");
      setPickup(null);
      setDestination(null);
      setPickupDisplay("");
      setDestinationDisplay("");
      setRideRequestId(null);
      setRouteData(null);
      setMatchPhase("searching");
      setTrackingStatus("arriving");
    }, 1500);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <AnimatePresence mode="wait">
        {/* ═══════ HOME ═══════ */}
        {viewStep === "home" && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <MapSection compact userLocation={userLocation} onLocateUser={handleLocateUser} />

            <div className="shrink-0 bg-background relative z-10 -mt-5 rounded-t-[2rem] border-t border-border/30 px-5 pt-5 pb-2 shadow-[0_-10px_24px_hsl(var(--foreground)/0.08)]">
              <h2 className="text-xl font-black text-foreground">{greeting}, {userName}</h2>
              <button
                onClick={() => setViewStep("search")}
                className="w-full mt-3 flex items-center gap-3 bg-muted/30 border border-border/30 rounded-2xl px-4 py-3 transition-colors hover:bg-muted/40 active:scale-[0.98]"
              >
                <MapPin className="w-5 h-5 text-foreground" />
                <span className="flex-1 text-left text-sm font-semibold text-foreground">Where to?</span>
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-card border border-border/30">
                  <Clock className="w-3.5 h-3.5 text-foreground" />
                  <span className="text-xs font-semibold text-foreground">Now</span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </div>
              </button>

              <div className="mt-3 space-y-0">
                {savedPlaces.map((place, i) => {
                  const Icon = place.icon;
                  return (
                    <button
                      key={place.id}
                      onClick={() => handleSavedPlace(place.address)}
                      className={cn(
                        "w-full flex items-center gap-3 px-1 py-3 text-left transition-colors hover:bg-muted/10",
                        i < savedPlaces.length - 1 && "border-b border-border/15"
                      )}
                    >
                      <div className="w-9 h-9 rounded-full bg-muted/40 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground">{place.name}</p>
                        <p className="text-xs text-muted-foreground">{place.address}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════ SEARCH ═══════ */}
        {viewStep === "search" && (
          <motion.div key="search" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex flex-col flex-1 bg-background">
            <div className="flex items-center gap-3 px-4 pt-4 pb-2">
              <button onClick={() => setViewStep("home")} className="w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center shrink-0" aria-label="Go back">
                <ArrowLeft className="w-4 h-4 text-foreground" />
              </button>
              <h2 className="text-lg font-black text-foreground">Where to?</h2>
            </div>

            <div className="px-4 pt-2">
              <div className="rounded-2xl bg-muted/15 border border-border/30 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-3 h-3 rounded-full bg-foreground" />
                    <div className="w-0.5 h-8 bg-border/50" />
                    <div className="w-3 h-3 rounded-sm bg-foreground" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <AddressAutocomplete
                      placeholder="Pickup location"
                      value={pickupDisplay}
                      onSelect={handlePickupSelect}
                      className="[&_input]:h-11 [&_input]:rounded-xl [&_input]:text-sm [&_input]:font-semibold [&_input]:bg-card [&_input]:border-0"
                    />
                    <AddressAutocomplete
                      placeholder="Where to?"
                      value={destinationDisplay}
                      onSelect={handleDestinationSelect}
                      proximity={pickup ? { lat: pickup.lat, lng: pickup.lng } : undefined}
                      className="[&_input]:h-11 [&_input]:rounded-xl [&_input]:text-sm [&_input]:font-semibold [&_input]:bg-card [&_input]:border-0"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pt-3">
              {/* Saved places */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Saved Places</p>
              {savedPlaces.map((place) => {
                const Icon = place.icon;
                return (
                  <button
                    key={place.id}
                    onClick={() => handleSavedPlace(place.address)}
                    className="w-full flex items-center gap-3 px-1 py-3 text-left hover:bg-muted/10 transition-colors border-b border-border/10"
                  >
                    <div className="w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">{place.name}</p>
                      <p className="text-xs text-muted-foreground">{place.address}</p>
                    </div>
                  </button>
                );
              })}

              {/* Recent destinations */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4">Recent</p>
              {recentDestinations.map((dest) => (
                <button
                  key={dest.id}
                  onClick={() => {
                    setDestinationDisplay(dest.address.split(",")[0]);
                    setDestination({ address: dest.address, lat: 40.758, lng: -73.9855 });
                  }}
                  className="w-full flex items-center gap-3 px-1 py-3 text-left hover:bg-muted/10 transition-colors border-b border-border/10"
                >
                  <div className="w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center shrink-0">
                    <History className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{dest.address}</p>
                    <p className="text-xs text-muted-foreground">{dest.time}</p>
                  </div>
                </button>
              ))}
            </div>

            {pickup && destination && (
              <div className="px-4 pb-4 pt-2">
                <Button
                  className="w-full h-14 rounded-2xl text-base font-bold bg-foreground text-background hover:bg-foreground/90 shadow-lg"
                  onClick={handleConfirmSearch}
                  disabled={isLoadingRoute}
                >
                  {isLoadingRoute ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                      Finding route...
                    </span>
                  ) : (
                    "Choose a ride"
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══════ ROUTE PREVIEW ═══════ */}
        {viewStep === "route-preview" && (
          <motion.div key="route-preview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col flex-1 min-h-0 overflow-hidden relative">
            <MapSection
              pickupCoords={pickup}
              dropoffCoords={destination}
              routePolyline={routeData?.polyline}
              onLocateUser={handleLocateUser}
              userLocation={userLocation}
            />


            {/* Route info bottom card */}
            <div className="shrink-0 bg-background relative z-10 -mt-6 rounded-t-[1.5rem] border-t border-border/30 px-5 pt-4 pb-3 shadow-[0_-8px_20px_hsl(var(--foreground)/0.06)]">
              {/* Addresses */}
              <div className="flex items-start gap-3 mb-3">
                <div className="flex flex-col items-center gap-0.5 mt-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <div className="w-0.5 h-6 bg-border/50" />
                  <div className="w-2.5 h-2.5 rounded-sm bg-foreground" />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Pickup</p>
                    <p className="text-sm font-semibold text-foreground truncate">{pickup?.address || pickupDisplay}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Destination</p>
                    <p className="text-sm font-semibold text-foreground truncate">{destination?.address || destinationDisplay}</p>
                  </div>
                </div>
              </div>

              {/* Trip stats */}
              {routeData && (
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="flex-1 flex items-center gap-2 rounded-xl bg-muted/20 border border-border/20 px-3 py-2.5">
                    <Timer className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-lg font-bold text-foreground leading-none">{routeData.duration_minutes} min</p>
                      <p className="text-[10px] text-muted-foreground">Est. trip time</p>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center gap-2 rounded-xl bg-muted/20 border border-border/20 px-3 py-2.5">
                    <Route className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-lg font-bold text-foreground leading-none">{routeData.distance_miles} mi</p>
                      <p className="text-[10px] text-muted-foreground">Distance</p>
                    </div>
                  </div>
                  {routeData.traffic_level && (
                    <div className="flex-1 flex items-center gap-2 rounded-xl bg-muted/20 border border-border/20 px-3 py-2.5">
                      <Car className="w-4 h-4 text-primary shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-foreground leading-none capitalize">{routeData.traffic_level}</p>
                        <p className="text-[10px] text-muted-foreground">Traffic</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isLoadingRoute ? (
                <div className="flex items-center justify-center py-6">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="ml-3 text-sm text-muted-foreground">Calculating route...</span>
                </div>
              ) : (
                <Button
                  className="w-full h-14 rounded-2xl text-base font-bold bg-foreground text-background hover:bg-foreground/90 shadow-lg"
                  onClick={() => setViewStep("vehicle")}
                >
                  Choose a ride
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {/* ═══════ VEHICLE SELECTION ═══════ */}
        {viewStep === "vehicle" && (
          <motion.div key="vehicle" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col flex-1 min-h-0 overflow-hidden relative">
            <MapSection
              pickupCoords={pickup}
              dropoffCoords={destination}
              routePolyline={routeData?.polyline}
            >
              <div className="absolute top-3 left-3 z-30">
                <button onClick={() => setViewStep("route-preview")} className="w-9 h-9 rounded-full bg-card border border-border/30 shadow-sm flex items-center justify-center" aria-label="Go back">
                  <ArrowLeft className="w-4 h-4 text-foreground" />
                </button>
              </div>
            </MapSection>
            <div className="shrink-0 bg-background relative z-10 max-h-[55vh] overflow-y-auto">
              {/* Trip summary bar */}
              {routeData && (
                <div className="flex items-center gap-3 px-5 pt-3 pb-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Timer className="w-3.5 h-3.5" />
                    <span className="font-semibold">{routeData.duration_minutes} min</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-border" />
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Route className="w-3.5 h-3.5" />
                    <span className="font-semibold">{routeData.distance_miles} mi</span>
                  </div>
                </div>
              )}

              <div className="px-5 pt-2 pb-2 flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground">Choose a ride</h3>
                <button
                  onClick={() => {
                    setCarSeatFilter(!carSeatFilter);
                    if (!carSeatFilter && !currentVehicle.carSeat) {
                      setSelectedVehicle("car-seat");
                    } else if (carSeatFilter && currentVehicle.carSeat) {
                      setSelectedVehicle("economy");
                    }
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
                    carSeatFilter
                      ? "bg-sky-500/10 text-sky-600 border-sky-500/30"
                      : "bg-muted/20 text-muted-foreground border-border/30"
                  )}
                >
                  <Baby className="w-3.5 h-3.5" />
                  Car seat
                </button>
              </div>
              <div className="border-t border-border/15">
                {filteredVehicles.map((v) => (
                  <VehicleRow
                    key={v.id}
                    vehicle={v}
                    selected={selectedVehicle === v.id}
                    onSelect={() => setSelectedVehicle(v.id)}
                    price={routeData ? calcPrice(v, routeData.distance_miles) : v.basePrice}
                  />
                ))}
              </div>
              <div className="px-4 py-3 border-t border-border/15 flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground flex-1">Visa •••• 4242</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="px-4 pb-4 pt-2">
                <Button
                  className="w-full h-14 rounded-2xl text-base font-bold bg-foreground text-background hover:bg-foreground/90 shadow-lg"
                  onClick={() => setViewStep("pickup-confirm")}
                >
                  Choose {currentVehicle.name} · ${currentPrice.toFixed(2)}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════ PICKUP CONFIRMATION ═══════ */}
        {viewStep === "pickup-confirm" && (
          <motion.div key="pickup-confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <MapSection
              pickupCoords={pickup}
              dropoffCoords={destination}
              routePolyline={routeData?.polyline}
            >
              <div className="absolute top-3 left-3 z-30">
                <button onClick={() => setViewStep("vehicle")} className="w-9 h-9 rounded-full bg-card border border-border/30 shadow-sm flex items-center justify-center" aria-label="Go back">
                  <ArrowLeft className="w-4 h-4 text-foreground" />
                </button>
              </div>
            </MapSection>
            <div className="shrink-0 bg-background relative z-10 -mt-3 rounded-t-[1.5rem] border-t border-border/30 px-4 pt-4 pb-4">
              <h3 className="text-base font-bold text-foreground mb-3">Confirm pickup</h3>

              <AddressAutocomplete
                placeholder="Edit pickup location"
                value={pickupDisplay}
                onSelect={handlePickupSelect}
                className="mb-3"
              />

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <MapPin className="w-4 h-4 text-foreground" />
                <span className="font-medium text-foreground">To:</span>
                <span className="truncate">{destination?.address || destinationDisplay}</span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/20 mb-2">
                <div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center">
                  {(() => { const Icon = currentVehicle.icon; return <Icon className="w-5 h-5 text-foreground" />; })()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground">{currentVehicle.name}</p>
                    {currentVehicle.carSeat && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-600 text-[10px] font-bold">
                        <Baby className="w-3 h-3" /> Car seat
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{currentVehicle.etaMin} min · {currentVehicle.capacity} seats</p>
                </div>
                <p className="text-lg font-bold text-foreground">${currentPrice.toFixed(2)}</p>
              </div>

              {routeData && (
                <div className="flex items-center gap-3 px-1 mb-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Timer className="w-3 h-3" />{routeData.duration_minutes} min</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Route className="w-3 h-3" />{routeData.distance_miles} mi</span>
                </div>
              )}

              <Button
                className="w-full h-14 rounded-2xl text-base font-bold bg-foreground text-background hover:bg-foreground/90 shadow-lg gap-2"
                onClick={handleRequestRide}
                disabled={isSubmitting}
              >
                <Zap className="w-5 h-5" />
                {isSubmitting ? "Requesting..." : "Request Ride"}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ═══════ DRIVER MATCHING ═══════ */}
        {viewStep === "matching" && (
          <motion.div key="matching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col flex-1 bg-background">
            {matchPhase === "searching" ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6">
                <div className="relative w-48 h-48 mb-8">
                  <div className="absolute inset-0 rounded-full border-2 border-border/30" />
                  <div className="absolute inset-6 rounded-full border border-border/20" />
                  <div className="absolute inset-12 rounded-full border border-border/15" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
                  </div>
                  <motion.div
                    className="absolute inset-0"
                    style={{ transformOrigin: "center center" }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-primary/80 to-transparent origin-left" />
                  </motion.div>
                  {[45, 120, 230, 310].map((angle, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-3 h-3 rounded-full bg-primary/60"
                      style={{
                        top: `${50 - Math.cos((angle * Math.PI) / 180) * 35}%`,
                        left: `${50 + Math.sin((angle * Math.PI) / 180) * 35}%`,
                      }}
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    />
                  ))}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Finding your driver</h3>
                <p className="text-sm text-muted-foreground text-center">Searching nearby drivers for your {currentVehicle.name}...</p>
                <Button variant="ghost" className="mt-6 text-destructive" onClick={() => {
                  setViewStep("home");
                  if (rideRequestId) {
                    supabase.from("ride_requests").update({ status: "cancelled" }).eq("id", rideRequestId);
                  }
                }}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center px-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <CheckCircle className="w-10 h-10 text-primary" />
                  </div>
                </motion.div>
                <h3 className="text-xl font-bold text-foreground mb-1">Driver found!</h3>

                <div className="w-full mt-6 p-4 rounded-2xl bg-card border border-border/30">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/20 text-primary font-bold">{MOCK_DRIVER.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-bold text-foreground">{MOCK_DRIVER.name}</p>
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-sm text-muted-foreground">{MOCK_DRIVER.rating} · {MOCK_DRIVER.trips} trips</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Car className="w-4 h-4" />
                    <span>{MOCK_DRIVER.vehicle}</span>
                    <span className="ml-auto font-mono font-bold text-foreground">{MOCK_DRIVER.plate}</span>
                  </div>
                </div>

                <Button className="w-full h-14 rounded-2xl text-base font-bold bg-foreground text-background mt-6" onClick={startTracking}>
                  Track Driver
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══════ LIVE TRACKING ═══════ */}
        {viewStep === "tracking" && (
          <motion.div key="tracking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <MapSection
              pickupCoords={pickup}
              dropoffCoords={destination}
              driverCoords={driverCoords}
              routePolyline={routeData?.polyline}
            />
            <div className="shrink-0 bg-background relative z-10 -mt-3 rounded-t-[1.5rem] border-t border-border/30 px-4 pt-4 pb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {trackingStatus === "waiting" ? "Driver has arrived" : `Arriving in ${trackingEta} min`}
                  </p>
                  <p className="text-xs text-muted-foreground">{MOCK_DRIVER.vehicle} · {MOCK_DRIVER.plate}</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-primary">
                  <Shield className="w-3.5 h-3.5" />
                  Trip protected
                </div>
              </div>

              <Progress value={trackingStatus === "waiting" ? 100 : (1 - trackingEta / 4) * 100} className="h-1.5 mb-4" />

              <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/30 mb-4">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">{MOCK_DRIVER.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">{MOCK_DRIVER.name}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs text-muted-foreground">{MOCK_DRIVER.rating}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center" aria-label="Call driver">
                    <Phone className="w-4 h-4 text-foreground" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center" aria-label="Message driver">
                    <MessageSquare className="w-4 h-4 text-foreground" />
                  </button>
                </div>
              </div>

              {trackingStatus === "waiting" && (
                <Button className="w-full h-14 rounded-2xl text-base font-bold bg-foreground text-background" onClick={handleCompleteTrip}>
                  Start Ride
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {/* ═══════ TRIP COMPLETE / PAYMENT ═══════ */}
        {viewStep === "complete" && (
          <motion.div key="complete" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col flex-1 bg-background px-4 pt-6 pb-4">
            <div className="text-center mb-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
              </motion.div>
              <h3 className="text-xl font-bold text-foreground">Trip Complete!</h3>
              <p className="text-sm text-muted-foreground mt-1">{pickup?.address} → {destination?.address}</p>
            </div>

            {/* Fare breakdown */}
            <div className="rounded-2xl bg-card border border-border/30 p-4 mb-4">
              <h4 className="text-sm font-bold text-foreground mb-3">Fare Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base fare</span>
                  <span className="text-foreground">${(currentPrice * 0.4).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Distance ({routeData?.distance_miles ?? "—"} mi)</span>
                  <span className="text-foreground">${(currentPrice * 0.35).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Time ({routeData?.duration_minutes ?? "—"} min)</span>
                  <span className="text-foreground">${(currentPrice * 0.15).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service fee</span>
                  <span className="text-foreground">${(currentPrice * 0.10).toFixed(2)}</span>
                </div>
                <div className="border-t border-border/30 pt-2 flex justify-between">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="font-bold text-foreground text-lg">${currentPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment options */}
            <div className="space-y-2">
              <Button className="w-full h-12 rounded-xl bg-foreground text-background font-bold gap-2" onClick={() => handlePayment("Card")}>
                <CreditCard className="w-4 h-4" />
                Pay with Card
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-12 rounded-xl font-bold gap-2" onClick={() => handlePayment("Apple Pay")}>
                  <Smartphone className="w-4 h-4" />
                  Apple Pay
                </Button>
                <Button variant="outline" className="h-12 rounded-xl font-bold gap-2" onClick={() => handlePayment("Google Pay")}>
                  <Wallet className="w-4 h-4" />
                  Google Pay
                </Button>
              </div>
              <Button variant="ghost" className="w-full h-12 rounded-xl font-bold gap-2 text-muted-foreground" onClick={() => handlePayment("Cash")}>
                <Banknote className="w-4 h-4" />
                Pay with Cash
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Haversine fallback for distance estimation ─── */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
