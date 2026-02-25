/**
 * App Rides Screen
 * MVP flow with payment: Request → Quote → Payment → Success
 */
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  MapPin, Car, Clock, Users, Shield, Star, CheckCircle2, Crown,
  ChevronRight, ArrowRight, Phone, Mail, User, CreditCard, Loader2
} from "lucide-react";
import AppLayout from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ServiceHero } from "@/components/shared/ServiceHero";
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
  { id: "standard", name: "Standard", icon: "standard", multiplier: 1.0, seats: 4, description: "Affordable everyday rides" },
  { id: "xl", name: "XL", icon: "xl", multiplier: 1.3, seats: 6, description: "Extra space for groups" },
  { id: "premium", name: "Premium", icon: "premium", multiplier: 1.6, seats: 4, description: "High-end vehicles" },
];

const rideIconMap: Record<string, { Icon: typeof Car; color: string }> = {
  standard: { Icon: Car, color: "text-sky-400" },
  xl: { Icon: Car, color: "text-emerald-400" },
  premium: { Icon: Crown, color: "text-amber-400" },
};

// Simple fare calculation (MVP)
const calculateFare = (distanceMiles: number, durationMinutes: number, multiplier: number) => {
  const baseFare = 3.50;
  const perMile = 1.75;
  const perMinute = 0.35;
  const bookingFee = 2.50;
  const minimumFare = 7.00;

  const fare = (baseFare + (distanceMiles * perMile) + (durationMinutes * perMinute)) * multiplier + bookingFee;
  return Math.max(fare, minimumFare);
};

