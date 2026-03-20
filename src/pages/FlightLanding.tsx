/**
 * Flight Search Page — /flights
 * Mobile: native app feel with AppLayout, no duplicate title, premium UX
 * Desktop: website layout with Header/Footer
 */

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import {
  Plane, ArrowLeftRight, Users, CalendarIcon, ChevronDown, Search,
  Sparkles, Loader2, Shield, Star, TrendingUp, ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AppLayout from "@/components/app/AppLayout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import AirportAutocomplete from "@/components/flight/AirportAutocomplete";
import { useIsMobile } from "@/hooks/use-mobile";

type TripType = "roundtrip" | "oneway";

/* ─── Popular Routes ─── */
const popularRoutes = [
  { from: "JFK", to: "MIA", label: "New York → Miami", price: "$89" },
  { from: "LAX", to: "SFO", label: "LA → San Francisco", price: "$59" },
  { from: "ORD", to: "ATL", label: "Chicago → Atlanta", price: "$75" },
  { from: "DFW", to: "DEN", label: "Dallas → Denver", price: "$68" },
  { from: "SEA", to: "LAS", label: "Seattle → Las Vegas", price: "$72" },
  { from: "BOS", to: "FLL", label: "Boston → Fort Lauderdale", price: "$95" },
];

/* ─── Shared Search Form ─── */
const useFlightSearch = () => {
  const navigate = useNavigate();
  const { fromCity, toCity } = useParams();

  const [tripType, setTripType] = useState<TripType>("roundtrip");
  const [origin, setOrigin] = useState(fromCity ? decodeURIComponent(fromCity) : "");
  const [destination, setDestination] = useState(toCity ? decodeURIComponent(toCity) : "");
  const [departureDate, setDepartureDate] = useState<Date | undefined>();
  const [returnDate, setReturnDate] = useState<Date | undefined>();
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabinClass, setCabinClass] = useState("economy");
  const [passengersOpen, setPassengersOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const totalPassengers = adults + children + infants;

  const extractCode = (val: string): string => {
    const match = val.match(/\(([A-Z]{3})\)/);
    return match ? match[1] : val.trim().toUpperCase();
  };

  const originCode = extractCode(origin);
  const destCode = extractCode(destination);
  const sameAirport = originCode.length === 3 && destCode.length === 3 && originCode === destCode;

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSearch = () => {
    if (sameAirport || !originCode || !destCode || !departureDate) return;
    setIsSearching(true);
    const params = new URLSearchParams({
      origin: originCode, destination: destCode,
      departureDate: format(departureDate, "yyyy-MM-dd"),
      adults: String(adults), children: String(children),
      infants: String(infants), cabinClass,
    });
    if (tripType === "roundtrip" && returnDate) {
      params.set("returnDate", format(returnDate, "yyyy-MM-dd"));
    }
    navigate(`/flights/results?${params.toString()}`);
  };

  const handleQuickRoute = (from: string, to: string) => {
    setOrigin(from);
    setDestination(to);
  };

  const isValid = originCode.length === 3 && destCode.length === 3 && !sameAirport && !!departureDate;

  return {
    tripType, setTripType, origin, setOrigin, destination, setDestination,
    departureDate, setDepartureDate, returnDate, setReturnDate,
    adults, setAdults, children, setChildren, infants, setInfants,
    cabinClass, setCabinClass, passengersOpen, setPassengersOpen,
    isSearching, totalPassengers, sameAirport, handleSwap, handleSearch,
    handleQuickRoute, isValid, extractCode,
  };
};

/* ─── Mobile Flight Search ─── */
const MobileFlightSearch = () => {
  const s = useFlightSearch();

  return (
    <div className="flex flex-col gap-5 px-4 pb-8 pt-1">
      {/* Search Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="bg-card/90 backdrop-blur-xl rounded-2xl border border-border/40 shadow-lg shadow-[hsl(var(--flights))]/5 p-4 space-y-4">
          {/* Trip Type Toggle */}
          <div className="flex gap-1 p-1 bg-muted/60 rounded-xl w-full">
            {(["roundtrip", "oneway"] as TripType[]).map((type) => (
              <button
                key={type}
                onClick={() => { s.setTripType(type); if (type === "oneway") s.setReturnDate(undefined); }}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 touch-manipulation active:scale-[0.97]",
                  s.tripType === type
                    ? "bg-[hsl(var(--flights))] text-primary-foreground shadow-sm"
                    : "text-muted-foreground"
                )}
              >
                {type === "roundtrip" ? "Round Trip" : "One Way"}
              </button>
            ))}
          </div>

          {/* Origin / Destination — stacked with swap */}
          <div className="relative space-y-2">
            <AirportAutocomplete
              value={s.origin}
              onChange={s.setOrigin}
              label="From"
              placeholder="City or airport"
              excludeCode={s.extractCode(s.destination)}
            />
            {/* Swap button overlapping between fields */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <button
                onClick={s.handleSwap}
                className="w-9 h-9 rounded-full border border-border/60 bg-card shadow-md flex items-center justify-center active:scale-90 transition-all touch-manipulation"
                aria-label="Swap"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            <AirportAutocomplete
              value={s.destination}
              onChange={s.setDestination}
              label="To"
              placeholder="City or airport"
              excludeCode={s.extractCode(s.origin)}
            />
          </div>

          {sameAirport && (
            <p className="text-[11px] text-destructive font-medium -mt-2 pl-0.5">
              Origin and destination cannot be the same.
            </p>
          )}

          {/* Dates — full-width touch targets */}
          <div className={cn("grid gap-2.5", s.tripType === "roundtrip" ? "grid-cols-2" : "grid-cols-1")}>
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block font-semibold uppercase tracking-wider">Departure</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-12 justify-start text-left text-sm font-normal bg-muted/30 border-border/40 rounded-xl touch-manipulation",
                      !s.departureDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="w-4 h-4 mr-2 text-[hsl(var(--flights))]" />
                    {s.departureDate ? format(s.departureDate, "MMM d") : "Select"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={s.departureDate} onSelect={s.setDepartureDate} disabled={(d) => d < new Date()} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            {s.tripType === "roundtrip" && (
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block font-semibold uppercase tracking-wider">Return</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-12 justify-start text-left text-sm font-normal bg-muted/30 border-border/40 rounded-xl touch-manipulation",
                        !s.returnDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="w-4 h-4 mr-2 text-[hsl(var(--flights))]" />
                      {s.returnDate ? format(s.returnDate, "MMM d") : "Select"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={s.returnDate} onSelect={s.setReturnDate} disabled={(d) => d < (s.departureDate || new Date())} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          {/* Passengers + Cabin */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block font-semibold uppercase tracking-wider">Travelers</label>
              <Popover open={s.passengersOpen} onOpenChange={s.setPassengersOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full h-12 justify-between text-sm font-normal bg-muted/30 border-border/40 rounded-xl touch-manipulation">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[hsl(var(--flights))]" />
                      {s.totalPassengers}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 pointer-events-auto" align="start">
                  <div className="space-y-3.5 p-1">
                    {[
                      { label: "Adults", sublabel: "12+ years", value: s.adults, setter: s.setAdults, min: 1, max: 9 },
                      { label: "Children", sublabel: "2–11 years", value: s.children, setter: s.setChildren, min: 0, max: 8 },
                      { label: "Infants", sublabel: "Under 2", value: s.infants, setter: s.setInfants, min: 0, max: s.adults },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-[11px] text-muted-foreground">{item.sublabel}</p>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button onClick={() => item.setter(Math.max(item.min, item.value - 1))} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-accent active:scale-90 disabled:opacity-40" disabled={item.value <= item.min}>−</button>
                          <span className="w-5 text-center font-semibold tabular-nums">{item.value}</span>
                          <button onClick={() => item.setter(Math.min(item.max, item.value + 1))} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-accent active:scale-90 disabled:opacity-40" disabled={item.value >= item.max}>+</button>
                        </div>
                      </div>
                    ))}
                    <Button size="sm" className="w-full mt-1" onClick={() => s.setPassengersOpen(false)}>Done</Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-1 block font-semibold uppercase tracking-wider">Cabin</label>
              <Select value={s.cabinClass} onValueChange={s.setCabinClass}>
                <SelectTrigger className="h-12 text-sm bg-muted/30 border-border/40 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="economy">Economy</SelectItem>
                  <SelectItem value="premium_economy">Premium Eco</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="first">First Class</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Button */}
          <Button
            size="lg"
            onClick={s.handleSearch}
            disabled={!s.isValid || s.isSearching}
            className={cn(
              "w-full h-14 text-base font-bold gap-2.5 rounded-xl shadow-lg active:scale-[0.97] transition-all duration-200 touch-manipulation",
              "bg-gradient-to-r from-[hsl(var(--flights))] to-[hsl(var(--flights))]/80",
              "shadow-[hsl(var(--flights))]/25",
              "disabled:opacity-50 disabled:shadow-none"
            )}
          >
            {s.isSearching ? (
              <><Loader2 className="w-5 h-5 animate-spin" />Searching...</>
            ) : (
              <><Search className="w-5 h-5" />Search Flights</>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Trust strip */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> 500+ Airlines</span>
        <span className="w-0.5 h-0.5 rounded-full bg-border" />
        <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure</span>
        <span className="w-0.5 h-0.5 rounded-full bg-border" />
        <span className="flex items-center gap-1"><Star className="w-3 h-3" /> Best Price</span>
      </motion.div>

      {/* Popular Routes */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.35 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-[hsl(var(--flights))]" />
          <h2 className="text-sm font-bold">Popular Routes</h2>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {popularRoutes.map((route) => (
            <button
              key={route.label}
              onClick={() => s.handleQuickRoute(route.from, route.to)}
              className="bg-card/80 backdrop-blur-sm border border-border/40 rounded-xl p-3 text-left active:scale-[0.97] transition-all touch-manipulation hover:border-[hsl(var(--flights))]/30"
            >
              <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
                <span>{route.from}</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <span>{route.to}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{route.label}</p>
              <p className="text-xs font-bold text-[hsl(var(--flights))] mt-1">from {route.price}</p>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

/* ─── Desktop Search Content (unchanged) ─── */
const DesktopFlightSearch = () => {
  const s = useFlightSearch();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="max-w-3xl mx-auto flex items-center gap-3.5 pt-2 sm:pt-4 pb-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="w-11 h-11 rounded-xl bg-[hsl(var(--flights))]/10 border border-[hsl(var(--flights))]/20 flex items-center justify-center shrink-0"
        >
          <Plane className="w-5.5 h-5.5 text-[hsl(var(--flights))]" />
        </motion.div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">Search Flights</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">500+ airlines · Best price guaranteed</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="max-w-3xl mx-auto"
      >
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/40 shadow-xl shadow-[hsl(var(--flights))]/5 p-4 sm:p-5 space-y-3.5">
          <div className="flex gap-1 p-0.5 bg-muted/50 rounded-lg w-fit">
            {(["roundtrip", "oneway"] as TripType[]).map((type) => (
              <button key={type} onClick={() => { s.setTripType(type); if (type === "oneway") s.setReturnDate(undefined); }}
                className={cn("px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-200", s.tripType === type ? "bg-[hsl(var(--flights))] text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                {type === "roundtrip" ? "Round Trip" : "One Way"}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2.5 items-end">
            <AirportAutocomplete value={s.origin} onChange={s.setOrigin} label="From" placeholder="City or airport" excludeCode={s.extractCode(s.destination)} />
            <button onClick={s.handleSwap} className="self-end h-10 w-10 rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm flex items-center justify-center hover:bg-accent transition-all mx-auto active:scale-90" aria-label="Swap">
              <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <AirportAutocomplete value={s.destination} onChange={s.setDestination} label="To" placeholder="City or airport" excludeCode={s.extractCode(s.origin)} />
          </div>
          {s.sameAirport && <p className="text-[11px] text-destructive font-medium -mt-1 pl-0.5">Origin and destination cannot be the same.</p>}
          <div className={cn("grid gap-2.5", s.tripType === "roundtrip" ? "grid-cols-2" : "grid-cols-1")}>
            <div>
              <label className="text-[10px] text-muted-foreground mb-0.5 block font-semibold uppercase tracking-wider">Departure</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full h-10 justify-start text-left text-sm font-normal bg-muted/30 border-border/40", !s.departureDate && "text-muted-foreground")}>
                    <CalendarIcon className="w-3.5 h-3.5 mr-2 text-[hsl(var(--flights))]" />{s.departureDate ? format(s.departureDate, "EEE, MMM d") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={s.departureDate} onSelect={s.setDepartureDate} disabled={(d) => d < new Date()} initialFocus className="p-3 pointer-events-auto" /></PopoverContent>
              </Popover>
            </div>
            {s.tripType === "roundtrip" && (
              <div>
                <label className="text-[10px] text-muted-foreground mb-0.5 block font-semibold uppercase tracking-wider">Return</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full h-10 justify-start text-left text-sm font-normal bg-muted/30 border-border/40", !s.returnDate && "text-muted-foreground")}>
                      <CalendarIcon className="w-3.5 h-3.5 mr-2 text-[hsl(var(--flights))]" />{s.returnDate ? format(s.returnDate, "EEE, MMM d") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={s.returnDate} onSelect={s.setReturnDate} disabled={(d) => d < (s.departureDate || new Date())} initialFocus className="p-3 pointer-events-auto" /></PopoverContent>
                </Popover>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[10px] text-muted-foreground mb-0.5 block font-semibold uppercase tracking-wider">Travelers</label>
              <Popover open={s.passengersOpen} onOpenChange={s.setPassengersOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full h-10 justify-between text-sm font-normal bg-muted/30 border-border/40">
                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[hsl(var(--flights))]" />{s.totalPassengers}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 pointer-events-auto" align="start">
                  <div className="space-y-3.5 p-1">
                    {[
                      { label: "Adults", sublabel: "12+ years", value: s.adults, setter: s.setAdults, min: 1, max: 9 },
                      { label: "Children", sublabel: "2–11 years", value: s.children, setter: s.setChildren, min: 0, max: 8 },
                      { label: "Infants", sublabel: "Under 2", value: s.infants, setter: s.setInfants, min: 0, max: s.adults },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div><p className="text-sm font-medium">{item.label}</p><p className="text-[11px] text-muted-foreground">{item.sublabel}</p></div>
                        <div className="flex items-center gap-2.5">
                          <button onClick={() => item.setter(Math.max(item.min, item.value - 1))} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-accent disabled:opacity-40 active:scale-90" disabled={item.value <= item.min}>−</button>
                          <span className="w-5 text-center font-semibold tabular-nums text-sm">{item.value}</span>
                          <button onClick={() => item.setter(Math.min(item.max, item.value + 1))} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-accent disabled:opacity-40 active:scale-90" disabled={item.value >= item.max}>+</button>
                        </div>
                      </div>
                    ))}
                    <Button size="sm" className="w-full mt-1" onClick={() => s.setPassengersOpen(false)}>Done</Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground mb-0.5 block font-semibold uppercase tracking-wider">Cabin</label>
              <Select value={s.cabinClass} onValueChange={s.setCabinClass}>
                <SelectTrigger className="h-10 text-sm bg-muted/30 border-border/40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="economy">Economy</SelectItem>
                  <SelectItem value="premium_economy">Premium Economy</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="first">First Class</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button size="lg" onClick={s.handleSearch} disabled={!s.isValid || s.isSearching}
            className={cn("w-full h-13 text-base font-bold gap-2.5 rounded-xl shadow-lg active:scale-[0.97] transition-all duration-200", "bg-gradient-to-r from-[hsl(var(--flights))] to-[hsl(var(--flights))]/80", "shadow-[hsl(var(--flights))]/25", "disabled:opacity-50 disabled:shadow-none")}>
            {s.isSearching ? <><Loader2 className="w-5 h-5 animate-spin" />Searching...</> : <><Search className="w-5 h-5" />Search Flights</>}
          </Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="max-w-3xl mx-auto mt-4 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> 500+ Airlines</span>
        <span className="w-0.5 h-0.5 rounded-full bg-border" />
        <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure</span>
        <span className="w-0.5 h-0.5 rounded-full bg-border" />
        <span className="flex items-center gap-1"><Star className="w-3 h-3" /> Best Price</span>
      </motion.div>
    </>
  );
};

/* ─── Main Component ─── */
const FlightLanding = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <>
        <SEOHead title="Search Flights – ZIVO" description="Search and compare flights from 500+ airlines." />
        <AppLayout title="Flights">
          <div className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[hsl(var(--flights))]/8 blur-3xl" />
              <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
            </div>
            <div className="relative z-10">
              <MobileFlightSearch />
            </div>
          </div>
        </AppLayout>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <SEOHead title="Search Flights – ZIVO" description="Search and compare flights from 500+ airlines. Find the best deals." />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[hsl(var(--flights))]/8 blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      </div>
      <Header />
      <main className="pt-16 pb-16 relative z-10">
        <div className="container mx-auto px-4"><DesktopFlightSearch /></div>
      </main>
      <Footer />
    </div>
  );
};

export default FlightLanding;
