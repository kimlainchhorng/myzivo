 /**
  * ZIVO Rides — Booking Page
  * Full booking flow: Request → Quote → Payment → Success
  */
 
 import { useState, useEffect } from "react";
 import { useCurrentLocation } from "@/hooks/useCurrentLocation";
 import { useNavigate, useSearchParams } from "react-router-dom";
 import { 
   MapPin, Car, Clock, Users, Shield, Star, CheckCircle2, 
   ChevronRight, ArrowRight, Phone, Mail, User, CreditCard, Loader2, LocateFixed
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
 import heroRides from "@/assets/hero-rides.jpg";
 
 type RideStep = "request" | "options" | "confirm" | "processing" | "success";
 
 interface RideOption {
   id: string;
   name: string;
   icon: string;
   multiplier: number;
   seats: number;
   description: string;
 }
 
 const rideOptions: RideOption[] = [
   { id: "standard", name: "Standard", icon: "🚗", multiplier: 1.0, seats: 4, description: "Affordable everyday rides" },
   { id: "xl", name: "XL", icon: "🚙", multiplier: 1.3, seats: 6, description: "Extra space for groups" },
   { id: "premium", name: "Premium", icon: "🚘", multiplier: 1.6, seats: 4, description: "High-end vehicles" },
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
 
   // Auto-detect location on mount
   useEffect(() => {
     const autoDetectLocation = async () => {
       try {
         const location = await getCurrentLocation();
         const address = await reverseGeocode(location.lat, location.lng);
         setPickup(address);
       } catch {
         // Silently fail - user can enter manually
       }
     };
     if (!pickup) {
       autoDetectLocation();
     }
   }, []);

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
 
   return (
     <div className="min-h-screen bg-background">
       <SEOHead
         title="ZIVO Rides — Request a Ride"
         description="Book a ride with ZIVO. Fast, reliable, and safe rides with verified drivers."
       />
       <Header />
 
       <main className="pt-16">
         {step === "request" && (
           <section className="relative py-20 md:py-28">
             <div className="absolute inset-0">
               <img src={heroRides} alt="ZIVO Rides" className="w-full h-full object-cover" loading="eager" />
               <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
             </div>
             <div className="container mx-auto px-4 relative z-10">
               <div className="max-w-lg">
                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rides/10 border border-rides/20 mb-6">
                   <Car className="w-4 h-4 text-rides" />
                   <span className="text-sm font-medium text-rides">ZIVO Rides</span>
                 </div>
                 <h1 className="text-4xl md:text-5xl font-bold mb-4">
                   Get a Ride.<span className="block text-rides">Anytime.</span>
                 </h1>
                 <p className="text-lg text-muted-foreground">Fast, reliable rides at the tap of a button.</p>
               </div>
             </div>
           </section>
         )}
 
         <div className="container mx-auto px-4 py-8 max-w-2xl">
           {step === "request" && (
             <div className="space-y-6 bg-card rounded-3xl p-6 md:p-8 border border-border/50 shadow-lg">
               <div className="space-y-4">
                 <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-rides rounded-full" />
                   <Input 
                     placeholder={isGettingLocation ? "Detecting location..." : "Pickup location"} 
                     value={pickup} 
                     onChange={(e) => setPickup(e.target.value)} 
                     className="pl-11 pr-12 h-14 rounded-xl text-base" 
                   />
                   <button
                     type="button"
                     onClick={handleUseCurrentLocation}
                     disabled={isGettingLocation}
                     className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                     title="Use current location"
                   >
                     <LocateFixed className={`w-5 h-5 text-rides ${isGettingLocation ? "animate-pulse" : ""}`} />
                   </button>
                 </div>
                 <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-eats rounded-full" />
                   <Input placeholder="Drop-off location" value={dropoff} onChange={(e) => setDropoff(e.target.value)} className="pl-11 h-14 rounded-xl text-base" />
                 </div>
               </div>
               <div className="h-48 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center">
                 <div className="text-center text-muted-foreground">
                   <MapPin className="w-10 h-10 mx-auto mb-2 opacity-50" />
                   <p className="text-sm">Map preview coming soon</p>
                 </div>
               </div>
               <Button onClick={handleFindRides} disabled={!pickup || !dropoff} size="lg" className="w-full h-14 rounded-xl font-bold gap-2 bg-rides hover:bg-rides/90 text-lg">
                 Get Quote <ArrowRight className="w-5 h-5" />
               </Button>
               <div className="grid grid-cols-3 gap-4 pt-4">
                 {[{ icon: CreditCard, label: "Secure Payment" }, { icon: Shield, label: "Verified Drivers" }, { icon: Star, label: "Top Rated" }].map((feature) => (
                   <div key={feature.label} className="text-center p-4 rounded-xl bg-muted/30">
                     <feature.icon className="w-6 h-6 mx-auto mb-2 text-rides" />
                     <p className="text-xs text-muted-foreground font-medium">{feature.label}</p>
                   </div>
                 ))}
               </div>
             </div>
           )}
 
           {step === "options" && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
               <Button variant="ghost" onClick={() => setStep("request")} className="gap-2 mb-2">← Back</Button>
               <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                 <div className="flex items-center gap-3 text-sm">
                   <div className="w-3 h-3 bg-rides rounded-full" />
                   <span className="flex-1 truncate font-medium">{pickup}</span>
                 </div>
                 <div className="w-px h-4 bg-border ml-1.5 my-1" />
                 <div className="flex items-center gap-3 text-sm">
                   <div className="w-3 h-3 bg-eats rounded-full" />
                   <span className="flex-1 truncate font-medium">{dropoff}</span>
                 </div>
                 <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50 text-sm text-muted-foreground">
                   <span>~{estimatedDistance} mi</span>
                   <span>~{estimatedDuration} min</span>
                 </div>
               </div>
               <h2 className="font-display font-bold text-2xl">Choose your ride</h2>
               <div className="space-y-4">
                 {rideOptions.map((option) => (
                   <button key={option.id} onClick={() => handleSelectOption(option)} className="w-full p-5 rounded-2xl bg-card border-2 border-border/50 flex items-center gap-4 text-left transition-all hover:border-rides/50 hover:shadow-lg">
                     <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center text-4xl flex-shrink-0">{option.icon}</div>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2">
                         <h3 className="font-bold text-lg">{option.name}</h3>
                         <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" />{option.seats}</span>
                       </div>
                       <p className="text-sm text-muted-foreground">{option.description}</p>
                     </div>
                     <div className="text-right">
                       <p className="font-bold text-lg text-rides">{getFareEstimate(option)}</p>
                       <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
                     </div>
                   </button>
                 ))}
               </div>
             </div>
           )}
 
           {step === "confirm" && selectedOption && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
               <Button variant="ghost" onClick={() => setStep("options")} className="gap-2 mb-2">← Back</Button>
               <div className="p-5 rounded-2xl bg-rides/5 border border-rides/20">
                 <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center text-3xl">{selectedOption.icon}</div>
                   <div className="flex-1">
                     <h3 className="font-bold text-lg">{selectedOption.name}</h3>
                     <p className="text-sm text-muted-foreground">{pickup} → {dropoff}</p>
                   </div>
                   <div className="text-right">
                     <p className="font-bold text-xl text-rides">${calculateFare(estimatedDistance, estimatedDuration, selectedOption.multiplier).toFixed(2)}</p>
                     <p className="text-xs text-muted-foreground">Est. total</p>
                   </div>
                 </div>
               </div>
               <h2 className="font-display font-bold text-2xl">Your Information</h2>
               <div className="space-y-4">
                 <div>
                   <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                   <div className="relative mt-1.5">
                     <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                     <Input id="name" placeholder="Your name" value={contactInfo.name} onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))} className="pl-11 h-12" />
                   </div>
                 </div>
                 <div>
                   <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                   <div className="relative mt-1.5">
                     <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                     <Input id="phone" type="tel" placeholder="(555) 123-4567" value={contactInfo.phone} onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))} className="pl-11 h-12" />
                   </div>
                 </div>
                 <div>
                   <Label htmlFor="email" className="text-sm font-medium">Email (for receipt)</Label>
                   <div className="relative mt-1.5">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                     <Input id="email" type="email" placeholder="your@email.com" value={contactInfo.email} onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))} className="pl-11 h-12" />
                   </div>
                 </div>
                 <div>
                   <Label htmlFor="notes" className="text-sm font-medium">Notes (optional)</Label>
                   <Textarea id="notes" placeholder="Any special requests..." value={contactInfo.notes} onChange={(e) => setContactInfo(prev => ({ ...prev, notes: e.target.value }))} className="mt-1.5 min-h-[100px]" />
                 </div>
               </div>
               <Button onClick={handlePayment} disabled={!contactInfo.name || !contactInfo.phone || isSubmitting} size="lg" className="w-full h-14 rounded-xl font-bold gap-3 bg-rides hover:bg-rides/90 text-lg">
                 <CreditCard className="w-5 h-5" />
                 Pay ${calculateFare(estimatedDistance, estimatedDuration, selectedOption.multiplier).toFixed(2)} & Request
               </Button>
               <p className="text-xs text-center text-muted-foreground">Secure payment via Stripe. We don't store your card details.</p>
             </div>
           )}
 
           {step === "processing" && (
             <div className="py-24 text-center space-y-6 animate-in fade-in duration-200">
               <Loader2 className="w-14 h-14 mx-auto text-rides animate-spin" />
               <div>
                 <h2 className="font-display text-2xl font-bold mb-2">Redirecting to Payment...</h2>
                 <p className="text-muted-foreground">Please wait while we set up your secure checkout.</p>
               </div>
             </div>
           )}
 
           {step === "success" && (
             <div className="py-16 text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
               <div className="w-24 h-24 mx-auto rounded-full bg-rides/10 flex items-center justify-center">
                 <CheckCircle2 className="w-12 h-12 text-rides" />
               </div>
               <div>
                 <h2 className="font-display text-3xl font-bold mb-3">Payment Received!</h2>
                 <p className="text-muted-foreground text-lg max-w-md mx-auto">Your ride request has been submitted. We'll confirm shortly.</p>
               </div>
               {requestId && (
                 <div className="py-4 px-6 rounded-2xl bg-muted/30 border border-border/50 inline-block">
                   <p className="text-xs text-muted-foreground mb-1">Request ID</p>
                   <p className="font-mono font-bold">{requestId.slice(0, 8).toUpperCase()}</p>
                 </div>
               )}
               <div className="py-5 px-6 rounded-2xl bg-muted/30 border border-border/50 max-w-md mx-auto text-left">
                 <p className="text-sm text-muted-foreground mb-3">Status: <span className="text-rides font-semibold">Paid / Awaiting Match</span></p>
                 <ul className="text-sm space-y-3">
                   <li className="flex items-center gap-3"><div className="w-2 h-2 bg-rides rounded-full" />We'll match you with a driver</li>
                   <li className="flex items-center gap-3"><div className="w-2 h-2 bg-rides rounded-full" />You'll receive a confirmation call/text</li>
                   <li className="flex items-center gap-3"><div className="w-2 h-2 bg-rides rounded-full" />Driver will pick you up at the scheduled time</li>
                 </ul>
               </div>
               <Button variant="outline" size="lg" onClick={handleReset} className="rounded-xl">Request Another Ride</Button>
             </div>
           )}
         </div>
 
         {step === "request" && (
           <section className="py-16 bg-muted/30">
             <div className="container mx-auto px-4">
               <div className="text-center mb-10">
                 <h2 className="text-3xl font-bold mb-3">Why Choose <span className="text-rides">ZIVO Rides</span></h2>
               </div>
               <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                 {[
                   { icon: Clock, title: "Quick Pickup", desc: "Get matched with drivers fast" },
                   { icon: Shield, title: "Safe & Reliable", desc: "Verified drivers with quality vehicles" },
                   { icon: Star, title: "Top-Rated", desc: "Professional service" },
                   { icon: MapPin, title: "Anywhere", desc: "City trips and airport transfers" },
                 ].map((f) => (
                   <div key={f.title} className="text-center p-6 rounded-2xl bg-card border border-border/50">
                     <div className="w-14 h-14 mx-auto rounded-2xl bg-rides/10 flex items-center justify-center mb-4">
                       <f.icon className="w-7 h-7 text-rides" />
                     </div>
                     <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                     <p className="text-sm text-muted-foreground">{f.desc}</p>
                   </div>
                 ))}
               </div>
             </div>
           </section>
         )}
 
         {step === "request" && (
           <section className="py-16">
             <div className="container mx-auto px-4">
               <div className="text-center mb-10">
                 <h2 className="text-3xl font-bold mb-3">Choose Your <span className="text-rides">Ride</span></h2>
               </div>
               <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                 {[
                   { name: "Standard", desc: "Affordable everyday rides", img: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop&q=75&fm=webp" },
                   { name: "XL", desc: "More space for groups", img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop&q=75&fm=webp" },
                   { name: "Premium", desc: "Luxury vehicles", img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=300&fit=crop&q=75&fm=webp" },
                 ].map((v) => (
                   <div key={v.name} className="overflow-hidden rounded-2xl border-2 border-border/50 hover:border-rides/30 transition-all group">
                     <div className="relative aspect-[4/3] overflow-hidden">
                       <img src={v.img} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                       <div className="absolute bottom-4 left-4 text-white">
                         <h3 className="font-bold text-xl">{v.name}</h3>
                         <p className="text-sm text-white/80">{v.desc}</p>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           </section>
         )}
       </main>
 
       <Footer />
     </div>
   );
 }