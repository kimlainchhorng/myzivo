/**
 * ZIVO Rides — Premium 2026 Booking Page
 * Dark Glassmorphism with layered scroll architecture
 * Now with real Mapbox geocoding, routing, and dynamic pricing
 * Embedded Stripe Elements checkout (no redirect)
 */

import { useState, useEffect, useCallback } from "react";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, Navigation, Clock, Shield, Star, CheckCircle2,
  ChevronRight, Phone, Mail, User, CreditCard, Loader2, LocateFixed,
  Leaf, Zap, Briefcase, Crown, Anchor, Dog, CarFront, UserRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import MobileCheckoutFooter from "@/components/mobile/MobileCheckoutFooter";
import { useIsMobile } from "@/hooks/useMobileSettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import RidesMapBackground from "@/components/ride/RidesMapBackground";
import { useGoogleMapsRoute, RouteData } from "@/hooks/useGoogleMapsRoute";
import { useGoogleMapsGeocode } from "@/hooks/useGoogleMapsGeocode";
import { calculateRidePrice, TripDetails } from "@/lib/tripCalculator";
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

// Glassmorphism Car Icon component with Lucide icon - compact for mobile
function CarIcon() {
  return (
    <div className="flex h-9 w-9 md:h-11 md:w-11 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 shrink-0">
      <CarFront className="h-5 w-5 md:h-6 md:w-6 text-white/90" />
    </div>
  );
}

// Tag pill component for ride features (glassmorphism style) - compact for mobile
function TagPill({ tag }: { tag?: RideTag }) {
  if (!tag) return null;
  
  const tagMap: Record<RideTag, { icon: string; label: string }> = {
    wait_save: { icon: "⏱️", label: "Save" },
    priority: { icon: "⚡", label: "Fast" },
    green: { icon: "🌿", label: "Eco" },
    standard: { icon: "⭐", label: "Standard" },
    lux: { icon: "💎", label: "Elite" },
  };
  
  const item = tagMap[tag];
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] md:text-[11px] font-medium text-white/90 backdrop-blur">
      <span aria-hidden className="text-[10px]">{item.icon}</span>
      {item.label}
    </span>
  );
}

type CategoryKey = "Economy" | "Premium" | "Elite";
 
 // Premium categorized vehicle options with clean car images
 const rideCategories: Record<CategoryKey, RideOption[]> = {
  Economy: [
    {
      id: "wait_save",
      name: "Wait & Save",
      desc: "Lowest price, longer wait.",
      price: "$18.50",
      time: "15 min",
      eta: 15,
      icon: Clock,
      image: "https://img.icons8.com/isometric/200/car.png",
      multiplier: 0.75,
      seats: 4,
      tag: "wait_save"
    },
    {
      id: "standard",
      name: "Standard",
      desc: "Reliable everyday rides.",
      price: "$24.50",
      time: "4 min",
      eta: 4,
      icon: Navigation,
      image: "https://img.icons8.com/isometric/200/sedan.png",
      multiplier: 1.0,
      seats: 4,
      tag: "standard"
    },
    {
      id: "green",
      name: "Green",
      desc: "EVs & Hybrids.",
      price: "$25.00",
      time: "6 min",
      eta: 6,
      icon: Leaf,
      image: "https://img.icons8.com/isometric/200/electric-car.png",
      multiplier: 1.02,
      seats: 4,
      tag: "green"
    },
    {
      id: "priority",
      name: "Priority",
      desc: "Faster pickup.",
      price: "$32.00",
      time: "1 min",
      eta: 1,
      icon: Zap,
      image: "https://img.icons8.com/isometric/200/sedan.png",
      multiplier: 1.3,
      seats: 4,
      tag: "priority"
    }
  ],
   Premium: [
     {
       id: "comfort",
       name: "Extra Comfort",
       desc: "Newer cars, more legroom.",
       price: "$38.00",
       time: "5 min",
       eta: 5,
       icon: Star,
       image: "https://img.icons8.com/isometric/200/hatchback.png",
       multiplier: 1.55,
       seats: 4
     },
     {
       id: "black",
       name: "ZIVO Black",
       desc: "Premium leather sedans.",
       price: "$65.00",
       time: "8 min",
       eta: 8,
       icon: Briefcase,
       image: "https://img.icons8.com/isometric/200/limousine.png",
       multiplier: 2.65,
       seats: 4
     },
     {
       id: "black_suv",
       name: "Black SUV",
       desc: "Luxury for 6.",
       price: "$85.00",
       time: "10 min",
       eta: 10,
       icon: Shield,
       image: "https://img.icons8.com/isometric/200/suv.png",
       multiplier: 3.5,
       seats: 6
     },
     {
       id: "xxl",
       name: "XXL",
       desc: "Max luggage space.",
       price: "$90.00",
       time: "12 min",
       eta: 12,
       icon: Anchor,
       image: "https://img.icons8.com/isometric/200/suv.png",
       multiplier: 3.7,
       seats: 6
     }
   ],
   Elite: [
     {
       id: "lux",
       name: "ZIVO Lux",
       desc: "Rolls-Royce / Bentley.",
       price: "$250.00",
       time: "20 min",
       eta: 20,
       icon: Crown,
       image: "https://img.icons8.com/isometric/200/limousine.png",
       multiplier: 10.0,
       seats: 4,
       tag: "lux"
     },
     {
       id: "sprinter",
       name: "Executive Sprinter",
       desc: "Jet van for 12.",
       price: "$180.00",
       time: "45 min",
       eta: 45,
       icon: Briefcase,
       image: "https://img.icons8.com/isometric/200/minibus.png",
       multiplier: 7.3,
       seats: 12
     },
     {
       id: "secure",
       name: "Secure Transit",
       desc: "Armored transport.",
       price: "$500.00",
       time: "60 min",
       eta: 60,
       icon: Shield,
       image: "https://img.icons8.com/isometric/200/suv.png",
       multiplier: 20.0,
       seats: 4
     },
     {
       id: "pet",
       name: "Pet Premium",
       desc: "Luxury with pets.",
       price: "$75.00",
       time: "10 min",
       eta: 10,
       icon: Dog,
       image: "https://img.icons8.com/isometric/200/hatchback.png",
       multiplier: 3.0,
       seats: 4
     }
   ]
 };

 // Helper to get pickup time string
 const getPickupTime = (etaMinutes: number) => {
   const now = new Date();
   now.setMinutes(now.getMinutes() + etaMinutes);
   return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
 };
 
