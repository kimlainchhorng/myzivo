/**
 * ZIVO Rides — Uber-Style Booking Page
 * Full-height map with draggable bottom sheet
 * Mobile-first, no scroll required
 */

import { useState, useEffect, useCallback, useMemo, useLayoutEffect, useRef } from "react";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { 
  MapPin, Navigation, Clock, Shield, Star, CheckCircle2,
  ChevronRight, ChevronLeft, Phone, Mail, User, CreditCard, Loader2, LocateFixed,
  Leaf, Zap, Briefcase, Crown, Anchor, Dog, CarFront, UserRound, Search, Plus, X, Receipt,
  ChevronUp, ChevronDown, CalendarDays, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { useIsMobile } from "@/hooks/useMobileSettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useGoogleMaps } from "@/components/maps/GoogleMapProvider";
import GoogleMap, { MapMarker, MapRoute } from "@/components/maps/GoogleMap";

import { useServerRoute, ServerRouteData } from "@/hooks/useServerRoute";
import { useGoogleMapsGeocode, Suggestion } from "@/hooks/useGoogleMapsGeocode";
import { getPlaceDetails } from "@/services/mapsApi";
import { decodePolyline } from "@/services/googleMaps";
import RideEmbeddedCheckout from "@/components/ride/RideEmbeddedCheckout";
import { ZivoRideRow } from "@/components/ride/ZivoRideRow";
import { useRidePricingSettings, DEFAULT_RIDE_PRICING } from "@/hooks/useRidePricingSettings";
import { usePricingZone, DEFAULT_US_ZONE } from "@/hooks/usePricingZone";
import { useAllZoneRatesMap, DEFAULT_ZONE_RATES, type ZonePricingRate } from "@/hooks/useZonePricingRates";
import { useZoneSurgePricing } from "@/hooks/useZoneSurgePricing";
import { RIDE_TYPE_MULTIPLIERS } from "@/lib/pricing";
import { 
  quoteRidePrice, 
  validateRouteData, 
  formatCurrency, 
  type RidePriceQuote,
  type PriceQuoteSettings 
} from "@/lib/pricing";
import { PricingDebugPanel } from "@/components/ride/PricingDebugPanel";
import { LiveDriverIndicator } from "@/components/ride/LiveDriverIndicator";
import { SurgeBanner } from "@/components/ride/SurgeBanner";
import { PromoCodeInput } from "@/components/ride/PromoCodeInput";
import { RidePriceBreakdownWithPromo } from "@/components/ride/RidePriceBreakdownWithPromo";
import { useRidePromoValidation, ValidatedRidePromo } from "@/hooks/useRidePromoValidation";
import { useDriverAvailability } from "@/hooks/useLiveDriverTracking";
import { ScheduleRideSheet } from "@/components/schedule/ScheduleRideSheet";
import { useCreateScheduledBooking } from "@/hooks/useScheduledBookings";

type RideStep = "request" | "options" | "confirm" | "checkout" | "processing" | "success";
type RideTag = "wait_save" | "priority" | "green" | "standard" | "lux";

interface RideOption {
  id: string;
  name: string;
  image: string;
  price: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
  multiplier?: number;
  seats?: number;
  subtitle?: string;
  eta?: number;
  tag?: RideTag;
}

// RideImage and TagPill components moved to UberLikeRideRow.tsx

type CategoryKey = "Economy" | "Premium" | "Elite";

// Vehicle options (multipliers are now in RIDE_TYPE_MULTIPLIERS in pricing.ts)
const rideCategories: Record<CategoryKey, RideOption[]> = {
  Economy: [
    { id: "wait_save", name: "Wait & Save", desc: "Lowest price, longer wait.", price: "", time: "15 min", eta: 15, icon: Clock, image: "", seats: 4, tag: "wait_save" },
    { id: "standard", name: "Standard", desc: "Reliable everyday rides.", price: "", time: "4 min", eta: 4, icon: Navigation, image: "", seats: 4, tag: "standard" },
    { id: "green", name: "Green", desc: "EVs & Hybrids.", price: "", time: "6 min", eta: 6, icon: Leaf, image: "", seats: 4, tag: "green" },
    { id: "priority", name: "Priority", desc: "Faster pickup.", price: "", time: "1 min", eta: 1, icon: Zap, image: "", seats: 4, tag: "priority" },
    { id: "pet", name: "Pet", desc: "Pet-friendly rides.", price: "", time: "8 min", eta: 8, icon: Dog, image: "", seats: 4 }
  ],
  Premium: [
    { id: "comfort", name: "Extra Comfort", desc: "Newer cars, more legroom.", subtitle: "Leather seats, quiet ride", price: "", time: "5 min", eta: 5, icon: Star, image: "", seats: 4 },
    { id: "black", name: "ZIVO Black", desc: "Premium leather sedans.", subtitle: "Professional chauffeur", price: "", time: "8 min", eta: 8, icon: Briefcase, image: "", seats: 4 },
    { id: "black_suv", name: "Black SUV", desc: "Luxury for 6.", subtitle: "Spacious, premium SUV", price: "", time: "10 min", eta: 10, icon: Shield, image: "", seats: 6 },
    { id: "xxl", name: "XXL", desc: "Max luggage space.", subtitle: "Extra cargo capacity", price: "", time: "12 min", eta: 12, icon: Anchor, image: "", seats: 6 }
  ],
  Elite: [
    { id: "lux", name: "ZIVO Lux", desc: "Rolls-Royce / Bentley.", subtitle: "Ultra-luxury, white-glove service", price: "", time: "20 min", eta: 20, icon: Crown, image: "", seats: 4, tag: "lux" },
    { id: "sprinter", name: "Executive Sprinter", desc: "Jet van for 12.", subtitle: "Private jet-style van", price: "", time: "45 min", eta: 45, icon: Briefcase, image: "", seats: 12 },
    { id: "secure", name: "Secure Transit", desc: "Armored transport.", subtitle: "Armored, discreet travel", price: "", time: "60 min", eta: 60, icon: Shield, image: "", seats: 4 }
  ]
};

const getPickupTime = (etaMinutes: number) => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + etaMinutes);
  return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

