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
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import RideMap from "@/components/maps/RideMap";
import ScrollWheelPicker from "./ScrollWheelPicker";
import DateScrollWheelPicker from "./DateScrollWheelPicker";
import { AddressAutocomplete } from "@/components/shared/AddressAutocomplete";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { useSavedLocations } from "@/hooks/useSavedLocations";
import { reverseGeocode } from "@/services/mapsApi";
import RidePaymentSection from "@/components/rides/RidePaymentSection";

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
  stopCoords = [],
  driverCoords,
  userLocation,
  routePolyline,
  onLocateUser,
  onCenterChanged,
  showUserLocationDot = true,
  compact = false,
  children,
}: {
  pickupCoords?: { lat: number; lng: number } | null;
  dropoffCoords?: { lat: number; lng: number } | null;
  stopCoords?: { lat: number; lng: number }[];
  driverCoords?: { lat: number; lng: number } | null;
  userLocation?: { lat: number; lng: number } | null;
  routePolyline?: string | null;
  onLocateUser?: () => void;
  onCenterChanged?: (center: { lat: number; lng: number }) => void;
  showUserLocationDot?: boolean;
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
          stopCoords={stopCoords}
          driverCoords={driverCoords || null}
          userLocation={userLocation || null}
          showUserLocationDot={showUserLocationDot}
          routePolyline={routePolyline || null}
          onMapReady={(map) => { mapRef.current = map; }}
          onCenterChanged={onCenterChanged}
          className="absolute inset-0 h-full w-full"
        />
      </div>
      <button
        onClick={handleLocateClick}
        className="absolute right-3 top-14 z-20 w-10 h-10 rounded-full bg-card shadow-lg shadow-black/10 flex items-center justify-center border border-border/30 backdrop-blur-sm"
        aria-label="Center on my location"
      >
        <Navigation className="w-4 h-4" style={{ color: '#00C853' }} />
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

/* ─── Stripe Payment Form (inside Elements provider) ─── */
function StripePaymentForm({ onSuccess, isSubmitting, price, vehicleName }: {
  onSuccess: () => void;
  isSubmitting: boolean;
  price: number;
  vehicleName: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setErrorMsg(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href, // fallback — we handle inline
      },
      redirect: "if_required",
    });

    if (error) {
      setErrorMsg(error.message || "Payment failed");
      setProcessing(false);
    } else {
      // Payment authorized successfully
      setProcessing(false);
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />
      {errorMsg && (
        <p className="text-sm text-destructive text-center">{errorMsg}</p>
      )}
      <Button
        type="submit"
        className="w-full h-14 rounded-2xl text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg gap-2"
        disabled={!stripe || processing || isSubmitting}
      >
        <Shield className="w-5 h-5" />
        {processing ? "Authorizing..." : `Authorize $${price.toFixed(2)} · ${vehicleName}`}
      </Button>
      <p className="text-[10px] text-muted-foreground text-center">
        Your card will be pre-authorized. Final charge applied after ride completion.
      </p>
    </form>
  );
}

