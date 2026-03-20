/**
 * Passenger Details Page — /flights/traveler-info
 * Premium traveler form with profile autofill, passport fields,
 * flight summary, round-trip display, and sticky CTA
 */

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, User, Plane, Clock, ChevronRight, Shield, Mail, Phone,
  Calendar, Users, Globe, CreditCard, CheckCircle2, Sparkles, Info, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AppLayout from "@/components/app/AppLayout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import type { DuffelOffer, DuffelSegment } from "@/hooks/useDuffelFlights";
import { AirlineLogo } from "@/components/flight/AirlineLogo";
import { FLIGHT_CONSENT, FLIGHT_DISCLAIMERS } from "@/config/flightCompliance";
import { cn } from "@/lib/utils";

interface PassengerForm {
  title: string;
  given_name: string;
  family_name: string;
  gender: "m" | "f" | "";
  born_on: string;
  email: string;
  phone_number: string;
  nationality: string;
  passport_number: string;
  passport_expiry: string;
}

const emptyPassenger = (): PassengerForm => ({
  title: "mr",
  given_name: "",
  family_name: "",
  gender: "",
  born_on: "",
  email: "",
  phone_number: "",
  nationality: "",
  passport_number: "",
  passport_expiry: "",
});

const POPULAR_NATIONALITIES = [
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "CA", label: "Canada" },
  { code: "AU", label: "Australia" },
  { code: "DE", label: "Germany" },
  { code: "FR", label: "France" },
  { code: "JP", label: "Japan" },
  { code: "KR", label: "South Korea" },
  { code: "IN", label: "India" },
  { code: "SG", label: "Singapore" },
  { code: "KH", label: "Cambodia" },
  { code: "TH", label: "Thailand" },
  { code: "VN", label: "Vietnam" },
  { code: "PH", label: "Philippines" },
  { code: "MY", label: "Malaysia" },
  { code: "CN", label: "China" },
  { code: "BR", label: "Brazil" },
  { code: "MX", label: "Mexico" },
  { code: "AE", label: "UAE" },
  { code: "QA", label: "Qatar" },
];

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