// Fare calculation now uses DB-driven pricing via useRidePricingSettings hook
// See calculateUnifiedRideFare in src/lib/pricing.ts

// Map View Component
function RidesMapView({ 
  userLocation,
  pickupCoords,
  dropoffCoords,
  pickup,
  dropoff,
  etaMinutes,
  routeData,
  onPickupClick,
  onDropoffClick,
  onLocateMe
}: {
  userLocation: { lat: number; lng: number } | null;
  pickupCoords?: { lat: number; lng: number } | null;
  dropoffCoords?: { lat: number; lng: number } | null;
  pickup: string;
  dropoff: string;
  etaMinutes?: number;
  routeData?: ServerRouteData | null;
  onPickupClick?: () => void;
  onDropoffClick?: () => void;
  onLocateMe?: () => void;
}) {
  const { isLoaded, loadError } = useGoogleMaps();
  const center = pickupCoords || userLocation || { lat: 30.4515, lng: -91.1871 };
  
  // Decode route polyline for map display
  const routePath = useMemo(() => {
    if (routeData?.polyline) {
      // decodePolyline returns [lng, lat] pairs, convert to LatLngLiteral
      return decodePolyline(routeData.polyline).map(([lng, lat]) => ({ lat, lng }));
    }
    return undefined;
  }, [routeData?.polyline]);

  const route: MapRoute | undefined = pickupCoords && dropoffCoords ? {
    origin: pickupCoords,
    destination: dropoffCoords,
    color: "#3b82f6",
  } : undefined;

  // Show loading state while Maps is loading
  const showLoading = !isLoaded && !loadError;
  
  // Show fallback only if there's an actual error
  const showFallback = !!loadError;

  return (
    <div className="relative w-full h-full bg-[#e5e3df]">
      {showLoading || showFallback ? (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-emerald-950 to-zinc-900">
          {/* Subtle map-like pattern */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0.5) 41px),
              repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0.5) 41px)`
          }} />
          {/* Radial glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl" />
          
          {/* Pulsing location dot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/15 animate-ping-slow absolute" />
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 absolute" />
              <div className="w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-lg relative z-10" />
            </div>
          </div>

          <div className="absolute bottom-4 inset-x-0 flex flex-col items-center gap-1">
            {showLoading && <Loader2 className="w-4 h-4 text-white/30 animate-spin" />}
            <span className="text-xs text-white/40">
              {showFallback ? "Map unavailable" : showLoading ? "Loading map…" : ""}
            </span>
          </div>
        </div>
      ) : (
        // Google Map with ZIVO light theme (Uber-inspired)
        <>
          <GoogleMap
            className="w-full h-full"
            center={center}
            pickup={pickupCoords || userLocation || center}
            dropoff={dropoffCoords || undefined}
            zoom={pickupCoords && dropoffCoords ? 12 : 15}
            markers={[]}
            route={route}
            routePath={routePath}
            fitBounds={!!(pickupCoords && dropoffCoords)}
            showControls={false}
            darkMode={false}
          />
          {/* Subtle light vignette */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.03)_100%)]" />
        </>
      )}
      
      {/* Floating Pickup Card - Top Right - ZIVO Brand */}
      {pickup && (
        <button
          onClick={onPickupClick}
          className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-[#FFFBF5] rounded-xl shadow-lg border border-emerald-100 px-3 py-2.5 text-left max-w-[280px] touch-manipulation active:scale-[0.98] transition-transform"
        >
          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white px-2 py-1.5 rounded-lg text-[10px] font-bold leading-none flex-shrink-0 text-center min-w-[40px]">
            <div>{etaMinutes ? `${etaMinutes}-${etaMinutes + 10}` : "5-10"}</div>
            <div className="text-[8px] font-medium text-white/70">MIN</div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-zinc-800 truncate">{pickup.split(',')[0]}</div>
            {pickup.split(',').length > 1 && (
              <div className="text-xs text-zinc-500 truncate">{pickup.split(',').slice(1, 2).join(',').trim()}</div>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        </button>
      )}
      
      {/* Floating Dropoff Card - Bottom Right - ZIVO Brand */}
      {dropoff && (
        <button
          onClick={onDropoffClick}
          className="absolute bottom-16 right-4 z-10 flex items-center gap-2 bg-[#FFFBF5] rounded-xl shadow-lg border border-emerald-100 px-3 py-2.5 text-left max-w-[280px] touch-manipulation active:scale-[0.98] transition-transform"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <div className="w-2.5 h-2.5 bg-white rounded-full" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-zinc-800 truncate">{dropoff.split(',')[0]}</div>
            {dropoff.split(',').length > 1 && (
              <div className="text-xs text-zinc-500 truncate">{dropoff.split(',').slice(1, 2).join(',').trim()}</div>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-teal-500 flex-shrink-0" />
        </button>
      )}

      {/* Current location button */}
      <div className="absolute bottom-4 right-4 z-10">
        <button 
          onClick={onLocateMe}
          className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center touch-manipulation active:scale-95 transition-transform"
        >
          <LocateFixed className="w-5 h-5 text-zinc-700" />
        </button>
      </div>
    </div>
  );
}

// Main Page Component
function RidesInner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getCurrentLocation, reverseGeocode, isGettingLocation } = useCurrentLocation();
  const isMobile = useIsMobile();
  const { routeData, fetchRoute, clearRoute } = useServerRoute();
  const { suggestions: pickupSuggestions, fetchSuggestions: fetchPickupSuggestions, clearSuggestions: clearPickupSuggestions } = useGoogleMapsGeocode();
  const { suggestions: dropoffSuggestions, fetchSuggestions: fetchDropoffSuggestions, clearSuggestions: clearDropoffSuggestions } = useGoogleMapsGeocode();
  
  // DB-driven pricing settings (fallback)
  const { data: pricingSettings } = useRidePricingSettings();
  const pricing = pricingSettings || DEFAULT_RIDE_PRICING;
  
  const [step, setStep] = useState<RideStep>("request");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [selectedOption, setSelectedOption] = useState<RideOption | null>(null);
  const [contactInfo, setContactInfo] = useState({ name: "", phone: "", email: "", notes: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CategoryKey>("Economy");
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [checkoutAmount, setCheckoutAmount] = useState<number>(0);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  
  // Intermediate stops state (max 3 stops)
  const [stops, setStops] = useState<{ address: string; coords: { lat: number; lng: number } | null }[]>([]);
  const [activeStopIndex, setActiveStopIndex] = useState<number | null>(null);
  const [showStopSuggestions, setShowStopSuggestions] = useState(false);
  const { suggestions: stopSuggestions, fetchSuggestions: fetchStopSuggestions, clearSuggestions: clearStopSuggestions } = useGoogleMapsGeocode();
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showScheduleSheet, setShowScheduleSheet] = useState(false);
  
  // Refs for programmatic focus from map chip clicks
  const pickupInputRef = useRef<HTMLInputElement>(null);
  const dropoffInputRef = useRef<HTMLInputElement>(null);
  
  const createScheduledBooking = useCreateScheduledBooking();
  
  // Zone-based pricing using pickup coordinates
  const { zone: pricingZone } = usePricingZone(pickupCoords?.lat, pickupCoords?.lng);
  // Fetch ALL ride-type rates for the zone (for per-card pricing)
  const { ratesMap: zoneRatesMap } = useAllZoneRatesMap(pricingZone?.id);
  
  // Zone-specific surge pricing
  const surge = useZoneSurgePricing(pricingZone);
  
  // Live driver availability for dynamic ETAs
  const driverAvailability = useDriverAvailability(pickupCoords);
  const closestDriverETA = driverAvailability.closestETAMinutes;
  
  /** Blend live driver ETA with static ride-type ETA.
   *  Use the larger of (closest driver ETA) and (ride-type minimum) so
   *  premium / high-wait categories keep their baseline expectations. */
  const getBlendedEta = useCallback((staticEta: number): number => {
    if (closestDriverETA == null) return staticEta;
    return Math.max(closestDriverETA, staticEta);
  }, [closestDriverETA]);
  
  // Promo code validation hook
  const { 
    isValidating: isValidatingPromo, 
    appliedPromo, 
    promoError, 
    validateCode: validatePromoCode, 
    removePromo,
    calculateFinalTotal 
  } = useRidePromoValidation();
  
  // Extract city from pickup address for promo validation
  const extractCity = (address: string): string => {
    const parts = address.split(',').map(p => p.trim());
    // Typically city is the second-to-last part (before state/zip)
    return parts.length >= 2 ? parts[parts.length - 2] : parts[0] || '';
  };
  
  // Log zone detection for debugging
  useEffect(() => {
    if (pricingZone && pickupCoords) {
      console.log(`[Rides] Detected pricing zone: ${pricingZone.name} (${pricingZone.id}), rates loaded: ${zoneRatesMap.size} types`);
      if (surge.isActive) {
        console.log(`[Rides] Surge active: ${surge.multiplier}x (${surge.level})`);
      }
    }
  }, [pricingZone, pickupCoords, zoneRatesMap.size, surge.isActive, surge.multiplier, surge.level]);
  
  // Debug panel toggle: ?debug=1 URL param OR localStorage
  const showDebugPanel = useMemo(() => {
    const urlDebug = searchParams.get("debug") === "1";
    try {
      const lsDebug = localStorage.getItem('zivo_debug_pricing') === 'true';
      return urlDebug || lsDebug;
    } catch {
      return urlDebug;
    }
  }, [searchParams]);

  // Bottom sheet state - simplified 2-state snap
  const dragControls = useDragControls();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Lock body scroll for Uber-style full app experience
  useLayoutEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const estimatedDistance = routeData?.distance || 5.2;
  const estimatedDuration = routeData?.duration || 15;
  
  // Validate route data (sanity checks)
  const routeValidation = useMemo(() => {
    return validateRouteData(estimatedDistance, estimatedDuration);
  }, [estimatedDistance, estimatedDuration]);
  
  // Get pricing settings for a specific ride type from the rates map
  const getRatesForRideType = useCallback((rideTypeId: string): ZonePricingRate | null => {
    // Priority: exact match → "standard" fallback
    const exactMatch = zoneRatesMap.get(rideTypeId);
    if (exactMatch) return exactMatch;
    
    const standardFallback = zoneRatesMap.get("standard");
    return standardFallback ?? null;
  }, [zoneRatesMap]);

  // Single price quote function - used everywhere (SINGLE SOURCE OF TRUTH)
  // Now uses per-ride-type rates from the Map + surge multiplier
  const getQuoteForOption = useCallback((option: RideOption): RidePriceQuote | null => {
    if (!routeValidation.valid) return null;
    
    // Get rates specific to this ride type
    const ratesForType = getRatesForRideType(option.id);
    
    // Build settings from ride-type-specific rates or defaults
    const settings: PriceQuoteSettings = ratesForType ? {
      base_fare: ratesForType.base_fare,
      per_mile: ratesForType.per_mile,
      per_minute: ratesForType.per_minute,
      booking_fee: ratesForType.booking_fee,
      minimum_fare: ratesForType.minimum_fare,
    } : {
      base_fare: DEFAULT_ZONE_RATES.base_fare,
      per_mile: DEFAULT_ZONE_RATES.per_mile,
      per_minute: DEFAULT_ZONE_RATES.per_minute,
      booking_fee: DEFAULT_ZONE_RATES.booking_fee,
      minimum_fare: DEFAULT_ZONE_RATES.minimum_fare,
    };
    
    // Multiplier: from zone rates if available, otherwise fallback to RIDE_TYPE_MULTIPLIERS
    const multiplier = ratesForType?.ride_type_multiplier ?? RIDE_TYPE_MULTIPLIERS[option.id] ?? 1.0;
    
    return quoteRidePrice(
      settings,
      estimatedDistance,
      estimatedDuration,
      option.id,
      {
        multiplier,
        surgeMultiplier: surge.multiplier, // Apply surge multiplier
        zoneName: pricingZone?.name,
      }
    );
  }, [routeValidation.valid, getRatesForRideType, estimatedDistance, estimatedDuration, pricingZone?.name, surge.multiplier]);

  // Current quote for selected option (for debug panel)
  const currentQuote = useMemo(() => {
    if (!selectedOption) return null;
    return getQuoteForOption(selectedOption);
  }, [selectedOption, getQuoteForOption]);

  // Fetch route when both coordinates are available (include waypoints)
  useEffect(() => {
    if (pickupCoords && dropoffCoords) {
      const waypoints = stops
        .filter(s => s.coords != null)
        .map(s => s.coords!);
      fetchRoute(pickupCoords, dropoffCoords, pickup, dropoff, waypoints.length > 0 ? waypoints : undefined);
    } else {
      clearRoute();
    }
  }, [pickupCoords, dropoffCoords, pickup, dropoff, stops, fetchRoute, clearRoute]);

  const handlePickupSuggestionClick = useCallback(async (suggestion: Suggestion) => {
    setPickup(suggestion.placeName);
    setShowPickupSuggestions(false);
    clearPickupSuggestions();
    
    // Fetch coordinates via place details
    if (suggestion.placeId) {
      const details = await getPlaceDetails(suggestion.placeId);
      if (details) {
        setPickupCoords({ lat: details.lat, lng: details.lng });
      }
    }
  }, [clearPickupSuggestions]);

  const handleDropoffSuggestionClick = useCallback(async (suggestion: Suggestion) => {
    setDropoff(suggestion.placeName);
    setShowDropoffSuggestions(false);
    clearDropoffSuggestions();
    
    // Fetch coordinates via place details
    if (suggestion.placeId) {
      const details = await getPlaceDetails(suggestion.placeId);
      if (details) {
        setDropoffCoords({ lat: details.lat, lng: details.lng });
      }
    }
  }, [clearDropoffSuggestions]);

  // Handle stop suggestion click
  const handleStopSuggestionClick = useCallback(async (suggestion: Suggestion, index: number) => {
    const newStops = [...stops];
    newStops[index] = { ...newStops[index], address: suggestion.placeName };
    setStops(newStops);
    setShowStopSuggestions(false);
    setActiveStopIndex(null);
    clearStopSuggestions();
    
    if (suggestion.placeId) {
      const details = await getPlaceDetails(suggestion.placeId);
      if (details) {
        const updatedStops = [...newStops];
        updatedStops[index] = { address: suggestion.placeName, coords: { lat: details.lat, lng: details.lng } };
        setStops(updatedStops);
      }
    }
  }, [stops, clearStopSuggestions]);

  // Add a new stop (max 3)
  const handleAddStop = () => {
    if (stops.length < 3) {
      setStops([...stops, { address: "", coords: null }]);
    }
  };

  // Move stop up
  const handleMoveStopUp = (index: number) => {
    if (index <= 0) return;
    const newStops = [...stops];
    [newStops[index - 1], newStops[index]] = [newStops[index], newStops[index - 1]];
    setStops(newStops);
  };

  // Move stop down
  const handleMoveStopDown = (index: number) => {
    if (index >= stops.length - 1) return;
    const newStops = [...stops];
    [newStops[index], newStops[index + 1]] = [newStops[index + 1], newStops[index]];
    setStops(newStops);
  };

  // Remove a stop
  const handleRemoveStop = (index: number) => {
    const newStops = stops.filter((_, i) => i !== index);
    setStops(newStops);
    if (activeStopIndex === index) {
      setActiveStopIndex(null);
      setShowStopSuggestions(false);
    }
  };

  useEffect(() => {
    const autoDetectLocation = async () => {
      setIsAutoDetecting(true);
      try {
        const location = await getCurrentLocation();
        setUserLocation({ lat: location.lat, lng: location.lng });
        setPickupCoords({ lat: location.lat, lng: location.lng });
        const address = await reverseGeocode(location.lat, location.lng);
        setPickup(address);
        toast.success("Location detected");
      } catch {
        setUserLocation({ lat: 30.4515, lng: -91.1871 });
      } finally {
        setIsAutoDetecting(false);
      }
    };
    if (!pickup) {
      autoDetectLocation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUseCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setPickupCoords({ lat: location.lat, lng: location.lng });
      const address = await reverseGeocode(location.lat, location.lng);
      setPickup(address);
      toast.success("Location detected");
    } catch {
      toast.error("Could not get your location");
    }
  };

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const reqId = searchParams.get("request_id");
    if (sessionId && reqId) {
      setRequestId(reqId);
      setStep("success");
    }
    const cancelled = searchParams.get("cancelled");
    if (cancelled) {
      toast.error("Payment was cancelled");
    }
  }, [searchParams]);

  const handleFindRides = () => {
    if (!pickupCoords) {
      toast.error("Please select a valid pickup address from the suggestions");
      return;
    }
    if (!dropoffCoords) {
      toast.error("Please select a valid destination from the suggestions");
      return;
    }
    // Prevent same pickup and dropoff
    if (
      pickupCoords && dropoffCoords &&
      Math.abs(pickupCoords.lat - dropoffCoords.lat) < 0.0005 &&
      Math.abs(pickupCoords.lng - dropoffCoords.lng) < 0.0005
    ) {
      toast.error("Pickup and destination can't be the same location");
      return;
    }
    setStep("options");
  };

  const handleSelectOption = (option: RideOption) => {
    setSelectedOption(option);
  };

  const handleConfirmRide = () => {
    if (selectedOption) setStep("confirm");
  };

  const handleStartCheckout = async () => {
    if (!contactInfo.name || !contactInfo.phone || !selectedOption) return;
    setStep("processing");
    setIsSubmitting(true);
    
    try {
      // Use unified pricing (quoteRidePrice)
      const quote = getQuoteForOption(selectedOption);
      const priceBeforeDiscount = quote?.total ?? 0;
      
      // Calculate final amount with promo discount
      const { discountAmount, finalTotal } = calculateFinalTotal(priceBeforeDiscount);
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out")), 15000);
      });
      
      const invokePromise = supabase.functions.invoke("create-ride-payment-intent", {
        body: {
          customer_name: contactInfo.name,
          customer_phone: contactInfo.phone,
          customer_email: contactInfo.email || undefined,
          pickup_address: pickup,
          pickup_lat: pickupCoords?.lat,
          pickup_lng: pickupCoords?.lng,
          dropoff_address: dropoff,
          dropoff_lat: dropoffCoords?.lat,
          dropoff_lng: dropoffCoords?.lng,
          ride_type: selectedOption.id,
          notes: contactInfo.notes || undefined,
          estimated_fare: finalTotal, // Send discounted total
          distance_miles: estimatedDistance,
          duration_minutes: estimatedDuration,
          surge_multiplier: surge.multiplier,
          // Promo code data
          promo_code: appliedPromo?.valid ? appliedPromo.code : undefined,
          promo_id: appliedPromo?.valid ? appliedPromo.promo_id : undefined,
          promo_discount: appliedPromo?.valid ? discountAmount : undefined,
          price_before_discount: appliedPromo?.valid ? priceBeforeDiscount : undefined,
        },
      });
      
      const { data, error } = await Promise.race([invokePromise, timeoutPromise]);
      if (error) throw error;
      if (!data?.clientSecret) throw new Error("No client secret returned");
      
      setClientSecret(data.clientSecret);
      setCheckoutAmount(data.amount);
      setRequestId(data.requestId);
      setStep("checkout");
      setIsSubmitting(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (errorMessage === "Request timed out") {
        toast.error("Payment setup is taking too long. Please disable ad blockers and try again.");
      } else {
        toast.error("Failed to start payment. Please try again.");
      }
      setStep("confirm");
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    setStep("success");
    toast.success("Payment successful! Your ride is being confirmed.");
  };

  const handleCancelCheckout = () => {
    setStep("confirm");
    setClientSecret(null);
    setCheckoutAmount(0);
  };

  const handleReset = () => {
    setStep("request");
    setPickup("");
    setDropoff("");
    setPickupCoords(null);
    setDropoffCoords(null);
    setStops([]);
    setSelectedOption(null);
    setContactInfo({ name: "", phone: "", email: "", notes: "" });
    setRequestId(null);
    removePromo(); // Clear promo code
    clearRoute();
    navigate("/rides", { replace: true });
  };

  // Use unified pricing for display - just format the quote's total
  const getFareDisplay = (option: RideOption): string => {
    const quote = getQuoteForOption(option);
    if (!quote) return "--";
    return formatCurrency(quote.total);
  };

  // Simplified drag handling - 2 states: collapsed (55%) and expanded (85%)
  const handleDragEnd = (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
    // Expand if dragged up fast/far, collapse if dragged down fast/far
    if (info.offset.y < -50 || info.velocity.y < -500) {
      setIsExpanded(true);
    } else if (info.offset.y > 50 || info.velocity.y > 500) {
      setIsExpanded(false);
    }
  };

  // Sheet height class based on step and expansion state
  const getSheetHeightClass = () => {
    if (step === "checkout" || step === "success") return "h-[75%]";
    if (step === "confirm" || step === "options") return "h-[65%]";
    return isExpanded ? "h-[85%]" : "h-[55%]";
  };

  return (
    <div className="fixed inset-0 bg-zinc-100 overflow-hidden">
      <SEOHead
        title="ZIVO Rides — Request a Ride"
        description="Book a ride with ZIVO. Fast, reliable, and safe rides with verified drivers."
      />
      
      {/* Back button - always visible */}
      <button
        onClick={() => {
          if (step === "request") {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate("/");
            }
          } else if (step === "options") {
            setStep("request");
          } else if (step === "confirm") {
            setStep("options");
          } else if (step === "checkout") {
            setStep("confirm");
          } else if (step === "success") {
            handleReset();
          }
        }}
        className="absolute top-4 left-4 z-[60] w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center touch-manipulation active:scale-95 transition-transform"
        style={{ pointerEvents: 'auto' }}
      >
        <ChevronLeft className="w-5 h-5 text-zinc-700" />
      </button>
      
      {/* Full-height Map - Takes remaining space above sheet */}
      <div className="absolute inset-0">
        <RidesMapView
          userLocation={userLocation}
          pickupCoords={pickupCoords}
          dropoffCoords={dropoffCoords}
          pickup={pickup}
          dropoff={dropoff}
          etaMinutes={selectedOption ? getBlendedEta(selectedOption.eta || 5) : (routeData?.duration ? Math.round(routeData.duration) : undefined)}
          routeData={routeData}
          onPickupClick={() => {
            setIsExpanded(true);
            setTimeout(() => pickupInputRef.current?.focus(), 150);
          }}
          onDropoffClick={() => {
            setIsExpanded(true);
            setTimeout(() => dropoffInputRef.current?.focus(), 150);
          }}
          onLocateMe={handleUseCurrentLocation}
        />
      </div>
      
      {/* Bottom Sheet - Fixed positioning with CSS-based heights */}
      <motion.div
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className={`fixed bottom-0 left-0 right-0 ${getSheetHeightClass()} rounded-t-[32px] bg-gradient-to-b from-[#FFFBF5] to-white border-t border-emerald-100/50 shadow-[0_-18px_40px_rgba(16,185,129,0.12)] flex flex-col z-50 transition-[height] duration-300 ease-out`}
      >
        {/* Drag Handle - ZIVO emerald accent */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="flex justify-center py-3 cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
        >
          <div className="w-12 h-1.5 bg-emerald-200 rounded-full" />
        </div>

        {/* Content - scrollable when expanded */}
        <div className={`flex-1 overscroll-contain ${(showPickupSuggestions || showDropoffSuggestions || showStopSuggestions) ? 'overflow-visible' : 'overflow-y-auto'}`}>
          <div className="px-4 pb-4">
          {/* Request Step */}
          {step === "request" && (
            <div className="space-y-3">
              {/* Title + Driver Availability */}
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-bold text-zinc-900">Where to?</h1>
                <LiveDriverIndicator pickupLocation={pickupCoords} variant="compact" />
              </div>
              
              {/* Pickup & Dropoff Inputs */}
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-1 border border-emerald-100 shadow-[0_4px_20px_rgba(16,185,129,0.08)]" style={{ overflow: 'visible' }}>
                {/* Pickup Input */}
                <div className="relative">
                    <div className="flex items-center gap-2 px-3 py-2">
                    {/* ZIVO emerald pickup ring */}
                    <div className="w-6 h-6 rounded-full border-2 border-emerald-500 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    </div>
                    <input
                      ref={pickupInputRef}
                      value={pickup}
                      onChange={(e) => {
                        setPickup(e.target.value);
                        setPickupCoords(null); // Clear coords when user types
                        setShowPickupSuggestions(true);
                        fetchPickupSuggestions(e.target.value, userLocation || undefined);
                      }}
                      onFocus={() => {
                        setShowPickupSuggestions(true);
                        setShowDropoffSuggestions(false);
                        // Trigger suggestions even if empty
                        fetchPickupSuggestions(pickup, userLocation || undefined);
                      }}
                      onBlur={() => setTimeout(() => setShowPickupSuggestions(false), 200)}
                      placeholder="Enter pickup location"
                      className="flex-1 bg-transparent text-zinc-900 placeholder-zinc-500 outline-none text-base"
                      style={{ fontSize: '16px' }}
                    />
                    {pickup && !pickupCoords && !isAutoDetecting && (
                      <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    )}
                    {isAutoDetecting && <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />}
                  </div>
                  
                  {/* Pickup Dropdown */}
                  <AnimatePresence>
                    {showPickupSuggestions && pickupSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-zinc-200 overflow-hidden"
                        style={{ zIndex: 9999 }}
                      >
                        {/* Current location option */}
                        <button
                          onClick={handleUseCurrentLocation}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 transition-colors border-b border-zinc-100"
                        >
                          <LocateFixed className="w-4 h-4 text-blue-500 shrink-0" />
                          <span className="text-sm font-medium text-blue-600">Use current location</span>
                        </button>
                        {pickupSuggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            onClick={() => handlePickupSuggestionClick(suggestion)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-b-0"
                          >
                            <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
                            <span className="text-sm text-zinc-900 truncate">{suggestion.placeName}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Divider */}
                <div className="mx-3 border-t border-zinc-200" />
                
                {/* Intermediate Stops */}
                {stops.map((stop, index) => (
                  <div key={index}>
                    <div className="relative">
                      <div className="flex items-center gap-2 px-3 py-2">
                        <div className="w-6 h-6 bg-zinc-400 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-white">{index + 1}</span>
                        </div>
                        <input
                          value={stop.address}
                          onChange={(e) => {
                            const newStops = [...stops];
                            newStops[index] = { ...newStops[index], address: e.target.value };
                            setStops(newStops);
                            setActiveStopIndex(index);
                            setShowStopSuggestions(true);
                            fetchStopSuggestions(e.target.value, userLocation || undefined);
                          }}
                          onFocus={() => {
                            setActiveStopIndex(index);
                            setShowStopSuggestions(true);
                            setShowPickupSuggestions(false);
                            setShowDropoffSuggestions(false);
                            fetchStopSuggestions(stop.address, userLocation || undefined);
                          }}
                          onBlur={() => setTimeout(() => {
                            setShowStopSuggestions(false);
                            setActiveStopIndex(null);
                          }, 200)}
                          placeholder={`Stop ${index + 1}`}
                          className="flex-1 bg-transparent text-zinc-900 placeholder-zinc-500 outline-none text-base"
                          style={{ fontSize: '16px' }}
                        />
                        <button
                          onClick={() => handleRemoveStop(index)}
                          className="p-1 hover:bg-zinc-200 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4 text-zinc-500" />
                        </button>
                        {/* Reorder buttons */}
                        {stops.length > 1 && (
                          <div className="flex flex-col -space-y-0.5">
                            <button
                              onClick={() => handleMoveStopUp(index)}
                              disabled={index === 0}
                              className="p-0.5 hover:bg-zinc-200 rounded transition-colors disabled:opacity-30"
                            >
                              <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
                            </button>
                            <button
                              onClick={() => handleMoveStopDown(index)}
                              disabled={index === stops.length - 1}
                              className="p-0.5 hover:bg-zinc-200 rounded transition-colors disabled:opacity-30"
                            >
                              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Stop Dropdown */}
                      <AnimatePresence>
                        {showStopSuggestions && activeStopIndex === index && stopSuggestions.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-zinc-200 overflow-hidden"
                            style={{ zIndex: 9999 }}
                          >
                            {stopSuggestions.map((suggestion) => (
                              <button
                                key={suggestion.id}
                                onClick={() => handleStopSuggestionClick(suggestion, index)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-b-0"
                              >
                                <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
                                <span className="text-sm text-zinc-900 truncate">{suggestion.placeName}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="mx-3 border-t border-zinc-200" />
                  </div>
                ))}
                
                {/* Dropoff Input */}
                <div className="relative">
                  <div className="flex items-center gap-2 px-3 py-2">
                    {/* ZIVO teal dropoff marker */}
                    <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-white rounded-sm" />
                    </div>
                    <input
                      ref={dropoffInputRef}
                      value={dropoff}
                      onChange={(e) => {
                        setDropoff(e.target.value);
                        setDropoffCoords(null); // Clear coords when user types
                        setShowDropoffSuggestions(true);
                        fetchDropoffSuggestions(e.target.value, userLocation || undefined);
                      }}
                      onFocus={() => {
                        setShowDropoffSuggestions(true);
                        setShowPickupSuggestions(false);
                        setShowStopSuggestions(false);
                        // Trigger suggestions even if empty
                        fetchDropoffSuggestions(dropoff, userLocation || undefined);
                      }}
                      onBlur={() => setTimeout(() => setShowDropoffSuggestions(false), 200)}
                      placeholder="Enter destination"
                      className="flex-1 bg-transparent text-zinc-900 placeholder-zinc-500 outline-none text-base"
                      style={{ fontSize: '16px' }}
                    />
                    {dropoff && !dropoffCoords && (
                      <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    )}
                    {(!dropoff || dropoffCoords) && <Search className="w-5 h-5 text-zinc-400" />}
                  </div>
                  
                  {/* Dropoff Dropdown */}
                  <AnimatePresence>
                    {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-zinc-200 overflow-hidden"
                        style={{ zIndex: 9999 }}
                      >
                        {dropoffSuggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            onClick={() => handleDropoffSuggestionClick(suggestion)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-b-0"
                          >
                            <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
                            <span className="text-sm text-zinc-900 truncate">{suggestion.placeName}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              {/* Add Stop Button */}
              {stops.length < 3 && (
                <button
                  onClick={handleAddStop}
                  className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add stop {stops.length > 0 ? `(${stops.length}/3)` : ''}
                </button>
              )}

              {/* Category Tabs - Lighter, taller, Uber-style */}
              <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                {(Object.keys(rideCategories) as CategoryKey[]).map((cat) => {
                  const isActive = activeTab === cat;
                  const tabStyle = cat === "Elite"
                    ? isActive
                      ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md shadow-purple-500/25 border-b-2 border-purple-300"
                      : "bg-white border border-purple-200 text-purple-600 hover:bg-purple-50/50"
                    : cat === "Premium"
                    ? isActive
                      ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-md shadow-amber-500/25 border-b-2 border-amber-300"
                      : "bg-white border border-amber-200 text-amber-600 hover:bg-amber-50/50"
                    : isActive
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25 border-b-2 border-emerald-300"
                      : "bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50";
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveTab(cat)}
                      className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${tabStyle}`}
                    >
                      {cat === "Premium" && <Star className="w-3 h-3 inline mr-1 -mt-0.5" />}
                      {cat === "Elite" && <Crown className="w-3 h-3 inline mr-1 -mt-0.5" />}
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Trip Info - ZIVO styled */}
              {routeData && dropoff && (
                <div className="flex items-center gap-3 text-sm text-zinc-600 bg-emerald-50 rounded-xl px-3 py-2 border border-emerald-100">
                  <span className="font-medium text-emerald-700">{estimatedDistance.toFixed(1)} mi</span>
                  <span className="text-emerald-300">•</span>
                  <span className="text-emerald-600">{estimatedDuration} min</span>
                </div>
              )}

              {/* Surge Banner */}
              <SurgeBanner
                isActive={surge.isActive}
                multiplier={surge.multiplier}
                level={surge.level}
                zoneName={surge.zoneName}
              />

              {/* Section Header for Premium/Elite */}
              {activeTab === "Premium" && (
                <div className="flex items-center gap-2 px-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-semibold text-amber-600">Premium Collection</span>
                </div>
              )}
              {activeTab === "Elite" && (
                <div className="flex items-center gap-2 px-1">
                  <Crown className="w-4 h-4 text-purple-500 fill-purple-500" />
                  <span className="text-sm font-semibold text-purple-600">Elite Collection</span>
                </div>
              )}

              {/* Ride Options List - using ZivoRideRow */}
              <div className="space-y-2">
                {rideCategories[activeTab].map((ride) => (
                  <ZivoRideRow
                    key={ride.id}
                    selected={selectedOption?.id === ride.id}
                    name={ride.name}
                    tag={ride.tag}
                    seats={ride.seats || 4}
                    time={getPickupTime(getBlendedEta(ride.eta || 5))}
                    eta={`${getBlendedEta(ride.eta || 5)} min`}
                    price={getFareDisplay(ride)}
                    onClick={() => handleSelectOption(ride)}
                    compact
                    surgeMultiplier={surge.multiplier}
                    surgeLevel={surge.level}
                    surgeActive={surge.isActive}
                    category={activeTab.toLowerCase() as "economy" | "premium" | "elite"}
                    subtitle={ride.subtitle}
                  />
                ))}
              </div>

            </div>
          )}

          {/* Options Step - Confirm selection */}

          {/* Options Step - Confirm selection */}
          {step === "options" && selectedOption && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-zinc-800">Confirm your ride</h2>
              
              {/* ZIVO styled route summary */}
              <div className="bg-emerald-50 rounded-xl p-4 space-y-2 border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span className="text-sm text-zinc-800 truncate">{pickup}</span>
                </div>
                {stops.map((stop, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-teal-400 rounded-full" />
                    <span className="text-sm text-zinc-600 truncate">{stop.address}</span>
                  </div>
                ))}
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-teal-600 rounded-full" />
                  <span className="text-sm text-zinc-800 truncate">{dropoff}</span>
                </div>
                <div className="flex gap-4 mt-3 pt-3 border-t border-emerald-200 text-sm text-emerald-700">
                  <span>~{estimatedDistance.toFixed(1)} mi</span>
                  <span>~{estimatedDuration} min</span>
                  {stops.length > 0 && <span>{stops.length} stop{stops.length > 1 ? 's' : ''}</span>}
                </div>
              </div>

              {/* ZIVO styled selected ride card */}
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                <div className="w-14 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center shrink-0">
                  <CarFront className="w-7 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-zinc-800">{selectedOption.name}</span>
                  <div className="text-sm text-emerald-600">{getBlendedEta(selectedOption.eta || 5)} min away</div>
                </div>
                <span className="text-lg font-bold text-emerald-600">{getFareDisplay(selectedOption)}</span>
              </div>

              {/* Total - ZIVO styled */}
              {currentQuote && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#FFFBF5] border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-zinc-700">Total</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-600">{formatCurrency(currentQuote.total)}</span>
                </div>
              )}

            </div>
          )}

          {/* Confirm Step - Contact Info */}
          {step === "confirm" && selectedOption && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-zinc-900">Your Information</h2>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm text-zinc-600">Full Name *</Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <Input
                      placeholder="Your name"
                      value={contactInfo.name}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="pl-10 h-12 bg-zinc-100 border-0 text-zinc-900 placeholder-zinc-500"
                      style={{ fontSize: '16px' }}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-zinc-600">Phone Number *</Label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <Input
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="pl-10 h-12 bg-zinc-100 border-0 text-zinc-900 placeholder-zinc-500"
                      style={{ fontSize: '16px' }}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-zinc-600">Email (for receipt)</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10 h-12 bg-zinc-100 border-0 text-zinc-900 placeholder-zinc-500"
                      style={{ fontSize: '16px' }}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-zinc-600">Notes (optional)</Label>
                  <Textarea
                    placeholder="Any special requests..."
                    value={contactInfo.notes}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, notes: e.target.value }))}
                    className="mt-1.5 min-h-[80px] bg-zinc-100 border-0 text-zinc-900 placeholder-zinc-500"
                    style={{ fontSize: '16px' }}
                  />
                </div>
              </div>

              {/* Promo Code Section */}
              <div className="pt-2 border-t border-zinc-200">
                <PromoCodeInput
                  onApply={(code) => validatePromoCode(code, currentQuote?.total ?? 0, extractCity(pickup))}
                  onRemove={removePromo}
                  isValidating={isValidatingPromo}
                  appliedPromo={appliedPromo}
                  error={promoError}
                  disabled={isSubmitting}
                />
              </div>

              {/* Total - ZIVO styled */}
              {currentQuote && (
                <div className="p-3 rounded-xl bg-[#FFFBF5] border border-emerald-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-medium text-zinc-700">Total</span>
                    </div>
                    <div className="text-right">
                      {appliedPromo?.valid && appliedPromo.discount_amount ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-zinc-400 line-through">{formatCurrency(currentQuote.total)}</span>
                          <span className="text-lg font-bold text-emerald-600">{formatCurrency(Math.max(0, currentQuote.total - appliedPromo.discount_amount))}</span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-emerald-600">{formatCurrency(currentQuote.total)}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Checkout Step */}
          {step === "checkout" && selectedOption && clientSecret && (
            <RideEmbeddedCheckout
              clientSecret={clientSecret}
              amount={checkoutAmount}
              onSuccess={handlePaymentSuccess}
              onCancel={handleCancelCheckout}
              pickupAddress={pickup}
              dropoffAddress={dropoff}
              rideName={selectedOption.name}
            />
          )}

          {/* Processing Step */}
          {step === "processing" && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="w-12 h-12 mx-auto text-zinc-400 animate-spin" />
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Setting up payment...</h2>
                <p className="text-zinc-500">Please wait while we prepare your checkout.</p>
              </div>
            </div>
          )}

          {/* Success Step - ZIVO Brand */}
          {step === "success" && (
            <div className="py-8 text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-zinc-800">Payment Received!</h2>
                <p className="text-zinc-500 mt-2">Your ride request has been submitted.</p>
              </div>
              {requestId && (
                <div className="py-3 px-5 rounded-xl bg-emerald-50 border border-emerald-100 inline-block">
                  <p className="text-xs text-emerald-600">Request ID</p>
                  <p className="font-mono font-bold text-emerald-700">{requestId.slice(0, 8).toUpperCase()}</p>
                </div>
              )}
              <Button
                variant="outline"
                onClick={handleReset}
                className="rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                Request Another Ride
              </Button>
            </div>
        )}
          </div>
        </div>

        {/* Sticky CTA Buttons - ZIVO emerald gradient */}
        {step === "request" && selectedOption && dropoff && (
          <div className="flex-shrink-0 p-4 bg-gradient-to-t from-[#FFFBF5] via-[#FFFBF5] to-[#FFFBF5]/90 border-t border-emerald-100">
            <div className="flex gap-2">
              <Button
                onClick={handleFindRides}
                disabled={!pickupCoords || !dropoffCoords}
                className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 disabled:from-zinc-300 disabled:to-zinc-400 disabled:shadow-none"
              >
                Choose {selectedOption.name}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowScheduleSheet(true)}
                className="h-12 px-4 rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                <CalendarDays className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === "options" && selectedOption && (
          <div className="flex-shrink-0 p-4 bg-gradient-to-t from-[#FFFBF5] via-[#FFFBF5] to-[#FFFBF5]/90 border-t border-emerald-100">
            <Button
              onClick={handleConfirmRide}
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25"
            >
              Continue
            </Button>
          </div>
        )}

        {step === "confirm" && selectedOption && (
          <div className="flex-shrink-0 p-4 bg-gradient-to-t from-[#FFFBF5] via-[#FFFBF5] to-[#FFFBF5]/90 border-t border-emerald-100">
            <Button
              onClick={handleStartCheckout}
              disabled={!contactInfo.name || !contactInfo.phone || isSubmitting}
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm rounded-xl gap-2 shadow-lg shadow-emerald-500/25 disabled:from-zinc-300 disabled:to-zinc-400 disabled:shadow-none"
            >
              <CreditCard className="w-4 h-4" />
              Continue to Payment
            </Button>
          </div>
        )}
      </motion.div>

      {/* Debug Panel - enabled via localStorage.setItem('zivo_debug_pricing', 'true') */}
      <PricingDebugPanel quote={currentQuote} show={showDebugPanel} />

      {/* Schedule Ride Sheet */}
      <ScheduleRideSheet
        open={showScheduleSheet}
        onOpenChange={setShowScheduleSheet}
        pickup={pickup}
        dropoff={dropoff}
        rideName={selectedOption?.name}
        estimatedPrice={selectedOption ? getFareDisplay(selectedOption) : undefined}
        onConfirm={(date, time) => {
          const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
          createScheduledBooking.mutate({
            booking_type: "ride",
            scheduled_date: fmt(date),
            scheduled_time: time,
            pickup_address: pickup,
            destination_address: dropoff || undefined,
            pickup_lat: pickupCoords?.lat,
            pickup_lng: pickupCoords?.lng,
            destination_lat: dropoffCoords?.lat,
            destination_lng: dropoffCoords?.lng,
            estimated_price: currentQuote?.total,
            details: {
              rideType: selectedOption?.id,
              rideName: selectedOption?.name,
              stops: stops.map(s => s.address).filter(Boolean),
            },
          });
        }}
      />

      {/* Mobile Nav - hidden when bottom sheet is shown */}
      {isMobile && step === "success" && <ZivoMobileNav />}
    </div>
  );
}

export default function Rides() {
  return <RidesInner />;
}