/* ─── Main Component ─── */
export default function RideBookingHome({ initialSchedule = false }: { initialSchedule?: boolean } = {}) {
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

  const [viewStep, setViewStep] = useState<ViewStep>("search");
  const [activeTab, setActiveTab] = useState<RideTab>("book");
   const [pickup, setPickup] = useState<PlaceData | null>(null);
  const [destination, setDestination] = useState<PlaceData | null>(null);
  const [pickupDisplay, setPickupDisplay] = useState("");
  const [destinationDisplay, setDestinationDisplay] = useState("");
  const [stops, setStops] = useState<{ id: string; place: PlaceData | null; display: string }[]>([]);
  const stopsRef = useRef(stops);
  stopsRef.current = stops;
  const [selectedVehicle, setSelectedVehicle] = useState("economy");
  const [rideRequestId, setRideRequestId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [searchSheetY, setSearchSheetY] = useState(-20); // -20 = full, 0 = half, positive = peek
  const [isReversingGeocode, setIsReversingGeocode] = useState(false);
  const reverseGeocodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pickupManuallySet = useRef(false); // true when user selects pickup via autocomplete
  const mapCenterRef = useRef<{ lat: number; lng: number } | null>(null);

  // New state for enhanced flow
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.0);
  const [rideCategory, setRideCategory] = useState<"popular" | "premium" | "accessible">("popular");
  const [rating, setRating] = useState(0);
  const [tip, setTip] = useState<number | null>(null);

  // Schedule state
  const [showSchedule, setShowSchedule] = useState(initialSchedule);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(new Date());
  const [scheduleHour, setScheduleHour] = useState(() => {
    const h = new Date().getHours();
    return h < 23 ? h + 1 : 0;
  });
  const [scheduleMinute, setScheduleMinute] = useState(0);

  // Pick up other state
  const [showPickupOther, setShowPickupOther] = useState(false);
  const [otherName, setOtherName] = useState("");
  const [otherPhone, setOtherPhone] = useState("");

  // Viewport height for dynamic sheet sizing
  const [viewportHeight, setViewportHeight] = useState(800);
  useEffect(() => {
    const updateHeight = () => setViewportHeight(window.innerHeight);
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // Lock page scroll for full-screen ride experience
  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousOverscrollBehavior = document.body.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overscrollBehavior = previousOverscrollBehavior;
    };
  }, []);

  // Layout height constants
  const HEADER_HEIGHT = 56;
  const TABS_HEIGHT = 52;
  const HEADER_TABS_HEIGHT = HEADER_HEIGHT + TABS_HEIGHT;
  const BOTTOM_NAV_HEIGHT = 64;
  const SAFE_BOTTOM = "env(safe-area-inset-bottom, 0px)";

  // Route data
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  const COLLAPSED_SHEET_HEIGHT = 330 + stops.length * 56 + (routeData ? 52 : 0);
  const EXPANDED_SHEET_HEIGHT = Math.min(viewportHeight * 0.62, 560); // kept for future use

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

  /** When user drags map in search view, reverse geocode center → pickup */
  const handleMapCenterChanged = useCallback((center: { lat: number; lng: number }) => {
    // In home view: reverse geocode to show address in the destination field
    if (viewStep === "home") {
      mapCenterRef.current = center;
      if (reverseGeocodeTimerRef.current) clearTimeout(reverseGeocodeTimerRef.current);
      reverseGeocodeTimerRef.current = setTimeout(async () => {
        setIsReversingGeocode(true);
        try {
          const address = await reverseGeocode(center.lat, center.lng);
          setDestinationDisplay(address);
        } catch {
          setDestinationDisplay(`${center.lat.toFixed(5)}, ${center.lng.toFixed(5)}`);
        } finally {
          setIsReversingGeocode(false);
        }
      }, 600);
      return;
    }
    // Skip reverse geocode if user manually set pickup, or destination already chosen
    if (viewStep !== "search" || destination || pickupManuallySet.current) return;

    // Debounce reverse geocode
    if (reverseGeocodeTimerRef.current) clearTimeout(reverseGeocodeTimerRef.current);
    reverseGeocodeTimerRef.current = setTimeout(async () => {
      // Re-check guard inside the timeout — pickup may have been set manually during the debounce window
      if (pickupManuallySet.current) return;

      setIsReversingGeocode(true);
      try {
        // Final guard before writing state
        if (pickupManuallySet.current) return;
        const address = await reverseGeocode(center.lat, center.lng);
        // Final guard after async — user may have selected pickup while API was in-flight
        if (pickupManuallySet.current) return;
        setPickup({ address, lat: center.lat, lng: center.lng });
        setPickupDisplay(address);
      } catch {
        if (pickupManuallySet.current) return;
        setPickup({ address: `${center.lat.toFixed(5)}, ${center.lng.toFixed(5)}`, lat: center.lat, lng: center.lng });
        setPickupDisplay(`${center.lat.toFixed(5)}, ${center.lng.toFixed(5)}`);
      } finally {
        setIsReversingGeocode(false);
      }
    }, 600);
  }, [viewStep, destination]);

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

  const isSameLocation = useCallback((a: PlaceData | null, b: PlaceData | null) => {
    if (!a || !b) return false;
    const sameCoords = Math.abs(a.lat - b.lat) < 0.002 && Math.abs(a.lng - b.lng) < 0.002; // ~200m
    const normA = a.address.trim().toLowerCase().replace(/[,.\s]+/g, " ");
    const normB = b.address.trim().toLowerCase().replace(/[,.\s]+/g, " ");
    const sameAddress = normA === normB || normA.includes(normB) || normB.includes(normA);
    return sameCoords || sameAddress;
  }, []);

  const handlePickupSelect = useCallback((place: PlaceData) => {
    pickupManuallySet.current = true;
    // Cancel any pending reverse geocode
    if (reverseGeocodeTimerRef.current) {
      clearTimeout(reverseGeocodeTimerRef.current);
      reverseGeocodeTimerRef.current = null;
    }
    setIsReversingGeocode(false);
    setPickup(place);
    setPickupDisplay(place.address);
  }, []);

  const handleDestinationSelect = useCallback((place: PlaceData) => {
    // Lock pickup from reverse-geocode overwriting
    pickupManuallySet.current = true;
    // Stop pending reverse-geocode updates so pickup doesn't get overwritten after destination select
    if (reverseGeocodeTimerRef.current) {
      clearTimeout(reverseGeocodeTimerRef.current);
      reverseGeocodeTimerRef.current = null;
    }
    setIsReversingGeocode(false);

    // Determine effective pickup (including auto-fallback)
    let pickupData = pickup;
    if (!pickupData) {
      pickupData = userLocation
        ? { address: "Current Location", lat: userLocation.lat, lng: userLocation.lng }
        : { address: "Current Location", lat: 40.7128, lng: -73.9857 };
    }

    // Block same-location trips unless there are intermediate stops (round trip)
    const hasStops = stopsRef.current.some(s => s.place && s.place.lat && s.place.lng);
    if (isSameLocation(pickupData, place) && !hasStops) {
      toast.error("Pickup and destination can't be the same. Add a stop for round trips.");
      return;
    }

    setDestination(place);
    setDestinationDisplay(place.address);

    if (!pickup) {
      setPickup(pickupData);
      setPickupDisplay(pickupData.address);
    }

    if (pickupData && place.lat && place.lng) {
      // Include any existing stops as waypoints — use ref to avoid stale closure
      const wp = stopsRef.current
        .filter(s => s.place && s.place.lat && s.place.lng)
        .map(s => ({ lat: s.place!.lat, lng: s.place!.lng }));
      console.log("[handleDestinationSelect] stopsRef.current:", stopsRef.current.length, "waypoints:", wp.length, JSON.stringify(wp));
      
      // Call route fetch directly to avoid stale fetchRoute closure
      setIsLoadingRoute(true);
      setRouteData(null);
      
      supabase.functions.invoke("maps-route", {
        body: {
          origin_lat: pickupData.lat,
          origin_lng: pickupData.lng,
          dest_lat: place.lat,
          dest_lng: place.lng,
          waypoints: wp.length > 0 ? wp : undefined,
        },
      }).then(({ data, error }) => {
        console.log("[handleDestinationSelect] Route response:", data?.ok, data?.distance_miles, data?.duration_minutes);
        if (!error && data?.ok) {
          setRouteData({
            distance_miles: data.distance_miles,
            duration_minutes: data.duration_minutes,
            polyline: data.polyline,
            traffic_level: data.traffic_level,
          });
        } else {
          // Fallback: haversine including waypoints
          const haversine = (lat1: number, lng1: number, lat2: number, lng2: number) => {
            const R = 6371;
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLng = (lng2 - lng1) * Math.PI / 180;
            const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
            return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          };
          // Build full path: pickup → waypoints → destination
          const points = [
            { lat: pickupData.lat, lng: pickupData.lng },
            ...wp,
            { lat: place.lat, lng: place.lng },
          ];
          let totalKm = 0;
          for (let i = 0; i < points.length - 1; i++) {
            totalKm += haversine(points[i].lat, points[i].lng, points[i+1].lat, points[i+1].lng);
          }
          const distMiles = totalKm * 0.621371;
          setRouteData({
            distance_miles: Math.round(distMiles * 10) / 10,
            duration_minutes: Math.max(5, Math.round(distMiles * 3)),
            polyline: null,
          });
        }
        setIsLoadingRoute(false);
        setSheetExpanded(false);
        setViewStep("route-preview");
      }).catch((err) => {
        console.error("[handleDestinationSelect] Route error:", err);
        setIsLoadingRoute(false);
        setViewStep("route-preview");
      });
    }
  }, [pickup, userLocation, isSameLocation]);

  /* ─── Multi-stop management ─── */
  const MAX_STOPS = 1;
  const handleAddStop = useCallback(() => {
    if (stops.length >= MAX_STOPS) {
      toast.error(`Maximum ${MAX_STOPS} stops allowed`);
      return;
    }
    setStops(prev => [...prev, { id: Date.now().toString(), place: null, display: "" }]);
  }, [stops.length]);

  // Stop management — NOT wrapped in useCallback so they always use latest state
  const handleStopSelect = (stopId: string, place: PlaceData) => {
    const updatedStops = stops.map(s => s.id === stopId ? { ...s, place, display: place.address } : s);
    setStops(updatedStops);
    
    // Immediately re-fetch route with the updated stops
    const currentPickup = pickup;
    const currentDest = destination;
    console.log("[handleStopSelect] pickup:", currentPickup?.address, "dest:", currentDest?.address, "place:", place.address);
    
    if (currentPickup && currentDest && place.lat && place.lng) {
      const wp = updatedStops
        .filter(s => s.place && s.place.lat && s.place.lng)
        .map(s => ({ lat: s.place!.lat, lng: s.place!.lng }));
      
      console.log("[handleStopSelect] Re-fetching with", wp.length, "waypoints");
      fetchRoute(currentPickup, currentDest, wp);
    } else {
      console.warn("[handleStopSelect] Missing pickup or destination, skipping route fetch");
    }
  };

  const handleRemoveStop = (stopId: string) => {
    const updatedStops = stops.filter(s => s.id !== stopId);
    setStops(updatedStops);
    
    if (pickup && destination) {
      const wp = updatedStops
        .filter(s => s.place && s.place.lat && s.place.lng)
        .map(s => ({ lat: s.place!.lat, lng: s.place!.lng }));
      fetchRoute(pickup, destination, wp);
    }
  };

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

  /* ─── Fetch route (for initial route + confirm search) ─── */
  const fetchRoute = async (from: PlaceData, to: PlaceData, stopWaypoints?: { lat: number; lng: number }[]) => {
    if (!from.lat || !to.lat) return;
    const waypoints = stopWaypoints ?? stopsRef.current
      .filter(s => s.place && s.place.lat && s.place.lng)
      .map(s => ({ lat: s.place!.lat, lng: s.place!.lng }));
    if (isSameLocation(from, to) && waypoints.length === 0) {
      toast.error("Pickup and destination can't be the same location");
      return;
    }
    setIsLoadingRoute(true);
    setRouteData(null);


    console.log("[fetchRoute] waypoints:", waypoints.length, JSON.stringify(waypoints));
    try {
      const { data, error } = await supabase.functions.invoke("maps-route", {
        body: {
          origin_lat: from.lat,
          origin_lng: from.lng,
          dest_lat: to.lat,
          dest_lng: to.lng,
          waypoints: waypoints.length > 0 ? waypoints : undefined,
        },
      });
      console.log("[fetchRoute] Response:", data?.ok, data?.distance_miles, data?.duration_minutes);
      if (error) throw error;
      if (data?.ok) {
        setRouteData({
          distance_miles: data.distance_miles,
          duration_minutes: data.duration_minutes,
          polyline: data.polyline,
          traffic_level: data.traffic_level,
        });
      } else {
        // Fallback: haversine including waypoints
        const points = [{ lat: from.lat, lng: from.lng }, ...waypoints, { lat: to.lat, lng: to.lng }];
        let totalKm = 0;
        for (let i = 0; i < points.length - 1; i++) {
          totalKm += haversineKm(points[i].lat, points[i].lng, points[i+1].lat, points[i+1].lng);
        }
        const distMiles = totalKm * 0.621371;
        setRouteData({
          distance_miles: Math.round(distMiles * 10) / 10,
          duration_minutes: Math.max(5, Math.round(distMiles * 3)),
          polyline: null,
        });
      }
    } catch (err) {
      console.error("[fetchRoute] error:", err);
      const points = [{ lat: from.lat, lng: from.lng }, ...waypoints, { lat: to.lat, lng: to.lng }];
      let totalKm = 0;
      for (let i = 0; i < points.length - 1; i++) {
        totalKm += haversineKm(points[i].lat, points[i].lng, points[i+1].lat, points[i+1].lng);
      }
      const distMiles = totalKm * 0.621371;
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
    const wp = stops.filter(s => s.place && s.place.lat && s.place.lng).map(s => ({ lat: s.place!.lat, lng: s.place!.lng }));
    if (isSameLocation(pickup, destination) && wp.length === 0) {
      toast.error("Add a stop to create a round trip, or choose a different destination");
      return;
    }
    fetchRoute(pickup, destination, wp);
  };

  /* ─── Request Ride — Create PaymentIntent + Confirm ─── */
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<"idle" | "authorizing" | "authorized" | "failed">("idle");

  const handleRequestRide = async (paymentMethodId?: string) => {
    if (!user || !pickup || !destination) {
      toast.error("Please sign in and select locations");
      return;
    }

    setIsSubmitting(true);
    setPaymentStep("authorizing");
    try {
      // Build stops metadata
      const stopsData = stops.filter(s => s.place).map((s, idx) => ({
        order: idx + 1,
        address: s.place!.address,
        lat: s.place!.lat,
        lng: s.place!.lng,
      }));

      // 1. Create ride request in DB
      const { data: rideData, error: rideError } = await supabase.from("ride_requests").insert({
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
        status: scheduledDate ? "scheduled" : "pending_payment",
        customer_name: otherName.trim() || user.user_metadata?.full_name || "",
        customer_phone: otherPhone.trim() || user.user_metadata?.phone || "",
        requires_car_seat: currentVehicle.carSeat,
        car_seat_type: currentVehicle.carSeat ? "standard" : null,
        notes: [
          stopsData.length > 0 ? `Stops: ${stopsData.map(s => s.address).join(" → ")}` : "",
          scheduledDate ? `Scheduled: ${scheduledDate.toISOString()}` : "",
          otherName.trim() ? `Rider: ${otherName.trim()}${otherPhone.trim() ? ` (${otherPhone.trim()})` : ""}` : "",
        ].filter(Boolean).join(" | ") || null,
      }).select("id").single();

      if (rideError) throw rideError;
      setRideRequestId(rideData.id);

      // 2. Create Stripe PaymentIntent (pre-authorization)
      const amountCents = Math.round(currentPrice * 100);
      const { data: piData, error: piError } = await supabase.functions.invoke("create-ride-payment-intent", {
        body: {
          ride_request_id: rideData.id,
          amount_cents: amountCents,
          ride_type: selectedVehicle,
          payment_method_id: paymentMethodId || undefined,
        },
      });

      if (piError || !piData?.ok) {
        throw new Error(piData?.error || "Failed to create payment");
      }

      // If auto-confirmed with saved card, skip to searching
      if (piData.auto_confirmed && piData.status === "requires_capture") {
        setPaymentStep("idle");
        setClientSecret(null);
        await supabase.from("ride_requests").update({ status: "searching" }).eq("id", rideData.id);
        setViewStep("searching");
        toast.success("Payment authorized! Finding your driver...");
        return;
      }

      setClientSecret(piData.client_secret);
      setPaymentStep("authorized");
    } catch (err: unknown) {
      console.error("[RideBooking] Payment error:", err);
      toast.error("Payment failed. Please try again.");
      setPaymentStep("failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  /** After Stripe confirms payment, proceed to searching */
  const handlePaymentSuccess = async () => {
    if (rideRequestId) {
      await supabase.from("ride_requests").update({ status: "searching" }).eq("id", rideRequestId);
    }
    setPaymentStep("idle");
    setClientSecret(null);
    setViewStep("searching");
    toast.success("Payment authorized! Finding your driver...");
  };

  /* ─── Reset state ─── */
  const handleReset = () => {
    if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
    pickupManuallySet.current = false;
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
    setClientSecret(null);
    setPaymentStep("idle");
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
    <div className="relative h-full safe-area-top overflow-hidden bg-background flex flex-col">

      {/* ═══════ 1. HEADER — visible on non-home steps ═══════ */}
      {viewStep !== "home" && viewStep !== "trip-complete" && (
        <div className="relative z-20 flex items-center h-14 px-4 bg-background/95 backdrop-blur-xl border-b border-border/10">
          <button
            onClick={handleBack}
            className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center hover:bg-muted/50 transition-all duration-200 active:scale-90 touch-manipulation"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="flex-1 text-center font-black text-lg tracking-tight">
            <span className="text-primary">Zivo</span> Ride
          </h1>
          <button
            onClick={() => navigate("/notifications")}
            className="w-10 h-10 -mr-2 rounded-xl flex items-center justify-center hover:bg-muted/50 transition-all duration-200 active:scale-90 touch-manipulation"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* ═══════ 2. HOME — Full-screen map with floating UI ═══════ */}
      {viewStep === "home" && (
        <>
          {/* Header for home */}
          <div className="relative z-20 flex items-center h-14 px-4 bg-background/95 backdrop-blur-xl border-b border-border/10">
            <button
              onClick={handleBack}
              className="w-10 h-10 -ml-2 rounded-xl flex items-center justify-center hover:bg-muted/50 transition-all duration-200 active:scale-90 touch-manipulation"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="flex-1 text-center font-black text-lg tracking-tight">
              <span className="text-primary">Zivo</span> Ride
            </h1>
            <button
              onClick={() => navigate("/notifications")}
              className="w-10 h-10 -mr-2 rounded-xl flex items-center justify-center hover:bg-muted/50 transition-all duration-200 active:scale-90 touch-manipulation"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Map + bottom sheet container */}
          <div className="flex-1 relative z-0 min-h-0">
            <div className="absolute inset-0">
              <MapSection
                compact
                pickupCoords={null}
                dropoffCoords={null}
                userLocation={userLocation}
                showUserLocationDot
                onLocateUser={handleLocateUser}
                routePolyline={null}
                onCenterChanged={handleMapCenterChanged}
              >
                {/* Center destination pin — ZIVO branded */}
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none" style={{ marginBottom: 80 }}>
                  <div className="flex flex-col items-center">
                    <div className="relative w-10 h-10 rounded-full bg-primary border-[3px] border-background shadow-xl flex items-center justify-center">
                      <span className="text-sm font-black text-primary-foreground leading-none">Z</span>
                    </div>
                    <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-primary -mt-[2px]" />
                    <div className="w-3 h-1 rounded-full bg-foreground/15 mt-0.5 blur-[1px]" />
                    {isReversingGeocode && (
                      <span className="mt-1.5 px-2.5 py-1 rounded-full bg-background/95 text-[10px] font-semibold text-foreground shadow-md flex items-center gap-1.5 backdrop-blur-sm border border-border/30">
                        <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        Locating...
                      </span>
                    )}
                  </div>
                </div>
              </MapSection>
            </div>


            <div
              className="absolute left-0 right-0 bottom-0 z-30 rounded-t-[28px] bg-background shadow-[0_-16px_50px_hsl(var(--foreground)/0.12)]"
            >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
            </div>

            <div className="px-5 pt-1 pb-24">
              {/* Title */}
              <div className="text-center mb-3">
                <h2 className="text-lg font-black text-foreground tracking-tight">Set your destination</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Drag map to move pin</p>
              </div>

              {/* Destination input */}
              <button
                onClick={() => setViewStep("search")}
                className="w-full flex items-center gap-3 bg-muted/15 border border-border/20 rounded-2xl px-4 py-3 transition-all duration-200 hover:bg-muted/25 hover:border-primary/20 active:scale-[0.98] group"
              >
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-black text-primary-foreground leading-none">Z</span>
                </div>
                <span className="flex-1 text-left text-sm font-medium truncate" style={{ color: destinationDisplay ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}>
                  {destinationDisplay || "Book a Ride"}
                </span>
                <Navigation className="w-4 h-4 text-primary/60 shrink-0" />
              </button>

              {/* Choose Ride button */}
              <Button
                onClick={() => {
                  const center = mapCenterRef.current;
                  if (center && destinationDisplay) {
                    const dest: PlaceData = { address: destinationDisplay, lat: center.lat, lng: center.lng };
                    setDestination(dest);
                    setPickupDisplay("Current Location");
                    const pickupData = userLocation
                      ? { address: "Current Location", lat: userLocation.lat, lng: userLocation.lng }
                      : { address: "Current Location", lat: 40.7128, lng: -73.9857 };
                    setPickup(pickupData);
                    const wp = stops.filter(s => s.place && s.place.lat && s.place.lng).map(s => ({ lat: s.place!.lat, lng: s.place!.lng }));
                    fetchRoute(pickupData, dest, wp);
                  } else {
                    setViewStep("search");
                  }
                }}
                disabled={isReversingGeocode}
                className="w-full h-14 mt-3 rounded-2xl text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/20"
                size="lg"
              >
                {isReversingGeocode ? "Locating..." : destinationDisplay ? "Choose a ride" : "Search destination"}
              </Button>
            </div>
            </div>
          </div>
        </>
      )}

      {/* ═══════ 3. MAP VIEWPORT for non-home steps ═══════ */}
      {(viewStep === "route-preview"
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
            top: HEADER_HEIGHT,
            bottom: `calc(${BOTTOM_NAV_HEIGHT}px + ${SAFE_BOTTOM})`,
          }}
        >
          <MapSection
            compact
            pickupCoords={pickup}
            dropoffCoords={["route-preview", "ride-options", "confirm-ride", "searching", "pickup-confirm", "driver-assigned", "driver-en-route", "trip-in-progress"].includes(viewStep) ? destination : null}
            stopCoords={stops.filter(s => s.place).map(s => ({ lat: s.place!.lat || 0, lng: s.place!.lng || 0 })).filter(c => c.lat !== 0 && c.lng !== 0)}
            userLocation={userLocation}
            onLocateUser={handleLocateUser}
            routePolyline={routeData?.polyline ?? null}
            driverCoords={
              (viewStep === "driver-en-route" || viewStep === "trip-in-progress") ? driverCoords : null
            }
          />
        </div>
      )}

      {/* ═══════ SEARCH — full map + draggable bottom sheet ═══════ */}
      {viewStep === "search" && (
        <>
          {/* Full-screen map behind sheet */}
          <div
            className="absolute left-0 right-0 z-0"
            style={{
              top: HEADER_HEIGHT,
              bottom: 0,
            }}
          >
            <MapSection
              compact
              pickupCoords={null}
              dropoffCoords={destination}
              userLocation={userLocation}
              showUserLocationDot={false}
              onLocateUser={handleLocateUser}
              routePolyline={null}
              onCenterChanged={handleMapCenterChanged}
            >
              {/* Center pin — positioned in visible map area (upper portion above sheet) */}
              <div className="absolute inset-x-0 top-0 z-10 flex justify-center pointer-events-none" style={{ height: '45%' }}>
                <div className="flex flex-col items-center justify-center">
                  <div className="relative">
                    <div className="absolute -inset-4 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: "2s" }} />
                      <div className="relative w-11 h-11 rounded-full bg-primary border-[3px] border-background shadow-xl flex items-center justify-center">
                        <span className="text-sm font-black text-primary-foreground leading-none">Z</span>
                    </div>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rotate-45 border-b-[3px] border-r-[3px] border-background" />
                  </div>
                  <div className="w-3 h-1.5 rounded-full bg-foreground/15 mt-2 blur-[1px]" />
                  {isReversingGeocode && (
                    <span className="mt-2 px-2.5 py-1 rounded-full bg-background/95 text-[10px] font-semibold text-foreground shadow-md flex items-center gap-1.5 backdrop-blur-sm border border-border/30">
                      <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Locating...
                    </span>
                  )}
                  {!isReversingGeocode && !pickup && (
                    <span className="mt-2 px-2.5 py-1 rounded-full bg-background/95 text-[10px] font-semibold text-foreground shadow-md backdrop-blur-sm border border-border/30">
                      Move map to set pickup
                    </span>
                  )}
                </div>
              </div>
            </MapSection>
          </div>

          {/* Draggable bottom sheet */}
          <motion.div
            className="absolute left-0 right-0 z-40 bg-background rounded-t-[32px] shadow-[0_-12px_40px_hsl(var(--foreground)/0.1)] flex flex-col"
            style={{
              top: HEADER_HEIGHT,
              bottom: 0,
            }}
            initial={false}
            animate={{
              y: searchSheetY < -10
                ? 10 // full — just below header
                : searchSheetY > 10
                  ? viewportHeight - HEADER_HEIGHT - BOTTOM_NAV_HEIGHT - 90 // peek — just handle visible above nav
                  : Math.round((viewportHeight - HEADER_HEIGHT) * 0.38) // half — default
            }}
            drag="y"
            dragConstraints={{
              top: 10,
              bottom: viewportHeight - HEADER_HEIGHT - BOTTOM_NAV_HEIGHT - 90,
            }}
            dragElastic={0.1}
            onDragEnd={(_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
              const fullY = 10;
              const halfY = Math.round((viewportHeight - HEADER_HEIGHT) * 0.38);
              const peekY = viewportHeight - HEADER_HEIGHT - BOTTOM_NAV_HEIGHT - 90;
              const projected = (searchSheetY < -10 ? fullY : searchSheetY > 10 ? peekY : halfY) + info.offset.y;
              const mid1 = (fullY + halfY) / 2;
              const mid2 = (halfY + peekY) / 2;
              if (projected < mid1) {
                setSearchSheetY(-20); // full
              } else if (projected > mid2) {
                setSearchSheetY(20); // peek
              } else {
                setSearchSheetY(0); // half
              }
            }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/25" />
            </div>

            <div className="flex-1 overflow-hidden px-5 pt-2 pb-20">
              <h2 className="text-lg font-black text-foreground mb-4 tracking-tight">Where to?</h2>

              {/* Address inputs with ZIVO-style connector */}
              <div className="rounded-2xl bg-muted/10 border border-border/20 p-3.5">
                <div className="flex items-center gap-3">
                  {/* Pickup/Stops/Dropoff indicator dots + dotted lines */}
                  <div className="flex flex-col items-center py-2">
                    {/* Pickup Z marker */}
                    <div className="relative">
                      <div className="absolute -inset-1 rounded-full bg-primary/20 animate-pulse" />
                      <div className="relative w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-[9px] font-black text-primary-foreground leading-none">Z</span>
                      </div>
                    </div>
                    {/* Lines + S markers for each stop */}
                    {stops.map((stop) => (
                      <div key={stop.id} className="flex flex-col items-center">
                        <div className="w-px flex-1 min-h-[28px] border-l-[2px] border-dashed border-muted-foreground/25 my-1" />
                        <div className="w-5 h-5 rounded-full bg-muted-foreground/60 flex items-center justify-center">
                          <span className="text-[9px] font-black text-background leading-none">S</span>
                        </div>
                      </div>
                    ))}
                    {/* Line to destination E marker */}
                    <div className="w-px flex-1 min-h-[28px] border-l-[2px] border-dashed border-muted-foreground/25 my-1" />
                    <div className="w-5 h-5 rounded-sm bg-foreground flex items-center justify-center">
                      <span className="text-[9px] font-black text-background leading-none">E</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <AddressAutocomplete
                      placeholder="Pickup location"
                      value={pickupDisplay}
                      onSelect={handlePickupSelect}
                      className="[&_input]:h-11 [&_input]:rounded-xl [&_input]:text-sm [&_input]:font-semibold [&_input]:bg-card [&_input]:border-0"
                    />
                    {/* Stop inputs */}
                    {stops.map((stop, idx) => (
                      <div key={stop.id} className="relative">
                        <AddressAutocomplete
                          placeholder={`Stop ${idx + 1}`}
                          value={stop.display}
                          onSelect={(place) => handleStopSelect(stop.id, place)}
                          proximity={pickup ? { lat: pickup.lat, lng: pickup.lng } : undefined}
                          className="[&_input]:h-11 [&_input]:rounded-xl [&_input]:text-sm [&_input]:font-semibold [&_input]:bg-card [&_input]:border-0 [&_input]:pr-8"
                        />
                        <button
                          onClick={() => handleRemoveStop(stop.id)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center hover:bg-destructive/20 transition-colors z-10"
                        >
                          <X className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
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
              <div className="flex gap-2 mt-5 pb-1 flex-wrap">
                <button
                  onClick={handleAddStop}
                  disabled={stops.length >= MAX_STOPS}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border/30 text-[13px] font-semibold text-foreground whitespace-nowrap hover:border-primary/40 hover:shadow-sm active:scale-95 transition-all duration-200",
                    stops.length >= MAX_STOPS && "opacity-40 pointer-events-none"
                  )}
                >
                  <div className="w-5 h-5 rounded-full bg-muted/30 flex items-center justify-center">
                    <Plus className="w-3 h-3" />
                  </div>
                  Add Stop
                </button>
                <button
                  onClick={() => { setShowSchedule(!showSchedule); setShowPickupOther(false); }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-full border text-[13px] font-semibold whitespace-nowrap active:scale-95 transition-all duration-200",
                    showSchedule
                      ? "bg-primary/10 border-primary/40 text-primary shadow-sm shadow-primary/10"
                      : "bg-card border-border/30 text-foreground hover:border-primary/40 hover:shadow-sm"
                  )}
                >
                  <div className={cn("w-5 h-5 rounded-full flex items-center justify-center", showSchedule ? "bg-primary/20" : "bg-muted/30")}>
                    <CalendarClock className="w-3 h-3" />
                  </div>
                  {scheduledDate ? `${scheduledDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${scheduleHour % 12 || 12}:${scheduleMinute.toString().padStart(2, "0")} ${scheduleHour >= 12 ? "PM" : "AM"}` : "Schedule"}
                </button>
                <button
                  onClick={() => { setShowPickupOther(!showPickupOther); setShowSchedule(false); }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-full border text-[13px] font-semibold whitespace-nowrap active:scale-95 transition-all duration-200",
                    showPickupOther
                      ? "bg-primary/10 border-primary/40 text-primary shadow-sm shadow-primary/10"
                      : "bg-card border-border/30 text-foreground hover:border-primary/40 hover:shadow-sm"
                  )}
                >
                  <div className={cn("w-5 h-5 rounded-full flex items-center justify-center", showPickupOther ? "bg-primary/20" : "bg-muted/30")}>
                    <Users className="w-3 h-3" />
                  </div>
                  {otherName ? otherName.split(" ")[0] : "Pick up other"}
                </button>
              </div>

              {/* Schedule inline panel */}
              <AnimatePresence>
                {showSchedule && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 rounded-2xl bg-muted/15 border border-border/30 p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-foreground">Schedule ride</p>
                        <button
                          onClick={() => setShowSchedule(false)}
                          className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <X className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </div>
                      {/* 2026 Scroll wheel date picker */}
                      <DateScrollWheelPicker
                        selectedDate={scheduledDate ?? new Date()}
                        onDateChange={(d) => setScheduledDate(d)}
                        compact
                      />
                      {/* 2026 Scroll wheel time picker */}
                      {(() => {
                        const wheelHours = Array.from({ length: 12 }, (_, i) => i + 1);
                        const wheelMinutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
                        const currentAmPm = scheduleHour >= 12 ? "PM" : "AM";
                        const display12 = scheduleHour % 12 || 12;
                        const hourIdx = wheelHours.indexOf(display12);
                        const minIdx = wheelMinutes.indexOf(scheduleMinute);
                        
                        return (
                          <ScrollWheelPicker
                            hideDays
                            hours={wheelHours}
                            selectedHourIdx={hourIdx >= 0 ? hourIdx : 0}
                            onHourChange={(i) => {
                              const h12 = wheelHours[i];
                              const isPM = scheduleHour >= 12;
                              if (isPM) setScheduleHour(h12 === 12 ? 12 : h12 + 12);
                              else setScheduleHour(h12 === 12 ? 0 : h12);
                            }}
                            minutes={wheelMinutes}
                            selectedMinIdx={minIdx >= 0 ? minIdx : 0}
                            onMinChange={(i) => setScheduleMinute(wheelMinutes[i])}
                            amPm={currentAmPm as "AM" | "PM"}
                            onAmPmChange={(val) => {
                              const h12 = scheduleHour % 12;
                              setScheduleHour(val === "PM" ? h12 + 12 : h12);
                            }}
                            compact
                          />
                        );
                      })()}
                      <Button
                        className="w-full h-11 rounded-xl text-sm font-bold"
                        disabled={!scheduledDate}
                        onClick={() => {
                          if (scheduledDate) {
                            const d = new Date(scheduledDate);
                            d.setHours(scheduleHour, scheduleMinute);
                            setScheduledDate(d);
                            setShowSchedule(false);
                            toast.success(`Ride scheduled for ${d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at ${scheduleHour % 12 || 12}:${scheduleMinute.toString().padStart(2, "0")} ${scheduleHour >= 12 ? "PM" : "AM"}`);
                          }
                        }}
                      >
                        <CalendarClock className="w-4 h-4 mr-1.5" />
                        Set schedule
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pick up other inline panel */}
              <AnimatePresence>
                {showPickupOther && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 rounded-2xl bg-muted/15 border border-border/30 p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-foreground">Someone else is riding</p>
                        <button
                          onClick={() => setShowPickupOther(false)}
                          className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <X className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] text-muted-foreground mb-1 block">Rider's name</label>
                          <input
                            type="text"
                            value={otherName}
                            onChange={(e) => setOtherName(e.target.value.slice(0, 100))}
                            placeholder="Full name"
                            className="w-full h-11 rounded-xl bg-card border border-border/30 px-3 text-sm font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground mb-1 block">Phone number</label>
                          <input
                            type="tel"
                            value={otherPhone}
                            onChange={(e) => setOtherPhone(e.target.value.replace(/[^0-9+\-() ]/g, "").slice(0, 20))}
                            placeholder="+1 (555) 123-4567"
                            className="w-full h-11 rounded-xl bg-card border border-border/30 px-3 text-sm font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </div>
                      </div>
                      <Button
                        className="w-full h-11 rounded-xl text-sm font-bold"
                        disabled={!otherName.trim()}
                        onClick={() => {
                          setShowPickupOther(false);
                          toast.success(`Ride for ${otherName.trim().split(" ")[0]} confirmed`);
                        }}
                      >
                        <Users className="w-4 h-4 mr-1.5" />
                        Confirm rider
                      </Button>
                      <p className="text-[10px] text-muted-foreground text-center">
                        Driver will contact this person for pickup
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Saved & Recent list */}
              <div className="pt-5 space-y-5">
                {/* Saved Places */}
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Star className="w-3 h-3 text-primary/60" />
                    Saved Places
                  </p>
                  <div className="space-y-1">
                    {savedPlaces.length > 0 ? savedPlaces.map((place) => {
                      const Icon = place.icon;
                      return (
                        <button
                          key={place.id}
                          onClick={() => handleSavedPlace(place.address)}
                          className="w-full flex items-center gap-3.5 px-3 py-3 text-left rounded-2xl hover:bg-card transition-all duration-200 active:scale-[0.98] group"
                        >
                          <div className="w-11 h-11 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                            <Icon className="w-[18px] h-[18px] text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-bold text-foreground">{place.name}</p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{place.address}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0 group-hover:text-primary/60 transition-colors" />
                        </button>
                      );
                    }) : (
                      <button
                        onClick={() => toast.info("Save a location from your profile")}
                        className="w-full flex items-center gap-3.5 px-3 py-3 text-left rounded-2xl hover:bg-card transition-all duration-200 group"
                      >
                        <div className="w-11 h-11 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 border border-dashed border-primary/20 group-hover:border-primary/40 transition-colors">
                          <Plus className="w-4 h-4 text-primary/50 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-muted-foreground">Add a saved place</p>
                          <p className="text-xs text-muted-foreground/50">Home, work, gym...</p>
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                {/* Recent */}
                {recentDestinations.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-muted-foreground/60" />
                      Recent
                    </p>
                    <div className="space-y-1">
                      {recentDestinations.map((dest) => (
                        <button
                          key={dest.id}
                          onClick={() => {
                            setDestinationDisplay(dest.address.split(",")[0]);
                            setDestination({ address: dest.address, lat: 40.758, lng: -73.9855 });
                          }}
                          className="w-full flex items-center gap-3.5 px-3 py-3 text-left rounded-2xl hover:bg-card transition-all duration-200 active:scale-[0.98] group"
                        >
                          <div className="w-11 h-11 rounded-2xl bg-muted/15 border border-border/20 flex items-center justify-center shrink-0 group-hover:bg-muted/25 transition-colors">
                            <History className="w-[18px] h-[18px] text-muted-foreground/70" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-medium text-foreground truncate">{dest.address}</p>
                            <p className="text-xs text-muted-foreground/60 mt-0.5">{dest.time}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground/30 shrink-0 group-hover:text-muted-foreground/60 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {pickup && destination && (
              <div className="px-4 pt-2 shrink-0 bg-background border-t border-border/10" style={{ paddingBottom: `calc(${BOTTOM_NAV_HEIGHT}px + ${SAFE_BOTTOM} + 12px)` }}>
                <Button
                  className="w-full h-14 rounded-2xl text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/20"
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
          initial={{ height: COLLAPSED_SHEET_HEIGHT, y: 0 }}
          animate={{ height: COLLAPSED_SHEET_HEIGHT, y: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 34 }}
          className="absolute left-0 right-0 z-[100] rounded-t-[28px] bg-background shadow-[0_-8px_30px_hsl(var(--foreground)/0.15)] flex flex-col overflow-hidden border-t border-border/20"
          style={{
            bottom: 0,
            height: COLLAPSED_SHEET_HEIGHT,
            touchAction: "none",
          }}
        >
          <div className="mx-auto mt-2 h-1.5 w-14 rounded-full bg-muted-foreground/25 cursor-grab active:cursor-grabbing shrink-0" />

          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Route info */}
            <div className="px-5 pt-3 pb-2 shrink-0">
                <div className="flex items-start gap-3 mb-2">
                  <div className="flex flex-col items-center mt-0.5">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center ring-2 ring-primary/20">
                      <span className="text-[11px] font-black text-primary-foreground leading-none">Z</span>
                    </div>
                    {stops.map((stop) => (
                      <div key={stop.id} className="flex flex-col items-center">
                        <div className="w-px flex-1 min-h-[14px] border-l-[2px] border-dashed border-muted-foreground/30 my-0.5" />
                        <div className="w-5 h-5 rounded-full bg-muted-foreground/60 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-background leading-none">S</span>
                        </div>
                      </div>
                    ))}
                    <div className="w-px flex-1 min-h-[20px] border-l-[2px] border-dashed border-muted-foreground/30 my-0.5" />
                    <div className="w-6 h-6 rounded-sm bg-foreground flex items-center justify-center">
                      <span className="text-[11px] font-black text-background leading-none">D</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div>
                      <p className="text-[10px] text-muted-foreground leading-none mb-0.5">Pickup</p>
                      <p className="text-sm font-semibold text-foreground leading-tight whitespace-normal break-words">{pickup?.address || pickupDisplay}</p>
                    </div>
                    {stops.map((stop, idx) => (
                      <div key={stop.id}>
                        <p className="text-[10px] text-muted-foreground leading-none mb-0.5">Stop {idx + 1}</p>
                        {stop.place?.address ? (
                          <p className="text-xs font-medium text-foreground truncate leading-tight">{stop.place.address}</p>
                        ) : (
                          <div className="relative">
                            <AddressAutocomplete
                              placeholder={`Enter stop ${idx + 1} address`}
                              value={stop.display}
                              onSelect={(place) => handleStopSelect(stop.id, place)}
                              proximity={pickup ? { lat: pickup.lat, lng: pickup.lng } : undefined}
                              className="[&_input]:h-8 [&_input]:rounded-lg [&_input]:text-xs [&_input]:font-medium [&_input]:bg-muted/30 [&_input]:border-border/30 [&_input]:px-2"
                            />
                            <button
                              onClick={() => handleRemoveStop(stop.id)}
                              className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted/50"
                            >
                              <X className="w-3 h-3 text-muted-foreground" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    <div>
                      <p className="text-[10px] text-muted-foreground leading-none mb-0.5">Destination</p>
                      <p className="text-sm font-semibold text-foreground leading-tight whitespace-normal break-words">{destination?.address || destinationDisplay}</p>
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

              {/* Add Stop button */}
              <div className="px-5 pt-1 pb-1 shrink-0">
                <button
                  onClick={handleAddStop}
                  disabled={stops.length >= MAX_STOPS}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                    stops.length >= MAX_STOPS
                      ? "text-muted-foreground/40 cursor-not-allowed"
                      : "text-primary hover:bg-primary/10 active:scale-[0.98]"
                  )}
                >
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus className="w-3 h-3" />
                  </div>
                  Add Stop
                </button>
              </div>
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
                    className="w-full h-14 rounded-2xl text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/20"
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
                    className="w-full h-12 rounded-2xl text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90"
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
          className="absolute left-0 right-0 z-40 bg-background flex flex-col"
          style={{ top: HEADER_HEIGHT, bottom: `calc(${BOTTOM_NAV_HEIGHT}px + ${SAFE_BOTTOM})` }}
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
            <h2 className="text-xl font-black text-foreground tracking-tight">Choose a ride</h2>
            {/* Promo badge */}
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold text-primary">15% promo applied</span>
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-1.5 px-5 pb-3 shrink-0">
            {(["popular", "premium", "accessible"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setRideCategory(cat)}
                className={cn(
                  "px-5 py-2 rounded-full text-[13px] font-bold transition-all duration-200 active:scale-95",
                  rideCategory === cat
                    ? "bg-foreground text-background shadow-md"
                    : "bg-card border border-border/30 text-muted-foreground hover:text-foreground hover:border-border/60"
                )}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-border/15 mx-5" />

          {/* Vehicle list — scrollable */}
          <div className="flex-1 overflow-y-auto px-1">
            {filteredVehiclesByCategory.map((v, index) => {
              const isSelected = selectedVehicle === v.id;
              const price = calcPrice(v, routeData?.distance_miles ?? 0, routeData?.duration_minutes ?? 0);
              const isDiscount = v.surgeMultiplier < 1;
              const originalPrice = isDiscount ? calcPrice({ ...v, surgeMultiplier: 1.0 }, routeData?.distance_miles ?? 0, routeData?.duration_minutes ?? 0) : null;

              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVehicle(v.id)}
                  className={cn(
                    "w-full flex items-center gap-3.5 px-4 py-4 text-left transition-all duration-200 active:scale-[0.98] relative",
                    isSelected
                      ? "bg-primary/5"
                      : "hover:bg-muted/8",
                    index < filteredVehiclesByCategory.length - 1 && "border-b border-border/8"
                  )}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-primary" />
                  )}

                  {/* Vehicle image */}
                  <div className="w-[68px] shrink-0 flex items-center justify-center">
                    <img
                      src={VEHICLE_IMAGES[v.id] ?? "/vehicles/economy-car.svg"}
                      alt={v.name}
                      className={cn("w-[68px] h-auto transition-transform duration-200", isSelected && "scale-105")}
                    />
                  </div>

                  {/* Center: Name + meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={cn("text-[14px] font-bold", isSelected ? "text-foreground" : "text-foreground")}>{v.name}</span>
                      {v.id === "economy" && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-bold">
                          <TrendingDown className="w-3 h-3" />LOW
                        </span>
                      )}
                      {v.id === "share" && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold">
                          <Users className="w-3 h-3" />SAVE
                        </span>
                      )}
                      {v.id === "comfort" && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[10px] font-bold">
                          <Sparkles className="w-3 h-3" />TOP
                        </span>
                      )}
                      {v.id === "ev" && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                          <Zap className="w-3 h-3" />EV
                        </span>
                      )}
                      {v.id === "xl" && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-bold">
                          <Users className="w-3 h-3" />5+
                        </span>
                      )}
                      {v.id === "black-lane" && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                          <Crown className="w-3 h-3" />VIP
                        </span>
                      )}
                      {v.id === "black-xl" && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-muted/30 text-muted-foreground text-[10px] font-bold">
                          <Shield className="w-3 h-3" />PREMIUM
                        </span>
                      )}
                      {v.id === "luxury-xl" && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                          <Gem className="w-3 h-3" />ELITE
                        </span>
                      )}
                      {v.id === "pet" && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-pink-500/10 text-pink-600 dark:text-pink-400 text-[10px] font-bold">
                          <PawPrint className="w-3 h-3" />PET
                        </span>
                      )}
                      {v.id === "wheelchair" && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                          <Accessibility className="w-3 h-3" />WAV
                        </span>
                      )}
                      <div className="flex items-center gap-0.5 text-muted-foreground/60">
                        <User className="w-3 h-3" />
                        <span className="text-[11px]">{v.capacity}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-snug">
                      {etaTime(v.etaMin)} · {v.desc}
                    </p>
                  </div>

                  {/* Right: Price + check */}
                  <div className="shrink-0 text-right flex flex-col items-end gap-1">
                    {isDiscount && originalPrice ? (
                      <>
                        <span className="text-[11px] text-muted-foreground line-through">${originalPrice.toFixed(2)}</span>
                        <span className="text-[15px] font-bold text-primary flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                          ${price.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-[15px] font-bold text-foreground">${price.toFixed(2)}</span>
                    )}
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <CheckCircle className="w-3.5 h-3.5 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Payment row */}
          <div className="shrink-0 border-t border-border/15">
            <button className="w-full flex items-center gap-3.5 px-5 py-3.5 hover:bg-muted/8 transition-colors active:scale-[0.98]">
              <div className="w-10 h-10 rounded-xl bg-muted/20 border border-border/20 flex items-center justify-center">
                <CreditCard className="w-[18px] h-[18px] text-muted-foreground" />
              </div>
              <span className="flex-1 text-[14px] text-foreground font-semibold text-left">Visa •••• 4242</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
            </button>
          </div>

          {/* Confirm button */}
          <div className="shrink-0 px-5 pt-1" style={{ paddingBottom: `calc(16px + ${SAFE_BOTTOM})` }}>
            <Button
              className="w-full h-14 rounded-2xl text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-[0.97] transition-all duration-200"
              onClick={() => setViewStep("confirm-ride")}
            >
              Confirm {currentVehicle.name} · ${currentPrice.toFixed(2)}
            </Button>
          </div>
        </div>
      )}

      {/* ═══════ CONFIRM RIDE — with real Stripe payment ═══════ */}
      {viewStep === "confirm-ride" && (
        <div
          className="absolute left-0 right-0 z-40 bg-background flex flex-col overflow-hidden"
          style={{ top: HEADER_HEIGHT, bottom: `calc(${BOTTOM_NAV_HEIGHT}px + ${SAFE_BOTTOM})` }}
        >
          <div className="px-5 pt-5 pb-2 shrink-0">
            <h2 className="text-xl font-black text-foreground tracking-tight">Confirm your ride</h2>
          </div>

          <div className="px-5 pb-4 space-y-4 flex-1 overflow-hidden flex flex-col">
            {/* Route card */}
            <div className="rounded-2xl bg-card border border-border/20 p-4">
              <div className="flex items-start gap-3.5">
                <div className="flex flex-col items-center mt-1">
                  <div className="w-3 h-3 rounded-full bg-primary ring-[3px] ring-primary/15" />
                  <div className="w-px flex-1 min-h-[28px] border-l-[2px] border-dashed border-muted-foreground/25 my-1" />
                  <div className="w-3 h-3 rounded-sm bg-foreground ring-[3px] ring-foreground/10" />
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Pickup</p>
                    <p className="text-[14px] font-bold text-foreground leading-snug">{pickup?.address || pickupDisplay}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Dropoff</p>
                    <p className="text-[14px] font-bold text-foreground leading-snug">{destination?.address || destinationDisplay}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle summary card */}
            <div className="rounded-2xl bg-card border border-border/20 p-4">
              <div className="flex items-center gap-4">
                <div className="w-[72px] h-[52px] flex items-center justify-center shrink-0 bg-muted/10 rounded-xl">
                  <img src={VEHICLE_IMAGES[selectedVehicle] || VEHICLE_IMAGES["economy"]} alt={currentVehicle.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-foreground">{currentVehicle.name} · {currentVehicle.capacity} seats</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{currentVehicle.etaMin} min away · {currentVehicle.desc}</p>
                </div>
                <p className="text-xl font-black text-foreground tabular-nums">${currentPrice.toFixed(2)}</p>
              </div>
            </div>

            {/* Route info pills */}
            {routeData && (
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-card border border-border/20 px-3 py-2.5">
                  <Timer className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">{routeData.duration_minutes} min</span>
                </div>
                <div className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-card border border-border/20 px-3 py-2.5">
                  <Route className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">{routeData.distance_miles} mi</span>
                </div>
                {routeData.traffic_level && (
                  <div className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-card border border-border/20 px-3 py-2.5">
                    <Car className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-foreground capitalize">{routeData.traffic_level}</span>
                  </div>
                )}
              </div>
            )}

            {/* Payment Section */}
            <RidePaymentSection
              price={currentPrice}
              vehicleName={currentVehicle.name}
              isSubmitting={isSubmitting}
              onAuthorizeWithSavedCard={(pmId) => handleRequestRide(pmId)}
              onAuthorizeWithNewCard={() => handleRequestRide()}
              clientSecret={clientSecret}
              onPaymentSuccess={handlePaymentSuccess}
              paymentFailed={paymentStep === "failed"}
            />
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
            onClick={() => handleRequestRide()}
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
