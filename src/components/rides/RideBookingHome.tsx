/**
 * RideBookingHome — Complete ride booking flow
 * Flow: home → search → route-preview → ride-options → confirm-ride → searching → driver-assigned → driver-en-route → trip-in-progress → trip-complete
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
  Route, Timer, Bell
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

type ViewStep =
  | "home"
  | "search"
  | "route-preview"
  | "ride-options"
  | "confirm-ride"
  | "searching"
  | "driver-assigned"
  | "driver-en-route"
  | "trip-in-progress"
  | "trip-complete";

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
  // Popular
  { id: "economy", category: "popular" as const, name: "ZIVO Economy", desc: "Affordable everyday rides", etaMin: 4, pricePerMile: 1.50, basePrice: 3.50, capacity: 4, icon: Car, carSeat: false, surgeMultiplier: 1.0 },
  { id: "xl", category: "popular" as const, name: "ZIVO XL", desc: "Extra space for groups", etaMin: 5, pricePerMile: 1.80, basePrice: 4.50, capacity: 6, icon: Users, carSeat: false, surgeMultiplier: 1.0 },
  { id: "share", category: "popular" as const, name: "ZIVO Share", desc: "Share and save money", etaMin: 7, pricePerMile: 0.90, basePrice: 2.00, capacity: 2, icon: Users, carSeat: false, surgeMultiplier: 0.65 },
  // Premium
  { id: "comfort", category: "premium" as const, name: "ZIVO Comfort", desc: "Top-rated drivers, extra legroom", etaMin: 5, pricePerMile: 2.20, basePrice: 5.00, capacity: 4, icon: Sparkles, carSeat: false, surgeMultiplier: 1.0 },
  { id: "luxury", category: "premium" as const, name: "ZIVO Luxury", desc: "Premium with professional drivers", etaMin: 6, pricePerMile: 3.80, basePrice: 8.00, capacity: 4, icon: Crown, carSeat: false, surgeMultiplier: 1.0 },
  // More
  { id: "car-seat", category: "more" as const, name: "ZIVO Car Seat", desc: "Equipped with 1 child car seat", etaMin: 6, pricePerMile: 1.80, basePrice: 5.50, capacity: 4, icon: Car, carSeat: true, surgeMultiplier: 1.0 },
  { id: "xl-car-seat", category: "more" as const, name: "ZIVO XL Car Seat", desc: "Larger vehicle with car seat", etaMin: 7, pricePerMile: 2.20, basePrice: 6.50, capacity: 6, icon: Users, carSeat: true, surgeMultiplier: 1.0 },
  { id: "black-car-seat", category: "more" as const, name: "ZIVO Black Car Seat", desc: "Premium with car seat", etaMin: 8, pricePerMile: 4.20, basePrice: 10.00, capacity: 4, icon: Crown, carSeat: true, surgeMultiplier: 1.0 },
];

const rideTabs: { id: RideTab; label: string; icon: React.ElementType }[] = [
  { id: "book", label: "Book", icon: Car },
  { id: "reserve", label: "Reserve", icon: CalendarClock },
  { id: "map", label: "Map", icon: Map },
  { id: "history", label: "History", icon: History },
];

/* ─── Price calculator ─── */
function calcPrice(vehicle: typeof vehicleOptions[0], distanceMiles: number, durationMinutes = 0): number {
  const TIME_RATE = 0.25;
  const raw = (vehicle.basePrice + vehicle.pricePerMile * distanceMiles + TIME_RATE * durationMinutes) * vehicle.surgeMultiplier;
  return Math.round(raw * 100) / 100;
}

