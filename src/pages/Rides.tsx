/**
 * ZIVO Rides — Uber-Style Booking Page
 * Full-height map with draggable bottom sheet
 * Mobile-first, no scroll required
 */

import { useState, useEffect, useCallback, useMemo, useLayoutEffect } from "react";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { 
  MapPin, Navigation, Clock, Shield, Star, CheckCircle2,
  ChevronRight, ChevronLeft, Phone, Mail, User, CreditCard, Loader2, LocateFixed,
  Leaf, Zap, Briefcase, Crown, Anchor, Dog, CarFront, UserRound, Search, Plus, X, Receipt
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
import { GoogleMapProvider, useGoogleMaps } from "@/components/maps/GoogleMapProvider";
import GoogleMap, { MapMarker, MapRoute } from "@/components/maps/GoogleMap";

import { useServerRoute, ServerRouteData } from "@/hooks/useServerRoute";
import { useGoogleMapsGeocode, Suggestion } from "@/hooks/useGoogleMapsGeocode";
import { getPlaceDetails } from "@/services/mapsApi";
import { decodePolyline } from "@/services/googleMaps";
import RideEmbeddedCheckout from "@/components/ride/RideEmbeddedCheckout";
import { UberLikeRideRow } from "@/components/ride/UberLikeRideRow";
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
    { id: "comfort", name: "Extra Comfort", desc: "Newer cars, more legroom.", price: "", time: "5 min", eta: 5, icon: Star, image: "", seats: 4 },
    { id: "black", name: "ZIVO Black", desc: "Premium leather sedans.", price: "", time: "8 min", eta: 8, icon: Briefcase, image: "", seats: 4 },
    { id: "black_suv", name: "Black SUV", desc: "Luxury for 6.", price: "", time: "10 min", eta: 10, icon: Shield, image: "", seats: 6 },
    { id: "xxl", name: "XXL", desc: "Max luggage space.", price: "", time: "12 min", eta: 12, icon: Anchor, image: "", seats: 6 }
  ],
  Elite: [
    { id: "lux", name: "ZIVO Lux", desc: "Rolls-Royce / Bentley.", price: "", time: "20 min", eta: 20, icon: Crown, image: "", seats: 4, tag: "lux" },
    { id: "sprinter", name: "Executive Sprinter", desc: "Jet van for 12.", price: "", time: "45 min", eta: 45, icon: Briefcase, image: "", seats: 12 },
    { id: "secure", name: "Secure Transit", desc: "Armored transport.", price: "", time: "60 min", eta: 60, icon: Shield, image: "", seats: 4 }
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
      {showLoading ? (
        // Loading state
        <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ccc" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          <div className="flex flex-col items-center gap-2 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm text-zinc-600">Loading map...</span>
          </div>
        </div>
      ) : showFallback ? (
        // Fallback: Static map-like background with pulsing location dot
        <div className="w-full h-full relative overflow-hidden">
          {/* Map-like grid pattern */}
          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-fallback" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ccc" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-fallback)" />
            </svg>
          </div>
          
          {/* Simulated roads */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-0 right-0 h-2 bg-white/60" />
            <div className="absolute top-1/2 left-0 right-0 h-3 bg-white/80" />
            <div className="absolute top-3/4 left-0 right-0 h-2 bg-white/60" />
            <div className="absolute left-1/4 top-0 bottom-0 w-2 bg-white/60" />
            <div className="absolute left-1/2 top-0 bottom-0 w-3 bg-white/80" />
            <div className="absolute left-3/4 top-0 bottom-0 w-2 bg-white/60" />
          </div>
          
          {/* Current location marker */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-blue-500/20 animate-ping absolute -inset-6" />
              <div className="w-12 h-12 rounded-full bg-blue-500/30 absolute -inset-3" />
              <div className="w-6 h-6 rounded-full bg-blue-500 border-4 border-white shadow-lg relative z-10" />
            </div>
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
      
      {/* Floating Pickup Card - Top Right */}
      {pickup && (
        <button
          onClick={onPickupClick}
          className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white rounded-lg shadow-lg px-3 py-2.5 text-left max-w-[280px] touch-manipulation active:scale-[0.98] transition-transform"
        >
          <div className="bg-zinc-900 text-white px-2 py-1.5 rounded text-[10px] font-bold leading-none flex-shrink-0 text-center min-w-[40px]">
            <div>{etaMinutes ? `${etaMinutes}-${etaMinutes + 10}` : "5-10"}</div>
            <div className="text-[8px] font-medium text-zinc-400">MIN</div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-zinc-900 truncate">{pickup.split(',')[0]}</div>
            {pickup.split(',').length > 1 && (
              <div className="text-xs text-zinc-500 truncate">{pickup.split(',').slice(1, 2).join(',').trim()}</div>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400 flex-shrink-0" />
        </button>
      )}
      
      {/* Floating Dropoff Card - Bottom Right */}
      {dropoff && (
        <button
          onClick={onDropoffClick}
          className="absolute bottom-16 right-4 z-10 flex items-center gap-2 bg-white rounded-lg shadow-lg px-3 py-2.5 text-left max-w-[280px] touch-manipulation active:scale-[0.98] transition-transform"
        >
          <div className="w-8 h-8 bg-zinc-900 rounded flex items-center justify-center flex-shrink-0">
            <div className="w-2.5 h-2.5 bg-white rounded-sm" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-zinc-900 truncate">{dropoff.split(',')[0]}</div>
            {dropoff.split(',').length > 1 && (
              <div className="text-xs text-zinc-500 truncate">{dropoff.split(',').slice(1, 2).join(',').trim()}</div>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400 flex-shrink-0" />
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
  
  
  // Zone-based pricing using pickup coordinates
  const { zone: pricingZone } = usePricingZone(pickupCoords?.lat, pickupCoords?.lng);
  // Fetch ALL ride-type rates for the zone (for per-card pricing)
  const { ratesMap: zoneRatesMap } = useAllZoneRatesMap(pricingZone?.id);
  
  // Zone-specific surge pricing
  const surge = useZoneSurgePricing(pricingZone);
  
  // Log zone detection for debugging
  useEffect(() => {
    if (pricingZone && pickupCoords) {
      console.log(`[Rides] Detected pricing zone: ${pricingZone.name} (${pricingZone.id}), rates loaded: ${zoneRatesMap.size} types`);
      if (surge.isActive) {
        console.log(`[Rides] Surge active: ${surge.multiplier}x (${surge.level}) - ${surge.requestedCount} requests / ${surge.availableDrivers} drivers`);
      }
    }
  }, [pricingZone, pickupCoords, zoneRatesMap.size, surge.isActive, surge.multiplier, surge.level, surge.requestedCount, surge.availableDrivers]);
  
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
    const multiplier = ratesForType?.multiplier ?? RIDE_TYPE_MULTIPLIERS[option.id] ?? 1.0;
    
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

  // Fetch route when both coordinates are available
  useEffect(() => {
    if (pickupCoords && dropoffCoords) {
      fetchRoute(pickupCoords, dropoffCoords, pickup, dropoff);
    } else {
      clearRoute();
    }
  }, [pickupCoords, dropoffCoords, pickup, dropoff, fetchRoute, clearRoute]);

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

  // Add a new stop (max 1)
  const handleAddStop = () => {
    if (stops.length < 1) {
      setStops([...stops, { address: "", coords: null }]);
    }
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
    if (pickup && dropoff) setStep("options");
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
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out")), 15000);
      });
      
      const invokePromise = supabase.functions.invoke("create-ride-payment-intent", {
        body: {
          customer_name: contactInfo.name,
          customer_phone: contactInfo.phone,
          customer_email: contactInfo.email || undefined,
          pickup_address: pickup,
          dropoff_address: dropoff,
          ride_type: selectedOption.id,
          notes: contactInfo.notes || undefined,
          estimated_fare: quote?.total ?? 0, // Client estimate for comparison
          distance_miles: estimatedDistance,
          duration_minutes: estimatedDuration,
          surge_multiplier: surge.multiplier, // Zone-specific surge multiplier
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
            navigate(-1); // Go back to previous page
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
        className="absolute top-4 left-4 z-50 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center touch-manipulation active:scale-95 transition-transform"
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
          etaMinutes={selectedOption?.eta ?? (routeData?.duration ? Math.round(routeData.duration) : undefined)}
          routeData={routeData}
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
        className={`fixed bottom-0 left-0 right-0 ${getSheetHeightClass()} rounded-t-[28px] bg-white shadow-[0_-18px_40px_rgba(0,0,0,0.18)] flex flex-col z-50 transition-[height] duration-300 ease-out`}
      >
        {/* Drag Handle */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="flex justify-center py-3 cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
        >
          <div className="w-12 h-1.5 bg-zinc-300/80 rounded-full" />
        </div>

        {/* Content - scrollable when expanded */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
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
              <div className="relative bg-zinc-100 rounded-xl p-1">
                {/* Pickup Input */}
                <div className="relative">
                    <div className="flex items-center gap-2 px-3 py-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <input
                      value={pickup}
                      onChange={(e) => {
                        setPickup(e.target.value);
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
                    {isAutoDetecting && <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />}
                  </div>
                  
                  {/* Pickup Dropdown */}
                  <AnimatePresence>
                    {showPickupSuggestions && pickupSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden z-50"
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
                      </div>
                      
                      {/* Stop Dropdown */}
                      <AnimatePresence>
                        {showStopSuggestions && activeStopIndex === index && stopSuggestions.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden z-50"
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
                    <div className="w-6 h-6 bg-black rounded flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-white rounded-sm" />
                    </div>
                    <input
                      value={dropoff}
                      onChange={(e) => {
                        setDropoff(e.target.value);
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
                    <Search className="w-5 h-5 text-zinc-400" />
                  </div>
                  
                  {/* Dropoff Dropdown */}
                  <AnimatePresence>
                    {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden z-50"
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
              {stops.length < 1 && (
                <button
                  onClick={handleAddStop}
                  className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add stop
                </button>
              )}

              {/* Category Tabs */}
              <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
                {(Object.keys(rideCategories) as CategoryKey[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      activeTab === cat 
                        ? "bg-zinc-900 text-white" 
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Trip Info - show when route is available */}
              {routeData && dropoff && (
                <div className="flex items-center gap-3 text-sm text-zinc-500 bg-zinc-50 rounded-lg px-3 py-2">
                  <span className="font-medium text-zinc-700">{estimatedDistance.toFixed(1)} mi</span>
                  <span className="text-zinc-300">•</span>
                  <span>{estimatedDuration} min</span>
                </div>
              )}

              {/* Surge Banner */}
              <SurgeBanner
                isActive={surge.isActive}
                multiplier={surge.multiplier}
                level={surge.level}
                zoneName={surge.zoneName}
              />

              {/* Ride Options List */}
              <div className="space-y-1.5">
                {rideCategories[activeTab].map((ride) => (
                  <UberLikeRideRow
                    key={ride.id}
                    selected={selectedOption?.id === ride.id}
                    name={ride.name}
                    tag={ride.tag}
                    seats={ride.seats || 4}
                    time={getPickupTime(ride.eta || 5)}
                    eta={`${ride.eta} min`}
                    price={getFareDisplay(ride)}
                    onClick={() => handleSelectOption(ride)}
                    compact
                    surgeMultiplier={surge.multiplier}
                    surgeLevel={surge.level}
                    surgeActive={surge.isActive}
                  />
                ))}
              </div>

            </div>
          )}

          {/* Options Step - Confirm selection */}

          {/* Options Step - Confirm selection */}
          {step === "options" && selectedOption && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-zinc-900">Confirm your ride</h2>
              
              <div className="bg-zinc-100 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-sm text-zinc-900 truncate">{pickup}</span>
                </div>
                {stops.map((stop, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-zinc-400 rounded-full" />
                    <span className="text-sm text-zinc-600 truncate">{stop.address}</span>
                  </div>
                ))}
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-zinc-900 rounded-full" />
                  <span className="text-sm text-zinc-900 truncate">{dropoff}</span>
                </div>
                <div className="flex gap-4 mt-3 pt-3 border-t border-zinc-200 text-sm text-zinc-500">
                  <span>~{estimatedDistance.toFixed(1)} mi</span>
                  <span>~{estimatedDuration} min</span>
                  {stops.length > 0 && <span>{stops.length} stop{stops.length > 1 ? 's' : ''}</span>}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl">
                <div className="w-14 h-10 bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-lg flex items-center justify-center shrink-0">
                  <CarFront className="w-7 h-5 text-zinc-600" />
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-zinc-900">{selectedOption.name}</span>
                  <div className="text-sm text-zinc-500">{selectedOption.eta} min away</div>
                </div>
                <span className="text-lg font-bold text-zinc-900">{getFareDisplay(selectedOption)}</span>
              </div>

              {/* Price Breakdown */}
              {currentQuote && (
                <div className="space-y-2 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
                    <Receipt className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm font-medium text-zinc-700">Fare Breakdown</span>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Base fare</span>
                      <span className="text-zinc-900">{formatCurrency(currentQuote.baseFare)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Distance ({estimatedDistance.toFixed(1)} mi)</span>
                      <span className="text-zinc-900">{formatCurrency(currentQuote.distanceFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Time (~{estimatedDuration} min)</span>
                      <span className="text-zinc-900">{formatCurrency(currentQuote.timeFee)}</span>
                    </div>
                    {currentQuote.multiplier !== 1 && (
                      <div className="flex justify-between text-zinc-400 text-xs">
                        <span>{selectedOption.name} ({currentQuote.multiplier}x)</span>
                        <span>applied</span>
                      </div>
                    )}
                    {currentQuote.minimumApplied && (
                      <div className="flex justify-between text-zinc-400 text-xs italic">
                        <span>Minimum fare applied</span>
                        <span>{formatCurrency(currentQuote.subtotal)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Booking fee</span>
                      <span className="text-zinc-900">{formatCurrency(currentQuote.bookingFee)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-zinc-200 font-bold">
                    <span className="text-zinc-900">Total</span>
                    <span className="text-zinc-900">{formatCurrency(currentQuote.total)}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 pt-1">
                    Estimated range: ${currentQuote.estimatedMin}-${currentQuote.estimatedMax}. Final price may vary based on route and traffic.
                  </p>
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

          {/* Success Step */}
          {step === "success" && (
            <div className="py-8 text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-zinc-900">Payment Received!</h2>
                <p className="text-zinc-500 mt-2">Your ride request has been submitted.</p>
              </div>
              {requestId && (
                <div className="py-3 px-5 rounded-xl bg-zinc-100 inline-block">
                  <p className="text-xs text-zinc-500">Request ID</p>
                  <p className="font-mono font-bold text-zinc-900">{requestId.slice(0, 8).toUpperCase()}</p>
                </div>
              )}
              <Button
                variant="outline"
                onClick={handleReset}
                className="rounded-xl"
              >
                Request Another Ride
              </Button>
            </div>
        )}
          </div>
        </div>

        {/* Sticky CTA Buttons - positioned at bottom of sheet */}
        {step === "request" && selectedOption && dropoff && (
          <div className="flex-shrink-0 p-4 bg-gradient-to-t from-white via-white to-white/90 border-t border-zinc-100">
            <Button
              onClick={handleFindRides}
              className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm rounded-xl"
            >
              Choose {selectedOption.name}
            </Button>
          </div>
        )}

        {step === "options" && selectedOption && (
          <div className="flex-shrink-0 p-4 bg-gradient-to-t from-white via-white to-white/90 border-t border-zinc-100">
            <Button
              onClick={handleConfirmRide}
              className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm rounded-xl"
            >
              Continue
            </Button>
          </div>
        )}

        {step === "confirm" && selectedOption && (
          <div className="flex-shrink-0 p-4 bg-gradient-to-t from-white via-white to-white/90 border-t border-zinc-100">
            <Button
              onClick={handleStartCheckout}
              disabled={!contactInfo.name || !contactInfo.phone || isSubmitting}
              className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm rounded-xl gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Continue to Payment
            </Button>
          </div>
        )}
      </motion.div>

      {/* Debug Panel - enabled via localStorage.setItem('zivo_debug_pricing', 'true') */}
      <PricingDebugPanel quote={currentQuote} show={showDebugPanel} />

      {/* Mobile Nav - hidden when bottom sheet is shown */}
      {isMobile && step === "success" && <ZivoMobileNav />}
    </div>
  );
}

export default function Rides() {
  return (
    <GoogleMapProvider>
      <RidesInner />
    </GoogleMapProvider>
  );
}
