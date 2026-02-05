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
  ChevronRight, Phone, Mail, User, CreditCard, Loader2, LocateFixed
 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Textarea } from "@/components/ui/textarea";
 import Header from "@/components/Header";
 import Footer from "@/components/Footer";
 import SEOHead from "@/components/SEOHead";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 
 type RideStep = "request" | "options" | "confirm" | "processing" | "success";
 
 interface RideOption {
   id: string;
   name: string;
  image: string;
   multiplier: number;
   seats: number;
   description: string;
  eta: string;
 }
 
// Premium vehicle imagery
 const rideOptions: RideOption[] = [
  { 
    id: "standard", 
    name: "ZIVO Prime", 
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1000",
    multiplier: 1.0, 
    seats: 4, 
    description: "Affordable luxury for everyday.",
    eta: "4 min"
  },
  { 
    id: "xl", 
    name: "ZIVO XL", 
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000",
    multiplier: 1.3, 
    seats: 6, 
    description: "Room for 6 + Luggage.",
    eta: "8 min"
  },
  { 
    id: "premium", 
    name: "ZIVO Black", 
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1000",
    multiplier: 1.6, 
    seats: 4, 
    description: "Professional chauffeur service.",
    eta: "12 min"
  },
 ];
 
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
   const [step, setStep] = useState<RideStep>("request");
   const [pickup, setPickup] = useState("");
   const [dropoff, setDropoff] = useState("");
   const [selectedOption, setSelectedOption] = useState<RideOption | null>(null);
   const [contactInfo, setContactInfo] = useState({ name: "", phone: "", email: "", notes: "" });
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [requestId, setRequestId] = useState<string | null>(null);
 
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
       const estimatedFare = calculateFare(estimatedDistance, estimatedDuration, selectedOption.multiplier);
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
     const fare = calculateFare(estimatedDistance, estimatedDuration, option.multiplier);
     const min = (fare * 0.9).toFixed(0);
     const max = (fare * 1.1).toFixed(0);
     return `$${min}-${max}`;
   };
 
  const getFareFixed = (option: RideOption) => {
    const fare = calculateFare(estimatedDistance, estimatedDuration, option.multiplier);
    return `$${fare.toFixed(2)}`;
  };

   return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
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
        <div className="relative z-20 pt-24 px-4 sm:px-6 pb-40 min-h-screen">
           {step === "request" && (
            <div className="max-w-xl mx-auto space-y-8">
              {/* Header */}
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center"
              >
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 mb-4">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest">35 Drivers Nearby</span>
                 </div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tighter">Where to?</h1>
              </motion.div>

              {/* GLASS INPUT PANEL */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="rides-glass-panel rounded-[2rem] p-6 shadow-2xl"
              >
                <div className="relative">
                  {/* Visual Connector Line */}
                  <div className="absolute left-[1.15rem] top-10 bottom-10 w-0.5 bg-gradient-to-b from-primary to-emerald-500 opacity-50" />
                  
                  {/* Pickup Input */}
                  <div className="rides-input-glass flex items-center gap-4 mb-4 p-4 rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                      <Navigation className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Pickup Location</div>
                      <input 
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        placeholder={isAutoDetecting || isGettingLocation ? "Detecting location..." : "Enter pickup address..."}
                        className="w-full bg-transparent text-white font-medium outline-none placeholder-zinc-600 truncate" 
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={isGettingLocation || isAutoDetecting}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 shrink-0"
                      title="Use current location"
                    >
                      <LocateFixed className={`w-5 h-5 text-primary ${isGettingLocation || isAutoDetecting ? "animate-pulse" : ""}`} />
                    </button>
                  </div>

                  {/* Dropoff Input */}
                  <div className="rides-input-glass flex items-center gap-4 p-4 rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Destination</div>
                      <input 
                        value={dropoff}
                        onChange={(e) => setDropoff(e.target.value)}
                        placeholder="Enter destination..."
                        className="w-full bg-transparent text-white font-medium outline-none placeholder-zinc-600 truncate" 
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocationForDropoff}
                      disabled={isGettingLocation}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 shrink-0"
                      title="Use current location"
                    >
                      <LocateFixed className={`w-5 h-5 text-emerald-400 ${isGettingLocation ? "animate-pulse" : ""}`} />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* VEHICLE FLEET SELECTOR */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full" />
                  Choose your Ride
                </h2>
                
                <div className="grid grid-cols-1 gap-4">
                  {rideOptions.map((ride) => (
                    <motion.div 
                      key={ride.id}
                      onClick={() => setSelectedOption(ride)}
                      whileHover={{ y: -5 }}
                      className={`relative overflow-hidden rounded-[1.5rem] cursor-pointer transition-all duration-300 ${
                        selectedOption?.id === ride.id 
                          ? "rides-card-3d rides-card-selected" 
                          : "rides-card-3d hover:border-white/20"
                      }`}
                    >
                      <div className="flex">
                        {/* Image Area */}
                        <div className="w-28 sm:w-36 h-28 overflow-hidden relative shrink-0">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/60 z-10" />
                          <img 
                            src={ride.image} 
                            className="w-full h-full object-cover" 
                            alt={ride.name} 
                          />
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-4 flex flex-col justify-center">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="text-lg sm:text-xl font-black italic">{ride.name}</h3>
                            <div className="text-lg font-bold">{getFareFixed(ride)}</div>
                          </div>
                          <p className={`text-sm mb-2 ${selectedOption?.id === ride.id ? "text-blue-100" : "text-zinc-400"}`}>
                            {ride.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest opacity-80">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {ride.eta}</span>
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {ride.seats}</span>
                            <span className="flex items-center gap-1"><Star className="w-3 h-3" /> 4.9</span>
                          </div>
                        </div>
                      </div>

                      {/* Selection Ring */}
                      {selectedOption?.id === ride.id && (
                        <motion.div 
                          layoutId="ride-outline"
                          className="absolute inset-0 border-2 border-primary rounded-[1.5rem] pointer-events-none"
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* WHY ZIVO — Dark Glass Section */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="pt-8"
              >
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-emerald-500 rounded-full" />
                  Why ZIVO Rides
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <div className="max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-right duration-300">
              <Button variant="ghost" onClick={() => setStep("request")} className="gap-2 mb-2 text-white hover:bg-white/10">← Back</Button>
              <div className="rides-glass-panel p-4 rounded-2xl">
                 <div className="flex items-center gap-3 text-sm">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                   <span className="flex-1 truncate font-medium">{pickup}</span>
                 </div>
                <div className="w-px h-4 bg-white/20 ml-1.5 my-1" />
                 <div className="flex items-center gap-3 text-sm">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                   <span className="flex-1 truncate font-medium">{dropoff}</span>
                 </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10 text-sm text-zinc-400">
                   <span>~{estimatedDistance} mi</span>
                   <span>~{estimatedDuration} min</span>
                 </div>
               </div>
               <h2 className="font-display font-bold text-2xl">Choose your ride</h2>
               <div className="space-y-4">
                 {rideOptions.map((option) => (
                  <button key={option.id} onClick={() => handleSelectOption(option)} className="w-full p-4 rounded-2xl rides-card-3d flex items-center gap-4 text-left transition-all hover:border-primary/50">
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={option.image} alt={option.name} className="w-full h-full object-cover" />
                    </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2">
                         <h3 className="font-bold text-lg">{option.name}</h3>
                        <span className="text-xs text-zinc-400 flex items-center gap-1"><Users className="w-3 h-3" />{option.seats}</span>
                       </div>
                      <p className="text-sm text-zinc-400">{option.description}</p>
                     </div>
                     <div className="text-right">
                      <p className="font-bold text-lg text-primary">{getFareEstimate(option)}</p>
                      <ChevronRight className="w-5 h-5 text-zinc-400 ml-auto" />
                     </div>
                   </button>
                 ))}
               </div>
             </div>
           )}
 
           {step === "confirm" && selectedOption && (
            <div className="max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-right duration-300">
              <Button variant="ghost" onClick={() => setStep("options")} className="gap-2 mb-2 text-white hover:bg-white/10">← Back</Button>
              <div className="rides-glass-panel p-5 rounded-2xl border-primary/20">
                 <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden">
                    <img src={selectedOption.image} alt={selectedOption.name} className="w-full h-full object-cover" />
                  </div>
                   <div className="flex-1">
                     <h3 className="font-bold text-lg">{selectedOption.name}</h3>
                    <p className="text-sm text-zinc-400">{pickup} → {dropoff}</p>
                   </div>
                   <div className="text-right">
                    <p className="font-bold text-xl text-primary">${calculateFare(estimatedDistance, estimatedDuration, selectedOption.multiplier).toFixed(2)}</p>
                    <p className="text-xs text-zinc-400">Est. total</p>
                   </div>
                 </div>
               </div>
               <h2 className="font-display font-bold text-2xl">Your Information</h2>
               <div className="space-y-4">
                 <div>
                  <Label htmlFor="name" className="text-sm font-medium text-zinc-300">Full Name *</Label>
                   <div className="relative mt-1.5">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <Input id="name" placeholder="Your name" value={contactInfo.name} onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))} className="pl-11 h-12 bg-zinc-900/50 border-zinc-700 text-white placeholder-zinc-500" />
                   </div>
                 </div>
                 <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-zinc-300">Phone Number *</Label>
                   <div className="relative mt-1.5">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <Input id="phone" type="tel" placeholder="(555) 123-4567" value={contactInfo.phone} onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))} className="pl-11 h-12 bg-zinc-900/50 border-zinc-700 text-white placeholder-zinc-500" />
                   </div>
                 </div>
                 <div>
                  <Label htmlFor="email" className="text-sm font-medium text-zinc-300">Email (for receipt)</Label>
                   <div className="relative mt-1.5">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <Input id="email" type="email" placeholder="your@email.com" value={contactInfo.email} onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))} className="pl-11 h-12 bg-zinc-900/50 border-zinc-700 text-white placeholder-zinc-500" />
                   </div>
                 </div>
                 <div>
                  <Label htmlFor="notes" className="text-sm font-medium text-zinc-300">Notes (optional)</Label>
                  <Textarea id="notes" placeholder="Any special requests..." value={contactInfo.notes} onChange={(e) => setContactInfo(prev => ({ ...prev, notes: e.target.value }))} className="mt-1.5 min-h-[100px] bg-zinc-900/50 border-zinc-700 text-white placeholder-zinc-500" />
                 </div>
               </div>
              <Button onClick={handlePayment} disabled={!contactInfo.name || !contactInfo.phone || isSubmitting} size="lg" className="w-full h-14 rounded-xl font-bold gap-3 bg-white text-black hover:bg-zinc-200 text-lg">
                 <CreditCard className="w-5 h-5" />
                 Pay ${calculateFare(estimatedDistance, estimatedDuration, selectedOption.multiplier).toFixed(2)} & Request
               </Button>
              <p className="text-xs text-center text-zinc-500">Secure payment via Stripe. We don't store your card details.</p>
             </div>
           )}
 
           {step === "processing" && (
            <div className="max-w-xl mx-auto py-24 text-center space-y-6 animate-in fade-in duration-200">
              <Loader2 className="w-14 h-14 mx-auto text-primary animate-spin" />
               <div>
                 <h2 className="font-display text-2xl font-bold mb-2">Redirecting to Payment...</h2>
                <p className="text-zinc-400">Please wait while we set up your secure checkout.</p>
               </div>
             </div>
           )}
 
           {step === "success" && (
            <div className="max-w-xl mx-auto py-16 text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-24 h-24 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
               </div>
               <div>
                 <h2 className="font-display text-3xl font-bold mb-3">Payment Received!</h2>
                <p className="text-zinc-400 text-lg max-w-md mx-auto">Your ride request has been submitted. We'll confirm shortly.</p>
               </div>
               {requestId && (
                <div className="py-4 px-6 rounded-2xl rides-glass-panel inline-block">
                  <p className="text-xs text-zinc-500 mb-1">Request ID</p>
                   <p className="font-mono font-bold">{requestId.slice(0, 8).toUpperCase()}</p>
                 </div>
               )}
              <div className="py-5 px-6 rounded-2xl rides-glass-panel max-w-md mx-auto text-left">
                <p className="text-sm text-zinc-400 mb-3">Status: <span className="text-emerald-400 font-semibold">Paid / Awaiting Match</span></p>
                 <ul className="text-sm space-y-3">
                  <li className="flex items-center gap-3"><div className="w-2 h-2 bg-primary rounded-full" />We'll match you with a driver</li>
                  <li className="flex items-center gap-3"><div className="w-2 h-2 bg-primary rounded-full" />You'll receive a confirmation call/text</li>
                  <li className="flex items-center gap-3"><div className="w-2 h-2 bg-primary rounded-full" />Driver will pick you up at the scheduled time</li>
                 </ul>
               </div>
              <Button variant="outline" size="lg" onClick={handleReset} className="rounded-xl border-zinc-700 text-white hover:bg-white/10">Request Another Ride</Button>
             </div>
           )}
 
          {/* STICKY CONFIRM BUTTON */}
          {step === "request" && (
            <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 rides-sticky-fade z-50 pointer-events-none flex justify-center">
              <Button 
                onClick={handleFindRides} 
                disabled={!pickup || !dropoff || !selectedOption}
                className="pointer-events-auto bg-white text-black text-base sm:text-lg font-black py-5 px-8 sm:px-12 rounded-2xl shadow-xl hover:scale-105 transition-transform flex items-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
              >
                {selectedOption ? `CONFIRM ${selectedOption.name.toUpperCase()}` : "SELECT A RIDE"} 
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
       </main>
 
       <Footer />
     </div>
   );
 }