/* ── Compact flight summary ───────────────── */
function FlightSummaryCompact({ offer, search }: { offer: DuffelOffer; search: any }) {
  const isRoundTrip = !!search?.returnDate;
  const segments = offer.segments || [];

  // Split segments for round-trip
  const { outbound, returnSegs } = useMemo(() => {
    if (!isRoundTrip || segments.length === 0) return { outbound: segments, returnSegs: [] };
    const dest = (search.destination || offer.arrival?.code || "").toUpperCase();
    const splitIdx = segments.findIndex((seg: DuffelSegment, i: number) =>
      i > 0 && seg.origin.code.toUpperCase() === dest
    );
    if (splitIdx <= 0) return { outbound: segments, returnSegs: [] };
    return { outbound: segments.slice(0, splitIdx), returnSegs: segments.slice(splitIdx) };
  }, [segments, isRoundTrip, search?.destination, offer.arrival?.code]);

  const getSliceInfo = (segs: DuffelSegment[]) => {
    if (!segs.length) return null;
    const first = segs[0];
    const last = segs[segs.length - 1];
    const depTime = first.departingAt?.split("T")[1]?.slice(0, 5) || "—";
    const arrTime = last.arrivingAt?.split("T")[1]?.slice(0, 5) || "—";
    const startMs = new Date(first.departingAt).getTime();
    const endMs = new Date(last.arrivingAt).getTime();
    const totalMin = Math.round((endMs - startMs) / 60000);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return {
      depTime, arrTime,
      depCode: first.origin.code,
      arrCode: last.destination.code,
      duration: totalMin > 0 ? `${h}h ${m}m` : offer.duration,
      stops: segs.length - 1,
    };
  };

  const outInfo = getSliceInfo(outbound);
  const retInfo = returnSegs.length > 0 ? getSliceInfo(returnSegs) : null;

  const carrierCodes = offer.carriers?.length
    ? [...new Set(offer.carriers.map((c: any) => c.code))].slice(0, 2)
    : [offer.airlineCode];

  const renderLeg = (info: ReturnType<typeof getSliceInfo>, label: string) => {
    if (!info) return null;
    return (
      <div className="flex items-center gap-2">
        <div className="min-w-[40px]">
          <p className="text-sm font-bold tabular-nums leading-none">{info.depTime}</p>
          <p className="text-[9px] text-muted-foreground">{info.depCode}</p>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <span className="text-[8px] text-muted-foreground">{info.duration}</span>
          <div className="w-full h-[1.5px] bg-gradient-to-r from-[hsl(var(--flights))] via-border/40 to-[hsl(var(--flights))] relative my-0.5 rounded-full">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[hsl(var(--flights))]" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[hsl(var(--flights))]" />
          </div>
          <span className="text-[8px] text-muted-foreground">
            {info.stops === 0 ? "Direct" : `${info.stops} stop${info.stops > 1 ? "s" : ""}`}
          </span>
        </div>
        <div className="text-right min-w-[40px]">
          <p className="text-sm font-bold tabular-nums leading-none">{info.arrTime}</p>
          <p className="text-[9px] text-muted-foreground">{info.arrCode}</p>
        </div>
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="mb-4 overflow-hidden border-[hsl(var(--flights))]/15 shadow-sm">
        <div className="h-0.5 bg-gradient-to-r from-[hsl(var(--flights))] via-[hsl(var(--flights))]/60 to-[hsl(var(--flights))]" />
        <CardContent className="p-3">
          {/* Header row */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="relative shrink-0" style={{ width: carrierCodes.length > 1 ? 42 : 32, height: 32 }}>
                <AirlineLogo iataCode={carrierCodes[0]} airlineName={offer.airline} size={32} className="border border-border/20 shadow-sm" />
                {carrierCodes.length > 1 && (
                  <AirlineLogo iataCode={carrierCodes[1]} airlineName="" size={22} className="absolute bottom-0 right-0 border-2 border-card shadow-sm" />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold">{offer.airline}</p>
                <p className="text-[9px] text-muted-foreground">{offer.flightNumber}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-base font-bold text-[hsl(var(--flights))] tabular-nums">${Math.round(offer.price)}</p>
              <p className="text-[8px] text-muted-foreground">{isRoundTrip ? "round trip" : "one way"}</p>
            </div>
          </div>

          {/* Outbound leg */}
          {outInfo && (
            <div>
              {retInfo && <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Outbound</p>}
              {renderLeg(outInfo, "Outbound")}
            </div>
          )}

          {/* Return leg */}
          {retInfo && (
            <div className="mt-2 pt-2 border-t border-dashed border-border/30">
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Return</p>
              {renderLeg(retInfo, "Return")}
            </div>
          )}

          {/* Tags */}
          <div className="flex gap-1 mt-2.5 flex-wrap">
            <Badge variant="outline" className="text-[7px] h-4 px-1.5 capitalize border-border/20 bg-muted/20">
              {offer.cabinClass.replace("_", " ")}
            </Badge>
            {isRoundTrip && (
              <Badge variant="outline" className="text-[7px] h-4 px-1.5 border-[hsl(var(--flights))]/20 text-[hsl(var(--flights))] bg-[hsl(var(--flights))]/5">
                Round trip
              </Badge>
            )}
            {offer.baggageIncluded && (
              <Badge variant="outline" className="text-[7px] h-4 px-1.5 border-border/20 bg-muted/20">
                {offer.baggageIncluded}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ── Autofill banner ───────────────────────── */
function AutofillBanner({ onFill, filled }: { onFill: () => void; filled: boolean }) {
  if (filled) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-3 p-2.5 rounded-xl bg-[hsl(var(--flights))]/5 border border-[hsl(var(--flights))]/15 flex items-center gap-2.5"
    >
      <div className="w-7 h-7 rounded-lg bg-[hsl(var(--flights))]/10 flex items-center justify-center shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--flights))]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold">Autofill from profile</p>
        <p className="text-[9px] text-muted-foreground">Save time with your saved details</p>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={onFill}
        className="h-7 text-[10px] px-2.5 border-[hsl(var(--flights))]/30 text-[hsl(var(--flights))] hover:bg-[hsl(var(--flights))]/10"
      >
        Fill
      </Button>
    </motion.div>
  );
}

/* ── Passenger form card ───────────────────── */
function PassengerFormCard({
  passenger,
  index,
  type,
  errors,
  isInternational,
  onUpdate,
}: {
  passenger: PassengerForm;
  index: number;
  type: string;
  errors: Record<string, string>;
  isInternational: boolean;
  onUpdate: (field: keyof PassengerForm, value: string) => void;
}) {
  const fieldError = (field: string) => errors[`${index}.${field}`];

  const inputCn = (field: string) => cn(
    "h-10 rounded-xl bg-muted/40 border-border/50 text-[13px] transition-all",
    "focus:bg-background focus:border-[hsl(var(--flights))]/50 focus:ring-1 focus:ring-[hsl(var(--flights))]/20",
    fieldError(field) && "border-destructive/60 bg-destructive/5"
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
    >
      <Card className="overflow-hidden border-border/50 shadow-sm">
        {/* Card header */}
        <div className="flex items-center gap-2.5 px-3 pt-3 pb-1.5">
          <div className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold",
            "bg-[hsl(var(--flights))]/10 text-[hsl(var(--flights))]"
          )}>
            {index + 1}
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-semibold">Passenger {index + 1}</p>
            <p className="text-[10px] text-muted-foreground">{type}</p>
          </div>
          <Badge variant="outline" className="text-[8px] h-4 px-1.5 border-border/20">{type}</Badge>
        </div>

        <CardContent className="px-3 pb-3 pt-1 space-y-2.5">
          {/* Title + Gender */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Title</label>
              <Select value={passenger.title} onValueChange={(v) => onUpdate("title", v)}>
                <SelectTrigger className={inputCn("title")}>
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
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Gender</label>
              <Select value={passenger.gender} onValueChange={(v) => onUpdate("gender", v)}>
                <SelectTrigger className={cn(inputCn("gender"), !passenger.gender && "text-muted-foreground")}>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="m">Male</SelectItem>
                  <SelectItem value="f">Female</SelectItem>
                </SelectContent>
              </Select>
              {fieldError("gender") && <p className="text-[9px] text-destructive mt-0.5">{fieldError("gender")}</p>}
            </div>
          </div>

          {/* Name */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">First name</label>
              <Input
                placeholder="As on passport"
                value={passenger.given_name}
                onChange={(e) => onUpdate("given_name", e.target.value)}
                className={inputCn("given_name")}
                autoComplete="given-name"
              />
              {fieldError("given_name") && <p className="text-[9px] text-destructive mt-0.5">{fieldError("given_name")}</p>}
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Last name</label>
              <Input
                placeholder="As on passport"
                value={passenger.family_name}
                onChange={(e) => onUpdate("family_name", e.target.value)}
                className={inputCn("family_name")}
                autoComplete="family-name"
              />
              {fieldError("family_name") && <p className="text-[9px] text-destructive mt-0.5">{fieldError("family_name")}</p>}
            </div>
          </div>

          {/* Date of birth */}
          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5" />
              Date of Birth
            </label>
            <Input
              type="date"
              value={passenger.born_on}
              onChange={(e) => onUpdate("born_on", e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className={inputCn("born_on")}
            />
            {fieldError("born_on") && <p className="text-[9px] text-destructive mt-0.5">{fieldError("born_on")}</p>}
          </div>

          {/* Passport section — for international flights */}
          {isInternational && (
            <>
              <Separator className="bg-border/20 my-1" />
              <div className="flex items-center gap-1.5 mb-1">
                <Globe className="w-3 h-3 text-[hsl(var(--flights))]" />
                <span className="text-[10px] font-semibold text-[hsl(var(--flights))]">Travel document</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-muted-foreground/50 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="text-[10px] max-w-[200px]">
                      Required for international travel. Passport must be valid for at least 6 months from travel date.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Nationality</label>
                <Select value={passenger.nationality} onValueChange={(v) => onUpdate("nationality", v)}>
                  <SelectTrigger className={cn(inputCn("nationality"), !passenger.nationality && "text-muted-foreground")}>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {POPULAR_NATIONALITIES.map(n => (
                      <SelectItem key={n.code} value={n.code}>{n.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Passport number</label>
                  <Input
                    placeholder="AB1234567"
                    value={passenger.passport_number}
                    onChange={(e) => onUpdate("passport_number", e.target.value.toUpperCase())}
                    className={inputCn("passport_number")}
                    maxLength={20}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Expiry date</label>
                  <Input
                    type="date"
                    value={passenger.passport_expiry}
                    onChange={(e) => onUpdate("passport_expiry", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className={inputCn("passport_expiry")}
                  />
                </div>
              </div>
            </>
          )}

          {/* Contact (only first passenger) */}
          {index === 0 && (
            <>
              <Separator className="bg-border/20 my-1" />
              <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                <Mail className="w-2.5 h-2.5" />
                Contact details
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Email</label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={passenger.email}
                    onChange={(e) => onUpdate("email", e.target.value)}
                    className={inputCn("email")}
                    autoComplete="email"
                  />
                  {fieldError("email") && <p className="text-[9px] text-destructive mt-0.5">{fieldError("email")}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    Phone <span className="text-muted-foreground/50">(optional)</span>
                  </label>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={passenger.phone_number}
                    onChange={(e) => onUpdate("phone_number", e.target.value)}
                    className={inputCn("phone_number")}
                    autoComplete="tel"
                  />
                </div>
              </div>
            </>
          )}
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
  const isMobile = useIsMobile();

  const offerRaw = sessionStorage.getItem("zivo_selected_offer");
  const searchRaw = sessionStorage.getItem("zivo_search_params");
  const offer: DuffelOffer | null = offerRaw ? JSON.parse(offerRaw) : null;
  const search = searchRaw ? JSON.parse(searchRaw) : null;

  const totalPassengers = search ? (search.adults || 1) + (search.children || 0) + (search.infants || 0) : 1;
  const isRoundTrip = !!search?.returnDate;

  // Determine if international (different country codes)
  const isInternational = useMemo(() => {
    if (!search) return true;
    // If origin/destination are different countries, it's international
    // For now, if they're different IATA codes, assume international for passport fields
    return search.origin !== search.destination;
  }, [search]);

  const [passengers, setPassengers] = useState<PassengerForm[]>(() => {
    const saved = sessionStorage.getItem("zivo_passengers");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure all fields exist (migration from old format)
      return parsed.map((p: any) => ({ ...emptyPassenger(), ...p }));
    }
    const list = Array.from({ length: totalPassengers }, () => emptyPassenger());
    if (user?.email) list[0].email = user.email;
    return list;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autofilled, setAutofilled] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

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
    // Clear error for this field
    setErrors(prev => {
      const next = { ...prev };
      delete next[`${index}.${field}`];
      return next;
    });
  };

  const handleAutofill = () => {
    if (!user) return;
    const metadata = user.user_metadata || {};
    setPassengers(prev => {
      const copy = [...prev];
      copy[0] = {
        ...copy[0],
        email: user.email || copy[0].email,
        given_name: metadata.given_name || metadata.first_name || metadata.full_name?.split(" ")[0] || copy[0].given_name,
        family_name: metadata.family_name || metadata.last_name || metadata.full_name?.split(" ").slice(1).join(" ") || copy[0].family_name,
        phone_number: metadata.phone || user.phone || copy[0].phone_number,
      };
      return copy;
    });
    setAutofilled(true);
    toast({ title: "Profile applied", description: "Details filled from your profile." });
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
      // Contact only for first pax
      if (i === 0 && !emailRegex.test(p.email)) newErrors[`${i}.email`] = "Enter a valid email";
    }

    if (!consentChecked) {
      newErrors["consent"] = "Required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) {
      toast({ title: "Missing Information", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    // Copy contact info to all passengers from first
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
            className="bg-card/90 backdrop-blur-xl border-b border-border/30 shadow-sm p-2.5 -mx-0"
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

      {/* Autofill banner */}
      {user && <AutofillBanner onFill={handleAutofill} filled={autofilled} />}

      {/* Passenger Forms */}
      <div className="space-y-3">
        {passengers.map((p, idx) => (
          <PassengerFormCard
            key={idx}
            passenger={p}
            index={idx}
            type={getPassengerType(idx)}
            errors={errors}
            isInternational={isInternational}
            onUpdate={(field, value) => updatePassenger(idx, field, value)}
          />
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