const AppRides = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<RideStep>("request");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [selectedOption, setSelectedOption] = useState<RideOption | null>(null);
  const [contactInfo, setContactInfo] = useState({ name: "", phone: "", email: "", notes: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);

  // Estimated distance/duration - will be calculated via Maps API when route is set
  const [estimatedDistance] = useState(5.2);
  const [estimatedDuration] = useState(15);

  // Check for success return from Stripe
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
    if (pickup && dropoff) {
      setStep("options");
    }
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

      // Redirect to Stripe Checkout
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
    <AppLayout 
      title="Rides" 
      showBack={step !== "request" && step !== "success"} 
      onBack={() => {
        if (step === "options") setStep("request");
        else if (step === "confirm") setStep("options");
        else if (step === "processing") setStep("confirm");
      }}
    >
      {/* Hero Section - only show on request step */}
      {step === "request" && (
        <ServiceHero
          service="rides"
          title="Request a Ride"
          subtitle="Book your ride with trusted local drivers"
          icon={Car}
          image={heroRides}
          compact
        />
      )}

      <div className="p-4 space-y-4">
        {/* Step: Request */}
        {step === "request" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-rides rounded-full" />
                <Input
                  placeholder="Pickup location"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                />
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-eats rounded-full" />
                <Input
                  placeholder="Drop-off location"
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="h-40 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Map view coming soon</p>
              </div>
            </div>

            <Button
              onClick={handleFindRides}
              disabled={!pickup || !dropoff}
              className="w-full h-12 rounded-xl font-bold gap-2 bg-rides hover:bg-rides/90"
            >
              Get Quote
              <ArrowRight className="w-5 h-5" />
            </Button>

            <div className="grid grid-cols-3 gap-3 pt-4">
              {[
                { icon: CreditCard, label: "Secure Payment" },
                { icon: Shield, label: "Safe & Reliable" },
                { icon: Star, label: "Top Rated" },
              ].map((feature) => (
                <div key={feature.label} className="text-center p-3 rounded-xl bg-muted/30">
                  <feature.icon className="w-5 h-5 mx-auto mb-1 text-rides" />
                  <p className="text-[10px] text-muted-foreground">{feature.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step: Options */}
        {step === "options" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right duration-200">
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-rides rounded-full" />
                <span className="flex-1 truncate">{pickup}</span>
              </div>
              <div className="w-px h-3 bg-border ml-1 my-1" />
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-eats rounded-full" />
                <span className="flex-1 truncate">{dropoff}</span>
              </div>
              <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                <span>~{estimatedDistance} mi</span>
                <span>~{estimatedDuration} min</span>
              </div>
            </div>

            <h2 className="font-display font-bold text-lg">Choose your ride</h2>

            <div className="space-y-3">
              {rideOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option)}
                  className="w-full p-4 rounded-2xl bg-card border border-border/50 flex items-center gap-4 text-left touch-manipulation active:scale-[0.99] transition-transform hover:border-rides/30"
                >
                  <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                    {(() => { const cfg = rideIconMap[option.icon]; return cfg ? <cfg.Icon className={`w-7 h-7 ${cfg.color}`} /> : <Car className="w-7 h-7" />; })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{option.name}</h3>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" />{option.seats}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-rides">{getFareEstimate(option)}</p>
                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Confirm & Pay */}
        {step === "confirm" && selectedOption && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right duration-200">
            <div className="p-4 rounded-2xl bg-rides/5 border border-rides/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                  {(() => { const cfg = rideIconMap[selectedOption.icon]; return cfg ? <cfg.Icon className={`w-6 h-6 ${cfg.color}`} /> : <Car className="w-6 h-6" />; })()}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{selectedOption.name}</h3>
                  <p className="text-sm text-muted-foreground">{pickup} → {dropoff}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-rides">
                    ${calculateFare(estimatedDistance, estimatedDuration, selectedOption.multiplier).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">Est. total</p>
                </div>
              </div>
            </div>

            <h2 className="font-display font-bold text-lg">Contact Information</h2>

            <div className="space-y-3">
              <div>
                <Label htmlFor="name" className="text-sm">Full Name *</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={contactInfo.name}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="pl-9 h-11"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm">Phone Number *</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="pl-9 h-11"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-sm">Email (for receipt)</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-9 h-11"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requests..."
                  value={contactInfo.notes}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, notes: e.target.value }))}
                  className="mt-1 min-h-[80px]"
                />
              </div>
            </div>

            <Button
              onClick={handlePayment}
              disabled={!contactInfo.name || !contactInfo.phone || isSubmitting}
              className="w-full h-12 rounded-xl font-bold gap-2 bg-rides hover:bg-rides/90"
            >
              <CreditCard className="w-5 h-5" />
              Pay ${calculateFare(estimatedDistance, estimatedDuration, selectedOption.multiplier).toFixed(2)} & Request
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Secure payment via Stripe. We don't store your card details.
            </p>
          </div>
        )}

        {/* Step: Processing */}
        {step === "processing" && (
          <div className="py-20 text-center space-y-6 animate-in fade-in duration-200">
            <Loader2 className="w-12 h-12 mx-auto text-rides animate-spin" />
            <div>
              <h2 className="font-display text-xl font-bold mb-2">Redirecting to Payment...</h2>
              <p className="text-muted-foreground text-sm">
                Please wait while we set up your secure checkout.
              </p>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="py-12 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 mx-auto rounded-full bg-rides/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-rides" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold mb-2">Payment Received!</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Your ride request has been submitted. We'll confirm shortly.
              </p>
            </div>
            {requestId && (
              <div className="py-3 px-4 rounded-xl bg-muted/30 border border-border/50 inline-block">
                <p className="text-xs text-muted-foreground mb-1">Request ID</p>
                <p className="font-mono font-bold text-sm">{requestId.slice(0, 8).toUpperCase()}</p>
              </div>
            )}
            <div className="py-4 px-6 rounded-2xl bg-muted/30 border border-border/50 max-w-sm mx-auto text-left">
              <p className="text-sm text-muted-foreground mb-2">Status: <span className="text-rides font-semibold">Paid / Awaiting Match</span></p>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-rides rounded-full" />
                  We'll match you with a driver
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-rides rounded-full" />
                  You'll receive a confirmation call/text
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-rides rounded-full" />
                  Driver will pick you up at the scheduled time
                </li>
              </ul>
            </div>
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
    </AppLayout>
  );
};

export default AppRides;
