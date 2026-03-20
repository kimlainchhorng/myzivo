/**
 * Flight Search Page — /flights
 * 2026 Spatial UI: glassmorphism, decorative orbs, staggered animations
 */

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { Plane, ArrowLeftRight, Users, CalendarIcon, ChevronDown, Search, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import AirportAutocomplete from "@/components/flight/AirportAutocomplete";

type TripType = "roundtrip" | "oneway";

const FlightLanding = () => {
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

  const totalPassengers = adults + children + infants;

  const extractCode = (val: string): string => {
    const match = val.match(/\(([A-Z]{3})\)/);
    return match ? match[1] : val.trim().toUpperCase();
  };

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const [isSearching, setIsSearching] = useState(false);

  const originCode = extractCode(origin);
  const destCode = extractCode(destination);
  const sameAirport = originCode.length === 3 && destCode.length === 3 && originCode === destCode;

  const handleSearch = () => {
    if (sameAirport || !originCode || !destCode || !departureDate) return;
    setIsSearching(true);

    const params = new URLSearchParams({
      origin: originCode,
      destination: destCode,
      departureDate: format(departureDate, "yyyy-MM-dd"),
      adults: String(adults),
      children: String(children),
      infants: String(infants),
      cabinClass,
    });

    if (tripType === "roundtrip" && returnDate) {
      params.set("returnDate", format(returnDate, "yyyy-MM-dd"));
    }

    navigate(`/flights/results?${params.toString()}`);
  };

  const isValid = originCode.length === 3 && destCode.length === 3 && !sameAirport && !!departureDate;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <SEOHead
        title="Search Flights – ZIVO"
        description="Search and compare flights from 500+ airlines. Find the best deals on domestic and international flights."
      />

      {/* Decorative orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[hsl(var(--flights))]/8 blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <Header />

      <main className="pt-20 pb-20 relative z-10">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-3xl mx-auto text-center pt-4 sm:pt-8 pb-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="w-14 h-14 rounded-2xl bg-[hsl(var(--flights))]/10 backdrop-blur-xl border border-[hsl(var(--flights))]/20 flex items-center justify-center mx-auto mb-4"
            >
              <Plane className="w-7 h-7 text-[hsl(var(--flights))]" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1.5 tracking-tight">Search Flights</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Compare fares from 500+ airlines worldwide
            </p>
          </motion.div>

          {/* Search Card — Glassmorphic */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/40 shadow-xl shadow-[hsl(var(--flights))]/5 p-4 sm:p-6 space-y-4">
              {/* Trip Type Toggle */}
              <div className="flex gap-1.5 p-1 bg-muted/60 rounded-xl w-fit">
                {(["roundtrip", "oneway"] as TripType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => { setTripType(type); if (type === "oneway") setReturnDate(undefined); }}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      tripType === type
                        ? "bg-[hsl(var(--flights))] text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {type === "roundtrip" ? "Round Trip" : "One Way"}
                  </button>
                ))}
              </div>

              {/* Origin / Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
                <AirportAutocomplete
                  value={origin}
                  onChange={setOrigin}
                  label="From"
                  placeholder="City or airport"
                  excludeCode={extractCode(destination)}
                />
                <button
                  onClick={handleSwap}
                  className="self-end h-10 sm:h-11 w-10 sm:w-11 rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm flex items-center justify-center hover:bg-accent hover:border-[hsl(var(--flights))]/40 transition-all duration-200 mx-auto active:scale-95"
                  aria-label="Swap origin and destination"
                >
                  <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <AirportAutocomplete
                  value={destination}
                  onChange={setDestination}
                  label="To"
                  placeholder="City or airport"
                  excludeCode={extractCode(origin)}
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-muted-foreground mb-1 block font-medium uppercase tracking-wider">Departure</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-11 justify-start text-left font-normal bg-muted/40 border-border/40 hover:border-[hsl(var(--flights))]/40 transition-colors",
                          !departureDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="w-4 h-4 mr-2 text-[hsl(var(--flights))]" />
                        {departureDate ? format(departureDate, "EEE, MMM d") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={departureDate}
                        onSelect={setDepartureDate}
                        disabled={(d) => d < new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {tripType === "roundtrip" && (
                  <div>
                    <label className="text-[11px] text-muted-foreground mb-1 block font-medium uppercase tracking-wider">Return</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-11 justify-start text-left font-normal bg-muted/40 border-border/40 hover:border-[hsl(var(--flights))]/40 transition-colors",
                            !returnDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="w-4 h-4 mr-2 text-[hsl(var(--flights))]" />
                          {returnDate ? format(returnDate, "EEE, MMM d") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={returnDate}
                          onSelect={setReturnDate}
                          disabled={(d) => d < (departureDate || new Date())}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>

              {/* Passengers + Cabin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-muted-foreground mb-1 block font-medium uppercase tracking-wider">Passengers</label>
                  <Popover open={passengersOpen} onOpenChange={setPassengersOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-11 justify-between font-normal bg-muted/40 border-border/40 hover:border-[hsl(var(--flights))]/40"
                      >
                        <span className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[hsl(var(--flights))]" />
                          {totalPassengers} Traveler{totalPassengers > 1 ? "s" : ""}
                        </span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 pointer-events-auto" align="start">
                      <div className="space-y-4 p-1">
                        {[
                          { label: "Adults", sublabel: "12+ years", value: adults, setter: setAdults, min: 1, max: 9 },
                          { label: "Children", sublabel: "2–11 years", value: children, setter: setChildren, min: 0, max: 8 },
                          { label: "Infants", sublabel: "Under 2", value: infants, setter: setInfants, min: 0, max: adults },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{item.label}</p>
                              <p className="text-xs text-muted-foreground">{item.sublabel}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => item.setter(Math.max(item.min, item.value - 1))}
                                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-sm hover:bg-accent transition-colors disabled:opacity-40 active:scale-95"
                                disabled={item.value <= item.min}
                              >
                                −
                              </button>
                              <span className="w-6 text-center font-semibold tabular-nums">{item.value}</span>
                              <button
                                onClick={() => item.setter(Math.min(item.max, item.value + 1))}
                                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-sm hover:bg-accent transition-colors disabled:opacity-40 active:scale-95"
                                disabled={item.value >= item.max}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                        <Button size="sm" className="w-full mt-2" onClick={() => setPassengersOpen(false)}>
                          Done
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="text-[11px] text-muted-foreground mb-1 block font-medium uppercase tracking-wider">Cabin Class</label>
                  <Select value={cabinClass} onValueChange={setCabinClass}>
                    <SelectTrigger className="h-11 bg-muted/40 border-border/40 hover:border-[hsl(var(--flights))]/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economy">Economy</SelectItem>
                      <SelectItem value="premium_economy">Premium Economy</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="first">First Class</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Search Button */}
              <Button
                size="lg"
                onClick={handleSearch}
                disabled={!isValid}
                className="w-full h-12 text-base font-semibold gap-2 bg-[hsl(var(--flights))] hover:bg-[hsl(var(--flights))]/90 shadow-lg shadow-[hsl(var(--flights))]/20 active:scale-[0.98] transition-all duration-200"
              >
                <Search className="w-5 h-5" />
                Search Flights
              </Button>
            </div>
          </motion.div>

          {/* Trust strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="max-w-3xl mx-auto mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground"
          >
            <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> 500+ Airlines</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>Best Price Guarantee</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>Secure Booking</span>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FlightLanding;
