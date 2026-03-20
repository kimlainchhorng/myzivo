/**
 * Passenger Details Page — /flights/traveler-info
 * Premium traveler form with flight summary and sticky CTA
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Plane, Clock, ChevronRight, Shield, Mail, Phone, Calendar, Users } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { DuffelOffer } from "@/hooks/useDuffelFlights";

interface PassengerForm {
  title: string;
  given_name: string;
  family_name: string;
  gender: "m" | "f" | "";
  born_on: string;
  email: string;
  phone_number: string;
}

const emptyPassenger = (): PassengerForm => ({
  title: "mr",
  given_name: "",
  family_name: "",
  gender: "",
  born_on: "",
  email: "",
  phone_number: "",
});

/* ── Step indicator ────────────────────────── */
function StepIndicator() {
  const steps = ["Search", "Review", "Travelers", "Checkout"];
  const current = 2;
  return (
    <div className="flex items-center justify-center gap-1 mb-6">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
            i < current ? "bg-[hsl(var(--flights))]/10 text-[hsl(var(--flights))]" :
            i === current ? "bg-[hsl(var(--flights))] text-white shadow-md shadow-[hsl(var(--flights))]/25" :
            "bg-muted text-muted-foreground"
          }`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
              i < current ? "bg-[hsl(var(--flights))] text-white" :
              i === current ? "bg-white/20 text-white" :
              "bg-muted-foreground/20"
            }`}>{i + 1}</span>
            <span className="hidden sm:inline">{s}</span>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight className={`w-3 h-3 ${i < current ? "text-[hsl(var(--flights))]" : "text-muted-foreground/40"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Flight summary card ───────────────────── */
function FlightSummaryCard({ offer }: { offer: DuffelOffer }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="mb-6 overflow-hidden border-[hsl(var(--flights))]/15 shadow-sm">
        {/* Gradient top edge */}
        <div className="h-1 bg-gradient-to-r from-[hsl(var(--flights))] via-[hsl(var(--flights))]/60 to-[hsl(var(--flights))]" />
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[hsl(var(--flights))]/10 flex items-center justify-center">
                <Plane className="w-4 h-4 text-[hsl(var(--flights))]" />
              </div>
              <div>
                <p className="text-sm font-semibold">{offer.airline}</p>
                <p className="text-[11px] text-muted-foreground">{offer.departure.code} → {offer.arrival.code}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-[hsl(var(--flights))]">${Math.round(offer.price)}</p>
              <p className="text-[10px] text-muted-foreground">/person</p>
            </div>
          </div>

          {/* Time row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold tracking-tight">{offer.departure.time}</p>
              <p className="text-xs text-muted-foreground">{offer.departure.code}</p>
            </div>
            <div className="flex-1 mx-3 flex flex-col items-center">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                <Clock className="w-3 h-3" />
                {offer.duration}
              </div>
              <div className="w-full h-[2px] bg-gradient-to-r from-[hsl(var(--flights))] via-[hsl(var(--flights))]/30 to-[hsl(var(--flights))] relative rounded-full">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[hsl(var(--flights))] border border-card" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[hsl(var(--flights))] border border-card" />
              </div>
              <p className="text-[10px] text-[hsl(var(--flights))] font-medium mt-1">
                {offer.stops === 0 ? "Direct" : `${offer.stops} stop${offer.stops > 1 ? "s" : ""}`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold tracking-tight">{offer.arrival.time}</p>
              <p className="text-xs text-muted-foreground">{offer.arrival.code}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Passenger form card ───────────────────── */
function PassengerFormCard({
  passenger,
  index,
  type,
  onUpdate,
}: {
  passenger: PassengerForm;
  index: number;
  type: string;
  onUpdate: (field: keyof PassengerForm, value: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card className="overflow-hidden border-border/60 shadow-sm">
        {/* Card header with icon */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <div className="w-8 h-8 rounded-full bg-[hsl(var(--flights))]/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-[hsl(var(--flights))]" />
          </div>
          <div>
            <p className="text-sm font-semibold">Passenger {index + 1}</p>
            <p className="text-[11px] text-muted-foreground">({type})</p>
          </div>
        </div>

        <CardContent className="px-4 pb-4 pt-2 space-y-3">
          {/* Title + Gender row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Title</label>
              <Select value={passenger.title} onValueChange={(v) => onUpdate("title", v)}>
                <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-border/60">
                  <SelectValue placeholder="Title" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mr">Mr</SelectItem>
                  <SelectItem value="ms">Ms</SelectItem>
                  <SelectItem value="mrs">Mrs</SelectItem>
                  <SelectItem value="miss">Miss</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Gender</label>
              <Select value={passenger.gender} onValueChange={(v) => onUpdate("gender", v)}>
                <SelectTrigger className={`h-11 rounded-xl bg-muted/50 border-border/60 ${!passenger.gender ? "text-muted-foreground" : ""}`}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="m">Male</SelectItem>
                  <SelectItem value="f">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">First name</label>
              <Input
                placeholder="As on passport"
                value={passenger.given_name}
                onChange={(e) => onUpdate("given_name", e.target.value)}
                className="h-11 rounded-xl bg-muted/50 border-border/60"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Last name</label>
              <Input
                placeholder="As on passport"
                value={passenger.family_name}
                onChange={(e) => onUpdate("family_name", e.target.value)}
                className="h-11 rounded-xl bg-muted/50 border-border/60"
              />
            </div>
          </div>

          {/* Date of birth */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Date of Birth
            </label>
            <Input
              type="date"
              value={passenger.born_on}
              onChange={(e) => onUpdate("born_on", e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="h-11 rounded-xl bg-muted/50 border-border/60"
            />
          </div>

          {/* Contact row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                Email
              </label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={passenger.email}
                onChange={(e) => onUpdate("email", e.target.value)}
                className="h-11 rounded-xl bg-muted/50 border-border/60"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                Phone <span className="text-muted-foreground/60">(optional)</span>
              </label>
              <Input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={passenger.phone_number}
                onChange={(e) => onUpdate("phone_number", e.target.value)}
                className="h-11 rounded-xl bg-muted/50 border-border/60"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Main page ─────────────────────────────── */
const FlightTravelerInfo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const offerRaw = sessionStorage.getItem("zivo_selected_offer");
  const searchRaw = sessionStorage.getItem("zivo_search_params");
  const offer: DuffelOffer | null = offerRaw ? JSON.parse(offerRaw) : null;
  const search = searchRaw ? JSON.parse(searchRaw) : null;

  const totalPassengers = search ? (search.adults || 1) + (search.children || 0) + (search.infants || 0) : 1;

  const [passengers, setPassengers] = useState<PassengerForm[]>(() => {
    const saved = sessionStorage.getItem("zivo_passengers");
    if (saved) return JSON.parse(saved);
    const list = Array.from({ length: totalPassengers }, () => emptyPassenger());
    if (user?.email) list[0].email = user.email;
    return list;
  });

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
  };

  const validate = (): string | null => {
    const nameRegex = /^[a-zA-Z\s\-']{2,}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!nameRegex.test(p.given_name)) return `Passenger ${i + 1}: Enter a valid first name`;
      if (!nameRegex.test(p.family_name)) return `Passenger ${i + 1}: Enter a valid last name`;
      if (!p.gender) return `Passenger ${i + 1}: Select gender`;
      if (!p.born_on) return `Passenger ${i + 1}: Enter date of birth`;
      if (!emailRegex.test(p.email)) return `Passenger ${i + 1}: Enter a valid email`;
    }
    return null;
  };

  const handleContinue = () => {
    const err = validate();
    if (err) {
      toast({ title: "Missing Information", description: err, variant: "destructive" });
      return;
    }
    sessionStorage.setItem("zivo_passengers", JSON.stringify(passengers));
    navigate("/flights/checkout");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Traveler Details – ZIVO Flights" description="Enter passenger information for your flight booking." />
      <Header />

      <main className="pt-20 pb-32">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Back + Title */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4"
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

          {/* Step indicator */}
          <StepIndicator />

          {/* Flight summary */}
          <FlightSummaryCard offer={offer} />

          {/* Passenger Forms */}
          <div className="space-y-4">
            {passengers.map((p, idx) => (
              <PassengerFormCard
                key={idx}
                passenger={p}
                index={idx}
                type={getPassengerType(idx)}
                onUpdate={(field, value) => updatePassenger(idx, field, value)}
              />
            ))}
          </div>

          {/* Trust signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground"
          >
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure & encrypted</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span className="flex items-center gap-1"><User className="w-3 h-3" /> Data protected</span>
          </motion.div>
        </div>
      </main>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-card/80 backdrop-blur-2xl border-t border-[hsl(var(--flights))]/15 safe-area-bottom shadow-[0_-4px_20px_-4px_hsl(var(--flights)/0.1)]">
        <div className="container mx-auto px-4 max-w-2xl py-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-muted-foreground">Total price</p>
            <p className="text-xl font-bold text-[hsl(var(--flights))]">
              ${Math.round(offer.price * totalPassengers)}
            </p>
            <p className="text-[10px] text-muted-foreground">{totalPassengers} traveler{totalPassengers > 1 ? "s" : ""} · USD</p>
          </div>
          <motion.div whileTap={{ scale: 0.97 }}>
            <Button
              size="lg"
              onClick={handleContinue}
              className="h-12 px-8 text-base font-bold rounded-2xl bg-[hsl(var(--flights))] hover:bg-[hsl(var(--flights))]/90 text-white shadow-lg shadow-[hsl(var(--flights))]/25 gap-2"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FlightTravelerInfo;
