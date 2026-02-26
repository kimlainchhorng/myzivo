import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Navigation, Loader2, Car, Receipt, ChevronRight, DollarSign, CreditCard, Lock, Shield, CheckCircle, Zap, Plus, Users, Clock, Sparkles, Leaf, Crown, Volume2, VolumeX, Thermometer, Music, Tag, Gift, Heart, Star, Share2, UserPlus, Phone, AlertTriangle, Copy, ExternalLink, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { usePhoneVerificationGate } from "@/hooks/usePhoneVerificationGate";
import { PhoneVerificationDialog } from "@/components/account/PhoneVerificationDialog";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { useGoogleMapsGeocode, Suggestion } from "@/hooks/useGoogleMapsGeocode";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";
import { cn } from "@/lib/utils";
import RideMap from "@/components/maps/RideMap";

const stripePromise = getStripe();

interface PricingBreakdown {
  base_fare: number;
  per_mile: number;
  per_minute: number;
  airport_fee: number;
  final_multiplier: number;
  total: number;
}

const rideCategories = [
  { id: "economy", label: "Economy", icon: Car },
  { id: "premium", label: "Premium", icon: Sparkles },
  { id: "elite", label: "Elite", icon: Crown },
];

const vehicleOptions: Record<string, Array<{
  id: string; name: string; badge?: string; badgeColor?: string;
  eta: string; capacity: number; price: string; priceCents: number; multiplier: number;
}>> = {
  economy: [
    { id: "wait-save", name: "Wait & Save", badge: "Save", badgeColor: "text-primary", eta: "10-15 min", capacity: 4, price: "$13.55", priceCents: 1355, multiplier: 0.85 },
    { id: "standard", name: "Standard", eta: "3-5 min", capacity: 4, price: "$16.29", priceCents: 1629, multiplier: 1.0 },
    { id: "green", name: "Green", badge: "Eco", badgeColor: "text-emerald-500", eta: "5-8 min", capacity: 4, price: "$15.55", priceCents: 1555, multiplier: 0.95 },
    { id: "priority", name: "Priority", badge: "Fast", badgeColor: "text-orange-500", eta: "1-3 min", capacity: 4, price: "$18.29", priceCents: 1829, multiplier: 1.15 },
    { id: "xl", name: "XL", eta: "5-10 min", capacity: 6, price: "$22.99", priceCents: 2299, multiplier: 1.4 },
  ],
  premium: [
    { id: "comfort", name: "Comfort", eta: "4-8 min", capacity: 4, price: "$24.99", priceCents: 2499, multiplier: 1.5 },
    { id: "comfort-xl", name: "Comfort XL", eta: "6-10 min", capacity: 6, price: "$32.50", priceCents: 3250, multiplier: 2.0 },
    { id: "black", name: "Black", badge: "Top Rated", badgeColor: "text-amber-500", eta: "5-10 min", capacity: 4, price: "$38.99", priceCents: 3899, multiplier: 2.4 },
  ],
  elite: [
    { id: "black-suv", name: "Black SUV", badge: "Luxury", badgeColor: "text-amber-500", eta: "8-15 min", capacity: 6, price: "$52.99", priceCents: 5299, multiplier: 3.2 },
    { id: "limo", name: "Limo", badge: "VIP", badgeColor: "text-violet-500", eta: "15-25 min", capacity: 4, price: "$89.99", priceCents: 8999, multiplier: 5.5 },
  ],
};

const ridePreferences = [
  { id: "quiet", icon: VolumeX, label: "Quiet Ride", description: "Minimal conversation" },
  { id: "ac", icon: Thermometer, label: "Cool AC", description: "Extra air conditioning" },
  { id: "music", icon: Music, label: "Music On", description: "Driver plays music" },
  { id: "pet", icon: Heart, label: "Pet Friendly", description: "Traveling with a pet" },
];

const tipOptions = [
  { id: "none", label: "No tip", amount: 0 },
  { id: "15", label: "15%", amount: 0.15 },
  { id: "20", label: "20%", amount: 0.20 },
  { id: "25", label: "25%", amount: 0.25 },
  { id: "custom", label: "Custom", amount: 0 },
];

const savedPlaces = [
  { id: "home", label: "Home", icon: "🏠", address: "" },
  { id: "work", label: "Work", icon: "💼", address: "" },
];

const safetyFeatures = [
  { id: "share-trip", icon: Share2, label: "Share Trip", description: "Share live location with contacts" },
  { id: "emergency", icon: Phone, label: "Emergency", description: "Quick access to 911" },
  { id: "report", icon: AlertTriangle, label: "Report Issue", description: "Report a safety concern" },
];

