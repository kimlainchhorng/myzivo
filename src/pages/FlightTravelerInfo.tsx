/**
 * Passenger Details Page — /flights/traveler-info
 * Premium traveler form with saved profile autofill, passport fields,
 * flight summary, round-trip display, and sticky CTA
 */

import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Plane, ChevronRight, Shield, Users, Lock, User,
  CreditCard, CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AppLayout from "@/components/app/AppLayout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import type { DuffelOffer } from "@/hooks/useDuffelFlights";
import { FLIGHT_CONSENT, FLIGHT_DISCLAIMERS } from "@/config/flightCompliance";
import { cn } from "@/lib/utils";

import { FlightSummaryCompact } from "@/components/flight/traveler/FlightSummaryCompact";
import {
  PassengerFormCard,
  emptyPassenger,
  type PassengerForm,
} from "@/components/flight/traveler/PassengerFormCard";
import {
  SavedTravelerPicker,
  profileToPassenger,
} from "@/components/flight/traveler/SavedTravelerPicker";
import type { TravelerProfile } from "@/hooks/useTravelerProfiles";

/* ── Step indicator ────────────────────────── */
function StepIndicator({ current = 2 }: { current?: number }) {
  const steps = [
    { label: "Search", icon: Plane },
    { label: "Review", icon: CheckCircle2 },
    { label: "Travelers", icon: Users },
    { label: "Checkout", icon: CreditCard },
  ];
  return (
    <div className="flex items-center justify-center gap-0.5 mb-5">
      {steps.map((s, i) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="flex items-center gap-0.5">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1.5 rounded-full text-[10px] font-semibold transition-all",
                i < current && "bg-[hsl(var(--flights))]/10 text-[hsl(var(--flights))]",
                i === current && "bg-[hsl(var(--flights))] text-primary-foreground shadow-md shadow-[hsl(var(--flights))]/25",
                i > current && "bg-muted/50 text-muted-foreground"
              )}
            >
              <Icon className="w-3 h-3" />
              <span className="hidden sm:inline">{s.label}</span>
            </motion.div>
            {i < steps.length - 1 && (
              <ChevronRight className={cn("w-3 h-3 shrink-0", i < current ? "text-[hsl(var(--flights))]" : "text-muted-foreground/30")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Main page ─────────────────────────────── */
const FlightTravelerInfo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const offerRaw = sessionStorage.getItem("zivo_selected_offer");
  const searchRaw = sessionStorage.getItem("zivo_search_params");
  const offer: DuffelOffer | null = offerRaw ? JSON.parse(offerRaw) : null;
  const search = searchRaw ? JSON.parse(searchRaw) : null;

  const totalPassengers = search ? (search.adults || 1) + (search.children || 0) + (search.infants || 0) : 1;
  const isRoundTrip = !!search?.returnDate;

  const isInternational = useMemo(() => {
    if (!search) return true;
    return search.origin !== search.destination;
  }, [search]);

  const [passengers, setPassengers] = useState<PassengerForm[]>(() => {
    const saved = sessionStorage.getItem("zivo_passengers");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((p: any) => ({ ...emptyPassenger(), ...p }));
    }
    const list = Array.from({ length: totalPassengers }, () => emptyPassenger());
    if (user?.email) list[0].email = user.email;
    return list;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consentChecked, setConsentChecked] = useState(false);
  const [selectedProfiles, setSelectedProfiles] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!offer) navigate("/flights", { replace: true });
  }, [offer, navigate]);

  if (!offer || !search) return null;

  const getPassengerType = (idx: number): string => {
    if (idx < (search.adults || 1)) return "Adult";
    if (idx < (search.adults || 1) + (search.children || 0)) return "Child";
    return "Infant";
  };

  const updatePassenger = (index: number, field: keyof PassengerForm, value: string) => {
    setPassengers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
    setErrors(prev => {
      const next = { ...prev };
      delete next[`${index}.${field}`];
      return next;
    });
  };

  const handleSelectProfile = (index: number, profile: TravelerProfile) => {
    const mapped = profileToPassenger(profile);
    setPassengers(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...mapped };
      return copy;
    });
    setSelectedProfiles(prev => ({ ...prev, [index]: profile.id }));
    toast({
      title: "Profile applied",
      description: `${profile.first_name} ${profile.last_name}'s details filled.`,
    });
  };

  const validate = (): boolean => {
    const nameRegex = /^[a-zA-Z\s\-']{2,}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const newErrors: Record<string, string> = {};

    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!nameRegex.test(p.given_name)) newErrors[`${i}.given_name`] = "Enter a valid first name";
      if (!nameRegex.test(p.family_name)) newErrors[`${i}.family_name`] = "Enter a valid last name";
      if (!p.gender) newErrors[`${i}.gender`] = "Required";
      if (!p.born_on) newErrors[`${i}.born_on`] = "Required";
      if (i === 0 && !emailRegex.test(p.email)) newErrors[`${i}.email`] = "Enter a valid email";
    }

    if (!consentChecked) newErrors["consent"] = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) {
      toast({ title: "Missing Information", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    const withContact = passengers.map((p, i) => ({
      ...p,
      email: i === 0 ? p.email : passengers[0].email,
      phone_number: i === 0 ? p.phone_number : passengers[0].phone_number,
    }));
    sessionStorage.setItem("zivo_passengers", JSON.stringify(withContact));
    navigate("/flights/checkout");
  };

  const pageContent = (
    <div className={cn("mx-auto px-3 sm:px-4", isMobile ? "max-w-lg pb-32" : "max-w-2xl pb-32")}>
      {/* Sticky header for mobile */}
      {isMobile && (
        <div className="sticky top-0 z-20 -mx-3 px-3 mb-3">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/90 backdrop-blur-xl border-b border-border/30 shadow-sm p-2.5"
          >
            <div className="flex items-center gap-2.5">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0 -ml-1 w-8 h-8">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold">Traveler Details</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {offer.departure.code} → {offer.arrival.code} · {totalPassengers} traveler{totalPassengers > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Desktop header */}
      {!isMobile && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-4 pt-4"
        >
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0 rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Traveler Details</h1>
            <p className="text-sm text-muted-foreground">
              {offer.departure.code} → {offer.arrival.code} · {offer.airline}
            </p>
          </div>
        </motion.div>
      )}

      {/* Step indicator */}
      <StepIndicator current={2} />

      {/* Flight summary */}
      <FlightSummaryCompact offer={offer} search={search} />

      {/* Passenger Forms with saved traveler pickers */}
      <div className="space-y-3">
        {passengers.map((p, idx) => (
          <div key={idx}>
            {/* Saved traveler picker per passenger */}
            {user && (
              <SavedTravelerPicker
                passengerIndex={idx}
                onSelect={(profile) => handleSelectProfile(idx, profile)}
                selectedProfileId={selectedProfiles[idx]}
              />
            )}
            <PassengerFormCard
              passenger={p}
              index={idx}
              type={getPassengerType(idx)}
              errors={errors}
              isInternational={isInternational}
              onUpdate={(field, value) => updatePassenger(idx, field, value)}
            />
          </div>
        ))}
      </div>

      {/* Consent + compliance */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 space-y-3"
      >
        {/* Consent checkbox */}
        <div className={cn(
          "flex items-start gap-2.5 p-3 rounded-xl border",
          errors.consent ? "border-destructive/40 bg-destructive/5" : "border-border/40 bg-muted/20"
        )}>
          <Checkbox
            id="consent"
            checked={consentChecked}
            onCheckedChange={(v) => {
              setConsentChecked(!!v);
              if (v) setErrors(prev => { const n = { ...prev }; delete n.consent; return n; });
            }}
            className="mt-0.5"
          />
          <label htmlFor="consent" className="text-[11px] text-muted-foreground leading-relaxed cursor-pointer">
            {FLIGHT_CONSENT.checkboxLabel}{" "}
            I agree to share my information with the travel partner to complete this booking.{" "}
            <Link to="/partner-disclosure" className="text-[hsl(var(--flights))] hover:underline">Learn more</Link>
          </label>
        </div>

        {/* Partner disclosure */}
        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[hsl(var(--flights))]/5 border border-[hsl(var(--flights))]/10">
          <Shield className="w-4 h-4 text-[hsl(var(--flights))] shrink-0 mt-0.5" />
          <div className="text-[10px] text-muted-foreground leading-relaxed">
            <p className="font-semibold text-foreground mb-0.5">Secure booking</p>
            <p>{FLIGHT_DISCLAIMERS.ticketing}</p>
          </div>
        </div>

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-3 text-[9px] text-muted-foreground/70">
          <span className="flex items-center gap-1"><Lock className="w-2.5 h-2.5" /> 256-bit encryption</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
          <span className="flex items-center gap-1"><Shield className="w-2.5 h-2.5" /> PCI compliant</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
          <span className="flex items-center gap-1"><User className="w-2.5 h-2.5" /> GDPR ready</span>
        </div>

        {/* Legal links */}
        <p className="text-[9px] text-center text-muted-foreground/60">
          By continuing, you agree to our{" "}
          <Link to="/terms" className="hover:underline">Terms</Link>,{" "}
          <Link to="/privacy" className="hover:underline">Privacy</Link>, and{" "}
          <Link to="/partner-disclosure" className="hover:underline">Partner Disclosure</Link>
        </p>
      </motion.div>
    </div>
  );

  /* Sticky bottom CTA */
  const stickyCTA = (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-card/80 backdrop-blur-2xl border-t border-[hsl(var(--flights))]/15 safe-area-bottom shadow-[0_-4px_20px_-4px_hsl(var(--flights)/0.1)]">
      <div className={cn("mx-auto px-4 py-2.5 flex items-center justify-between gap-3", isMobile ? "max-w-lg" : "max-w-2xl")}>
        <div>
          <p className="text-[9px] text-muted-foreground">Total</p>
          <p className="text-lg font-bold text-[hsl(var(--flights))] tabular-nums leading-tight">
            ${Math.round(offer.price * totalPassengers).toLocaleString()}
          </p>
          <p className="text-[9px] text-muted-foreground">
            {totalPassengers} traveler{totalPassengers > 1 ? "s" : ""} · {offer.currency || "USD"}
          </p>
        </div>
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button
            size="lg"
            onClick={handleContinue}
            className="h-11 px-6 text-sm font-bold rounded-2xl bg-[hsl(var(--flights))] hover:bg-[hsl(var(--flights))]/90 text-primary-foreground shadow-lg shadow-[hsl(var(--flights))]/25 gap-1.5"
          >
            Continue to Checkout
            <ChevronRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <SEOHead title="Traveler Details – ZIVO Flights" description="Enter passenger information for your flight booking." />
        <AppLayout hideHeader hideNav>
          <div className="relative overflow-hidden min-h-[100dvh]">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 right-0 w-60 h-60 rounded-full bg-[hsl(var(--flights))]/5 blur-3xl" />
            </div>
            <div className="relative z-10">
              {pageContent}
            </div>
          </div>
        </AppLayout>
        {stickyCTA}
      </>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background relative overflow-hidden flex flex-col">
      <SEOHead title="Traveler Details – ZIVO Flights" description="Enter passenger information for your flight booking." />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 right-0 w-72 h-72 rounded-full bg-[hsl(var(--flights))]/5 blur-3xl" />
      </div>
      <Header />
      <main className="flex-1 pt-16 pb-8 relative z-10">
        {pageContent}
      </main>
      {stickyCTA}
      <Footer />
    </div>
  );
};

export default FlightTravelerInfo;