// Real fare calculation using spec formula
const calculateFare = (distanceMiles: number, durationMinutes: number, multiplier: number) => {
  const baseFare = 2.00;
  const perMile = 1.25;
  const perMinute = 0.20;
  const fare = (baseFare + (distanceMiles * perMile) + (durationMinutes * perMinute)) * multiplier;
  return Math.max(fare, 5.00); // $5 minimum
};

export default function Rides() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getCurrentLocation, reverseGeocode, isGettingLocation } = useCurrentLocation();
  const isMobile = useIsMobile();
  const { routeData, isLoading: isRouteLoading, fetchRoute } = useGoogleMapsRoute();
  const { 
    suggestions: pickupSuggestions, 
    fetchSuggestions: fetchPickupSuggestions,
    clearSuggestions: clearPickupSuggestions 
  } = useGoogleMapsGeocode();
  const { 
    suggestions: dropoffSuggestions, 
    fetchSuggestions: fetchDropoffSuggestions,
    clearSuggestions: clearDropoffSuggestions 
  } = useGoogleMapsGeocode();
  
  const [step, setStep] = useState<RideStep>("request");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [selectedOption, setSelectedOption] = useState<RideOption | null>(null);
  const [contactInfo, setContactInfo] = useState({ name: "", phone: "", email: "", notes: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CategoryKey>("Premium");
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Embedded checkout state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [checkoutAmount, setCheckoutAmount] = useState<number>(0);

  // Address autocomplete state
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);

  // Real route data
  const estimatedDistance = routeData?.distance || 5.2;
  const estimatedDuration = routeData?.duration || 15;

  // Fetch route when both addresses are set
  useEffect(() => {
    if (pickup.trim() && dropoff.trim()) {
      fetchRoute(pickup, dropoff);
    }
  }, [pickup, dropoff, fetchRoute]);

  // Handle suggestion selection
  const handlePickupSuggestionClick = useCallback((suggestion: { placeName: string }) => {
    setPickup(suggestion.placeName);
    setShowPickupSuggestions(false);
    clearPickupSuggestions();
  }, [clearPickupSuggestions]);

  const handleDropoffSuggestionClick = useCallback((suggestion: { placeName: string }) => {
    setDropoff(suggestion.placeName);
    setShowDropoffSuggestions(false);
    clearDropoffSuggestions();
  }, [clearDropoffSuggestions]);
 
   // Auto-detect location on mount
   useEffect(() => {
     const autoDetectLocation = async () => {
     setIsAutoDetecting(true);
       try {
         const location = await getCurrentLocation();
         setUserLocation({ lat: location.lat, lng: location.lng });
         const address = await reverseGeocode(location.lat, location.lng);
         setPickup(address);
       toast.success("Location detected");
       } catch {
       // Fail silently - user can enter manually
       // Set default location (Baton Rouge)
       setUserLocation({ lat: 30.4515, lng: -91.1871 });
     } finally {
       setIsAutoDetecting(false);
       }
     };
     if (!pickup) {
       autoDetectLocation();
     }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

   const handleUseCurrentLocation = async () => {
     try {
       const location = await getCurrentLocation();
       const address = await reverseGeocode(location.lat, location.lng);
       setPickup(address);
       toast.success("Location detected");
     } catch (error) {
       toast.error("Could not get your location");
     }
   };

  const handleUseCurrentLocationForDropoff = async () => {
    try {
      const location = await getCurrentLocation();
      const address = await reverseGeocode(location.lat, location.lng);
      setDropoff(address);
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
     setStep("confirm");
   };
 
   // Start embedded checkout - creates PaymentIntent and shows form
   const handleStartCheckout = async () => {
     if (!contactInfo.name || !contactInfo.phone || !selectedOption) return;
     
     setStep("processing");
     setIsSubmitting(true);
     
     try {
       const estimatedFare = calculateFare(estimatedDistance, estimatedDuration, selectedOption.multiplier || 1.0);
       console.log("[Rides] Creating payment intent...", { estimatedFare, selectedOption: selectedOption.id });
       
       // Create a timeout promise (15 seconds)
       const timeoutPromise = new Promise<never>((_, reject) => {
         setTimeout(() => reject(new Error("Request timed out")), 15000);
       });
       
       // Race between the actual request and the timeout
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
       
       console.log("[Rides] Payment intent response:", { data, error });
       
       if (error) throw error;
       if (!data?.clientSecret) throw new Error("No client secret returned");
       
       // Set checkout state and show embedded form
       setClientSecret(data.clientSecret);
       setCheckoutAmount(data.amount);
       setRequestId(data.requestId);
       setStep("checkout");
       setIsSubmitting(false);
       
     } catch (error) {
       console.error("[Rides] Payment intent error:", error);
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
   
   // Handle successful payment from embedded checkout
   const handlePaymentSuccess = (paymentIntentId: string) => {
     console.log("[Rides] Payment successful:", paymentIntentId);
     setStep("success");
     toast.success("Payment successful! Your ride is being confirmed.");
   };
   
   // Cancel checkout and go back to confirm step
   const handleCancelCheckout = () => {
     setStep("confirm");
     setClientSecret(null);
     setCheckoutAmount(0);
   };
 
   const handleReset = () => {
     setStep("request");
     setPickup("");
     setDropoff("");
     setSelectedOption(null);
     setContactInfo({ name: "", phone: "", email: "", notes: "" });
     setRequestId(null);
     navigate("/rides", { replace: true });
   };
 
   const getFareEstimate = (option: RideOption) => {
     const fare = calculateFare(estimatedDistance, estimatedDuration, option.multiplier || 1.0);
     const min = (fare * 0.9).toFixed(0);
     const max = (fare * 1.1).toFixed(0);
     return `$${min}-${max}`;
   };
 
  const getFareFixed = (option: RideOption) => {
    const fare = calculateFare(estimatedDistance, estimatedDuration, option.multiplier || 1.0);
    return `$${fare.toFixed(2)}`;
  };

   return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans pb-20 md:pb-0">
       <SEOHead
         title="ZIVO Rides — Request a Ride"
         description="Book a ride with ZIVO. Fast, reliable, and safe rides with verified drivers."
       />
       <Header />
 
      <main className="relative">
        {/* FIXED LAYER — Dark Map Background with Mapbox */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <RidesMapBackground 
            userLocation={userLocation}
            pickupCoords={routeData?.pickupCoords}
            dropoffCoords={routeData?.dropoffCoords}
            routeCoordinates={routeData?.coordinates}
          />
          <div className="absolute inset-0 rides-gradient-overlay" />
        </div>
 
       {/* SCROLLABLE CONTENT LAYER — Optimized for no-scroll mobile */}
       <div className="relative z-20 pt-12 md:pt-24 px-2 sm:px-6 pb-24 md:pb-40">
            {step === "request" && (
             <div className="max-w-xl mx-auto space-y-2 md:space-y-8">
               {/* Header - more compact on mobile */}
                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-center rides-content-visible"
                >
                 <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2 py-0.5 md:px-4 md:py-2 rounded-full border border-white/10 mb-1 md:mb-4">
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-500 rounded-full animate-pulse" />
                   <span className="text-[9px] md:text-xs font-bold uppercase tracking-widest">35 Drivers Nearby</span>
                   </div>
                 <h1 className="text-xl sm:text-3xl md:text-5xl font-black tracking-tighter">Where to?</h1>
                </motion.div>

               {/* GLASS INPUT PANEL - compact for mobile */}
                <motion.div 
                   initial={{ y: 20, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ delay: 0.1 }}
                   className="rides-glass-panel rounded-xl md:rounded-[2rem] p-2 md:p-6 shadow-2xl rides-content-visible relative z-50"
                 >
                  <div className="relative">
                    {/* Visual Connector Line */}
                   <div className="absolute left-[0.7rem] md:left-[1.15rem] top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary to-emerald-500 opacity-50" />
                    
                    {/* Pickup Input */}
                    <div className="relative">
                      <div className="rides-input-glass flex items-center gap-2 md:gap-4 mb-1.5 md:mb-4 p-2 md:p-4 rounded-lg md:rounded-2xl">
                        <div className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                          <Navigation className="w-3 h-3 md:w-5 md:h-5" />
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="text-[8px] md:text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Pickup</div>
                          <input 
                            value={pickup}
                            onChange={(e) => {
                              setPickup(e.target.value);
                              setShowPickupSuggestions(true);
                              fetchPickupSuggestions(e.target.value, userLocation || undefined);
                            }}
                            onFocus={() => setShowPickupSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowPickupSuggestions(false), 200)}
                            placeholder={isAutoDetecting || isGettingLocation ? "Detecting location..." : "Enter pickup address..."}
                            className="w-full bg-transparent text-white font-medium outline-none placeholder-zinc-600 truncate text-xs md:text-base" 
                            style={{ fontSize: '16px' }}
                          />
                       </div>
                       <button
                         type="button"
                         onClick={handleUseCurrentLocation}
                         disabled={isGettingLocation || isAutoDetecting}
                         className="p-1.5 md:p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 shrink-0 touch-manipulation active:scale-95"
                         title="Use current location"
                       >
                         <LocateFixed className={`w-4 h-4 md:w-5 md:h-5 text-primary ${isGettingLocation || isAutoDetecting ? "animate-pulse" : ""}`} />
                       </button>
                     </div>
                     
                     {/* Pickup Suggestions Dropdown */}
                     <AnimatePresence>
                       {showPickupSuggestions && pickupSuggestions.length > 0 && (
                         <motion.div
                           initial={{ opacity: 0, y: -10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -10 }}
                           className="absolute left-0 right-0 mt-1 rounded-xl overflow-hidden isolate"
                           style={{ 
                             zIndex: 9999, 
                             backgroundColor: '#09090b',
                             boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)'
                           }}
                         >
                            <div className="border border-zinc-700 rounded-xl overflow-hidden">
                              {pickupSuggestions.map((suggestion) => (
                                <button
                                  key={suggestion.id}
                                  onClick={() => handlePickupSuggestionClick(suggestion)}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-zinc-800 last:border-b-0"
                                  style={{ 
                                    backgroundColor: '#09090b',
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a1a1f'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#09090b'}
                                >
                                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                                  <span className="text-sm text-white truncate">{suggestion.placeName}</span>
                                </button>
                              ))}
                            </div>
                         </motion.div>
                       )}
                     </AnimatePresence>
                   </div>

                   {/* Dropoff Input */}
                    <div className="relative">
                      <div className="rides-input-glass flex items-center gap-2 md:gap-4 p-2 md:p-4 rounded-lg md:rounded-2xl">
                        <div className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                          <MapPin className="w-3 h-3 md:w-5 md:h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[8px] md:text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Destination</div>
                           <input 
                             value={dropoff}
                             onChange={(e) => {
                               setDropoff(e.target.value);
                               setShowDropoffSuggestions(true);
                               fetchDropoffSuggestions(e.target.value, userLocation || undefined);
                             }}
                             onFocus={() => setShowDropoffSuggestions(true)}
                             onBlur={() => setTimeout(() => setShowDropoffSuggestions(false), 200)}
                             placeholder="Enter destination..."
                             className="w-full bg-transparent text-white font-medium outline-none placeholder-zinc-600 truncate text-xs md:text-base" 
                             style={{ fontSize: '16px' }}
                           />
                        </div>
                        <button
                          type="button"
                          onClick={handleUseCurrentLocationForDropoff}
                          disabled={isGettingLocation}
                          className="p-1.5 md:p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 shrink-0 touch-manipulation active:scale-95"
                          title="Use current location"
                        >
                          <LocateFixed className={`w-4 h-4 md:w-5 md:h-5 text-emerald-400 ${isGettingLocation ? "animate-pulse" : ""}`} />
                        </button>
                      </div>
                      
                      {/* Dropoff Suggestions Dropdown */}
                      <AnimatePresence>
                        {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute left-0 right-0 mt-1 rounded-xl overflow-hidden isolate"
                            style={{ 
                              zIndex: 9999, 
                              backgroundColor: '#09090b',
                              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)'
                            }}
                          >
                             <div className="border border-zinc-700 rounded-xl overflow-hidden">
                               {dropoffSuggestions.map((suggestion) => (
                                 <button
                                   key={suggestion.id}
                                   onClick={() => handleDropoffSuggestionClick(suggestion)}
                                   className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-b border-zinc-800 last:border-b-0"
                                   style={{ 
                                     backgroundColor: '#09090b',
                                   }}
                                   onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a1a1f'}
                                   onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#09090b'}
                                 >
                                   <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                                   <span className="text-sm text-white truncate">{suggestion.placeName}</span>
                                 </button>
                               ))}
                             </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                   </div>
                   
                   {/* Distance & Duration Display */}
                   {pickup.trim() && dropoff.trim() && (
                     <div className="flex items-center justify-center gap-3 mt-2 pt-2 border-t border-white/10">
                       <span className="text-[10px] md:text-sm text-zinc-400 font-medium">~{estimatedDistance.toFixed(1)} mi</span>
                       <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                       <span className="text-[10px] md:text-sm text-zinc-400 font-medium">~{estimatedDuration} min</span>
                     </div>
                   )}
                </motion.div>

               {/* VEHICLE FLEET SELECTOR */}
               <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="rides-content-visible relative z-10"
                >
                 {/* Header - compact on mobile */}
                <div className="text-center mb-1.5 md:mb-8">
                  <h2 className="text-base sm:text-xl md:text-3xl font-black tracking-tight mb-1 md:mb-6">
                     Choose Your <span className="text-primary">Ride</span>
                   </h2>
                   
                   {/* Category Tab Selector */}
                   <div className="flex justify-center">
                    <div className="flex gap-0.5 md:gap-2 p-0.5 md:p-1.5 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 overflow-x-auto hide-scrollbar">
                       {(Object.keys(rideCategories) as CategoryKey[]).map((cat) => (
                         <button
                           key={cat}
                           onClick={() => setActiveTab(cat)}
                          className={`px-2.5 sm:px-5 md:px-8 py-1 sm:py-2 md:py-3 rounded-full text-[8px] sm:text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-300 touch-manipulation whitespace-nowrap ${
                             activeTab === cat 
                               ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" 
                               : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                           }`}
                         >
                           {cat}
                         </button>
                       ))}
                     </div>
                   </div>
                 </div>
                
                 {/* Vehicle List - compact cards for mobile */}
                 <motion.div 
                   layout
                   className="space-y-1.5 md:space-y-3"
                 >
                    <AnimatePresence mode="popLayout">
                      {rideCategories[activeTab].map((ride) => {
                        const isSelected = selectedOption?.id === ride.id;
                        return (
                        <motion.button 
                          key={ride.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          onClick={() => setSelectedOption(ride)}
                          className={[
                            "w-full text-left",
                            "rounded-xl md:rounded-[18px] p-2 md:p-[14px]",
                            "bg-black/35 backdrop-blur-[14px]",
                            "border border-white/10",
                            "shadow-[0_8px_20px_rgba(0,0,0,0.3)]",
                            "transition active:scale-[0.99]",
                            isSelected
                              ? "border-blue-500/90 shadow-[0_0_0_1px_rgba(59,130,246,0.65),0_8px_20px_rgba(0,0,0,0.3)]"
                              : "hover:bg-black/40",
                          ].join(" ")}
                         >
                          <div className="flex items-center gap-2 md:gap-3">
                            {/* Left - Car Icon */}
                            <CarIcon />

                            {/* Middle - Info section - single line on mobile */}
                            <div className="flex-1 min-w-0">
                              {/* Tag + Name on same row for mobile */}
                              <div className="flex items-center gap-1.5 min-w-0 mb-0.5">
                                <TagPill tag={ride.tag} />
                                <h3 className="text-[13px] md:text-[15px] font-semibold text-white truncate">{ride.name}</h3>
                                <span className="inline-flex items-center gap-0.5 rounded bg-white/10 px-1 py-0.5 text-[9px] md:text-[11px] font-medium text-white/80">
                                  <UserRound className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                  {ride.seats || 4}
                                </span>
                              </div>
                              <p className="text-[10px] md:text-[12px] text-white/60">
                                {getPickupTime(ride.eta || 5)} · {ride.eta || 5} min · {ride.desc}
                              </p>
                            </div>

                            {/* Right - Price + selection dot */}
                            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                              <span className="text-[14px] md:text-[16px] font-bold text-white tabular-nums">
                                {getFareFixed(ride)}
                              </span>
                              <div
                                className={[
                                  "h-2 w-2 rounded-full",
                                  isSelected ? "bg-blue-500 ring-2 ring-white/90" : "bg-white/20",
                                ].join(" ")}
                                aria-hidden
                              />
                            </div>
                          </div>
                        </motion.button>
                        );
                      })}
                    </AnimatePresence>
                 </motion.div>
               </motion.div>

               {/* WHY ZIVO — Hidden on mobile for no-scroll experience */}
               <motion.div
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.3 }}
                className="hidden md:block pt-8"
               >
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-emerald-500 rounded-full" />
                   Why ZIVO Rides
                 </h2>
                <div className="grid grid-cols-3 gap-4">
                   {[
                     { icon: Clock, title: "Instant Pickup", text: "AI-dispatching in under 3 minutes" },
                     { icon: Shield, title: "Verified Elite", text: "50-point security background check" },
                     { icon: Star, title: "Premium Fleet", text: "No cars older than 3 years" }
                   ].map((item, i) => (
                    <div key={i} className="rides-glass-panel p-6 rounded-2xl hover:bg-zinc-900/80 transition-colors">
                      <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center mb-4">
                        <item.icon className="w-6 h-6" />
                       </div>
                      <h3 className="text-base font-bold mb-1">{item.title}</h3>
                      <p className="text-sm text-zinc-400">{item.text}</p>
                     </div>
                   ))}
                 </div>
               </motion.div>
              </div>
            )}
 
           {step === "options" && (
           <div className="max-w-xl mx-auto space-y-4 md:space-y-6 animate-in fade-in slide-in-from-right duration-300">
             <Button variant="ghost" onClick={() => setStep("request")} className="gap-2 mb-2 text-white hover:bg-white/10 h-12 touch-manipulation">← Back</Button>
             <div className="rides-glass-panel p-3 md:p-4 rounded-xl md:rounded-2xl">
                 <div className="flex items-center gap-3 text-sm">
                 <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-primary rounded-full" />
                   <span className="flex-1 truncate font-medium">{pickup}</span>
                 </div>
                <div className="w-px h-4 bg-white/20 ml-1.5 my-1" />
                 <div className="flex items-center gap-3 text-sm">
                 <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-emerald-500 rounded-full" />
                   <span className="flex-1 truncate font-medium">{dropoff}</span>
                 </div>
               <div className="flex items-center gap-4 mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/10 text-xs md:text-sm text-zinc-400">
                   <span>~{estimatedDistance} mi</span>
                   <span>~{estimatedDuration} min</span>
                 </div>
               </div>
              <h2 className="font-display font-bold text-xl md:text-2xl">Choose your ride</h2>
              <div className="space-y-2 md:space-y-3">
                  {rideCategories[activeTab].map((option) => {
                    const isSelected = selectedOption?.id === option.id;
                    return (
                  <button 
                    key={option.id} 
                    onClick={() => handleSelectOption(option)} 
                    className={[
                      "w-full text-left",
                      "rounded-[18px] p-[14px]",
                      "bg-black/35 backdrop-blur-[14px]",
                      "border border-white/10",
                      "shadow-[0_12px_30px_rgba(0,0,0,0.35)]",
                      "transition active:scale-[0.99]",
                      isSelected
                        ? "border-blue-500/90 shadow-[0_0_0_1px_rgba(59,130,246,0.65),0_12px_30px_rgba(0,0,0,0.35)]"
                        : "hover:bg-black/40",
                    ].join(" ")}
                   >
                    <div className="flex items-center gap-3">
                      {/* Left - Car Icon */}
                      <CarIcon />
                      
                      {/* Info section */}
                      <div className="flex-1 min-w-0">
                        {/* Optional tag badge */}
                        <div className="mb-1">
                          <TagPill tag={option.tag} />
                        </div>
                        <div className="flex items-center gap-2 min-w-0 mb-0.5">
                          <h3 className="text-[15px] font-semibold text-white truncate">{option.name}</h3>
                          <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-1.5 py-0.5 text-[11px] font-medium text-white/80">
                            <UserRound className="h-3.5 w-3.5" />
                            {option.seats || 4}
                          </span>
                        </div>
                        <p className="text-[12px] text-white/75 mb-0.5">
                          {getPickupTime(option.eta || 5)} · {option.eta || 5} min
                        </p>
                        <p className="text-[12px] text-white/55 truncate">{option.desc}</p>
                      </div>
                      
                      {/* Right - Price + selection dot */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-[16px] font-bold text-white tabular-nums">{getFareFixed(option)}</span>
                        <div
                          className={[
                            "h-2 w-2 rounded-full",
                            isSelected ? "bg-blue-500 ring-2 ring-white/90" : "bg-white/20",
                          ].join(" ")}
                          aria-hidden
                        />
                      </div>
                    </div>
                  </button>
                    );
                  })}
                </div>
             </div>
           )}
 
           {step === "confirm" && selectedOption && (
            <div className="max-w-xl mx-auto space-y-4 md:space-y-6 animate-in fade-in slide-in-from-right duration-300">
              <Button variant="ghost" onClick={() => setStep("options")} className="gap-2 mb-2 text-white hover:bg-white/10 h-12 touch-manipulation">← Back</Button>
              <div className={[
                "rounded-[18px] p-[14px]",
                "bg-black/35 backdrop-blur-[14px]",
                "border border-white/10",
                "shadow-[0_12px_30px_rgba(0,0,0,0.35)]",
              ].join(" ")}>
                <div className="flex items-center gap-3">
                   <CarIcon />
                    <div className="flex-1 min-w-0">
                     <div className="mb-1">
                       <TagPill tag={selectedOption.tag} />
                     </div>
                     <h3 className="text-[15px] font-semibold text-white">{selectedOption.name}</h3>
                    <p className="text-[12px] text-white/55 truncate">{pickup} → {dropoff}</p>
                    </div>
                    <div className="text-right">
                    <p className="text-[16px] font-bold text-blue-400 tabular-nums">${calculateFare(estimatedDistance, estimatedDuration, selectedOption.multiplier || 1.0).toFixed(2)}</p>
                    <p className="text-[11px] text-white/55">Est. total</p>
                   </div>
                 </div>
               </div>
              <h2 className="font-display font-bold text-xl md:text-2xl">Your Information</h2>
              <div className="space-y-3 md:space-y-4">
                 <div>
                  <Label htmlFor="name" className="text-sm font-medium text-zinc-300">Full Name *</Label>
                   <div className="relative mt-1.5">
                   <User className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                   <Input id="name" placeholder="Your name" value={contactInfo.name} onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))} className="pl-10 md:pl-11 h-12 bg-zinc-900/50 border-zinc-700 text-white placeholder-zinc-500" style={{ fontSize: '16px' }} />
                   </div>
                 </div>
                 <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-zinc-300">Phone Number *</Label>
                   <div className="relative mt-1.5">
                   <Phone className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                   <Input id="phone" type="tel" placeholder="(555) 123-4567" value={contactInfo.phone} onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))} className="pl-10 md:pl-11 h-12 bg-zinc-900/50 border-zinc-700 text-white placeholder-zinc-500" style={{ fontSize: '16px' }} />
                   </div>
                 </div>
                 <div>
                  <Label htmlFor="email" className="text-sm font-medium text-zinc-300">Email (for receipt)</Label>
                   <div className="relative mt-1.5">
                   <Mail className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                   <Input id="email" type="email" placeholder="your@email.com" value={contactInfo.email} onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))} className="pl-10 md:pl-11 h-12 bg-zinc-900/50 border-zinc-700 text-white placeholder-zinc-500" style={{ fontSize: '16px' }} />
                   </div>
                 </div>
                 <div>
                  <Label htmlFor="notes" className="text-sm font-medium text-zinc-300">Notes (optional)</Label>
                 <Textarea id="notes" placeholder="Any special requests..." value={contactInfo.notes} onChange={(e) => setContactInfo(prev => ({ ...prev, notes: e.target.value }))} className="mt-1.5 min-h-[80px] md:min-h-[100px] bg-zinc-900/50 border-zinc-700 text-white placeholder-zinc-500" style={{ fontSize: '16px' }} />
                 </div>
               </div>
             <Button onClick={handleStartCheckout} disabled={!contactInfo.name || !contactInfo.phone || isSubmitting} size="lg" className="w-full h-14 rounded-xl font-bold gap-3 bg-white text-black hover:bg-zinc-200 text-base md:text-lg touch-manipulation active:scale-[0.98]">
                 <CreditCard className="w-5 h-5" />
                  Continue to Payment
               </Button>
              <p className="text-xs text-center text-zinc-500">Secure payment via Stripe. We don't store your card details.</p>
             </div>
           )}
           
           {/* Embedded Stripe Checkout */}
           {step === "checkout" && selectedOption && clientSecret && (
           <div className="max-w-xl mx-auto space-y-4 md:space-y-6 animate-in fade-in slide-in-from-right duration-300">
             <Button variant="ghost" onClick={handleCancelCheckout} className="gap-2 mb-2 text-white hover:bg-white/10 h-12 touch-manipulation">← Back</Button>
             
             <RideEmbeddedCheckout
               clientSecret={clientSecret}
               amount={checkoutAmount}
               onSuccess={handlePaymentSuccess}
               onCancel={handleCancelCheckout}
               pickupAddress={pickup}
               dropoffAddress={dropoff}
               rideName={selectedOption.name}
             />
           </div>
           )}
 
           {step === "processing" && (
           <div className="max-w-xl mx-auto py-16 md:py-24 text-center space-y-4 md:space-y-6 animate-in fade-in duration-200">
             <Loader2 className="w-12 h-12 md:w-14 md:h-14 mx-auto text-primary animate-spin" />
               <div>
                <h2 className="font-display text-xl md:text-2xl font-bold mb-2">Setting up payment...</h2>
                <p className="text-zinc-400">Please wait while we prepare your secure checkout.</p>
               </div>
               
               {/* Help text for ad blockers */}
               <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                 If you use an ad blocker, please allow <span className="text-zinc-400">supabase.co</span> and <span className="text-zinc-400">stripe.com</span>.
               </p>
               
               {/* Cancel button */}
               <Button 
                 variant="ghost" 
                 onClick={handleCancelCheckout}
                 className="text-zinc-400 hover:text-white hover:bg-white/10"
               >
                 ← Cancel and go back
               </Button>
             </div>
           )}
 
           {step === "success" && (
           <div className="max-w-xl mx-auto py-12 md:py-16 text-center space-y-6 md:space-y-8 animate-in fade-in zoom-in-95 duration-300">
             <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
               <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-emerald-500" />
               </div>
               <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold mb-2 md:mb-3">Payment Received!</h2>
               <p className="text-zinc-400 text-base md:text-lg max-w-md mx-auto px-4">Your ride request has been submitted. We'll confirm shortly.</p>
               </div>
               {requestId && (
               <div className="py-3 px-5 md:py-4 md:px-6 rounded-xl md:rounded-2xl rides-glass-panel inline-block">
                 <p className="text-[10px] md:text-xs text-zinc-500 mb-1">Request ID</p>
                   <p className="font-mono font-bold">{requestId.slice(0, 8).toUpperCase()}</p>
                 </div>
               )}
             <div className="py-4 px-4 md:py-5 md:px-6 rounded-xl md:rounded-2xl rides-glass-panel max-w-md mx-auto text-left">
               <p className="text-xs md:text-sm text-zinc-400 mb-2 md:mb-3">Status: <span className="text-emerald-400 font-semibold">Paid / Awaiting Match</span></p>
                <ul className="text-xs md:text-sm space-y-2 md:space-y-3">
                 <li className="flex items-center gap-2 md:gap-3"><div className="w-2 h-2 bg-primary rounded-full shrink-0" />We'll match you with a driver</li>
                 <li className="flex items-center gap-2 md:gap-3"><div className="w-2 h-2 bg-primary rounded-full shrink-0" />You'll receive a confirmation call/text</li>
                 <li className="flex items-center gap-2 md:gap-3"><div className="w-2 h-2 bg-primary rounded-full shrink-0" />Driver will pick you up at the scheduled time</li>
                 </ul>
               </div>
             <Button variant="outline" size="lg" onClick={handleReset} className="rounded-xl border-zinc-700 text-white hover:bg-white/10 h-12 touch-manipulation">Request Another Ride</Button>
             </div>
           )}
 
           {/* STICKY CONFIRM BUTTON - positioned above mobile nav */}
            {step === "request" && (
             <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-1.5 sm:p-3 md:p-6 rides-sticky-fade z-50 pointer-events-none flex justify-center">
                <Button 
                  onClick={handleFindRides} 
                  disabled={!pickup || !dropoff || !selectedOption}
                 className="pointer-events-auto bg-white text-black text-[11px] sm:text-sm md:text-lg font-black py-2.5 md:py-5 px-4 sm:px-6 md:px-12 rounded-xl md:rounded-2xl shadow-xl hover:scale-105 transition-transform flex items-center gap-1 md:gap-3 disabled:opacity-50 disabled:hover:scale-100 touch-manipulation active:scale-95"
                >
                 {selectedOption ? `CONFIRM ${selectedOption.name.toUpperCase()}` : "SELECT A RIDE"}
                 <ChevronRight className="w-3.5 h-3.5 md:w-5 md:h-5" />
                </Button>
              </div>
            )}
        </div>
       </main>
 
      <Footer className="hidden md:block" />
      
      {/* Mobile Bottom Nav */}
      {isMobile && <ZivoMobileNav />}
     </div>
   );
 }