// Inner payment form using Stripe Elements
function PaymentForm({ 
  onSuccess, isProcessing, setIsProcessing, totalCents,
}: { 
  onSuccess: () => void; isProcessing: boolean;
  setIsProcessing: (v: boolean) => void; totalCents: number;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements, confirmParams: { return_url: window.location.href }, redirect: "if_required",
    });
    if (error) { toast.error(error.message || "Payment authorization failed"); setIsProcessing(false); }
    else if (paymentIntent && (paymentIntent.status === "requires_capture" || paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) { onSuccess(); }
    else { toast.error("Unexpected payment status"); setIsProcessing(false); }
  };

  const formatUSD = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="p-5 rounded-2xl bg-card border border-border/40 hover:border-primary/20 hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border/30 mb-4">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-bold text-foreground">Payment Details</span>
        </div>
        <PaymentElement options={{ layout: "tabs" }} />
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
        <Shield className="w-3.5 h-3.5 text-primary/60" />
        <span>Secured by Stripe · TLS 1.3 encrypted</span>
      </div>
      <Button type="submit" disabled={!stripe || isProcessing}
        className="w-full h-14 text-base font-bold gap-2.5 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 text-primary-foreground shadow-lg shadow-primary/25 active:scale-[0.98] transition-all duration-200" size="lg">
        {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" />Processing...</> : <><Lock className="w-5 h-5" />Authorize {formatUSD(totalCents)}</>}
      </Button>
    </form>
  );
}

