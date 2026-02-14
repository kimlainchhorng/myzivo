import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Navigation, Loader2, Car, Receipt, ChevronRight, DollarSign, CreditCard, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { useGoogleMapsGeocode, Suggestion } from "@/hooks/useGoogleMapsGeocode";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

interface PricingBreakdown {
  base_fare: number;
  per_mile: number;
  per_minute: number;
  airport_fee: number;
  final_multiplier: number;
  total: number;
}

// Inner payment form using Stripe Elements
function PaymentForm({ 
  onSuccess, 
  isProcessing, 
  setIsProcessing,
  totalCents,
}: { 
  onSuccess: () => void;
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
  totalCents: number;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href, // fallback, we handle inline
      },
      redirect: "if_required",
    });

    if (error) {
      toast.error(error.message || "Payment failed");
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  const formatUSD = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-2 pb-3 border-b border-border mb-4">
          <CreditCard className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Payment Details</span>
        </div>
        <PaymentElement 
          options={{
            layout: "tabs",
          }}
        />
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
        <Lock className="w-3 h-3" />
        <span>Secured by Stripe · TLS 1.3 encrypted</span>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full h-14 text-base font-semibold gap-2"
        size="lg"
      >
        {isProcessing ? (
          <><Loader2 className="w-5 h-5 animate-spin" />Processing…</>
        ) : (
          <><Lock className="w-5 h-5" />Pay {formatUSD(totalCents)}</>
        )}
      </Button>
    </form>
  );
}

