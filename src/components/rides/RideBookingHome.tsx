/**
 * RideBookingHome — Complete ride booking flow
 * Flow: home → search → route-preview → ride-options → confirm-ride → searching → driver-assigned → driver-en-route → trip-in-progress → trip-complete
 */
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useDragControls, PanInfo } from "framer-motion";
import {
  MapPin, Navigation, ChevronRight, ArrowLeft, Home,
  Building2, Car, Crown, Users, Zap,
  CheckCircle, History, ChevronDown, Clock,
  CreditCard, User, CalendarClock, Map,
  Star, Phone, MessageSquare, Shield, Banknote,
  Smartphone, Wallet, X, Baby, Sparkles,
  Route, Timer, Bell, Package, Plane, Hotel, TrendingDown, Gem,
  PawPrint, Accessibility, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import RideMap from "@/components/maps/RideMap";
import { AddressAutocomplete } from "@/components/shared/AddressAutocomplete";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { useSavedLocations } from "@/hooks/useSavedLocations";

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
  | "trip-complete"
  // legacy aliases kept for backward compatibility
  | "vehicle"
  | "pickup-confirm"
  | "matching"
  | "tracking"
  | "complete";

type RideTab = "book" | "reserve" | "map" | "history";

/* ─── Data ─── */
/* Saved places & recent destinations now loaded from Supabase */
const ICON_MAP: Record<string, React.ElementType> = {
  home: Home,
  work: Building2,
  pin: MapPin,
};

const vehicleOptions = [
  // Popular
  { id: "economy", category: "popular", name: "ZIVO Economy", desc: "Affordable everyday rides", etaMin: 4, pricePerMile: 1.50, basePrice: 3.50, capacity: 3, icon: Car, carSeat: false, surgeMultiplier: 1.0 },
  { id: "share", category: "popular", name: "ZIVO Share", desc: "Share a ride, save money", etaMin: 6, pricePerMile: 0.90, basePrice: 2.00, capacity: 2, icon: Users, carSeat: false, surgeMultiplier: 0.7 },
  { id: "comfort", category: "popular", name: "ZIVO Comfort", desc: "Top-rated drivers, extra legroom", etaMin: 5, pricePerMile: 2.20, basePrice: 5.00, capacity: 3, icon: Sparkles, carSeat: false, surgeMultiplier: 1.0 },
  { id: "ev", category: "popular", name: "ZIVO EV", desc: "Electric, zero-emission rides", etaMin: 5, pricePerMile: 1.70, basePrice: 4.00, capacity: 3, icon: Zap, carSeat: false, surgeMultiplier: 1.0 },
  { id: "xl", category: "popular", name: "ZIVO XL", desc: "Extra space for groups", etaMin: 5, pricePerMile: 2.00, basePrice: 5.50, capacity: 5, icon: Car, carSeat: false, surgeMultiplier: 1.0 },
  // Premium
  { id: "black-lane", category: "premium", name: "ZIVO BLACK Lane", desc: "Executive black sedan service", etaMin: 6, pricePerMile: 3.80, basePrice: 8.00, capacity: 4, icon: Crown, carSeat: false, surgeMultiplier: 1.0 },
  { id: "black-xl", category: "premium", name: "ZIVO BLACK XL", desc: "Premium black SUV for groups", etaMin: 7, pricePerMile: 4.20, basePrice: 9.50, capacity: 6, icon: Crown, carSeat: false, surgeMultiplier: 1.0 },
  { id: "luxury-xl", category: "premium", name: "ZIVO Luxury XL", desc: "Luxury spacious SUV experience", etaMin: 8, pricePerMile: 4.60, basePrice: 10.50, capacity: 6, icon: Crown, carSeat: false, surgeMultiplier: 1.0 },
  // Accessible
  { id: "pet", category: "accessible", name: "ZIVO Pet", desc: "Pet-friendly rides", etaMin: 6, pricePerMile: 1.80, basePrice: 4.50, capacity: 3, icon: PawPrint, carSeat: false, surgeMultiplier: 1.0 },
  { id: "wheelchair", category: "accessible", name: "ZIVO Wheel Chair", desc: "Wheelchair accessible vehicle", etaMin: 8, pricePerMile: 1.60, basePrice: 4.00, capacity: 3, icon: Accessibility, carSeat: false, surgeMultiplier: 1.0 },
];

const rideTabs: { id: RideTab; label: string; icon: React.ElementType }[] = [
  { id: "book", label: "Book", icon: Car },
  { id: "reserve", label: "Reserve", icon: CalendarClock },
  { id: "map", label: "Map", icon: Map },
  { id: "history", label: "History", icon: History },
];

const homeServices = [
  { id: "ride", label: "Ride", icon: Car },
  { id: "delivery", label: "Delivery", icon: Package },
  { id: "flights", label: "Flights", icon: Plane },
  { id: "hotels", label: "Hotels", icon: Hotel },
];

/* ─── Price calculator ─── */
const PRICE_PER_MINUTE = 0.25; // time component of fare

function calcPrice(vehicle: typeof vehicleOptions[0], distanceMiles: number, durationMinutes = 0, surge = 1.0): number {
  const raw = (vehicle.basePrice + vehicle.pricePerMile * distanceMiles + PRICE_PER_MINUTE * durationMinutes) * surge * vehicle.surgeMultiplier;
  return Math.round(raw * 100) / 100;
}

/* ─── Mock driver ─── */
const MOCK_DRIVER = {
  name: "Marcus T.",
  fullName: "Marcus Thompson",
  initials: "MT",
  rating: 4.92,
  trips: 2847,
  vehicle: "Silver Toyota Camry",
  plate: "ABC 1234",
  phone: "+1 (555) 123-4567",
  etaMin: 5,
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

/* ─── Vehicle Row (for ride-options) ─── */
function VehicleRow({
  vehicle,
  selected,
  onSelect,
  price,
  originalPrice,
  surgeActive,
}: {
  vehicle: (typeof vehicleOptions)[0];
  selected: boolean;
  onSelect: () => void;
  price: number;
  originalPrice?: number;
  surgeActive?: boolean;
}) {
  const etaDate = new Date(Date.now() + vehicle.etaMin * 60000);
  const etaHour = etaDate.getHours();
  const etaMin = etaDate.getMinutes();
  const etaAmPm = etaHour >= 12 ? "pm" : "am";
  const etaHour12 = etaHour % 12 || 12;
  const etaStr = `${etaHour12}:${String(etaMin).padStart(2, "0")}${etaAmPm}`;
  const isDiscount = vehicle.surgeMultiplier < 1.0;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-4 px-4 py-3.5 text-left transition-all border-b border-border/10 last:border-0",
        selected
          ? "bg-green-500/8 border-l-4 border-l-green-500"
          : "hover:bg-muted/10 border-l-4 border-l-transparent"
      )}
    >
      <div className="w-[72px] shrink-0 flex items-center justify-center">
        <img
          src={VEHICLE_IMAGES[vehicle.id] ?? "/vehicles/economy-car.svg"}
          alt={vehicle.name}
          className="w-[72px] h-[44px] object-contain"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-bold text-foreground">{vehicle.name}</span>
          {vehicle.id === "economy" && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-bold">
              <TrendingDown className="w-3 h-3" />
              LOW
            </span>
          )}
          {vehicle.id === "share" && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
              <Users className="w-3 h-3" />
              SAVE
            </span>
          )}
          {vehicle.id === "comfort" && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[10px] font-bold">
              <Sparkles className="w-3 h-3" />
              TOP
            </span>
          )}
          {vehicle.id === "ev" && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
              <Zap className="w-3 h-3" />
              EV
            </span>
          )}
          {vehicle.id === "xl" && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-bold">
              <Users className="w-3 h-3" />
              5+
            </span>
          )}
          {vehicle.id === "black-lane" && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-[10px] font-bold">
              <Crown className="w-3 h-3" />
              VIP
            </span>
          )}
          {vehicle.id === "black-xl" && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-500/10 text-slate-600 dark:text-slate-400 text-[10px] font-bold">
              <Shield className="w-3 h-3" />
              PREMIUM
            </span>
          )}
          {vehicle.id === "luxury-xl" && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
              <Gem className="w-3 h-3" />
              ELITE
            </span>
          )}
          {vehicle.id === "pet" && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-pink-500/10 text-pink-600 dark:text-pink-400 text-[10px] font-bold">
              <PawPrint className="w-3 h-3" />
              PET
            </span>
          )}
          {vehicle.id === "wheelchair" && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
              <Accessibility className="w-3 h-3" />
              WAV
            </span>
          )}
          {vehicle.carSeat && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-600 text-[10px] font-bold">
              <Baby className="w-3 h-3" />
              Car seat
            </span>
          )}
          <div className="flex items-center gap-0.5 text-muted-foreground">
            <User className="w-3 h-3" />
            <span className="text-xs">{vehicle.capacity}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-muted-foreground">{etaStr} · {vehicle.desc}</span>
        </div>
      </div>
      <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
        {surgeActive && originalPrice && (
          <span className="line-through text-muted-foreground text-xs">${originalPrice.toFixed(2)}</span>
        )}
        {isDiscount ? (
          <span className="text-sm font-bold text-green-600">🟢 ${price.toFixed(2)}</span>
        ) : (
          <span className="text-sm font-bold text-foreground">${price.toFixed(2)}</span>
        )}
        {selected && (
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5" aria-label="Selected">
            <CheckCircle className="w-3.5 h-3.5 text-white" aria-hidden="true" />
          </div>
        )}
      </div>
    </button>
  );
}