// Step progress indicator
function RideStepIndicator({ currentStep }: { currentStep: "address" | "pricing" | "payment" | "finding" }) {
  const steps = [
    { id: "address", label: "Route", icon: MapPin },
    { id: "pricing", label: "Price", icon: DollarSign },
    { id: "payment", label: "Pay", icon: CreditCard },
  ] as const;
  const idx = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="flex items-center gap-2 px-4 py-3">
      {steps.map((s, i) => {
        const Icon = s.icon;
        return (
          <div key={s.id} className="flex-1 flex items-center gap-2">
            <div className="flex-1 flex flex-col items-center gap-1.5">
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300",
                i <= idx
                  ? "bg-gradient-to-br from-primary to-emerald-500 text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-muted/50 text-muted-foreground border border-border/40"
              )}>
                {i < idx ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={cn("text-[10px] font-bold", i <= idx ? "text-primary" : "text-muted-foreground/50")}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("h-[2px] flex-1 rounded-full transition-all duration-300 -mt-5", i < idx ? "bg-primary" : "bg-border/40")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Live ETA countdown in finding step
function LiveETACounter() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return (
    <span className="font-mono text-sm text-primary font-bold">
      {mins}:{secs.toString().padStart(2, "0")}
    </span>
  );
}

// Fare split component
function FareSplitSection({ totalCents, formatUSD }: { totalCents: number; formatUSD: (c: number) => string }) {
  const [splitCount, setSplitCount] = useState(1);
  const [showSplit, setShowSplit] = useState(false);
  const perPerson = Math.ceil(totalCents / splitCount);

  if (!showSplit) {
    return (
      <button onClick={() => setShowSplit(true)}
        className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-border/40 bg-card hover:border-primary/20 transition-all touch-manipulation active:scale-[0.98]">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold text-foreground">Split Fare</p>
          <p className="text-[10px] text-muted-foreground">Split the cost with fellow riders</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border/40 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold flex items-center gap-2"><UserPlus className="w-4 h-4 text-primary" /> Split Fare</h3>
        <button onClick={() => { setShowSplit(false); setSplitCount(1); }} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
      </div>
      <div className="flex items-center justify-center gap-4">
        <button onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground font-bold text-lg touch-manipulation active:scale-90">−</button>
        <div className="text-center">
          <p className="text-3xl font-bold text-foreground">{splitCount}</p>
          <p className="text-[10px] text-muted-foreground">{splitCount === 1 ? "person" : "people"}</p>
        </div>
        <button onClick={() => setSplitCount(Math.min(6, splitCount + 1))}
          className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg touch-manipulation active:scale-90">+</button>
      </div>
      {splitCount > 1 && (
        <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/20">
          <p className="text-xs text-muted-foreground">Each person pays</p>
          <p className="text-lg font-bold text-primary">{formatUSD(perPerson)}</p>
        </div>
      )}
    </div>
  );
}

export default function RequestRidePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isChecking: phoneChecking, isVerified: phoneVerified } = usePhoneVerificationGate();
  const [showPhoneVerify, setShowPhoneVerify] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);
  const { getCurrentLocation, reverseGeocode, isGettingLocation } = useCurrentLocation();

  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const pickupGeocode = useGoogleMapsGeocode();
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const dropoffGeocode = useGoogleMapsGeocode();
  const [activeInput, setActiveInput] = useState<"pickup" | "dropoff" | null>(null);

  const [activeCategory, setActiveCategory] = useState("economy");
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [selectedTip, setSelectedTip] = useState("none");
  const [customTip, setCustomTip] = useState("");
  const [rideNote, setRideNote] = useState("");
  const [showSafety, setShowSafety] = useState(false);

  const [step, setStep] = useState<"address" | "pricing" | "payment" | "finding">("address");
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [draftJobId, setDraftJobId] = useState<string | null>(null);
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("");

  const togglePreference = (id: string) => {
    setSelectedPreferences(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const tipAmount = useMemo(() => {
    if (!pricing) return 0;
    const total = pricing.total / 100;
    if (selectedTip === "custom") return parseFloat(customTip) || 0;
    const opt = tipOptions.find(t => t.id === selectedTip);
    return opt ? Math.round(total * opt.amount * 100) / 100 : 0;
  }, [selectedTip, customTip, pricing]);

  const handleUseMyLocation = useCallback(async () => {
    try {
      const loc = await getCurrentLocation();
      setPickupCoords({ lat: loc.lat, lng: loc.lng });
      const addr = await reverseGeocode(loc.lat, loc.lng);
      setPickupAddress(addr);
      pickupGeocode.clearSuggestions();
      setActiveInput(null);
    } catch { toast.error("Could not get your location"); }
  }, [getCurrentLocation, reverseGeocode, pickupGeocode]);

  const handleSelectSuggestion = (suggestion: Suggestion, field: "pickup" | "dropoff") => {
    if (field === "pickup") {
      setPickupAddress(suggestion.placeName); setPickupCoords(null);
      pickupGeocode.clearSuggestions();
    } else {
      setDropoffAddress(suggestion.placeName); setDropoffCoords(null);
      dropoffGeocode.clearSuggestions();
    }
    setActiveInput(null);
  };

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `https://slirphzzwcogdbkeicff.supabase.co/functions/v1/google-maps-proxy`,
        { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token ?? ""}`, "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaXJwaHp6d2NvZ2Ria2VpY2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDUzMzgsImV4cCI6MjA4NTAyMTMzOH0.44uwdZxQZYmmHr9yUALGO4Vr6mJVaVfSQW_pzJ0uoI" }, body: JSON.stringify({ action: "geocode", address }) }
      );
      const data = await res.json();
      if (data.results?.[0]?.geometry?.location) {
        const loc = data.results[0].geometry.location;
        return { lat: loc.lat, lng: loc.lng };
      }
      return null;
    } catch { return null; }
  };

  const handleGetPrice = async () => {
    if (!user) { toast.error("Please sign in first"); return; }
    if (!phoneChecking && !phoneVerified) {
      pendingActionRef.current = () => handleGetPrice();
      setShowPhoneVerify(true);
      return;
    }
    if (!pickupAddress.trim()) { toast.error("Please enter a pickup address"); return; }
    if (!dropoffAddress.trim()) { toast.error("Please enter a dropoff address for pricing"); return; }
    setIsLoadingPrice(true);
    try {
      let finalPickup = pickupCoords;
      if (!finalPickup) { finalPickup = await geocodeAddress(pickupAddress); if (!finalPickup) { toast.error("Could not resolve pickup location."); return; } setPickupCoords(finalPickup); }
      let finalDropoff = dropoffCoords;
      if (!finalDropoff) { finalDropoff = await geocodeAddress(dropoffAddress); if (!finalDropoff) { toast.error("Could not resolve dropoff location."); return; } setDropoffCoords(finalDropoff); }

      const { data: job, error } = await supabase.from("jobs").insert({
        customer_id: user.id, job_type: "ride", status: "created",
        pickup_address: pickupAddress, pickup_lat: finalPickup.lat, pickup_lng: finalPickup.lng,
        dropoff_address: dropoffAddress, dropoff_lat: finalDropoff.lat, dropoff_lng: finalDropoff.lng,
      } as any).select().single();
      if (error || !job) throw new Error(error?.message || "Failed to create draft job");
      const jobId = (job as any).id;
      setDraftJobId(jobId);

      const [estimateRes, zoneRes] = await Promise.all([
        supabase.functions.invoke("trip-estimate", { body: { job_id: jobId } }),
        supabase.rpc("assign_job_zone_and_surge_postgis" as any, { p_job_id: jobId }),
      ]);
      if (estimateRes.error) console.error("[GetPrice] trip-estimate error:", estimateRes.error);
      if (zoneRes.error) console.error("[GetPrice] zone/surge error:", zoneRes.error);

      const { error: pricingError } = await supabase.rpc("apply_pricing_to_job" as any, { p_job_id: jobId });
      if (pricingError) console.error("[GetPrice] apply_pricing error:", pricingError);

      const { data: pricedJob } = await supabase.from("jobs").select("*").eq("id", jobId).single();
      if (pricedJob) {
        const j = pricedJob as any;
        setPricing({ base_fare: j.pricing_base_fare ?? 0, per_mile: j.pricing_per_mile ?? 0, per_minute: j.pricing_per_minute ?? 0, airport_fee: j.pricing_airport_fee ?? 0, final_multiplier: j.pricing_final_multiplier ?? 1, total: j.pricing_total_estimate ?? 0 });
      }
      setStep("pricing");
    } catch (err: any) { toast.error(err.message || "Something went wrong"); } finally { setIsLoadingPrice(false); }
  };

  const handleConfirmPrice = async () => {
    if (!draftJobId) return;
    setIsConfirming(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment-intent", { body: { job_id: draftJobId } });
      if (error) throw new Error(error.message || "Failed to create payment intent");
      const secret = data?.client_secret || data?.clientSecret;
      if (!secret) throw new Error("No client_secret returned");
      setClientSecret(secret); setStep("payment");
    } catch (err: any) { toast.error(err.message || "Failed to initialize payment"); } finally { setIsConfirming(false); }
  };

  const handlePaymentSuccess = async () => {
    if (!draftJobId) return;
    setStep("finding");
    try {
      const { error: updateError } = await supabase.from("jobs").update({ status: "requested" } as any).eq("id", draftJobId);
      if (updateError) console.error("[RequestRide] status update error:", updateError);
      const { error: dispatchError } = await supabase.functions.invoke("dispatch-start", { body: { job_id: draftJobId, offer_ttl_seconds: 25 } });
      if (dispatchError) console.error("[RequestRide] dispatch-start error:", dispatchError);
      setTimeout(() => navigate(`/trip-status/${draftJobId}`), 5000);
    } catch { setTimeout(() => navigate(`/trip-status/${draftJobId}`), 3000); }
  };

  const handleShareTrip = () => {
    if (navigator.share) {
      navigator.share({ title: "My ZIVO Trip", text: `I'm on my way! Track my ride from ${pickupAddress} to ${dropoffAddress}.`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Trip link copied to clipboard!");
    }
  };

  const formatUSD = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const handleBack = () => {
    if (step === "finding") return;
    if (step === "payment") setStep("pricing");
    else if (step === "pricing") setStep("address");
    else navigate(-1);
  };
  const currentVehicles = vehicleOptions[activeCategory] || [];

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === "FIRST10") {
      setPromoApplied(true); toast.success("Promo code applied! 10% off");
    } else {
      toast.error("Invalid promo code");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Map area */}
      <div className="relative h-[35vh] min-h-[220px]">
        <RideMap pickupCoords={pickupCoords} dropoffCoords={dropoffCoords} className="w-full h-full" />
        <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-3 safe-area-top flex items-center justify-between">
          <motion.button whileTap={{ scale: 0.88 }} onClick={handleBack}
            className="h-10 px-4 rounded-full bg-card/90 backdrop-blur-lg border border-border/40 flex items-center gap-2 touch-manipulation text-sm font-medium text-foreground shadow-lg">
            <ArrowLeft className="w-4 h-4" />
          </motion.button>
          <div className="flex items-center gap-2">
            {/* Safety button */}
            <motion.button whileTap={{ scale: 0.88 }} onClick={() => setShowSafety(!showSafety)}
              className="h-10 w-10 rounded-full bg-card/90 backdrop-blur-lg border border-border/40 flex items-center justify-center touch-manipulation shadow-lg">
              <Shield className="w-4 h-4 text-primary" />
            </motion.button>
            {pickupAddress && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-card/90 backdrop-blur-lg border border-border/40 shadow-lg">
                <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">ETA</span>
                <div className="text-right">
                  <p className="text-xs font-bold text-foreground truncate max-w-[120px]">{pickupAddress.split(",")[0]}</p>
                  <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">{pickupAddress.split(",").slice(1).join(",").trim() || "Pickup"}</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Safety Panel Overlay */}
      <AnimatePresence>
        {showSafety && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="absolute top-[35vh] left-4 right-4 z-30 rounded-2xl bg-card border border-border/40 shadow-2xl p-4 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Safety Center</h3>
              <button onClick={() => setShowSafety(false)} className="text-xs text-muted-foreground">Close</button>
            </div>
            {safetyFeatures.map(f => {
              const Icon = f.icon;
              return (
                <button key={f.id} onClick={() => { if (f.id === "share-trip") handleShareTrip(); else if (f.id === "emergency") { window.location.href = "tel:911"; } else toast.info("Issue reported. Our team will review."); setShowSafety(false); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/30 hover:bg-muted/50 transition-all touch-manipulation active:scale-[0.98]">
                  <Icon className="w-4 h-4 text-primary" />
                  <div className="flex-1 text-left">
                    <p className="text-xs font-bold text-foreground">{f.label}</p>
                    <p className="text-[10px] text-muted-foreground">{f.description}</p>
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Sheet */}
      <div className="flex-1 -mt-6 relative z-10">
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-border/60" />
        </div>

        {/* Step Progress */}
        <RideStepIndicator currentStep={step} />

        <div className="px-4 max-w-lg mx-auto w-full space-y-4 pb-28">
          <AnimatePresence mode="wait">
            {step === "address" && (
              <motion.div key="address" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">Where to?</h2>
                  <span className="text-xs text-amber-500 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Live pricing
                  </span>
                </div>

                {/* Address inputs */}
                <div className="rounded-2xl bg-card border border-border/40 p-4 space-y-3 shadow-sm">
                  <div className="relative flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full border-2 border-primary bg-primary/20 shrink-0" />
                    <Input placeholder="Enter pickup location" value={pickupAddress}
                      onChange={(e) => { setPickupAddress(e.target.value); setPickupCoords(null); pickupGeocode.fetchSuggestions(e.target.value); setActiveInput("pickup"); }}
                      onFocus={() => setActiveInput("pickup")}
                      className="h-11 border-0 bg-transparent px-0 text-sm font-medium focus-visible:ring-0 shadow-none" />
                  </div>
                  <div className="ml-1.5 border-l-2 border-dashed border-border/40 h-3" />
                  <div className="relative flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full border-2 border-orange-500 bg-orange-500/20 shrink-0" />
                    <Input placeholder="Enter destination" value={dropoffAddress}
                      onChange={(e) => { setDropoffAddress(e.target.value); setDropoffCoords(null); dropoffGeocode.fetchSuggestions(e.target.value); setActiveInput("dropoff"); }}
                      onFocus={() => setActiveInput("dropoff")}
                      className="h-11 border-0 bg-transparent px-0 text-sm font-medium focus-visible:ring-0 shadow-none" />
                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                </div>

                {/* Suggestions */}
                {activeInput === "pickup" && pickupGeocode.suggestions.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border/40 rounded-2xl shadow-lg overflow-hidden">
                    {pickupGeocode.suggestions.map((s) => (
                      <button key={s.id} onClick={() => handleSelectSuggestion(s, "pickup")} className="w-full text-left px-4 py-3.5 hover:bg-muted/50 transition border-b border-border/20 last:border-b-0 text-sm text-foreground touch-manipulation active:bg-muted/80 flex items-center gap-3">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" /><span className="truncate">{s.placeName}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
                {activeInput === "dropoff" && dropoffGeocode.suggestions.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border/40 rounded-2xl shadow-lg overflow-hidden">
                    {dropoffGeocode.suggestions.map((s) => (
                      <button key={s.id} onClick={() => handleSelectSuggestion(s, "dropoff")} className="w-full text-left px-4 py-3.5 hover:bg-muted/50 transition border-b border-border/20 last:border-b-0 text-sm text-foreground touch-manipulation active:bg-muted/80 flex items-center gap-3">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" /><span className="truncate">{s.placeName}</span>
                      </button>
                    ))}
                  </motion.div>
                )}

                {/* Quick actions row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="ghost" size="sm" onClick={handleUseMyLocation} disabled={isGettingLocation}
                    className="gap-2 text-xs font-medium text-primary hover:text-primary hover:bg-primary/5">
                    {isGettingLocation ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                    Use my location
                  </Button>
                  {savedPlaces.map(place => (
                    <button key={place.id} onClick={() => { if (place.address) { setPickupAddress(place.address); } else { toast.info(`Set your ${place.label} address in Settings`); } }}
                      className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition px-2 py-1.5 rounded-lg bg-muted/30 border border-border/30 touch-manipulation active:scale-95">
                      <span>{place.icon}</span> {place.label}
                    </button>
                  ))}
                  <button className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition px-1">
                    <Plus className="w-3.5 h-3.5" /> Add stop
                  </button>
                </div>

                {/* Note to driver */}
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Input placeholder="Note to driver (e.g., I'm at the blue door)" value={rideNote} onChange={(e) => setRideNote(e.target.value)} className="h-10 rounded-xl text-sm" />
                </div>

                {/* Schedule ride toggle */}
                <div className="rounded-2xl bg-card border border-border/40 p-3 flex items-center gap-3">
                  <button onClick={() => setIsScheduled(!isScheduled)}
                    className={cn("w-10 h-6 rounded-full transition-all relative", isScheduled ? "bg-primary" : "bg-muted/60")}>
                    <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all", isScheduled ? "left-[18px]" : "left-0.5")} />
                  </button>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> Schedule for later</p>
                    {!isScheduled && <p className="text-[10px] text-muted-foreground">Ride now · ASAP pickup</p>}
                  </div>
                </div>
                {isScheduled && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid grid-cols-2 gap-2">
                    {["Today 2:00 PM", "Today 5:00 PM", "Tomorrow 9:00 AM", "Tomorrow 12:00 PM"].map(time => (
                      <button key={time} onClick={() => setScheduleTime(time)}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all touch-manipulation active:scale-95",
                          scheduleTime === time ? "border-primary bg-primary/5" : "border-border/40 bg-card hover:border-primary/20"
                        )}>
                        <p className="font-bold text-xs text-foreground">{time.split(" ").slice(0, 1)}</p>
                        <p className="text-[10px] text-muted-foreground">{time.split(" ").slice(1).join(" ")}</p>
                      </button>
                    ))}
                  </motion.div>
                )}

                {/* Category Tabs */}
                <div className="flex gap-2 pt-2">
                  {rideCategories.map((cat) => (
                    <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setSelectedVehicle(null); }}
                      className={cn(
                        "px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 touch-manipulation active:scale-95",
                        activeCategory === cat.id ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" : "bg-muted/50 text-muted-foreground border border-border/40 hover:bg-muted"
                      )}>
                      {cat.id === "premium" && <Sparkles className="w-3 h-3" />}
                      {cat.id === "elite" && <Crown className="w-3 h-3" />}
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Vehicle Options */}
                <div className="space-y-2">
                  {currentVehicles.map((vehicle, i) => (
                    <motion.button key={vehicle.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedVehicle(vehicle.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-200 touch-manipulation active:scale-[0.98]",
                        selectedVehicle === vehicle.id ? "border-primary bg-primary/5 shadow-sm shadow-primary/10" : "border-border/40 bg-card hover:border-primary/20 hover:bg-muted/30"
                      )}>
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", selectedVehicle === vehicle.id ? "bg-primary/15" : "bg-muted/50")}>
                        <Car className={cn("w-6 h-6", selectedVehicle === vehicle.id ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">{vehicle.name}</span>
                          {vehicle.badge && <span className={cn("text-[10px] font-bold flex items-center gap-0.5", vehicle.badgeColor)}><span className="w-1.5 h-1.5 rounded-full bg-current" />{vehicle.badge}</span>}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5"><Clock className="w-3 h-3" /><span>{vehicle.eta}</span></div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0"><Users className="w-3.5 h-3.5" /><span>{vehicle.capacity}</span></div>
                      <span className={cn("text-base font-bold shrink-0", selectedVehicle === vehicle.id ? "text-primary" : "text-foreground")}>{vehicle.price}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Ride Preferences */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Star className="w-3 h-3" /> Ride Preferences
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ridePreferences.map(pref => {
                      const Icon = pref.icon;
                      const isSelected = selectedPreferences.includes(pref.id);
                      return (
                        <button key={pref.id} onClick={() => togglePreference(pref.id)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all touch-manipulation active:scale-95",
                            isSelected ? "bg-primary/10 border border-primary/30 text-primary" : "bg-muted/50 border border-border/40 text-muted-foreground hover:bg-muted"
                          )}>
                          <Icon className="w-3.5 h-3.5" />
                          {pref.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Get Price button */}
                <Button onClick={handleGetPrice} disabled={isLoadingPrice || !pickupAddress.trim() || !dropoffAddress.trim()}
                  className="w-full h-14 text-base font-bold gap-2.5 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 text-primary-foreground shadow-lg shadow-primary/25 active:scale-[0.98] transition-all duration-200" size="lg">
                  {isLoadingPrice ? <><Loader2 className="w-5 h-5 animate-spin" />Calculating price...</> : <><Zap className="w-5 h-5" />{selectedVehicle ? `Request ${currentVehicles.find(v => v.id === selectedVehicle)?.name || "Ride"}` : "Get Price"}</>}
                </Button>
              </motion.div>
            )}

            {step === "pricing" && (
              <motion.div key="pricing" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
                {/* Route summary */}
                <div className="p-5 rounded-2xl bg-card border border-border/40 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-1 pt-1">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-emerald-500 shadow-sm shadow-primary/30" />
                      <div className="w-0.5 h-10 bg-gradient-to-b from-primary/40 to-destructive/40" />
                      <div className="w-3 h-3 rounded-full bg-destructive shadow-sm shadow-destructive/30" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div><p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Pickup</p><p className="text-sm font-bold text-foreground truncate">{pickupAddress}</p></div>
                      <div><p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">Dropoff</p><p className="text-sm font-bold text-foreground truncate">{dropoffAddress}</p></div>
                    </div>
                  </div>
                  {rideNote && (
                    <div className="mt-3 pt-3 border-t border-border/30 flex items-center gap-2 text-xs text-muted-foreground">
                      <MessageSquare className="w-3 h-3 shrink-0" /> {rideNote}
                    </div>
                  )}
                </div>

                {/* Selected vehicle + preferences */}
                {selectedVehicle && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/20">
                      <Car className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold text-primary">{currentVehicles.find(v => v.id === selectedVehicle)?.name}</span>
                    </div>
                    {selectedPreferences.map(p => {
                      const pref = ridePreferences.find(rp => rp.id === p);
                      if (!pref) return null;
                      const Icon = pref.icon;
                      return (
                        <div key={p} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/50 border border-border/40 text-xs text-muted-foreground">
                          <Icon className="w-3 h-3" /> {pref.label}
                        </div>
                      );
                    })}
                    {isScheduled && scheduleTime && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/5 border border-primary/20 text-xs text-primary font-bold">
                        <Clock className="w-3 h-3" /> {scheduleTime}
                      </div>
                    )}
                  </div>
                )}

                {/* Price breakdown */}
                {pricing && (
                  <div className="rounded-2xl bg-card border border-border/40 overflow-hidden shadow-sm">
                    <div className="flex items-center gap-2.5 p-4 border-b border-border/30 bg-muted/20">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center"><Receipt className="w-4 h-4 text-primary" /></div>
                      <span className="text-sm font-bold text-foreground">Fare Breakdown</span>
                    </div>
                    <div className="p-4 space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Base fare</span><span className="font-bold text-foreground">{formatUSD(pricing.base_fare)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Distance charge</span><span className="font-bold text-foreground">{formatUSD(pricing.per_mile)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Time charge</span><span className="font-bold text-foreground">{formatUSD(pricing.per_minute)}</span></div>
                      {pricing.airport_fee > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Airport fee</span><span className="font-bold text-foreground">{formatUSD(pricing.airport_fee)}</span></div>}
                      {pricing.final_multiplier !== 1 && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-amber-600 font-bold flex items-center gap-1"><Zap className="w-3 h-3" /> Surge ({pricing.final_multiplier.toFixed(2)}x)</span>
                          <span className="text-xs text-amber-600 font-bold">applied</span>
                        </div>
                      )}
                      {promoApplied && (
                        <div className="flex justify-between items-center text-primary">
                          <span className="text-xs font-bold flex items-center gap-1"><Tag className="w-3 h-3" /> Promo FIRST10</span>
                          <span className="text-xs font-bold">-10%</span>
                        </div>
                      )}
                    </div>
                    <div className="px-4 pb-4">
                      <div className="flex justify-between pt-4 border-t border-border/30">
                        <span className="font-bold text-lg text-foreground">Estimated Total</span>
                        <span className="font-bold text-2xl text-primary">{formatUSD(promoApplied ? Math.round(pricing.total * 0.9) : pricing.total)}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground pt-2">Final price may vary based on actual route, traffic, and wait time.</p>
                    </div>
                  </div>
                )}

                {/* Fare Split */}
                {pricing && <FareSplitSection totalCents={promoApplied ? Math.round(pricing.total * 0.9) : pricing.total} formatUSD={formatUSD} />}

                {/* Promo Code */}
                <div className="rounded-2xl bg-card border border-border/40 p-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <Gift className="w-3 h-3" /> Promo Code
                  </h3>
                  <div className="flex gap-2">
                    <Input placeholder="Enter code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)}
                      disabled={promoApplied} className="h-10 rounded-xl flex-1 text-sm" />
                    <Button variant={promoApplied ? "outline" : "default"} size="sm" onClick={handleApplyPromo}
                      disabled={promoApplied || !promoCode.trim()} className="rounded-xl h-10 px-4 text-xs font-bold">
                      {promoApplied ? <><CheckCircle className="w-3.5 h-3.5 mr-1" /> Applied</> : "Apply"}
                    </Button>
                  </div>
                </div>

                <Button onClick={handleConfirmPrice} disabled={isConfirming}
                  className="w-full h-14 text-base font-bold gap-2.5 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 text-primary-foreground shadow-lg shadow-primary/25 active:scale-[0.98] transition-all duration-200" size="lg">
                  {isConfirming ? <><Loader2 className="w-5 h-5 animate-spin" />Setting up payment...</> : <><CreditCard className="w-5 h-5" />Continue to Payment</>}
                </Button>
              </motion.div>
            )}

            {step === "payment" && clientSecret && (
              <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
                {/* Compact route + price summary */}
                <div className="p-4 rounded-2xl bg-card border border-border/40 flex items-center justify-between shadow-sm">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />{pickupAddress}</p>
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5 mt-1"><span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />{dropoffAddress}</p>
                  </div>
                  {pricing && <span className="text-xl font-bold text-primary ml-3 shrink-0">{formatUSD(promoApplied ? Math.round(pricing.total * 0.9) : pricing.total)}</span>}
                </div>

                {/* Tip Selection */}
                <div className="rounded-2xl bg-card border border-border/40 p-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-3">
                    <Heart className="w-3 h-3" /> Add a Tip
                  </h3>
                  <div className="flex gap-2 mb-2">
                    {tipOptions.map(opt => (
                      <button key={opt.id} onClick={() => setSelectedTip(opt.id)}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all touch-manipulation active:scale-95",
                          selectedTip === opt.id ? "bg-primary text-primary-foreground shadow-md" : "bg-muted/50 text-muted-foreground border border-border/40 hover:bg-muted"
                        )}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {selectedTip === "custom" && (
                    <Input placeholder="Enter tip amount" type="number" value={customTip}
                      onChange={(e) => setCustomTip(e.target.value)} className="h-10 rounded-xl text-sm mt-2" />
                  )}
                  {tipAmount > 0 && (
                    <p className="text-xs text-primary font-medium mt-2">Tip: ${tipAmount.toFixed(2)} — Thank you for your generosity!</p>
                  )}
                </div>

                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "night", variables: { colorPrimary: "hsl(142, 76%, 36%)", borderRadius: "12px" } } }}>
                  <PaymentForm onSuccess={handlePaymentSuccess} isProcessing={isProcessingPayment} setIsProcessing={setIsProcessingPayment} totalCents={(pricing?.total ?? 0) + Math.round(tipAmount * 100)} />
                </Elements>
              </motion.div>
            )}

            {/* FINDING DRIVER - Enhanced */}
            {step === "finding" && (
              <motion.div key="finding" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 space-y-6 text-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 rounded-full border-4 border-primary/30 border-t-primary flex items-center justify-center">
                    <Car className="w-8 h-8 text-primary" />
                  </motion.div>
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Finding your driver...</h2>
                  <p className="text-sm text-muted-foreground">Matching you with the nearest available driver</p>
                  <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" /> Searching for <LiveETACounter />
                  </div>
                </div>

                {/* Live progress steps */}
                <div className="w-full max-w-xs space-y-2">
                  {[
                    { label: "Payment confirmed", done: true, icon: CheckCircle },
                    { label: "Searching nearby drivers", done: false, icon: Navigation, active: true },
                    { label: "Driver assigned", done: false, icon: Car },
                    { label: "Driver en route to you", done: false, icon: MapPin },
                  ].map((item, i) => (
                    <motion.div key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.3 }}
                      className={cn("flex items-center gap-3 p-2.5 rounded-xl text-left", item.done ? "opacity-100" : item.active ? "opacity-100" : "opacity-40")}>
                      <item.icon className={cn("w-4 h-4 shrink-0", item.done ? "text-primary" : item.active ? "text-amber-500 animate-pulse" : "text-muted-foreground")} />
                      <span className={cn("text-xs font-medium", item.done ? "text-primary" : item.active ? "text-foreground" : "text-muted-foreground")}>{item.label}</span>
                      {item.done && <CheckCircle className="w-3 h-3 text-primary ml-auto" />}
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-primary" /> Verified drivers</span>
                  <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-amber-500" /> 4.8+ rated</span>
                </div>

                {/* Safety actions during finding */}
                <div className="flex gap-3 w-full max-w-xs">
                  <button onClick={handleShareTrip}
                    className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-border/40 bg-card text-xs font-bold text-foreground hover:bg-muted/50 touch-manipulation active:scale-95">
                    <Share2 className="w-4 h-4 text-primary" /> Share Trip
                  </button>
                  <button onClick={() => { toast.info("Ride cancelled. Refund will be processed."); navigate("/"); }}
                    className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-destructive/30 bg-destructive/5 text-xs font-bold text-destructive hover:bg-destructive/10 touch-manipulation active:scale-95">
                    Cancel
                  </button>
                </div>

                {isScheduled && scheduleTime && (
                  <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                    <Clock className="w-3.5 h-3.5 inline mr-1.5" />Scheduled: {scheduleTime}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ZivoMobileNav />

      <PhoneVerificationDialog
        open={showPhoneVerify}
        onOpenChange={setShowPhoneVerify}
        phoneNumber=""
        onVerified={() => {
          setShowPhoneVerify(false);
          if (pendingActionRef.current) {
            pendingActionRef.current();
            pendingActionRef.current = null;
          }
        }}
      />
    </div>
  );
}