export default function RequestRidePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getCurrentLocation, reverseGeocode, isGettingLocation } = useCurrentLocation();

  // Pickup state
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const pickupGeocode = useGoogleMapsGeocode();

  // Dropoff state
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const dropoffGeocode = useGoogleMapsGeocode();

  const [activeInput, setActiveInput] = useState<"pickup" | "dropoff" | null>(null);

  // Three-step flow state
  const [step, setStep] = useState<"address" | "pricing" | "payment">("address");
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [draftJobId, setDraftJobId] = useState<string | null>(null);
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Use current location for pickup
  const handleUseMyLocation = useCallback(async () => {
    try {
      const loc = await getCurrentLocation();
      setPickupCoords({ lat: loc.lat, lng: loc.lng });
      const addr = await reverseGeocode(loc.lat, loc.lng);
      setPickupAddress(addr);
      pickupGeocode.clearSuggestions();
      setActiveInput(null);
    } catch {
      toast.error("Could not get your location");
    }
  }, [getCurrentLocation, reverseGeocode, pickupGeocode]);

  const handleSelectSuggestion = (suggestion: Suggestion, field: "pickup" | "dropoff") => {
    if (field === "pickup") {
      setPickupAddress(suggestion.placeName);
      setPickupCoords(null);
      pickupGeocode.clearSuggestions();
    } else {
      setDropoffAddress(suggestion.placeName);
      setDropoffCoords(null);
      dropoffGeocode.clearSuggestions();
    }
    setActiveInput(null);
  };

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `https://slirphzzwcogdbkeicff.supabase.co/functions/v1/google-maps-proxy`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token ?? ""}`,
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaXJwaHp6d2NvZ2Ria2VpY2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDUzMzgsImV4cCI6MjA4NTAyMTMzOH0.44uwdZZxQZYmmHr9yUALGO4Vr6mJVaVfSQW_pzJ0uoI",
          },
          body: JSON.stringify({ action: "geocode", address }),
        }
      );
      const data = await res.json();
      if (data.results?.[0]?.geometry?.location) {
        const loc = data.results[0].geometry.location;
        return { lat: loc.lat, lng: loc.lng };
      }
      return null;
    } catch {
      return null;
    }
  };

  // STEP 1: Get Price — create draft job + call pricing pipeline
  const handleGetPrice = async () => {
    if (!user) { toast.error("Please sign in first"); return; }
    if (!pickupAddress.trim()) { toast.error("Please enter a pickup address"); return; }
    if (!dropoffAddress.trim()) { toast.error("Please enter a dropoff address for pricing"); return; }

    setIsLoadingPrice(true);

    try {
      let finalPickup = pickupCoords;
      if (!finalPickup) {
        finalPickup = await geocodeAddress(pickupAddress);
        if (!finalPickup) { toast.error("Could not resolve pickup location."); return; }
        setPickupCoords(finalPickup);
      }

      let finalDropoff = dropoffCoords;
      if (!finalDropoff) {
        finalDropoff = await geocodeAddress(dropoffAddress);
        if (!finalDropoff) { toast.error("Could not resolve dropoff location."); return; }
        setDropoffCoords(finalDropoff);
      }

      // 1) Create draft job (status='created')
      const { data: job, error } = await supabase
        .from("jobs")
        .insert({
          customer_id: user.id,
          job_type: "ride",
          status: "created",
          pickup_address: pickupAddress,
          pickup_lat: finalPickup.lat,
          pickup_lng: finalPickup.lng,
          dropoff_address: dropoffAddress,
          dropoff_lat: finalDropoff.lat,
          dropoff_lng: finalDropoff.lng,
        } as any)
        .select()
        .single();

      if (error || !job) throw new Error(error?.message || "Failed to create draft job");
      const jobId = (job as any).id;
      setDraftJobId(jobId);

      // 2) Call pricing pipeline
      const [estimateRes, zoneRes] = await Promise.all([
        supabase.functions.invoke("trip-estimate", { body: { job_id: jobId } }),
        supabase.rpc("assign_job_zone_and_surge_postgis" as any, { p_job_id: jobId }),
      ]);

      if (estimateRes.error) console.error("[GetPrice] trip-estimate error:", estimateRes.error);
      if (zoneRes.error) console.error("[GetPrice] zone/surge error:", zoneRes.error);

      // 3) Apply pricing
      const { error: pricingError } = await supabase.rpc("apply_pricing_to_job" as any, { p_job_id: jobId });
      if (pricingError) console.error("[GetPrice] apply_pricing error:", pricingError);

      // 4) Fetch the priced job
      const { data: pricedJob } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .single();

      if (pricedJob) {
        const j = pricedJob as any;
        setPricing({
          base_fare: j.pricing_base_fare ?? 0,
          per_mile: j.pricing_per_mile ?? 0,
          per_minute: j.pricing_per_minute ?? 0,
          airport_fee: j.pricing_airport_fee ?? 0,
          final_multiplier: j.pricing_final_multiplier ?? 1,
          total: j.pricing_total_estimate ?? 0,
        });
      }

      setStep("pricing");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsLoadingPrice(false);
    }
  };

  // STEP 2: Confirm Price → create PaymentIntent → show Stripe Elements
  const handleConfirmPrice = async () => {
    if (!draftJobId) return;
    setIsConfirming(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-payment-intent", {
        body: { job_id: draftJobId },
      });

      if (error) throw new Error(error.message || "Failed to create payment intent");

      const secret = data?.client_secret || data?.clientSecret;
      if (!secret) throw new Error("No client_secret returned");

      setClientSecret(secret);
      setStep("payment");
    } catch (err: any) {
      toast.error(err.message || "Failed to initialize payment");
    } finally {
      setIsConfirming(false);
    }
  };

  // STEP 3: After Stripe payment succeeds → update status + dispatch
  const handlePaymentSuccess = async () => {
    if (!draftJobId) return;

    try {
      // Update status to 'requested'
      const { error: updateError } = await supabase
        .from("jobs")
        .update({ status: "requested" } as any)
        .eq("id", draftJobId);

      if (updateError) console.error("[RequestRide] status update error:", updateError);

      // Dispatch
      const { error: dispatchError } = await supabase.functions.invoke("dispatch-start", {
        body: { job_id: draftJobId, offer_ttl_seconds: 25 },
      });

      if (dispatchError) console.error("[RequestRide] dispatch-start error:", dispatchError);

      navigate(`/trip-status/${draftJobId}`);
    } catch (err: any) {
      // Payment succeeded even if dispatch fails, navigate anyway
      navigate(`/trip-status/${draftJobId}`);
    }
  };

  const formatUSD = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const stepTitle = step === "address" 
    ? "Request a Ride" 
    : step === "pricing" 
      ? "Confirm Price" 
      : "Payment";

  const handleBack = () => {
    if (step === "payment") setStep("pricing");
    else if (step === "pricing") setStep("address");
    else navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={handleBack} className="p-1.5 rounded-full hover:bg-muted transition">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <Car className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">{stepTitle}</h1>
        </div>
      </div>

      {/* Step indicator */}
      <div className="px-4 pt-4 max-w-lg mx-auto w-full">
        <div className="flex gap-1.5">
          {["address", "pricing", "payment"].map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= ["address", "pricing", "payment"].indexOf(step)
                  ? "bg-primary"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 space-y-5 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          {step === "address" && (
            <motion.div
              key="address"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              {/* Pickup */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Pickup Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <Input
                    placeholder="Enter pickup address"
                    value={pickupAddress}
                    onChange={(e) => {
                      setPickupAddress(e.target.value);
                      setPickupCoords(null);
                      pickupGeocode.fetchSuggestions(e.target.value);
                      setActiveInput("pickup");
                    }}
                    onFocus={() => setActiveInput("pickup")}
                    className="pl-10"
                  />
                </div>

                <Button variant="outline" size="sm" onClick={handleUseMyLocation} disabled={isGettingLocation} className="w-full gap-2">
                  {isGettingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                  Use my location
                </Button>

                {activeInput === "pickup" && pickupGeocode.suggestions.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg shadow-md overflow-hidden">
                    {pickupGeocode.suggestions.map((s) => (
                      <button key={s.id} onClick={() => handleSelectSuggestion(s, "pickup")} className="w-full text-left px-4 py-3 hover:bg-muted/50 transition border-b border-border last:border-b-0 text-sm text-foreground">
                        {s.placeName}
                      </button>
                    ))}
                  </motion.div>
                )}

                {pickupCoords && (
                  <p className="text-xs text-muted-foreground">📍 {pickupCoords.lat.toFixed(4)}, {pickupCoords.lng.toFixed(4)}</p>
                )}
              </div>

              {/* Dropoff */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Dropoff Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-destructive" />
                  <Input
                    placeholder="Enter dropoff address"
                    value={dropoffAddress}
                    onChange={(e) => {
                      setDropoffAddress(e.target.value);
                      setDropoffCoords(null);
                      dropoffGeocode.fetchSuggestions(e.target.value);
                      setActiveInput("dropoff");
                    }}
                    onFocus={() => setActiveInput("dropoff")}
                    className="pl-10"
                  />
                </div>

                {activeInput === "dropoff" && dropoffGeocode.suggestions.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg shadow-md overflow-hidden">
                    {dropoffGeocode.suggestions.map((s) => (
                      <button key={s.id} onClick={() => handleSelectSuggestion(s, "dropoff")} className="w-full text-left px-4 py-3 hover:bg-muted/50 transition border-b border-border last:border-b-0 text-sm text-foreground">
                        {s.placeName}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              <Button onClick={handleGetPrice} disabled={isLoadingPrice || !pickupAddress.trim() || !dropoffAddress.trim()} className="w-full h-14 text-base font-semibold gap-2" size="lg">
                {isLoadingPrice ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />Calculating price…</>
                ) : (
                  <><DollarSign className="w-5 h-5" />Get Price</>
                )}
              </Button>
            </motion.div>
          )}

          {step === "pricing" && (
            <motion.div
              key="pricing"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-5"
            >
              {/* Route summary */}
              <div className="space-y-2 p-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <div className="w-0.5 h-8 bg-border" />
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Pickup</p>
                      <p className="text-sm font-medium text-foreground truncate">{pickupAddress}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Dropoff</p>
                      <p className="text-sm font-medium text-foreground truncate">{dropoffAddress}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price breakdown */}
              {pricing && (
                <div className="space-y-2 p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <Receipt className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Fare Breakdown</span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base fare</span>
                      <span className="text-foreground">{formatUSD(pricing.base_fare)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Distance charge</span>
                      <span className="text-foreground">{formatUSD(pricing.per_mile)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time charge</span>
                      <span className="text-foreground">{formatUSD(pricing.per_minute)}</span>
                    </div>
                    {pricing.airport_fee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Airport fee</span>
                        <span className="text-foreground">{formatUSD(pricing.airport_fee)}</span>
                      </div>
                    )}
                    {pricing.final_multiplier !== 1 && (
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Surge ({pricing.final_multiplier.toFixed(2)}×)</span>
                        <span>applied</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-3 border-t border-border font-bold text-lg">
                    <span className="text-foreground">Estimated Total</span>
                    <span className="text-primary">{formatUSD(pricing.total)}</span>
                  </div>

                  <p className="text-[10px] text-muted-foreground pt-1">
                    Final price may vary based on actual route, traffic, and wait time.
                  </p>
                </div>
              )}

              <Button onClick={handleConfirmPrice} disabled={isConfirming} className="w-full h-14 text-base font-semibold gap-2" size="lg">
                {isConfirming ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />Setting up payment…</>
                ) : (
                  <><CreditCard className="w-5 h-5" />Continue to Payment</>
                )}
              </Button>
            </motion.div>
          )}

          {step === "payment" && clientSecret && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-5"
            >
              {/* Compact route + price summary */}
              <div className="p-3 rounded-xl bg-muted/50 border border-border flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{pickupAddress}</p>
                  <p className="text-xs text-muted-foreground truncate">→ {dropoffAddress}</p>
                </div>
                {pricing && (
                  <span className="text-lg font-bold text-primary ml-3 shrink-0">
                    {formatUSD(pricing.total)}
                  </span>
                )}
              </div>

              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "night",
                    variables: {
                      colorPrimary: "hsl(142, 76%, 36%)",
                      borderRadius: "12px",
                    },
                  },
                }}
              >
                <PaymentForm
                  onSuccess={handlePaymentSuccess}
                  isProcessing={isProcessingPayment}
                  setIsProcessing={setIsProcessingPayment}
                  totalCents={pricing?.total ?? 0}
                />
              </Elements>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ZivoMobileNav />
    </div>
  );
}