/* ─── Vehicle image map ─── */
const VEHICLE_IMAGES: Record<string, string> = {
  "economy":   "/vehicles/economy-car-v2.png",
  "share":     "/vehicles/share-car-v2.png",
  "comfort":   "/vehicles/comfort-car-v2.png",
  "ev":        "/vehicles/ev-car-v2.png",
  "xl":        "/vehicles/xl-car-v2.png",
  "black-lane": "/vehicles/black-lane-car-v2.png",
  "black-xl":  "/vehicles/black-xl-car-v2.png",
  "luxury-xl": "/vehicles/luxury-car-v2.png",
  "pet":       "/vehicles/pet-car-v2.png",
  "wheelchair": "/vehicles/wheelchair-car-v2.png",
};

const etaTime = (minutesFromNow: number) =>
  new Date(Date.now() + minutesFromNow * 60000)
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    .toLowerCase();

/* ─── Main Component ─── */
export default function RideBookingHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getCurrentLocation } = useCurrentLocation();
  const { data: savedLocations = [] } = useSavedLocations(user?.id);

  // Recent ride destinations from Supabase
  const [recentDestinations, setRecentDestinations] = useState<{ id: string; address: string; time: string }[]>([]);
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("ride_requests")
      .select("id, dropoff_address, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setRecentDestinations(
            data
              .filter((r: any) => r.dropoff_address)
              .map((r: any) => ({
                id: r.id,
                address: r.dropoff_address,
                time: new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              }))
          );
        }
      });
  }, [user?.id]);

  // Map saved locations to display format
  const savedPlaces = useMemo(() =>
    savedLocations.map((loc) => ({
      id: loc.id,
      name: loc.label,
      address: loc.address,
      icon: ICON_MAP[loc.icon] || MapPin,
    })),
    [savedLocations]
  );
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

  // New state for enhanced flow
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.0);
  const [rideCategory, setRideCategory] = useState<"popular" | "premium" | "accessible">("popular");
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

  // Layout height constants
  const HEADER_HEIGHT = 56;
  const TABS_HEIGHT = 48;
  const HEADER_TABS_HEIGHT = HEADER_HEIGHT + TABS_HEIGHT;
  const BOTTOM_NAV_HEIGHT = 64;
  const SAFE_BOTTOM = "env(safe-area-inset-bottom, 0px)";

  const COLLAPSED_SHEET_HEIGHT = 230;
  const EXPANDED_SHEET_HEIGHT = Math.min(viewportHeight * 0.62, 560); // kept for future use

  // Route data
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Driver tracking
  const [driverCoords, setDriverCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [driverEta, setDriverEta] = useState(MOCK_DRIVER.etaMin);
  const trackingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch user location on mount
  useEffect(() => {
    getCurrentLocation()
      .then((loc) => setUserLocation({ lat: loc.lat, lng: loc.lng }))
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-advance: searching → driver-assigned after 4s
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

  // Auto-advance: driver-assigned → driver-en-route after 5s
  useEffect(() => {
    if (viewStep !== "driver-assigned") return;
    setDriverEta(MOCK_DRIVER.etaMin);
    const t = setTimeout(() => {
      setViewStep("driver-en-route");
    }, 5000);
    return () => clearTimeout(t);
  }, [viewStep]);

  // Driver en-route animation: move toward pickup
  useEffect(() => {
    if (viewStep !== "driver-en-route") return;
    if (!pickup) return;

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
      setDriverEta(Math.max(0, MOCK_DRIVER.etaMin - Math.floor(progress * MOCK_DRIVER.etaMin)));

      if (progress >= 1) {
        clearInterval(interval);
        setViewStep("trip-in-progress");
      }
    }, 1500);

    trackingIntervalRef.current = interval;
    return () => clearInterval(interval);
  }, [viewStep, pickup]);

  // Auto-advance: trip-in-progress → trip-complete after 8s
  useEffect(() => {
    if (viewStep !== "trip-in-progress") return;

    // Move driver toward destination
    if (pickup && destination) {
      const startLat = pickup.lat;
      const startLng = pickup.lng;
      let step = 0;

      const interval = setInterval(() => {
        step++;
        const progress = Math.min(step / 20, 1);
        setDriverCoords({
          lat: startLat + (destination.lat - startLat) * progress,
          lng: startLng + (destination.lng - startLng) * progress,
        });
      }, 400);

      trackingIntervalRef.current = interval;

      const t = setTimeout(async () => {
        clearInterval(interval);
        setViewStep("trip-complete");
        if (rideRequestId) {
          await supabase.from("ride_requests").update({ status: "completed" }).eq("id", rideRequestId);
        }
      }, 8000);

      return () => {
        clearInterval(interval);
        clearTimeout(t);
      };
    }

    const t = setTimeout(async () => {
      setViewStep("trip-complete");
      if (rideRequestId) {
        await supabase.from("ride_requests").update({ status: "completed" }).eq("id", rideRequestId);
      }
    }, 8000);
    return () => clearTimeout(t);
  }, [viewStep, pickup, destination, rideRequestId]);

  const handleLocateUser = useCallback(() => {
    getCurrentLocation()
      .then((loc) => setUserLocation({ lat: loc.lat, lng: loc.lng }))
      .catch(() => toast.error("Could not get your location"));
  }, [getCurrentLocation]);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const userName = user?.user_metadata?.full_name?.split(" ")[0] || "there";

  const currentVehicle = vehicleOptions.find((v) => v.id === selectedVehicle) ?? vehicleOptions[0];
  const currentPrice = routeData
    ? calcPrice(currentVehicle, routeData.distance_miles, routeData.duration_minutes, surgeMultiplier)
    : calcPrice(currentVehicle, 0, 0, surgeMultiplier);

  const handleTabChange = (tab: RideTab) => {
    setActiveTab(tab);
    if (tab === "reserve") navigate("/rides/reserve");
    else if (tab === "history") navigate("/rides/history");
  };

  /* ─── Back navigation ─── */
  const handleBack = () => {
    if (viewStep === "search") setViewStep("home");
    else if (viewStep === "route-preview") setViewStep("search");
    else if (viewStep === "ride-options") setViewStep("route-preview");
    else if (viewStep === "confirm-ride") setViewStep("ride-options");
    else if (
      viewStep === "driver-assigned" ||
      viewStep === "driver-en-route" ||
      viewStep === "trip-in-progress"
    ) {
      toast.info("Trip in progress");
    } else {
      navigate(-1);
    }
  };

  const handlePickupSelect = useCallback((place: PlaceData) => {
    setPickup(place);
    setPickupDisplay(place.address);
  }, []);

  const handleDestinationSelect = useCallback((place: PlaceData) => {
    setDestination(place);
    setDestinationDisplay(place.address);

    let pickupData = pickup;
    if (!pickupData) {
      pickupData = userLocation
        ? { address: "Current Location", lat: userLocation.lat, lng: userLocation.lng }
        : { address: "Current Location", lat: 40.7128, lng: -73.9857 };
      setPickup(pickupData);
      setPickupDisplay("Current Location");
    }

    if (pickupData && place.lat && place.lng) {
      fetchRoute(pickupData, place);
    }
  }, [pickup, userLocation]); // fetchRoute is intentionally omitted to avoid infinite loop

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

  /* ─── Fetch route ─── */
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
    } catch (err: unknown) {
      console.error("[RideBooking] Request error:", err);
      toast.error("Failed to request ride. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─── Reset state ─── */
  const handleReset = () => {
    if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
    setViewStep("home");
    setPickup(null);
    setDestination(null);
    setPickupDisplay("");
    setDestinationDisplay("");
    setRideRequestId(null);
    setRouteData(null);
    setDriverCoords(null);
    setDriverEta(MOCK_DRIVER.etaMin);
    setRating(0);
    setTip(null);
    setSurgeMultiplier(1.0);
    setRideCategory("popular");
  };

  /* ─── Cancel ride ─── */
  const handleCancelRide = async () => {
    if (rideRequestId) {
      await supabase.from("ride_requests").update({ status: "cancelled" }).eq("id", rideRequestId);
    }
    handleReset();
  };

  const filteredVehiclesByCategory = vehicleOptions.filter((v) => v.category === rideCategory);

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-background">

      {/* ═══════ 1. HEADER — always visible ═══════ */}
      <div className="relative z-20 flex items-center h-14 px-4 bg-background border-b border-border/20">
        <button
          onClick={handleBack}
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

      {/* ═══════ 2. RIDE TABS — only on home step ═══════ */}
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

      {/* ═══════ 3. MAP VIEWPORT LAYER ═══════ */}
      {(viewStep === "home"
        || viewStep === "route-preview"
        || viewStep === "ride-options"
        || viewStep === "confirm-ride"
        || viewStep === "searching"
        || viewStep === "driver-assigned"
        || viewStep === "driver-en-route"
        || viewStep === "trip-in-progress"
        || viewStep === "pickup-confirm"
        || viewStep === "tracking"
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
            routePolyline={viewStep !== "home" ? (routeData?.polyline ?? null) : null}
            driverCoords={
              (viewStep === "driver-en-route" || viewStep === "trip-in-progress") ? driverCoords : null
            }
          />
        </div>
      )}

      {/* ═══════ 4a. HOME bottom sheet ═══════ */}
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

            {/* Saved places */}
            {savedPlaces.length > 0 ? (
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
            ) : null}

            {/* Get anywhere service grid */}
            <div className="mt-4 border-t border-border/15 pt-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Get anywhere</p>
              <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
                {homeServices.map((svc) => {
                  const Icon = svc.icon;
                  return (
                    <button
                      key={svc.id}
                      onClick={() => toast.info("Coming soon!")}
                      className="flex flex-col items-center justify-center gap-1.5 w-[60px] h-[60px] rounded-xl bg-muted/30 border border-border/20 shrink-0 hover:bg-muted/50 active:scale-95 transition-all"
                    >
                      <Icon className="w-5 h-5 text-foreground" />
                      <span className="text-[10px] font-semibold text-foreground">{svc.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ SEARCH — split view: map top + panel bottom ═══════ */}
      {viewStep === "search" && (
        <>
          {/* Map area with draggable pin */}
          <div
            className="absolute left-0 right-0 z-0"
            style={{
              top: HEADER_HEIGHT,
              bottom: `calc(50% + ${SAFE_BOTTOM})`,
            }}
          >
            <MapSection
              compact
              pickupCoords={pickup}
              dropoffCoords={destination}
              userLocation={userLocation}
              onLocateUser={handleLocateUser}
              routePolyline={null}
            >
              {/* Center pin indicator when no pickup selected */}
              {!pickup && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <div className="flex flex-col items-center">
                    <MapPin className="w-8 h-8 text-primary drop-shadow-lg" />
                    <div className="w-2 h-2 rounded-full bg-primary/40 mt-0.5" />
                    <span className="mt-1 px-2 py-0.5 rounded-full bg-background/90 text-[10px] font-semibold text-foreground shadow-sm">
                      Move map to set pickup
                    </span>
                  </div>
                </div>
              )}
            </MapSection>
          </div>

          {/* Bottom panel */}
          <div
            className="absolute left-0 right-0 bottom-0 z-40 bg-background rounded-t-[28px] shadow-[0_-8px_30px_hsl(var(--foreground)/0.08)] flex flex-col"
            style={{
              top: "45%",
              paddingBottom: `calc(${BOTTOM_NAV_HEIGHT}px + ${SAFE_BOTTOM})`,
            }}
          >
            <div className="mx-auto mt-2 h-1.5 w-14 rounded-full bg-muted-foreground/25 shrink-0" />

            <div className="px-4 pt-3">
              <h2 className="text-lg font-black text-foreground mb-3">Where to?</h2>

              {/* Address inputs */}
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

              {/* Action buttons row */}
              <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-none pb-1">
                <button
                  onClick={() => toast.info("Add a stop coming soon")}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-muted/30 border border-border/30 text-xs font-semibold text-foreground whitespace-nowrap hover:bg-muted/50 active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Stop
                </button>
                <button
                  onClick={() => navigate("/rides/reserve")}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-muted/30 border border-border/30 text-xs font-semibold text-foreground whitespace-nowrap hover:bg-muted/50 active:scale-95 transition-all"
                >
                  <CalendarClock className="w-3.5 h-3.5" />
                  Schedule
                </button>
                <button
                  onClick={() => toast.info("Pick up other customer coming soon")}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-muted/30 border border-border/30 text-xs font-semibold text-foreground whitespace-nowrap hover:bg-muted/50 active:scale-95 transition-all"
                >
                  <Users className="w-3.5 h-3.5" />
                  Pick up other
                </button>
              </div>
            </div>

            {/* Saved & Recent list */}
            <div className="flex-1 overflow-y-auto px-4 pt-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Saved Places</p>
              {savedPlaces.length > 0 ? savedPlaces.map((place) => {
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
              }) : (
                <button
                  onClick={() => toast.info("Save a location from your profile")}
                  className="w-full flex items-center gap-3 px-1 py-3 text-left hover:bg-muted/10 transition-colors border-b border-border/10"
                >
                  <div className="w-9 h-9 rounded-full bg-muted/20 flex items-center justify-center shrink-0 border border-dashed border-border/40">
                    <Plus className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">Add a saved place</p>
                    <p className="text-xs text-muted-foreground/60">Home, work, gym...</p>
                  </div>
                </button>
              )}

              {recentDestinations.length > 0 && (
                <>
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
                </>
              )}
            </div>

            {pickup && destination && (
              <div className="px-4 pb-3 pt-2 shrink-0">
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
        </>
      )}

      {/* ═══════ Zoom controls — route-preview only ═══════ */}
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

      {/* ═══════ 4b. ROUTE PREVIEW — draggable bottom sheet ═══════ */}
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
          <div className="mx-auto mt-2 h-1.5 w-14 rounded-full bg-muted-foreground/25 cursor-grab active:cursor-grabbing shrink-0" />

          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Route info */}
            <div className="px-5 pt-3 pb-2 shrink-0">
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

            {/* Choose a ride button — collapsed */}
            {!sheetExpanded && (
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
            )}

            {/* Expanded — also go to ride-options */}
            <AnimatePresence>
              {sheetExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 overflow-hidden flex flex-col items-center justify-center px-4 border-t border-border/15"
                >
                  <p className="text-sm text-muted-foreground mb-4">Browse available rides</p>
                  <Button
                    className="w-full h-12 rounded-2xl text-base font-bold bg-foreground text-background"
                    onClick={() => setViewStep("ride-options")}
                  >
                    See ride options
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* ═══════ RIDE OPTIONS — full-screen overlay ═══════ */}
      {viewStep === "ride-options" && (
        <div
          className="absolute left-0 right-0 bottom-0 z-40 bg-background flex flex-col"
          style={{ top: HEADER_HEIGHT }}
        >
          {/* Header row */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewStep("route-preview")}
                className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center"
                aria-label="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-lg font-black text-foreground">Choose a ride</h2>
            </div>
            {/* Promo badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-emerald-600">15% promo applied</span>
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 px-5 pb-3 border-b border-border/10 shrink-0">
            {(["popular", "premium", "accessible"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setRideCategory(cat)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-bold transition-all capitalize",
                  rideCategory === cat
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Vehicle list — scrollable */}
          <div className="flex-1 overflow-y-auto">
            {filteredVehiclesByCategory.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVehicle(v.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-b border-border/10 last:border-0",
                  selectedVehicle === v.id
                    ? "bg-emerald-50 dark:bg-emerald-950/20 border-l-[3px] border-l-emerald-500"
                    : "hover:bg-muted/10 border-l-[3px] border-l-transparent"
                )}
              >
                {/* Left: Vehicle SVG */}
                <div className="w-14 shrink-0 flex items-center justify-center">
                  <img
                    src={VEHICLE_IMAGES[v.id] ?? "/vehicles/economy-car.svg"}
                    alt={v.name}
                    className="w-14 h-auto"
                  />
                </div>

                {/* Center: Name + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-bold text-foreground">{v.name}</span>
                    {v.id === "economy" && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-bold">
                        <TrendingDown className="w-3 h-3" />
                        LOW
                      </span>
                    )}
                    {v.id === "share" && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                        <Users className="w-3 h-3" />
                        SAVE
                      </span>
                    )}
                    {v.id === "comfort" && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[10px] font-bold">
                        <Sparkles className="w-3 h-3" />
                        TOP
                      </span>
                    )}
                    {v.id === "ev" && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                        <Zap className="w-3 h-3" />
                        EV
                      </span>
                    )}
                    {v.id === "xl" && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-bold">
                        <Users className="w-3 h-3" />
                        5+
                      </span>
                    )}
                    {v.id === "black-lane" && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-[10px] font-bold">
                        <Crown className="w-3 h-3" />
                        VIP
                      </span>
                    )}
                    {v.id === "black-xl" && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-500/10 text-slate-600 dark:text-slate-400 text-[10px] font-bold">
                        <Shield className="w-3 h-3" />
                        PREMIUM
                      </span>
                    )}
                    {v.id === "luxury-xl" && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                        <Gem className="w-3 h-3" />
                        ELITE
                      </span>
                    )}
                    {v.id === "pet" && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-pink-500/10 text-pink-600 dark:text-pink-400 text-[10px] font-bold">
                        <PawPrint className="w-3 h-3" />
                        PET
                      </span>
                    )}
                    {v.id === "wheelchair" && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                        <Accessibility className="w-3 h-3" />
                        WAV
                      </span>
                    )}
                    <div className="flex items-center gap-0.5">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{v.capacity}</span>
                    </div>
                    {v.carSeat && (
                      <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 text-[10px] font-bold">
                        Car seat
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {etaTime(v.etaMin)} · {v.desc}
                  </p>
                </div>

                {/* Right: Price */}
                <div className="shrink-0 text-right">
                  {v.surgeMultiplier < 1 ? (
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-muted-foreground line-through">
                        ${calcPrice({ ...v, surgeMultiplier: 1.0 }, routeData?.distance_miles ?? 0, routeData?.duration_minutes ?? 0).toFixed(2)}
                      </span>
                      <span className="text-sm font-bold text-emerald-500 flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        ${calcPrice(v, routeData?.distance_miles ?? 0, routeData?.duration_minutes ?? 0).toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-foreground">
                      ${calcPrice(v, routeData?.distance_miles ?? 0, routeData?.duration_minutes ?? 0).toFixed(2)}
                    </span>
                  )}
                  {selectedVehicle === v.id && (
                    <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center ml-auto">
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Payment row */}
          <div className="shrink-0 mt-4 pt-3 border-t border-border/20 px-5 py-3 flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-sm text-foreground font-medium">Visa •••• 4242</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* Confirm button */}
          <div className="shrink-0 px-5" style={{ paddingBottom: `calc(16px + ${SAFE_BOTTOM})` }}>
            <Button
              className="w-full h-14 rounded-[22px] text-base font-bold bg-foreground text-background"
              onClick={() => setViewStep("confirm-ride")}
            >
              Confirm {currentVehicle.name} · ${currentPrice.toFixed(2)}
            </Button>
          </div>
        </div>
      )}

      {/* ═══════ CONFIRM RIDE — full-screen overlay ═══════ */}
      {viewStep === "confirm-ride" && (
        <div
          className="absolute left-0 right-0 bottom-0 z-40 bg-background flex flex-col overflow-y-auto"
          style={{ top: HEADER_HEIGHT }}
        >
          <div className="flex items-center gap-3 px-4 pt-4 pb-2 shrink-0">
            <button
              onClick={() => setViewStep("ride-options")}
              className="w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
            <h2 className="text-lg font-black text-foreground">Confirm your ride</h2>
          </div>

          <div className="px-4 pb-4 space-y-0">
            {/* Route */}
            <div className="rounded-2xl bg-muted/15 border border-border/20 p-4 mb-3">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-0.5 mt-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <div className="w-0.5 h-8 bg-border/50" />
                  <div className="w-2.5 h-2.5 rounded-sm bg-foreground" />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <p className="text-sm font-semibold text-foreground truncate">{pickup?.address || pickupDisplay}</p>
                  <p className="text-sm font-semibold text-foreground truncate">{destination?.address || destinationDisplay}</p>
                </div>
              </div>
            </div>

            {/* Vehicle summary */}
            <div className="rounded-2xl bg-card border border-border/20 p-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center">
                  {(() => { const Icon = currentVehicle.icon; return <Icon className="w-5 h-5 text-foreground" />; })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{currentVehicle.name} · {currentVehicle.capacity} seats</p>
                  <p className="text-xs text-muted-foreground">{currentVehicle.etaMin} min away · {currentVehicle.desc}</p>
                </div>
                <p className="text-lg font-bold text-foreground">${currentPrice.toFixed(2)}</p>
              </div>
            </div>

            {/* Payment */}
            <div className="rounded-2xl bg-card border border-border/20 p-4 mb-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Payment</p>
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground flex-1">Visa •••• 4242</span>
                <button className="text-xs font-bold text-primary">Change &gt;</button>
              </div>
            </div>

            {/* Promo */}
            <div className="rounded-2xl bg-card border border-border/20 p-4 mb-3 flex items-center justify-between">
              <span className="text-sm text-foreground">Promo code</span>
              <button className="text-xs font-bold text-primary">Add &gt;</button>
            </div>

            {/* Route info */}
            {routeData && (
              <div className="rounded-2xl bg-muted/15 border border-border/20 p-3 mb-4 flex items-center justify-center gap-3 text-xs text-muted-foreground">
                <Timer className="w-3.5 h-3.5" />
                <span>{routeData.duration_minutes} min</span>
                <span>·</span>
                <Route className="w-3.5 h-3.5" />
                <span>{routeData.distance_miles} mi</span>
                {routeData.traffic_level && (
                  <>
                    <span>·</span>
                    <span className="capitalize">{routeData.traffic_level} traffic</span>
                  </>
                )}
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
        </div>
      )}

      {/* ═══════ SEARCHING — bottom sheet over map ═══════ */}
      {viewStep === "searching" && (
        <div
          className="absolute left-0 right-0 z-30 rounded-t-[28px] bg-background shadow-[0_-8px_30px_hsl(var(--foreground)/0.08)] px-5 pt-4 pb-4"
          style={{ bottom: `calc(${BOTTOM_NAV_HEIGHT}px + ${SAFE_BOTTOM})`, height: 260 }}
        >
          <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-muted-foreground/25" />

          <div className="flex flex-col items-center justify-center h-[calc(100%-28px)]">
            {/* Animated dots */}
            <div className="flex gap-2 mb-4">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-3 h-3 rounded-full bg-primary"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
                />
              ))}
            </div>

            <h3 className="text-lg font-bold text-foreground mb-1">Finding your driver…</h3>
            <p className="text-sm text-muted-foreground mb-1">Searching nearby drivers</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
              <span>Drivers nearby: 5</span>
              <span>·</span>
              <span>Estimated pickup: {currentVehicle.etaMin} min</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive/80"
              onClick={handleCancelRide}
            >
              Cancel ride
            </Button>
          </div>
        </div>
      )}

      {/* ═══════ DRIVER ASSIGNED — bottom sheet over map ═══════ */}
      {viewStep === "driver-assigned" && (
        <div
          className="absolute left-0 right-0 z-30 rounded-t-[28px] bg-background shadow-[0_-8px_30px_hsl(var(--foreground)/0.08)] px-5 pt-3 pb-4"
          style={{ bottom: `calc(${BOTTOM_NAV_HEIGHT}px + ${SAFE_BOTTOM})` }}
        >
          <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-muted-foreground/25" />

          <h3 className="text-base font-bold text-foreground text-center mb-0.5">Meet your driver at pickup</h3>
          <p className="text-xs text-muted-foreground text-center mb-3">Driver arriving in {MOCK_DRIVER.etaMin} minutes.</p>

          <div className="border-t border-border/15 pt-3">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-14 h-14 shrink-0">
                <AvatarFallback className="bg-foreground text-background font-bold text-lg">{MOCK_DRIVER.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground">{MOCK_DRIVER.name}</p>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-sm text-muted-foreground">{MOCK_DRIVER.rating} · {MOCK_DRIVER.trips.toLocaleString()} trips</span>
                </div>
                <p className="text-xs text-muted-foreground">{MOCK_DRIVER.vehicle}</p>
                <p className="text-xs font-mono font-bold text-foreground">{MOCK_DRIVER.plate}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border/15 pt-3 flex gap-2">
            <Button
              variant="outline"
              className="flex-1 h-10 rounded-xl gap-1.5 text-sm"
              onClick={() => toast.info("Opening chat...")}
            >
              <MessageSquare className="w-4 h-4" />
              Message
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-10 rounded-xl gap-1.5 text-sm"
              onClick={() => toast.info("Calling driver...")}
            >
              <Phone className="w-4 h-4" />
              Call
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-10 rounded-xl gap-1.5 text-sm text-destructive border-destructive/30 hover:bg-destructive/5"
              onClick={handleCancelRide}
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* ═══════ DRIVER EN ROUTE — bottom sheet over map ═══════ */}
      {viewStep === "driver-en-route" && (
        <div
          className="absolute left-0 right-0 z-30 rounded-t-[28px] bg-background shadow-[0_-8px_30px_hsl(var(--foreground)/0.08)] px-5 pt-3 pb-4"
          style={{ bottom: `calc(${BOTTOM_NAV_HEIGHT}px + ${SAFE_BOTTOM})`, height: 200 }}
        >
          <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-muted-foreground/25" />

          <h3 className="text-base font-bold text-foreground mb-2">
            Driver arriving in {driverEta > 0 ? `${driverEta} min` : "now"}
          </h3>

          <div className="flex items-center gap-2 mb-3 text-sm">
            <Car className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="font-semibold text-foreground">{MOCK_DRIVER.name}</span>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground">{MOCK_DRIVER.vehicle}</span>
            <span className="text-muted-foreground">|</span>
            <span className="font-mono font-bold text-foreground">{MOCK_DRIVER.plate}</span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 h-10 rounded-xl gap-1.5 text-sm"
              onClick={() => toast.info("Opening chat...")}
            >
              <MessageSquare className="w-4 h-4" />
              Message
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-10 rounded-xl gap-1.5 text-sm"
              onClick={() => toast.info("Calling driver...")}
            >
              <Phone className="w-4 h-4" />
              Call
            </Button>
          </div>
        </div>
      )}

      {/* ═══════ TRIP IN PROGRESS — bottom sheet over map ═══════ */}
      {viewStep === "trip-in-progress" && (
        <div
          className="absolute left-0 right-0 z-30 rounded-t-[28px] bg-background shadow-[0_-8px_30px_hsl(var(--foreground)/0.08)] px-5 pt-3 pb-4"
          style={{ bottom: `calc(${BOTTOM_NAV_HEIGHT}px + ${SAFE_BOTTOM})`, height: 220 }}
        >
          <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-muted-foreground/25" />

          <h3 className="text-base font-bold text-foreground mb-0.5">Heading to destination</h3>
          {routeData && (
            <p className="text-xs text-muted-foreground mb-2">ETA: {routeData.duration_minutes} min</p>
          )}

          <div className="flex items-center gap-2 mb-3 text-sm">
            <Car className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="font-semibold text-foreground">{MOCK_DRIVER.name}</span>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground truncate">{MOCK_DRIVER.vehicle}</span>
            <span className="text-muted-foreground">|</span>
            <span className="font-mono font-bold text-foreground shrink-0">{MOCK_DRIVER.plate}</span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 h-10 rounded-xl gap-1.5 text-sm"
              onClick={() => toast.info("Trip link copied!")}
            >
              <Route className="w-4 h-4" />
              Share Trip
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-10 rounded-xl gap-1.5 text-sm"
              onClick={() => toast.info("Calling driver...")}
            >
              <Phone className="w-4 h-4" />
              Call
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-10 rounded-xl gap-1.5 text-sm"
              onClick={() => toast.info("Safety center opened")}
            >
              <Shield className="w-4 h-4" />
              Safety
            </Button>
          </div>
        </div>
      )}

      {/* ═══════ TRIP COMPLETE — full-screen overlay ═══════ */}
      {(viewStep === "trip-complete" || viewStep === "complete") && (
        <div
          className="absolute left-0 right-0 z-30 rounded-t-[28px] bg-background shadow-[0_-8px_30px_hsl(var(--foreground)/0.08)] overflow-y-auto px-5 pt-5 pb-4"
          style={{ bottom: `calc(${BOTTOM_NAV_HEIGHT}px + ${SAFE_BOTTOM})`, maxHeight: '80vh' }}
        >
          <div className="text-center mb-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
            </motion.div>
            <h3 className="text-xl font-bold text-foreground">Trip Complete!</h3>
            <p className="text-sm text-muted-foreground mt-1">You've arrived</p>
          </div>

          {/* Trip summary */}
          <div className="rounded-2xl bg-card border border-border/30 p-4 mb-4">
            <h4 className="text-sm font-bold text-foreground mb-3">Trip summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pickup</span>
                <span className="text-foreground text-right max-w-[60%] truncate">{pickup?.address || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Destination</span>
                <span className="text-foreground text-right max-w-[60%] truncate">{destination?.address || "—"}</span>
              </div>
              {routeData && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="text-foreground">{routeData.duration_minutes} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distance</span>
                    <span className="text-foreground">{routeData.distance_miles} mi</span>
                  </div>
                </>
              )}
              <div className="flex justify-between border-t border-border/20 pt-2">
                <span className="font-bold text-foreground">Amount</span>
                <span className="font-bold text-foreground">${currentPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment</span>
                <span className="text-foreground">Visa •••• 4242</span>
              </div>
            </div>
          </div>

          {/* Rate driver */}
          <div className="rounded-2xl bg-card border border-border/30 p-4 mb-4">
            <h4 className="text-sm font-bold text-foreground mb-3">Rate {MOCK_DRIVER.name}</h4>
            <div className="flex justify-center gap-2 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className="touch-manipulation">
                  <Star
                    className={cn(
                      "w-8 h-8 transition-colors",
                      star <= rating ? "text-amber-500 fill-amber-500" : "text-border"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Add tip */}
          <div className="rounded-2xl bg-card border border-border/30 p-4 mb-6">
            <h4 className="text-sm font-bold text-foreground mb-3">Add a tip?</h4>
            <div className="flex gap-2">
              {[1, 2, 5].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTip(tip === amount ? null : amount)}
                  className={cn(
                    "flex-1 py-2 rounded-xl border text-sm font-bold transition-all",
                    tip === amount
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-foreground border-border/40 hover:border-foreground/30"
                  )}
                >
                  ${amount}
                </button>
              ))}
              <button
                onClick={() => toast.info("Custom tip coming soon!")}
                className="flex-1 py-2 rounded-xl border text-sm font-bold bg-background text-foreground border-border/40 hover:border-foreground/30 transition-all"
              >
                Custom
              </button>
            </div>
          </div>

          <Button
            className="w-full h-14 rounded-2xl text-base font-bold bg-foreground text-background hover:bg-foreground/90 shadow-lg"
            onClick={handleReset}
          >
            Done
          </Button>
        </div>
      )}

      {/* ═══════ Legacy: PICKUP CONFIRM (backward compat) ═══════ */}
      {viewStep === "pickup-confirm" && (
        <div
          className="absolute left-0 right-0 z-30 bg-background rounded-t-[1.5rem] border-t border-border/30 px-4 pt-4 pb-4 overflow-y-auto"
          style={{ bottom: `calc(${BOTTOM_NAV_HEIGHT}px + ${SAFE_BOTTOM})` }}
        >
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
          <Button
            className="w-full h-14 rounded-2xl text-base font-bold bg-foreground text-background hover:bg-foreground/90 shadow-lg gap-2"
            onClick={handleRequestRide}
            disabled={isSubmitting}
          >
            <Zap className="w-5 h-5" />
            {isSubmitting ? "Requesting..." : "Request Ride"}
          </Button>
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
