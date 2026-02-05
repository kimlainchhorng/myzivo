/**
 * ZIVO Rides — Premium 2026 Booking Page
 * Dark Glassmorphism with layered scroll architecture
 */

import { useState, useEffect } from "react";
 import { useCurrentLocation } from "@/hooks/useCurrentLocation";
 import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
 import { 
  MapPin, Navigation, Clock, Users, Shield, Star, CheckCircle2,
  ChevronRight, Phone, Mail, User, CreditCard, Loader2, LocateFixed,
  Leaf, Zap, Briefcase, Crown, Anchor, Dog
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
 
 type RideStep = "request" | "options" | "confirm" | "processing" | "success";
 
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
 }
 
 type CategoryKey = "Economy" | "Premium" | "Elite";
 
 // Premium categorized vehicle options
 const rideCategories: Record<CategoryKey, RideOption[]> = {
   Economy: [
     {
       id: "wait_save",
       name: "Wait & Save",
       desc: "Lowest price, longer wait.",
       price: "$18.50",
       time: "15 min",
       icon: Clock,
       image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1000",
       multiplier: 0.75,
       seats: 4
     },
     {
       id: "standard",
       name: "Standard",
       desc: "Reliable everyday rides.",
       price: "$24.50",
       time: "4 min",
       icon: Navigation,
       image: "https://images.unsplash.com/photo-1469285994282-454ceb49e63c?auto=format&fit=crop&q=80&w=1000",
       multiplier: 1.0,
       seats: 4
     },
     {
       id: "green",
       name: "Green",
       desc: "EVs & Hybrids.",
       price: "$25.00",
       time: "6 min",
       icon: Leaf,
       image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=1000",
       multiplier: 1.02,
       seats: 4
     },
     {
       id: "priority",
       name: "Priority",
       desc: "Faster pickup.",
       price: "$32.00",
       time: "1 min",
       icon: Zap,
       image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1000",
       multiplier: 1.3,
       seats: 4
     }
   ],
   Premium: [
     {
       id: "comfort",
       name: "Extra Comfort",
       desc: "Newer cars, more legroom.",
       price: "$38.00",
       time: "5 min",
       icon: Star,
       image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1000",
       multiplier: 1.55,
       seats: 4
     },
     {
       id: "black",
       name: "ZIVO Black",
       desc: "Premium leather sedans.",
       price: "$65.00",
       time: "8 min",
       icon: Briefcase,
       image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1000",
       multiplier: 2.65,
       seats: 4
     },
     {
       id: "black_suv",
       name: "Black SUV",
       desc: "Luxury for 6.",
       price: "$85.00",
       time: "10 min",
       icon: Shield,
       image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000",
       multiplier: 3.5,
       seats: 6
     },
     {
       id: "xxl",
       name: "XXL",
       desc: "Max luggage space.",
       price: "$90.00",
       time: "12 min",
       icon: Anchor,
       image: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&q=80&w=1000",
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
       icon: Crown,
       image: "https://images.unsplash.com/photo-1553440637-d22ed8a02575?auto=format&fit=crop&q=80&w=1000",
       multiplier: 10.0,
       seats: 4
     },
     {
       id: "sprinter",
       name: "Executive Sprinter",
       desc: "Jet van for 12.",
       price: "$180.00",
       time: "45 min",
       icon: Briefcase,
       image: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=1000",
       multiplier: 7.3,
       seats: 12
     },
     {
       id: "secure",
       name: "Secure Transit",
       desc: "Armored transport.",
       price: "$500.00",
       time: "60 min",
       icon: Shield,
       image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1000",
       multiplier: 20.0,
       seats: 4
     },
     {
       id: "pet",
       name: "Pet Premium",
       desc: "Luxury with pets.",
       price: "$75.00",
       time: "10 min",
       icon: Dog,
       image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1000",
       multiplier: 3.0,
       seats: 4
     }
   ]
 };
 
 const calculateFare = (distanceMiles: number, durationMinutes: number, multiplier: number) => {
   const baseFare = 3.50;
   const perMile = 1.75;
   const perMinute = 0.35;
   const bookingFee = 2.50;
   const minimumFare = 7.00;
   const fare = (baseFare + (distanceMiles * perMile) + (durationMinutes * perMinute)) * multiplier + bookingFee;
   return Math.max(fare, minimumFare);
 };
 
 export default function Rides() {
   const navigate = useNavigate();
   const [searchParams] = useSearchParams();
   const { getCurrentLocation, reverseGeocode, isGettingLocation } = useCurrentLocation();
  const isMobile = useIsMobile();
   const [step, setStep] = useState<RideStep>("request");
   const [pickup, setPickup] = useState("");
   const [dropoff, setDropoff] = useState("");
   const [selectedOption, setSelectedOption] = useState<RideOption | null>(null);
   const [contactInfo, setContactInfo] = useState({ name: "", phone: "", email: "", notes: "" });
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [requestId, setRequestId] = useState<string | null>(null);
   const [activeTab, setActiveTab] = useState<CategoryKey>("Premium");
 
   const [estimatedDistance] = useState(5.2);
   const [estimatedDuration] = useState(15);
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);
 
   // Auto-detect location on mount
   useEffect(() => {
     const autoDetectLocation = async () => {
     setIsAutoDetecting(true);
       try {
         const location = await getCurrentLocation();
         const address = await reverseGeocode(location.lat, location.lng);
         setPickup(address);
       toast.success("Location detected");
       } catch {
       // Fail silently - user can enter manually
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
 
   const handlePayment = async () => {
     if (!contactInfo.name || !contactInfo.phone || !selectedOption) return;
     setStep("processing");
     setIsSubmitting(true);
     try {
       const estimatedFare = calculateFare(estimatedDistance, estimatedDuration, selectedOption.multiplier || 1.0);
       const { data, error } = await supabase.functions.invoke("create-ride-checkout", {
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
       if (error) throw error;
       if (!data?.url) throw new Error("No checkout URL returned");
       window.location.href = data.url;
     } catch (error) {
       console.error("Payment error:", error);
       toast.error("Failed to start payment. Please try again.");
       setStep("confirm");
       setIsSubmitting(false);
     }
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
        {/* FIXED LAYER — Dark Map Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=2000"
            alt="City background"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 rides-gradient-overlay" />
          
          {/* Pulsing "Current Location" Dot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 bg-primary rounded-full animate-location-pulse absolute" />
            <div className="w-4 h-4 bg-primary rounded-full relative border-2 border-white shadow-[0_0_20px_hsl(217_91%_60%/0.5)]" />
          </div>
        </div>
 
        {/* SCROLLABLE CONTENT LAYER */}
      <div className="relative z-20 pt-20 md:pt-24 px-3 sm:px-6 pb-44 md:pb-40 min-h-screen">
           {step === "request" && (
            <div className="max-w-xl mx-auto space-y-8">
              {/* Header */}
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center rides-content-visible"
              >
               <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-white/10 mb-3 md:mb-4">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">35 Drivers Nearby</span>
                 </div>
               <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter">Where to?</h1>
              </motion.div>

              {/* GLASS INPUT PANEL */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
               className="rides-glass-panel rounded-2xl md:rounded-[2rem] p-4 md:p-6 shadow-2xl rides-content-visible"
              >
                <div className="relative">
                  {/* Visual Connector Line */}
                 <div className="absolute left-[0.95rem] md:left-[1.15rem] top-10 bottom-10 w-0.5 bg-gradient-to-b from-primary to-emerald-500 opacity-50" />
                  
                  {/* Pickup Input */}
                 <div className="rides-input-glass flex items-center gap-3 md:gap-4 mb-3 md:mb-4 p-3 md:p-4 rounded-xl md:rounded-2xl">
                   <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                     <Navigation className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Pickup Location</div>
                      <input 
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        placeholder={isAutoDetecting || isGettingLocation ? "Detecting location..." : "Enter pickup address..."}
                       className="w-full bg-transparent text-white font-medium outline-none placeholder-zinc-600 truncate text-sm md:text-base" 
                       style={{ fontSize: '16px' }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={isGettingLocation || isAutoDetecting}
                     className="p-2.5 md:p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 shrink-0 touch-manipulation active:scale-95"
                      title="Use current location"
                    >
                     <LocateFixed className={`w-5 h-5 md:w-5 md:h-5 text-primary ${isGettingLocation || isAutoDetecting ? "animate-pulse" : ""}`} />
                    </button>
                  </div>

                  {/* Dropoff Input */}
                 <div className="rides-input-glass flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl">
                   <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                     <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Destination</div>
                      <input 
                        value={dropoff}
                        onChange={(e) => setDropoff(e.target.value)}
                        placeholder="Enter destination..."
                       className="w-full bg-transparent text-white font-medium outline-none placeholder-zinc-600 truncate text-sm md:text-base" 
                       style={{ fontSize: '16px' }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocationForDropoff}
                      disabled={isGettingLocation}
                     className="p-2.5 md:p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 shrink-0 touch-manipulation active:scale-95"
                      title="Use current location"
                    >
                     <LocateFixed className={`w-5 h-5 md:w-5 md:h-5 text-emerald-400 ${isGettingLocation ? "animate-pulse" : ""}`} />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* VEHICLE FLEET SELECTOR */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="rides-content-visible"
              >
                {/* Header */}
               <div className="text-center mb-5 md:mb-8">
                 <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight mb-4 md:mb-6">
                    Choose Your <span className="text-primary">Ride</span>
                  </h2>
                  
                  {/* Category Tab Selector */}
                  <div className="flex justify-center">
                   <div className="flex gap-1 md:gap-2 p-1 md:p-1.5 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 overflow-x-auto hide-scrollbar">
                      {(Object.keys(rideCategories) as CategoryKey[]).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setActiveTab(cat)}
                         className={`px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-full text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-300 touch-manipulation whitespace-nowrap ${
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
                
                {/* Vehicle Grid */}
                <motion.div 
                  layout
                 className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6"
                >
                  <AnimatePresence mode="popLayout">
                    {rideCategories[activeTab].map((ride) => (
                      <motion.div 
                        key={ride.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={() => setSelectedOption(ride)}
                       className={`relative overflow-hidden rounded-xl md:rounded-[2rem] border cursor-pointer group transition-all duration-300 touch-manipulation active:scale-[0.98] ${
                          selectedOption?.id === ride.id 
                            ? "bg-primary/20 border-primary shadow-[0_0_40px_hsl(var(--primary)/0.2)]" 
                            : "bg-background/60 border-border/20 hover:border-border/50 hover:bg-background/80"
                        }`}
                      >
                        {/* Vehicle Image */}
                       <div className="h-20 sm:h-24 md:h-32 overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10" />
                          <img 
                            src={ride.image} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                            alt={ride.name} 
                          />
                          
                          {/* Price Badge */}
                         <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20 bg-black/50 backdrop-blur-md px-2 py-0.5 md:px-3 md:py-1 rounded-md md:rounded-lg border border-white/10 text-xs md:text-sm font-bold">
                            {getFareFixed(ride)}
                          </div>
                        </div>

                        {/* Details */}
                       <div className="p-3 md:p-5 relative z-20">
                         <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                           <ride.icon className={`w-3 h-3 md:w-4 md:h-4 ${selectedOption?.id === ride.id ? "text-primary" : "text-muted-foreground"}`} />
                           <h3 className="text-sm md:text-lg font-black italic truncate">{ride.name}</h3>
                          </div>
                         <p className="text-[10px] md:text-xs text-muted-foreground h-6 md:h-8 leading-relaxed mb-2 md:mb-4 line-clamp-2">{ride.desc}</p>
                          
                         <div className="flex items-center justify-between border-t border-border/20 pt-2 md:pt-4">
                           <span className="text-[9px] md:text-xs font-bold uppercase tracking-wider md:tracking-widest text-emerald-400 flex items-center gap-0.5 md:gap-1">
                             <Zap className="w-2.5 h-2.5 md:w-3 md:h-3" /> {ride.time}
                            </span>
                            {selectedOption?.id === ride.id && (
                             <div className="w-3 h-3 md:w-4 md:h-4 bg-primary rounded-full animate-ping" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </motion.div>

              {/* WHY ZIVO — Dark Glass Section */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
               className="pt-6 md:pt-8"
              >
               <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2">
                 <span className="w-1 h-5 md:h-6 bg-emerald-500 rounded-full" />
                  Why ZIVO Rides
                </h2>
               <div className="grid grid-cols-3 gap-2 md:gap-4">
                  {[
                    { icon: Clock, title: "Instant Pickup", text: "AI-dispatching in under 3 minutes" },
                    { icon: Shield, title: "Verified Elite", text: "50-point security background check" },
                    { icon: Star, title: "Premium Fleet", text: "No cars older than 3 years" }
                  ].map((item, i) => (
                   <div key={i} className="rides-glass-panel p-3 md:p-6 rounded-xl md:rounded-2xl hover:bg-zinc-900/80 transition-colors">
                     <div className="w-8 h-8 md:w-12 md:h-12 bg-primary/20 text-primary rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-4 mx-auto md:mx-0">
                       <item.icon className="w-4 h-4 md:w-6 md:h-6" />
                      </div>
                     <h3 className="text-xs md:text-base font-bold mb-0.5 md:mb-1 text-center md:text-left">{item.title}</h3>
                     <p className="text-[10px] md:text-sm text-zinc-400 text-center md:text-left hidden md:block">{item.text}</p>
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
              <div className="space-y-3 md:space-y-4">
                 {rideCategories[activeTab].map((option) => (
                 <button key={option.id} onClick={() => handleSelectOption(option)} className="w-full p-3 md:p-4 rounded-xl md:rounded-2xl rides-card-3d flex items-center gap-3 md:gap-4 text-left transition-all hover:border-primary/50 touch-manipulation active:scale-[0.98]">
                   <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg md:rounded-xl overflow-hidden flex-shrink-0">
                      <img src={option.image} alt={option.name} className="w-full h-full object-cover" />
                    </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base md:text-lg">{option.name}</h3>
                        <span className="text-[10px] md:text-xs text-zinc-400 flex items-center gap-1"><Users className="w-3 h-3" />{option.seats || 4}</span>
                       </div>
                      <p className="text-xs md:text-sm text-zinc-400 truncate">{option.desc}</p>
                     </div>
                     <div className="text-right">
                      <p className="font-bold text-base md:text-lg text-primary">{getFareFixed(option)}</p>
                     <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-zinc-400 ml-auto" />
                     </div>
                   </button>
                 ))}
               </div>
             </div>
           )}
 
           {step === "confirm" && selectedOption && (
           <div className="max-w-xl mx-auto space-y-4 md:space-y-6 animate-in fade-in slide-in-from-right duration-300">
             <Button variant="ghost" onClick={() => setStep("options")} className="gap-2 mb-2 text-white hover:bg-white/10 h-12 touch-manipulation">← Back</Button>
             <div className="rides-glass-panel p-4 md:p-5 rounded-xl md:rounded-2xl border-primary/20">
               <div className="flex items-center gap-3 md:gap-4">
                 <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-xl overflow-hidden">
                    <img src={selectedOption.image} alt={selectedOption.name} className="w-full h-full object-cover" />
                  </div>
                   <div className="flex-1">
                    <h3 className="font-bold text-base md:text-lg">{selectedOption.name}</h3>
                   <p className="text-xs md:text-sm text-zinc-400 truncate">{pickup} → {dropoff}</p>
                   </div>
                   <div className="text-right">
                   <p className="font-bold text-lg md:text-xl text-primary">${calculateFare(estimatedDistance, estimatedDuration, selectedOption.multiplier || 1.0).toFixed(2)}</p>
                   <p className="text-[10px] md:text-xs text-zinc-400">Est. total</p>
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
             <Button onClick={handlePayment} disabled={!contactInfo.name || !contactInfo.phone || isSubmitting} size="lg" className="w-full h-14 rounded-xl font-bold gap-3 bg-white text-black hover:bg-zinc-200 text-base md:text-lg touch-manipulation active:scale-[0.98]">
                 <CreditCard className="w-5 h-5" />
                  Pay ${calculateFare(estimatedDistance, estimatedDuration, selectedOption.multiplier || 1.0).toFixed(2)} & Request
               </Button>
              <p className="text-xs text-center text-zinc-500">Secure payment via Stripe. We don't store your card details.</p>
             </div>
           )}
 
           {step === "processing" && (
           <div className="max-w-xl mx-auto py-16 md:py-24 text-center space-y-4 md:space-y-6 animate-in fade-in duration-200">
             <Loader2 className="w-12 h-12 md:w-14 md:h-14 mx-auto text-primary animate-spin" />
               <div>
                <h2 className="font-display text-xl md:text-2xl font-bold mb-2">Redirecting to Payment...</h2>
                <p className="text-zinc-400">Please wait while we set up your secure checkout.</p>
               </div>
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
 
          {/* STICKY CONFIRM BUTTON */}
          {step === "request" && (
           <div className="fixed bottom-16 md:bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 rides-sticky-fade z-50 pointer-events-none flex justify-center">
              <Button 
                onClick={handleFindRides} 
                disabled={!pickup || !dropoff || !selectedOption}
               className="pointer-events-auto bg-white text-black text-sm sm:text-base md:text-lg font-black py-4 md:py-5 px-6 sm:px-8 md:px-12 rounded-xl md:rounded-2xl shadow-xl hover:scale-105 transition-transform flex items-center gap-2 md:gap-3 disabled:opacity-50 disabled:hover:scale-100 touch-manipulation active:scale-95"
              >
               {selectedOption ? `CONFIRM ${selectedOption.name.toUpperCase()}` : "SELECT A RIDE"}
               <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
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