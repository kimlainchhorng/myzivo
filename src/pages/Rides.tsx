/**
 * ZIVO Rides — Uber-Style Booking Page
 * Full-height map with draggable bottom sheet
 * Mobile-first, no scroll required
 */

import { useState, useEffect, useCallback } from "react";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useDragControls, useMotionValue, animate } from "framer-motion";
import { 
  MapPin, Navigation, Clock, Shield, Star, CheckCircle2,
  ChevronRight, ChevronLeft, Phone, Mail, User, CreditCard, Loader2, LocateFixed,
  Leaf, Zap, Briefcase, Crown, Anchor, Dog, CarFront, UserRound, Search
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

import { useServerRoute } from "@/hooks/useServerRoute";
import { useGoogleMapsGeocode, Suggestion } from "@/hooks/useGoogleMapsGeocode";
import { getPlaceDetails } from "@/services/mapsApi";
import RideEmbeddedCheckout from "@/components/ride/RideEmbeddedCheckout";

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

// Glassmorphism Car Icon
function CarIcon() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 shrink-0">
      <CarFront className="h-5 w-5 text-zinc-700" />
    </div>
  );
}

// Tag pill component
function TagPill({ tag }: { tag?: RideTag }) {
  if (!tag) return null;
  
  const tagMap: Record<RideTag, { icon: string; label: string; color: string }> = {
    wait_save: { icon: "⏱️", label: "Save", color: "bg-blue-100 text-blue-700" },
    priority: { icon: "⚡", label: "Faster", color: "bg-green-100 text-green-700" },
    green: { icon: "🌿", label: "Green", color: "bg-emerald-100 text-emerald-700" },
    standard: { icon: "⭐", label: "", color: "" },
    lux: { icon: "💎", label: "Elite", color: "bg-purple-100 text-purple-700" },
  };
  
  const item = tagMap[tag];
  if (!item.label) return null;
  
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.color}`}>
      <span aria-hidden className="text-[10px]">{item.icon}</span>
      {item.label}
    </span>
  );
}

type CategoryKey = "Economy" | "Premium" | "Elite";

// Vehicle options
const rideCategories: Record<CategoryKey, RideOption[]> = {
  Economy: [
    { id: "wait_save", name: "Wait & Save", desc: "Lowest price, longer wait.", price: "$18.50", time: "15 min", eta: 15, icon: Clock, image: "", multiplier: 0.75, seats: 4, tag: "wait_save" },
    { id: "standard", name: "Standard", desc: "Reliable everyday rides.", price: "$24.50", time: "4 min", eta: 4, icon: Navigation, image: "", multiplier: 1.0, seats: 4, tag: "standard" },
    { id: "green", name: "Green", desc: "EVs & Hybrids.", price: "$25.00", time: "6 min", eta: 6, icon: Leaf, image: "", multiplier: 1.02, seats: 4, tag: "green" },
    { id: "priority", name: "Priority", desc: "Faster pickup.", price: "$32.00", time: "1 min", eta: 1, icon: Zap, image: "", multiplier: 1.3, seats: 4, tag: "priority" }
  ],
  Premium: [
    { id: "comfort", name: "Extra Comfort", desc: "Newer cars, more legroom.", price: "$38.00", time: "5 min", eta: 5, icon: Star, image: "", multiplier: 1.55, seats: 4 },
    { id: "black", name: "ZIVO Black", desc: "Premium leather sedans.", price: "$65.00", time: "8 min", eta: 8, icon: Briefcase, image: "", multiplier: 2.65, seats: 4 },
    { id: "black_suv", name: "Black SUV", desc: "Luxury for 6.", price: "$85.00", time: "10 min", eta: 10, icon: Shield, image: "", multiplier: 3.5, seats: 6 },
    { id: "xxl", name: "XXL", desc: "Max luggage space.", price: "$90.00", time: "12 min", eta: 12, icon: Anchor, image: "", multiplier: 3.7, seats: 6 }
  ],
  Elite: [
    { id: "lux", name: "ZIVO Lux", desc: "Rolls-Royce / Bentley.", price: "$250.00", time: "20 min", eta: 20, icon: Crown, image: "", multiplier: 10.0, seats: 4, tag: "lux" },
    { id: "sprinter", name: "Executive Sprinter", desc: "Jet van for 12.", price: "$180.00", time: "45 min", eta: 45, icon: Briefcase, image: "", multiplier: 7.3, seats: 12 },
    { id: "secure", name: "Secure Transit", desc: "Armored transport.", price: "$500.00", time: "60 min", eta: 60, icon: Shield, image: "", multiplier: 20.0, seats: 4 },
    { id: "pet", name: "Pet Premium", desc: "Luxury with pets.", price: "$75.00", time: "10 min", eta: 10, icon: Dog, image: "", multiplier: 3.0, seats: 4 }
  ]
};

const getPickupTime = (etaMinutes: number) => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + etaMinutes);
  return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const calculateFare = (distanceMiles: number, durationMinutes: number, multiplier: number) => {
  const baseFare = 2.00;
  const perMile = 1.25;
  const perMinute = 0.20;
  const fare = (baseFare + (distanceMiles * perMile) + (durationMinutes * perMinute)) * multiplier;
  return Math.max(fare, 5.00);
};

// Map View Component
function RidesMapView({ 
  userLocation,
  pickupCoords,
  dropoffCoords,
  pickup,
  dropoff,
  onPickupClick,
  onDropoffClick,
  onLocateMe
}: {
  userLocation: { lat: number; lng: number } | null;
  pickupCoords?: { lat: number; lng: number } | null;
  dropoffCoords?: { lat: number; lng: number } | null;
  pickup: string;
  dropoff: string;
  onPickupClick?: () => void;
  onDropoffClick?: () => void;
  onLocateMe?: () => void;
}) {
  const { isLoaded, loadError } = useGoogleMaps();
  const center = pickupCoords || userLocation || { lat: 30.4515, lng: -91.1871 };
  
  // Build markers
  const markers: MapMarker[] = [];
  if (pickupCoords) {
    markers.push({ id: "pickup", position: pickupCoords, type: "pickup", title: "Pickup" });
  } else if (userLocation) {
    markers.push({ id: "user-location", position: userLocation, type: "pickup", title: "Your Location" });
  }
  if (dropoffCoords) {
    markers.push({ id: "dropoff", position: dropoffCoords, type: "dropoff", title: "Destination" });
  }

  const route: MapRoute | undefined = pickupCoords && dropoffCoords ? {
    origin: pickupCoords,
    destination: dropoffCoords,
    color: "#1a1a1a",
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
        // Google Map
        <GoogleMap
          className="w-full h-full"
          center={center}
          zoom={markers.length > 1 ? 12 : 15}
          markers={markers}
          route={route}
          fitBounds={markers.length > 1}
          showControls={false}
          darkMode={false}
        />
      )}
      
      {/* Floating Location Chips */}
      <div className="absolute top-4 left-4 right-4 z-10 space-y-2">
        {pickup && (
          <button
            onClick={onPickupClick}
            className="flex items-center gap-2 bg-white rounded-lg shadow-lg px-3 py-2.5 text-left max-w-[280px] touch-manipulation active:scale-[0.98] transition-transform"
          >
            <div className="bg-zinc-900 text-white px-2 py-1.5 rounded text-[10px] font-bold leading-none flex-shrink-0 text-center min-w-[36px]">
              <div>5-10</div>
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
        
        {dropoff && (
          <button
            onClick={onDropoffClick}
            className="flex items-center gap-2 bg-white rounded-lg shadow-lg px-3 py-2.5 text-left max-w-[280px] touch-manipulation active:scale-[0.98] transition-transform"
          >
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center flex-shrink-0">
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
      </div>

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
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Bottom sheet state
  const y = useMotionValue(0);
  const dragControls = useDragControls();
  const [sheetExpanded, setSheetExpanded] = useState(false);

  const estimatedDistance = routeData?.distance || 5.2;
  const estimatedDuration = routeData?.duration || 15;

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
      const estimatedFare = calculateFare(estimatedDistance, estimatedDuration, selectedOption.multiplier || 1.0);
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
          estimated_fare: estimatedFare,
          distance_miles: estimatedDistance,
          duration_minutes: estimatedDuration,
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
    setSelectedOption(null);
    setContactInfo({ name: "", phone: "", email: "", notes: "" });
    setRequestId(null);
    clearRoute();
    navigate("/rides", { replace: true });
  };

  const getFareFixed = (option: RideOption) => {
    const fare = calculateFare(estimatedDistance, estimatedDuration, option.multiplier || 1.0);
    return `$${fare.toFixed(2)}`;
  };

  // Sheet snap handling
  const snapToPosition = (expanded: boolean) => {
    const target = expanded ? -window.innerHeight * 0.45 : 0;
    animate(y, target, { type: "spring", stiffness: 400, damping: 40 });
    setSheetExpanded(expanded);
  };

  const handleDragEnd = () => {
    const currentY = y.get();
    const threshold = -window.innerHeight * 0.2;
    snapToPosition(currentY < threshold);
  };

  // Calculate sheet height based on step
  const getSheetHeight = () => {
    if (step === "request") return "55vh";
    if (step === "options") return "60vh";
    return "70vh";
  };

  return (
    <div className="fixed inset-0 bg-zinc-100 flex flex-col">
      <SEOHead
        title="ZIVO Rides — Request a Ride"
        description="Book a ride with ZIVO. Fast, reliable, and safe rides with verified drivers."
      />
      
      {/* Back button for non-request steps */}
      {step !== "request" && step !== "success" && (
        <button
          onClick={() => {
            if (step === "options") setStep("request");
            else if (step === "confirm") setStep("options");
            else if (step === "checkout") setStep("confirm");
          }}
          className="absolute top-4 left-4 z-50 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center touch-manipulation active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 text-zinc-700" />
        </button>
      )}
      
      {/* Full-height Map */}
      <div className="flex-1 relative">
        <RidesMapView
          userLocation={userLocation}
          pickupCoords={pickupCoords}
          dropoffCoords={dropoffCoords}
          pickup={pickup}
          dropoff={dropoff}
          onLocateMe={handleUseCurrentLocation}
        />
      </div>
      
      {/* Bottom Sheet */}
      <motion.div
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: -window.innerHeight * 0.5, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col"
        animate={{ height: getSheetHeight() }}
        transition={{ type: "spring", stiffness: 300, damping: 35 }}
      >
        {/* Drag Handle */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="flex justify-center py-3 cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
        >
          <div className="w-10 h-1 bg-zinc-300 rounded-full" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-24">
          {/* Request Step */}
          {step === "request" && (
            <div className="space-y-4">
              {/* Title */}
              <h1 className="text-xl font-bold text-zinc-900">Where to?</h1>
              
              {/* Pickup & Dropoff Inputs */}
              <div className="relative bg-zinc-100 rounded-xl p-1">
                {/* Pickup Input */}
                <div className="relative">
                  <div className="flex items-center gap-3 px-3 py-3">
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
                
                {/* Dropoff Input */}
                <div className="relative">
                  <div className="flex items-center gap-3 px-3 py-3">
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

              {/* Category Tabs */}
              <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1">
                {(Object.keys(rideCategories) as CategoryKey[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                      activeTab === cat 
                        ? "bg-zinc-900 text-white" 
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Ride Options List */}
              <div className="space-y-2">
                {rideCategories[activeTab].map((ride) => {
                  const isSelected = selectedOption?.id === ride.id;
                  return (
                    <button
                      key={ride.id}
                      onClick={() => handleSelectOption(ride)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                        isSelected 
                          ? "bg-zinc-100 ring-2 ring-zinc-900" 
                          : "hover:bg-zinc-50"
                      }`}
                    >
                      <CarIcon />
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-900">{ride.name}</span>
                          <TagPill tag={ride.tag} />
                          <span className="text-xs text-zinc-500 flex items-center gap-0.5">
                            <UserRound className="w-3 h-3" />
                            {ride.seats}
                          </span>
                        </div>
                        <div className="text-sm text-zinc-500">
                          {getPickupTime(ride.eta || 5)} · {ride.eta} min
                        </div>
                      </div>
                      <span className="text-base font-bold text-zinc-900">{getFareFixed(ride)}</span>
                    </button>
                  );
                })}
              </div>

              {/* Confirm Button */}
              {selectedOption && dropoff && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-zinc-200">
                  <Button
                    onClick={handleFindRides}
                    className="w-full h-14 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-base rounded-xl"
                  >
                    Choose {selectedOption.name}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Options Step - Confirm selection */}
          {step === "options" && selectedOption && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-zinc-900">Confirm your ride</h2>
              
              <div className="bg-zinc-100 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-sm text-zinc-900 truncate">{pickup}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-zinc-900 rounded-full" />
                  <span className="text-sm text-zinc-900 truncate">{dropoff}</span>
                </div>
                <div className="flex gap-4 mt-3 pt-3 border-t border-zinc-200 text-sm text-zinc-500">
                  <span>~{estimatedDistance.toFixed(1)} mi</span>
                  <span>~{estimatedDuration} min</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl">
                <CarIcon />
                <div className="flex-1">
                  <span className="font-semibold text-zinc-900">{selectedOption.name}</span>
                  <div className="text-sm text-zinc-500">{selectedOption.eta} min away</div>
                </div>
                <span className="text-lg font-bold text-zinc-900">{getFareFixed(selectedOption)}</span>
              </div>

              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-zinc-200">
                <Button
                  onClick={handleConfirmRide}
                  className="w-full h-14 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-base rounded-xl"
                >
                  Continue
                </Button>
              </div>
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

              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-zinc-200">
                <Button
                  onClick={handleStartCheckout}
                  disabled={!contactInfo.name || !contactInfo.phone || isSubmitting}
                  className="w-full h-14 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-base rounded-xl gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Continue to Payment
                </Button>
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
      </motion.div>

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