/* ─── Mock driver ─── */
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
      compact ? "absolute inset-0" : "flex-[3] min-h-[200px] max-h-[65vh]"
    )}>
      <div className="absolute inset-0">
        <RideMap
          pickupCoords={pickupCoords || null}
          dropoffCoords={dropoffCoords || null}
          driverCoords={driverCoords || null}
          userLocation={userLocation || null}
          routePolyline={routePolyline || null}
          onMapReady={(map) => { mapRef.current = map; }}
          className="absolute inset-0 h-full w-full"
        />
      </div>

      <button
        onClick={handleLocateClick}
        className="absolute right-3 top-14 z-20 w-12 h-12 rounded-full bg-card shadow-md flex items-center justify-center"
        aria-label="Center on my location"
      >
        <Navigation className="w-4 h-4 text-primary" />
      </button>

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
  const isShare = vehicle.surgeMultiplier < 1;
  const fullPrice = isShare ? Math.round((price / vehicle.surgeMultiplier) * 100) / 100 : null;
  const etaTime = new Date(Date.now() + vehicle.etaMin * 60000)
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    .toLowerCase();

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all border-b border-border/10 last:border-0",
        selected
          ? "bg-primary/5 border-l-4 border-l-primary"
          : "hover:bg-muted/10 border-l-4 border-l-transparent"
      )}
    >
      <div className="w-12 h-10 flex items-center justify-center shrink-0">
        <Icon className="w-8 h-8 text-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-bold text-foreground">{vehicle.name}</span>
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
        <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{vehicle.desc}</p>
      </div>
      <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
        <p className="text-[11px] text-muted-foreground">{etaTime}</p>
        {isShare && fullPrice ? (
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[10px] text-muted-foreground line-through">${fullPrice.toFixed(2)}</span>
            <span className="text-sm font-bold text-emerald-600">${price.toFixed(2)}</span>
          </div>
        ) : (
          <p className="text-sm font-bold text-foreground">${price.toFixed(2)}</p>
        )}
        {selected && (
          <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center mt-0.5">
            <CheckCircle className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
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
  const [sheetExpanded, setSheetExpanded] = useState(false);

  const [rideCategory, setRideCategory] = useState<"popular" | "premium" | "more">("popular");
  const [rating, setRating] = useState(0);
  const [tip, setTip] = useState<number | null>(null);

  // Viewport height for dynamic sheet sizing
  const [viewportHeight, setViewportHeight] = useState(800);
  useEffect(() => {
    const updateHeight = () => setViewportHeight(window.innerHeight);
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // Layout height constants — must stay in sync with the CSS classes in AppHeader, ZivoMobileNav,
  // and the header/tabs rendered below. Update these if those components change their heights.
  // HEADER_HEIGHT: matches AppHeader h-14 (14 * 4px = 56px)
  // BOTTOM_NAV_HEIGHT: matches ZivoMobileNav h-[64px] inner div height
  const HEADER_HEIGHT = 56;        // px — AppHeader bar height (h-14)
  const TABS_HEIGHT = 48;          // px — ride tabs row (py-2 + button height ~32px)
  const HEADER_TABS_HEIGHT = HEADER_HEIGHT + TABS_HEIGHT; // = 104
  const BOTTOM_NAV_HEIGHT = 64;    // px — ZivoMobileNav inner h-[64px] (see ZivoMobileNav.tsx)
  const SAFE_BOTTOM = "env(safe-area-inset-bottom, 0px)";

  const COLLAPSED_SHEET_HEIGHT = 230;
  const EXPANDED_SHEET_HEIGHT = Math.min(viewportHeight * 0.62, 560); // kept for future use

  // Route data
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Tracking state
  const [trackingEta, setTrackingEta] = useState(4);
  const [driverCoords, setDriverCoords] = useState<{ lat: number; lng: number } | null>(null);
  const trackingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const currentVehicle = vehicleOptions.find((v) => v.id === selectedVehicle)!;
  const currentPrice = routeData
    ? calcPrice(currentVehicle, routeData.distance_miles, routeData.duration_minutes)
    : currentVehicle.basePrice;

  const categoryVehicles = vehicleOptions.filter((v) => v.category === rideCategory);

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
  }, [pickup, userLocation]);

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

    setSheetExpanded(false);
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
      setViewStep("searching");
    } catch (err) {
      console.error("[RideBooking] Request error:", err);
      toast.error("Failed to request ride. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─── Auto-advance: searching → driver-assigned after 4s ─── */
  useEffect(() => {
    if (viewStep !== "searching") return;
    const t = setTimeout(async () => {
      setViewStep("driver-assigned");
      if (rideRequestId) {
        await supabase.from("ride_requests").update({ status: "driver_assigned" }).eq("id", rideRequestId);
      }
    }, 4000);
    return () => clearTimeout(t);
  }, [viewStep, rideRequestId]);

  /* ─── Auto-advance: driver-assigned → driver-en-route after 5s ─── */
  useEffect(() => {
    if (viewStep !== "driver-assigned") return;
    const t = setTimeout(() => setViewStep("driver-en-route"), 5000);
    return () => clearTimeout(t);
  }, [viewStep]);

  /* ─── Start tracking when entering driver-en-route ─── */
  const startTracking = useCallback(() => {
    setTrackingEta(4);
    if (pickup) {
      const startLat = pickup.lat + 0.01;
      const startLng = pickup.lng - 0.008;
      setDriverCoords({ lat: startLat, lng: startLng });

      let step = 0;
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = setInterval(() => {
        step++;
        const progress = Math.min(step / 20, 1);
        setDriverCoords({
          lat: startLat + (pickup.lat - startLat) * progress,
          lng: startLng + (pickup.lng - startLng) * progress,
        });
        setTrackingEta(Math.max(1, 4 - Math.floor(progress * 4)));

        if (progress >= 1) {
          clearInterval(trackingIntervalRef.current!);
          trackingIntervalRef.current = null;
          setViewStep("trip-in-progress");
        }
      }, 1500);
    }
  }, [pickup]);

  useEffect(() => {
    if (viewStep !== "driver-en-route") return;
    startTracking();
    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
        trackingIntervalRef.current = null;
      }
    };
  }, [viewStep, startTracking]);

  /* ─── Auto-advance: trip-in-progress → trip-complete after 8s ─── */
  useEffect(() => {
    if (viewStep !== "trip-in-progress") return;
    const t = setTimeout(async () => {
      setViewStep("trip-complete");
      if (rideRequestId) {
        await supabase.from("ride_requests").update({ status: "completed" }).eq("id", rideRequestId);
      }
    }, 8000);
    return () => clearTimeout(t);
  }, [viewStep, rideRequestId]);

  /* ─── Reset all state back to home ─── */
  const resetToHome = () => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
    setViewStep("home");
    setPickup(null);
    setDestination(null);
    setPickupDisplay("");
    setDestinationDisplay("");
    setRideRequestId(null);
    setRouteData(null);
    setSheetExpanded(false);
    setRating(0);
    setTip(null);
    setDriverCoords(null);
    setTrackingEta(4);
  };

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-background">

      {/* ═══════ 1. HEADER — normal flow, always visible ═══════ */}
      <div className="relative z-20 flex items-center h-14 px-4 bg-background border-b border-border/20">
        <button
          onClick={() => {
            if (viewStep === "route-preview") setViewStep("search");
            else if (viewStep === "ride-options") setViewStep("route-preview");
            else if (viewStep === "confirm-ride") setViewStep("ride-options");
            else if (viewStep === "search") setViewStep("home");
            else navigate(-1);
          }}
          className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center hover:bg-muted transition-all active:scale-90 touch-manipulation"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="flex-1 text-center font-black text-lg">Ride Hub</h1>
        <button
          onClick={() => navigate("/notifications")}
          className="w-10 h-10 -mr-2 rounded-xl flex items-center justify-center hover:bg-muted transition-all active:scale-90 touch-manipulation"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* ═══════ 2. RIDE TABS — normal flow, only on home step ═══════ */}
      {viewStep === "home" && (
        <div className="relative z-20 flex gap-1 px-4 py-2 bg-background border-b border-border/10 overflow-x-auto scrollbar-none">
          {rideTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all",
                activeTab === tab.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted/30"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ═══════ 3. MAP VIEWPORT LAYER — absolute, behind all sheets ═══════ */}
      {(
        viewStep === "home" ||
        viewStep === "route-preview" ||
        viewStep === "searching" ||
        viewStep === "driver-assigned" ||
        viewStep === "driver-en-route" ||
        viewStep === "trip-in-progress"
      ) && (
        <div
          className="absolute left-0 right-0 z-0"
          style={{
            top: viewStep === "home" ? HEADER_TABS_HEIGHT : HEADER_HEIGHT,
            bottom: `calc(${BOTTOM_NAV_HEIGHT}px + ${SAFE_BOTTOM})`,
          }}
        >
          <MapSection
            compact
            pickupCoords={pickup}
            dropoffCoords={["route-preview", "driver-assigned", "driver-en-route", "trip-in-progress"].includes(viewStep) ? destination : null}
            userLocation={userLocation}
            onLocateUser={handleLocateUser}
            routePolyline={routeData?.polyline ?? null}
            driverCoords={["driver-en-route", "trip-in-progress"].includes(viewStep) ? driverCoords : null}
          />
        </div>
      )}

      {/* ═══════ 4a. HOME bottom sheet — overlays map ═══════ */}
      {viewStep === "home" && (
        <div
          className="absolute left-0 right-0 z-30 rounded-t-[28px] bg-background shadow-[0_-8px_30px_hsl(var(--foreground)/0.08)]"
          style={{ bottom: `calc(${BOTTOM_NAV_HEIGHT}px + ${SAFE_BOTTOM})` }}
        >
          <div className="px-5 pt-5 pb-3">
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

            {/* Services row */}
            <div className="mt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Services</p>
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
                {[
                  { label: "Ride", icon: Car, color: "bg-emerald-500/10 text-emerald-600" },
                  { label: "Delivery", icon: Zap, color: "bg-orange-500/10 text-orange-600" },
                  { label: "Reserve", icon: CalendarClock, color: "bg-sky-500/10 text-sky-600" },
                  { label: "Rentals", icon: Crown, color: "bg-violet-500/10 text-violet-600" },
                  { label: "Flights", icon: Shield, color: "bg-amber-500/10 text-amber-600" },
                ].map((svc) => (
                  <button
                    key={svc.label}
                    onClick={() => svc.label === "Ride" ? setViewStep("search") : toast.info(`${svc.label} coming soon!`)}
                    className="flex flex-col items-center gap-1.5 shrink-0"
                  >
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", svc.color)}>
                      <svc.icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">{svc.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ SEARCH — full-screen overlay below header ═══════ */}
      {viewStep === "search" && (
        <div
          className="absolute left-0 right-0 bottom-0 z-40 bg-background flex flex-col"
          style={{ top: HEADER_HEIGHT }}
        >
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
        </div>
      )}

      {/* ═══════ Zoom controls — route-preview only, above collapsed sheet ═══════ */}
      {viewStep === "route-preview" && (
        <div
          className="absolute right-3 flex flex-col gap-2 z-20"
          style={{
            bottom: `calc(${COLLAPSED_SHEET_HEIGHT}px + ${BOTTOM_NAV_HEIGHT}px + 16px + ${SAFE_BOTTOM})`,
          }}
        >
          <button className="h-12 w-12 rounded-2xl bg-card shadow-md flex items-center justify-center text-foreground font-bold text-base" aria-label="Zoom in">+</button>
          <button className="h-12 w-12 rounded-2xl bg-card shadow-md flex items-center justify-center text-foreground font-bold text-base" aria-label="Zoom out">-</button>
        </div>
      )}

      {/* ═══════ 4b. ROUTE PREVIEW — draggable bottom sheet overlaying map ═══════ */}
      {viewStep === "route-preview" && (
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.12}
          onDragEnd={(_, info) => {
            const shouldCollapse = info.offset.y > 80 || info.velocity.y > 500;
            if (shouldCollapse) setSheetExpanded(false);
          }}
          animate={{ height: COLLAPSED_SHEET_HEIGHT }}
          transition={{ type: "spring", stiffness: 320, damping: 34 }}
          className="absolute left-0 right-0 z-30 rounded-t-[28px] bg-background shadow-[0_-8px_30px_hsl(var(--foreground)/0.08)] flex flex-col overflow-hidden"
          style={{
            bottom: `calc(${BOTTOM_NAV_HEIGHT}px + ${SAFE_BOTTOM})`,
            touchAction: "none",
          }}
        >
          {/* Drag handle */}
          <div className="mx-auto mt-2 h-1.5 w-14 rounded-full bg-muted-foreground/25 cursor-grab active:cursor-grabbing shrink-0" />

          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Route info */}
            <div className="px-5 pt-3 pb-2 shrink-0">
              {/* Addresses */}
              <div className="flex items-start gap-3 mb-2">
                <div className="flex flex-col items-center gap-0.5 mt-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <div className="w-0.5 h-5 bg-border/50" />
                  <div className="w-2.5 h-2.5 rounded-sm bg-foreground" />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div>
                    <p className="text-[10px] text-muted-foreground leading-none mb-0.5">Pickup</p>
                    <p className="text-sm font-semibold text-foreground truncate leading-tight">{pickup?.address || pickupDisplay}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground leading-none mb-0.5">Destination</p>
                    <p className="text-sm font-semibold text-foreground truncate leading-tight">{destination?.address || destinationDisplay}</p>
                  </div>
                </div>
              </div>

              {/* Trip stats */}
              {routeData && (
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 flex items-center gap-1.5 rounded-lg bg-muted/20 border border-border/20 px-2 py-1.5">
                    <Timer className="w-3.5 h-3.5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-foreground leading-none">{routeData.duration_minutes} min</p>
                      <p className="text-[9px] text-muted-foreground">Trip time</p>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center gap-1.5 rounded-lg bg-muted/20 border border-border/20 px-2 py-1.5">
                    <Route className="w-3.5 h-3.5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-foreground leading-none">{routeData.distance_miles} mi</p>
                      <p className="text-[9px] text-muted-foreground">Distance</p>
                    </div>
                  </div>
                  {routeData.traffic_level && (
                    <div className="flex-1 flex items-center gap-1.5 rounded-lg bg-muted/20 border border-border/20 px-2 py-1.5">
                      <Car className="w-3.5 h-3.5 text-primary shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-foreground leading-none capitalize">{routeData.traffic_level}</p>
                        <p className="text-[9px] text-muted-foreground">Traffic</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Choose a ride button */}
            <div className="px-4 pt-2 shrink-0" style={{ paddingBottom: `calc(8px + ${SAFE_BOTTOM})` }}>
              {isLoadingRoute ? (
                <div className="flex items-center justify-center py-3">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">Calculating route...</span>
                </div>
              ) : (
                <Button
                  className="w-full h-14 rounded-[22px] text-lg font-semibold bg-foreground text-background hover:bg-foreground/90 shadow-lg"
                  onClick={() => setViewStep("ride-options")}
                >
                  Choose a ride
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══════ RIDE OPTIONS — full-screen overlay ═══════ */}
      {viewStep === "ride-options" && (
        <div
          className="absolute left-0 right-0 bottom-0 z-40 bg-background flex flex-col"
          style={{ top: HEADER_HEIGHT }}
        >
          {/* Back + title */}
          <div className="flex items-center gap-3 px-4 pt-4 pb-2 shrink-0">
            <button onClick={() => setViewStep("route-preview")} className="w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center shrink-0" aria-label="Go back">
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
            <h2 className="text-lg font-black text-foreground">Choose a ride</h2>
          </div>

          {/* Promo badge */}
          <div className="px-4 pb-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              15% promo applied
            </span>
          </div>

          {/* Category tabs */}
          <div className="flex gap-1 px-4 pb-2 shrink-0">
            {(["popular", "premium", "more"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setRideCategory(cat)}
                className={cn(
                  "flex-1 py-1.5 rounded-full text-sm font-semibold capitalize transition-all",
                  rideCategory === cat
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted/30"
                )}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Scrollable vehicle list */}
          <div className="flex-1 overflow-y-auto border-t border-border/15">
            {categoryVehicles.map((v) => (
              <VehicleRow
                key={v.id}
                vehicle={v}
                selected={selectedVehicle === v.id}
                onSelect={() => setSelectedVehicle(v.id)}
                price={routeData ? calcPrice(v, routeData.distance_miles, routeData.duration_minutes) : v.basePrice}
              />
            ))}
          </div>

          {/* Sticky bottom */}
          <div className="shrink-0 border-t border-border/15">
            <div className="px-4 py-2 flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground flex-1">Visa .... 4242</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="px-4 pt-0.5" style={{ paddingBottom: `calc(8px + ${SAFE_BOTTOM})` }}>
              <Button
                className="w-full h-12 rounded-2xl text-base font-bold bg-foreground text-background hover:bg-foreground/90 shadow-lg"
                onClick={() => setViewStep("confirm-ride")}
              >
                Confirm {currentVehicle.name} - ${currentPrice.toFixed(2)}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ CONFIRM RIDE — full-screen overlay ═══════ */}
      {viewStep === "confirm-ride" && (
        <div
          className="absolute left-0 right-0 bottom-0 z-40 bg-background flex flex-col"
          style={{ top: HEADER_HEIGHT }}
        >
          {/* Back */}
          <div className="flex items-center gap-3 px-4 pt-4 pb-2 shrink-0">
            <button onClick={() => setViewStep("ride-options")} className="w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center shrink-0" aria-label="Go back">
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
            <h2 className="text-xl font-black text-foreground">Confirm your ride</h2>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {/* Pickup/destination card */}
            <div className="rounded-2xl bg-card border border-border/30 p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-0.5 mt-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <div className="w-0.5 h-5 bg-border/50" />
                  <div className="w-2.5 h-2.5 rounded-sm bg-foreground" />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div>
                    <p className="text-[10px] text-muted-foreground leading-none mb-0.5">Pickup</p>
                    <p className="text-sm font-semibold text-foreground truncate">{pickup?.address || pickupDisplay}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground leading-none mb-0.5">Destination</p>
                    <p className="text-sm font-semibold text-foreground truncate">{destination?.address || destinationDisplay}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle */}
            <div className="border-t border-border/15 pt-4 mb-4">
              <div className="flex items-center gap-3">
                {(() => { const Icon = currentVehicle.icon; return <Icon className="w-8 h-8 text-foreground shrink-0" />; })()}
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">{currentVehicle.name} - {currentVehicle.capacity} seats</p>
                  <p className="text-xs text-muted-foreground">{currentVehicle.etaMin} min away - {currentVehicle.desc}</p>
                </div>
                <p className="text-lg font-bold text-foreground">${currentPrice.toFixed(2)}</p>
              </div>
            </div>

            {/* Payment */}
            <div className="border-t border-border/15 pt-4 mb-4">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Payment</p>
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground flex-1">Visa .... 4242</span>
                <button className="text-xs font-semibold text-primary">Change</button>
              </div>
            </div>

            {/* Promo code */}
            <div className="border-t border-border/15 pt-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Promo code</span>
                <button
                  onClick={() => toast.info("Promo code added!")}
                  className="text-xs font-semibold text-primary"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Trip info */}
            <div className="border-t border-border/15 pt-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5" />
                  {routeData?.duration_minutes ?? 19} min
                </span>
                <span className="flex items-center gap-1.5">
                  <Route className="w-3.5 h-3.5" />
                  {routeData?.distance_miles ?? 10.6} mi
                </span>
                <span className="flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5" />
                  {routeData?.traffic_level ?? "Light"}
                </span>
              </div>
            </div>
          </div>

          {/* Sticky bottom: Request Ride */}
          <div className="shrink-0 border-t border-border/15 px-4 pt-3" style={{ paddingBottom: `calc(12px + ${SAFE_BOTTOM})` }}>
            <Button
              className="w-full h-14 rounded-2xl text-base font-bold bg-foreground text-background hover:bg-foreground/90 shadow-lg gap-2"
              onClick={handleRequestRide}
              disabled={isSubmitting}
            >
              <Zap className="w-5 h-5" />
              {isSubmitting ? "Requesting..." : "Request Ride"}
            </Button>
          </div>
        </div>
      )}

      {/* ═══════ SEARCHING — bottom sheet overlaying map ═══════ */}
      {viewStep === "searching" && (
        <div
          className="absolute left-0 right-0 z-30 rounded-t-[28px] bg-background shadow-[0_-8px_30px_hsl(var(--foreground)/0.08)]"
          style={{ bottom: `calc(${BOTTOM_NAV_HEIGHT}px + ${SAFE_BOTTOM})`, height: 280 }}
        >
          <div className="mx-auto mt-2 h-1.5 w-14 rounded-full bg-muted-foreground/25" />

          <div className="flex flex-col items-center px-6 pt-4 pb-4">
            <motion.div
              className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500" />
            </motion.div>
            <h3 className="text-lg font-bold text-foreground mb-0.5">Finding your driver...</h3>
            <p className="text-sm text-muted-foreground mb-3">Searching nearby drivers</p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4 w-full justify-center">
              <span>Drivers nearby: <span className="font-semibold text-foreground">5</span></span>
              <span>Estimated pickup: <span className="font-semibold text-foreground">4 minutes</span></span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </div>

            <button
              onClick={() => {
                if (rideRequestId) {
                  supabase.from("ride_requests").update({ status: "cancelled" }).eq("id", rideRequestId);
                }
                resetToHome();
              }}
              className="text-sm font-semibold text-destructive"
            >
              Cancel ride
            </button>
          </div>
        </div>
      )}

      {/* ═══════ DRIVER ASSIGNED — bottom sheet overlaying map ═══════ */}
      {viewStep === "driver-assigned" && (
        <div
          className="absolute left-0 right-0 z-30 rounded-t-[28px] bg-background shadow-[0_-8px_30px_hsl(var(--foreground)/0.08)]"
          style={{ bottom: `calc(${BOTTOM_NAV_HEIGHT}px + ${SAFE_BOTTOM})`, height: 340 }}
        >
          <div className="mx-auto mt-2 h-1.5 w-14 rounded-full bg-muted-foreground/25" />

          <div className="px-5 pt-3 pb-4">
            <h3 className="text-base font-bold text-foreground">Meet your driver at pickup</h3>
            <p className="text-sm text-muted-foreground mb-4">Driver arriving in 5 minutes</p>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/30 mb-4">
              <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-background">{MOCK_DRIVER.initials}</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground">{MOCK_DRIVER.name}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>{MOCK_DRIVER.rating} - {MOCK_DRIVER.trips.toLocaleString()} trips</span>
                </div>
                <p className="text-xs text-muted-foreground">{MOCK_DRIVER.vehicle}</p>
                <p className="text-xs font-mono font-bold text-foreground">{MOCK_DRIVER.plate}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => toast.info("Opening in-app chat...")}
                className="flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl bg-muted/40 text-sm font-semibold text-foreground"
              >
                <MessageSquare className="w-4 h-4" />
                Message
              </button>
              <button
                onClick={() => toast.info("Calling Marcus T....")}
                className="flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl bg-muted/40 text-sm font-semibold text-foreground"
              >
                <Phone className="w-4 h-4" />
                Call
              </button>
              <button
                onClick={resetToHome}
                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-muted/40 text-muted-foreground"
                aria-label="Cancel ride"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ DRIVER EN ROUTE — bottom sheet overlaying map ═══════ */}
      {viewStep === "driver-en-route" && (
        <div
          className="absolute left-0 right-0 z-30 rounded-t-[28px] bg-background shadow-[0_-8px_30px_hsl(var(--foreground)/0.08)]"
          style={{ bottom: `calc(${BOTTOM_NAV_HEIGHT}px + ${SAFE_BOTTOM})`, height: 220 }}
        >
          <div className="mx-auto mt-2 h-1.5 w-14 rounded-full bg-muted-foreground/25" />

          <div className="px-5 pt-3 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <Car className="w-5 h-5 text-primary shrink-0" />
              <p className="text-base font-bold text-foreground">Driver arriving in {trackingEta} min</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 border-t border-border/15 pt-3">
              <span className="font-semibold text-foreground">{MOCK_DRIVER.name}</span>
              <span>-</span>
              <span>{MOCK_DRIVER.vehicle}</span>
              <span>-</span>
              <span className="font-mono font-bold text-foreground">{MOCK_DRIVER.plate}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toast.info("Opening in-app chat...")}
                className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-muted/40 text-sm font-semibold text-foreground"
              >
                <MessageSquare className="w-4 h-4" />
                Message
              </button>
              <button
                onClick={() => toast.info("Calling driver...")}
                className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-muted/40 text-sm font-semibold text-foreground"
              >
                <Phone className="w-4 h-4" />
                Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ TRIP IN PROGRESS — bottom sheet overlaying map ═══════ */}
      {viewStep === "trip-in-progress" && (
        <div
          className="absolute left-0 right-0 z-30 rounded-t-[28px] bg-background shadow-[0_-8px_30px_hsl(var(--foreground)/0.08)]"
          style={{ bottom: `calc(${BOTTOM_NAV_HEIGHT}px + ${SAFE_BOTTOM})`, height: 220 }}
        >
          <div className="mx-auto mt-2 h-1.5 w-14 rounded-full bg-muted-foreground/25" />

          <div className="px-5 pt-3 pb-4">
            <p className="text-base font-bold text-foreground mb-0.5">Heading to destination</p>
            <p className="text-sm text-muted-foreground mb-3">ETA: {trackingEta} min</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 border-t border-border/15 pt-3">
              <span className="font-semibold text-foreground">{MOCK_DRIVER.name}</span>
              <span>-</span>
              <span>{MOCK_DRIVER.vehicle}</span>
              <span>-</span>
              <span className="font-mono font-bold text-foreground">{MOCK_DRIVER.plate}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toast.info("Trip link copied to clipboard!")}
                className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl bg-muted/40 text-xs font-semibold text-foreground"
              >
                <Route className="w-3.5 h-3.5" />
                Share Trip
              </button>
              <button
                onClick={() => toast.info("Calling driver...")}
                className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl bg-muted/40 text-xs font-semibold text-foreground"
              >
                <Phone className="w-3.5 h-3.5" />
                Call
              </button>
              <button
                onClick={() => toast.info("ZIVO Safety Center opened")}
                className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl bg-muted/40 text-xs font-semibold text-foreground"
              >
                <Shield className="w-3.5 h-3.5" />
                Safety
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ TRIP COMPLETE — full-screen overlay (z-50, top:0) ═══════ */}
      {viewStep === "trip-complete" && (
        <div className="absolute left-0 right-0 bottom-0 z-50 bg-background overflow-y-auto" style={{ top: 0 }}>
          <div className="px-5 pt-12 pb-8">
            <div className="text-center mb-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
              </motion.div>
              <h2 className="text-2xl font-black text-foreground">Trip Complete!</h2>
              <p className="text-sm text-muted-foreground mt-1">You have arrived safely</p>
            </div>

            {/* Trip summary */}
            <div className="rounded-2xl bg-card border border-border/30 p-4 mb-4">
              <h4 className="text-sm font-bold text-foreground mb-3">Trip summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pickup</span>
                  <span className="text-foreground font-medium text-right max-w-[60%] truncate">{pickup?.address || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Destination</span>
                  <span className="text-foreground font-medium text-right max-w-[60%] truncate">{destination?.address || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="text-foreground font-medium">{routeData?.duration_minutes ?? 19} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Distance</span>
                  <span className="text-foreground font-medium">{routeData?.distance_miles ?? 10.6} mi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="text-foreground font-bold">${currentPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment</span>
                  <span className="text-foreground font-medium">Visa .... 4242</span>
                </div>
              </div>
            </div>

            {/* Rate driver */}
            <div className="rounded-2xl bg-card border border-border/30 p-4 mb-4">
              <p className="text-sm font-bold text-foreground mb-2">Rate your driver  {MOCK_DRIVER.name}</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)}>
                    <Star className={cn("w-7 h-7", star <= rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground/40")} />
                  </button>
                ))}
              </div>
            </div>

            {/* Tip */}
            <div className="rounded-2xl bg-card border border-border/30 p-4 mb-6">
              <p className="text-sm font-bold text-foreground mb-3">Add a tip?</p>
              <div className="flex gap-2">
                {([1, 2, 5, null] as (number | null)[]).map((amount, i) => (
                  <button
                    key={i}
                    onClick={() => setTip(tip === amount ? null : amount)}
                    className={cn(
                      "flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all",
                      tip === amount
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background text-foreground border-border/30"
                    )}
                  >
                    {amount === null ? "Custom" : `$${amount}`}
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full h-14 rounded-2xl text-base font-bold bg-foreground text-background hover:bg-foreground/90 shadow-lg"
              onClick={resetToHome}
            >
              Done
            </Button>
          </div>
        </div>
      )}

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
