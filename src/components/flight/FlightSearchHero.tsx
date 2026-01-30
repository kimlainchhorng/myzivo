import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plane,
  Search,
  CalendarIcon,
  Users,
  ArrowLeftRight,
  Shield,
  Star,
  Clock,
  Sparkles,
  Globe,
  CalendarDays,
  Loader2,
  TrendingUp,
  TrendingDown,
  Zap,
  Award,
  RefreshCw,
  MapPin,
  Flame,
  ChevronDown,
  ChevronUp,
  Filter,
  Minus,
  Plus,
  Baby,
  User,
} from "lucide-react";
import { format } from "date-fns";
import AirportAutocomplete from "./AirportAutocomplete";
import PriceCalendar from "./PriceCalendar";
import flightHeroImage from "@/assets/flight-hero.jpg";
import { cn } from "@/lib/utils";

interface FlightSearchHeroProps {
  tripType: "roundtrip" | "oneway";
  setTripType: (type: "roundtrip" | "oneway") => void;
  fromCity: string;
  setFromCity: (city: string) => void;
  toCity: string;
  setToCity: (city: string) => void;
  departDate?: Date;
  setDepartDate: (date: Date | undefined) => void;
  returnDate?: Date;
  setReturnDate: (date: Date | undefined) => void;
  passengers: string;
  setPassengers: (passengers: string) => void;
  cabinClass: string;
  setCabinClass: (cabin: string) => void;
  onSearch: () => void;
  isSearching: boolean;
  recentSearches: string[];
}

export default function FlightSearchHero({
  tripType,
  setTripType,
  fromCity,
  setFromCity,
  toCity,
  setToCity,
  departDate,
  setDepartDate,
  returnDate,
  setReturnDate,
  passengers,
  setPassengers,
  cabinClass,
  setCabinClass,
  onSearch,
  isSearching,
  recentSearches,
}: FlightSearchHeroProps) {
  const [showPriceCalendar, setShowPriceCalendar] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [directOnly, setDirectOnly] = useState(false);
  const [flexibleDates, setFlexibleDates] = useState(false);
  const [nearbyAirports, setNearbyAirports] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  // Extract airport codes
  const fromMatch = fromCity.match(/\(([A-Z]{3})\)/);
  const toMatch = toCity.match(/\(([A-Z]{3})\)/);
  const fromCode = fromMatch ? fromMatch[1] : "LAX";
  const toCode = toMatch ? toMatch[1] : "JFK";

  const totalPassengers = adults + children + infants;

  const swapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  const updatePassengers = () => {
    setPassengers(String(totalPassengers));
  };

  const trustBadges = [
    { icon: Shield, text: "Free Cancellation", color: "text-emerald-500" },
    { icon: Award, text: "Best Price Guarantee", color: "text-amber-500" },
    { icon: Clock, text: "24/7 Support", color: "text-sky-500" },
    { icon: Zap, text: "Instant Confirmation", color: "text-purple-500" },
  ];

  const quickDestinations = [
    { city: "New York", code: "JFK", price: 299, oldPrice: 349, trend: -14, hot: true },
    { city: "London", code: "LHR", price: 449, oldPrice: 510, trend: -12, hot: false },
    { city: "Tokyo", code: "NRT", price: 699, oldPrice: 759, trend: -8, hot: true },
    { city: "Paris", code: "CDG", price: 399, oldPrice: 389, trend: +3, hot: false },
    { city: "Dubai", code: "DXB", price: 549, oldPrice: 620, trend: -11, hot: true },
    { city: "Singapore", code: "SIN", price: 629, oldPrice: 699, trend: -10, hot: false },
  ];

  return (
    <section className="relative min-h-[80vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={flightHeroImage}
          alt="Airplane window view at sunset"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-transparent to-background/70" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[10%] w-48 h-48 bg-sky-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-32 right-[15%] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Floating Decorative Elements - Smaller */}
      <div className="absolute top-20 right-10 hidden lg:block animate-float">
        <div className="w-11 h-11 rounded-xl bg-sky-500/20 backdrop-blur-xl border border-sky-500/30 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <Plane className="w-5 h-5 text-sky-400" />
        </div>
      </div>
      <div
        className="absolute top-36 right-28 hidden lg:block animate-float"
        style={{ animationDelay: "0.5s" }}
      >
        <div className="w-9 h-9 rounded-lg bg-blue-500/20 backdrop-blur-xl border border-blue-500/30 flex items-center justify-center">
          <Globe className="w-4 h-4 text-blue-400" />
        </div>
      </div>
      <div
        className="absolute bottom-32 left-10 hidden lg:block animate-float"
        style={{ animationDelay: "0.8s" }}
      >
        <div className="w-10 h-10 rounded-lg bg-amber-500/20 backdrop-blur-xl border border-amber-500/30 flex items-center justify-center">
          <Star className="w-5 h-5 text-amber-400" />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-14 pb-10">
        <div className="text-center mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Live Indicator */}
          <div className="flex justify-center mb-3">
            <Badge className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1.5 text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Prices from 500+ Airlines
            </Badge>
          </div>
          
          <Badge className="mb-4 px-4 py-2 bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 text-white border-0 shadow-lg shadow-sky-500/40 text-xs">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            ZIVO Flights — Premium Air Travel
          </Badge>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            Your journey to
            <br />
            <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
              anywhere starts here
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-5">
            Compare prices from 500+ airlines worldwide with exclusive deals.
          </p>

          {/* Trust Badges - Compact */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {trustBadges.map((item, index) => (
              <div
                key={item.text}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-card/60 backdrop-blur-xl border border-border/50 hover:border-sky-500/40 transition-all duration-300 animate-in fade-in group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <item.icon className={cn("w-3.5 h-3.5 transition-transform group-hover:scale-110", item.color)} />
                <span className="text-xs font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Search Card - Compact */}
        <div
          className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700"
          style={{ animationDelay: "0.2s" }}
        >
          <Card className="overflow-hidden border-0 bg-transparent shadow-none relative">
            {/* Premium glow effect */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-sky-500/25 via-blue-600/15 to-cyan-500/25 rounded-2xl blur-xl opacity-50" />
            
            {/* Card content wrapper */}
            <div className="relative bg-gradient-to-br from-card via-card to-card/95 rounded-xl overflow-hidden border border-border/40 shadow-2xl shadow-black/50 ring-1 ring-white/10">
              {/* Top accent line */}
              <div className="h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-400 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-shimmer" />
              </div>
              
              <CardContent className="p-4 sm:p-5 lg:p-6">
                {/* Trip Type Toggle - Compact */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {[
                    { type: "roundtrip" as const, label: "Round Trip", icon: RefreshCw },
                    { type: "oneway" as const, label: "One Way", icon: Plane },
                  ].map((item) => (
                    <button
                      key={item.type}
                      onClick={() => setTripType(item.type)}
                      className={cn(
                        "px-4 py-2.5 rounded-lg font-semibold text-xs transition-all duration-300 flex items-center gap-2 relative overflow-hidden",
                        tripType === item.type
                          ? "bg-gradient-to-r from-sky-500 via-blue-600 to-sky-600 text-white shadow-md shadow-sky-500/30 scale-[1.02] ring-1 ring-sky-400/30"
                          : "bg-muted/80 text-foreground/70 hover:bg-muted hover:text-foreground border border-border/60 hover:border-sky-500/40"
                      )}
                    >
                      {tripType === item.type && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-shimmer" />
                      )}
                      <item.icon className={cn("w-3.5 h-3.5", tripType === item.type && "drop-shadow-sm")} />
                      <span className="relative">{item.label}</span>
                    </button>
                  ))}
                  <button
                    className="px-4 py-2.5 rounded-lg font-semibold text-xs bg-muted/80 text-foreground/70 hover:bg-muted hover:text-foreground transition-all duration-300 flex items-center gap-2 border border-border/60 hover:border-sky-500/40"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Multi-City
                  </button>
                </div>

                {/* Search Fields - Compact 2x2 Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 relative">
                  {/* Left Column: From + Departure */}
                  <div className="space-y-3">
                    {/* From Field */}
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-sky-500/30 to-blue-500/30 rounded-xl opacity-0 group-focus-within:opacity-100 transition-all duration-500 blur-lg" />
                      <div className="relative bg-muted/50 rounded-lg p-0.5 border border-border/40 group-focus-within:border-sky-500/50 transition-colors">
                        <AirportAutocomplete
                          value={fromCity}
                          onChange={setFromCity}
                          label="From"
                          placeholder="Departure city or airport"
                          recentSearches={recentSearches}
                          excludeCode={toCode}
                        />
                      </div>
                    </div>

                    {/* Departure Date - Compact */}
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-sky-500/20 to-blue-500/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-all duration-500 blur-lg" />
                      <div className="relative">
                        <label className="text-xs font-bold text-foreground mb-2 flex items-center gap-2">
                          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-sky-500/20 to-blue-500/20 flex items-center justify-center border border-sky-500/20">
                            <CalendarIcon className="w-2.5 h-2.5 text-sky-400" />
                          </div>
                          Departure
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full h-12 justify-start bg-muted/60 hover:bg-muted border border-border/50 hover:border-sky-500/50 transition-all duration-300 rounded-lg text-sm font-medium group shadow-sm",
                                !departDate && "text-muted-foreground"
                              )}
                            >
                              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500/20 to-blue-500/15 flex items-center justify-center mr-3 group-hover:from-sky-500/30 group-hover:to-blue-500/25 transition-all border border-sky-500/20">
                                <CalendarIcon className="h-4 w-4 text-sky-500" />
                              </div>
                              <div className="text-left flex-1">
                                {departDate ? (
                                  <>
                                    <span className="block font-bold text-foreground">{format(departDate, "EEE, MMM d")}</span>
                                    <span className="block text-[10px] text-muted-foreground">{format(departDate, "yyyy")}</span>
                                  </>
                                ) : (
                                  <span className="text-muted-foreground text-sm">Select date</span>
                                )}
                              </div>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-card border border-border/50 shadow-2xl rounded-lg" align="start">
                            <Calendar
                              mode="single"
                              selected={departDate}
                              onSelect={setDepartDate}
                              initialFocus
                              className="p-2 pointer-events-auto"
                              disabled={(date) => date < new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>

                  {/* Swap Button - Center */}
                  <button
                    onClick={swapCities}
                    className="hidden md:flex absolute left-1/2 top-[40px] -translate-x-1/2 w-10 h-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 via-blue-600 to-cyan-600 text-white hover:from-sky-400 hover:via-blue-500 hover:to-cyan-500 transition-all z-20 shadow-lg shadow-sky-500/40 hover:shadow-xl hover:scale-110 active:scale-95 border-2 border-white/30 ring-2 ring-background"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>

                  {/* Right Column: To + Return */}
                  <div className="space-y-3">
                    {/* To Field */}
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-xl opacity-0 group-focus-within:opacity-100 transition-all duration-500 blur-lg" />
                      <div className="relative bg-muted/50 rounded-lg p-0.5 border border-border/40 group-focus-within:border-cyan-500/50 transition-colors">
                        <AirportAutocomplete
                          value={toCity}
                          onChange={setToCity}
                          label="To"
                          placeholder="Arrival city or airport"
                          recentSearches={recentSearches}
                          excludeCode={fromCode}
                        />
                      </div>
                    </div>

                    {/* Return Date - Compact */}
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-all duration-500 blur-lg" />
                      <div className="relative">
                        <label className="text-xs font-bold text-foreground mb-2 flex items-center gap-2">
                          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/20">
                            <CalendarIcon className="w-2.5 h-2.5 text-cyan-400" />
                          </div>
                          {tripType === "roundtrip" ? "Return" : "One Way"}
                        </label>
                        {tripType === "roundtrip" ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full h-12 justify-start bg-muted/60 hover:bg-muted border border-border/50 hover:border-cyan-500/50 transition-all duration-300 rounded-lg text-sm font-medium group shadow-sm",
                                  !returnDate && "text-muted-foreground"
                                )}
                              >
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/15 flex items-center justify-center mr-3 group-hover:from-cyan-500/30 group-hover:to-blue-500/25 transition-all border border-cyan-500/20">
                                  <CalendarIcon className="h-4 w-4 text-cyan-500" />
                                </div>
                                <div className="text-left flex-1">
                                  {returnDate ? (
                                    <>
                                      <span className="block font-bold text-foreground">{format(returnDate, "EEE, MMM d")}</span>
                                      <span className="block text-[10px] text-muted-foreground">{format(returnDate, "yyyy")}</span>
                                    </>
                                  ) : (
                                    <span className="text-muted-foreground text-sm">Select date</span>
                                  )}
                                </div>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-card border border-border/50 shadow-2xl rounded-lg" align="start">
                              <Calendar
                                mode="single"
                                selected={returnDate}
                                onSelect={setReturnDate}
                                initialFocus
                                className="p-2 pointer-events-auto"
                                disabled={(date) => date < (departDate || new Date())}
                              />
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <div className="h-12 rounded-lg bg-gradient-to-br from-muted/40 to-muted/20 border border-dashed border-border/60 flex items-center justify-center text-muted-foreground text-xs gap-2">
                            <Plane className="w-4 h-4 -rotate-45 text-muted-foreground/70" />
                            <span className="font-medium">No return needed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Passengers, Class & Search - Compact Row */}
                <div className="flex flex-wrap gap-3 items-end mb-6">
                  {/* Passengers Dropdown - Compact */}
                  <div className="flex-1 min-w-[160px]">
                    <label className="text-xs font-bold text-foreground mb-2 flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-gradient-to-br from-sky-500/20 to-blue-500/20 flex items-center justify-center border border-sky-500/20">
                        <Users className="w-2.5 h-2.5 text-sky-400" />
                      </div>
                      Travelers
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full h-12 justify-between bg-muted/60 hover:bg-muted border border-border/50 hover:border-sky-500/50 rounded-lg text-sm font-medium shadow-sm transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500/20 to-blue-500/15 flex items-center justify-center border border-sky-500/20">
                              <Users className="w-4 h-4 text-sky-500" />
                            </div>
                            <div className="text-left">
                              <span className="font-bold text-foreground block">{totalPassengers}</span>
                              <span className="text-[10px] text-muted-foreground">Traveler{totalPassengers > 1 ? "s" : ""}</span>
                            </div>
                          </div>
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-4 bg-card border border-border/50 shadow-2xl rounded-lg" align="start">
                        <div className="space-y-3">
                          <h4 className="font-bold text-sm text-foreground flex items-center gap-2 mb-3">
                            <Users className="w-4 h-4 text-sky-500" />
                            Select Travelers
                          </h4>
                          {/* Adults */}
                          <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-br from-muted/60 to-muted/40 border border-border/30">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500/25 to-blue-500/25 flex items-center justify-center border border-sky-500/30">
                                <User className="w-4 h-4 text-sky-500" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-foreground">Adults</p>
                                <p className="text-[10px] text-muted-foreground">12+ years</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-lg border-border hover:border-sky-500/50"
                                onClick={() => setAdults(Math.max(1, adults - 1))}
                                disabled={adults <= 1}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center font-bold text-sm">{adults}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-lg border-border hover:border-sky-500/50"
                                onClick={() => setAdults(Math.min(9, adults + 1))}
                                disabled={adults >= 9}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Children */}
                          <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-br from-muted/60 to-muted/40 border border-border/30">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/25 to-orange-500/25 flex items-center justify-center border border-amber-500/30">
                                <User className="w-4 h-4 text-amber-500" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-foreground">Children</p>
                                <p className="text-[10px] text-muted-foreground">2-11 years</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-lg border-border hover:border-amber-500/50"
                                onClick={() => setChildren(Math.max(0, children - 1))}
                                disabled={children <= 0}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center font-bold text-sm">{children}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-lg border-border hover:border-amber-500/50"
                                onClick={() => setChildren(Math.min(6, children + 1))}
                                disabled={children >= 6}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Infants */}
                          <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-br from-muted/60 to-muted/40 border border-border/30">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500/25 to-rose-500/25 flex items-center justify-center border border-pink-500/30">
                                <Baby className="w-4 h-4 text-pink-500" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-foreground">Infants</p>
                                <p className="text-[10px] text-muted-foreground">Under 2</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-lg border-border hover:border-pink-500/50"
                                onClick={() => setInfants(Math.max(0, infants - 1))}
                                disabled={infants <= 0}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center font-bold text-sm">{infants}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-lg border-border hover:border-pink-500/50"
                                onClick={() => setInfants(Math.min(adults, infants + 1))}
                                disabled={infants >= adults}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          <Button
                            className="w-full h-10 mt-2 bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 hover:from-sky-600 hover:via-blue-700 hover:to-cyan-600 font-semibold text-sm rounded-lg shadow-md shadow-sky-500/30"
                            onClick={updatePassengers}
                          >
                            Confirm
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Cabin Class - Compact */}
                  <div className="flex-1 min-w-[140px]">
                    <label className="text-xs font-bold text-foreground mb-2 flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center border border-amber-500/20">
                        <Star className="w-2.5 h-2.5 text-amber-400" />
                      </div>
                      Class
                    </label>
                    <Select value={cabinClass} onValueChange={setCabinClass}>
                      <SelectTrigger className="h-12 bg-muted/60 hover:bg-muted border border-border/50 hover:border-sky-500/50 rounded-lg text-sm font-medium shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border border-border/50 shadow-2xl rounded-lg">
                        <SelectItem value="economy" className="py-2.5 rounded-md">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">Economy</span>
                            <Badge className="text-[9px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-semibold">Popular</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="premium" className="py-2.5 rounded-md">
                          <span className="font-semibold text-sm">Premium</span>
                        </SelectItem>
                        <SelectItem value="business" className="py-2.5 rounded-md">
                          <span className="font-semibold text-sm">Business</span>
                        </SelectItem>
                        <SelectItem value="first" className="py-2.5 rounded-md">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">First</span>
                            <Badge className="text-[9px] px-2 py-0.5 bg-amber-500/20 text-amber-400 border-amber-500/30 font-semibold">Luxury</Badge>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Search Button - Compact Premium */}
                  <Button
                    onClick={onSearch}
                    disabled={isSearching}
                    className="h-12 px-8 bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 hover:from-sky-600 hover:via-blue-700 hover:to-cyan-600 text-white font-bold text-sm shadow-lg shadow-sky-500/40 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] rounded-lg relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    {isSearching ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    <span className="relative">{isSearching ? "Searching..." : "Search"}</span>
                  </Button>
                </div>

                {/* Advanced Options Toggle - Compact */}
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-sky-400 transition-colors mb-4 group"
                >
                  <div className="w-6 h-6 rounded-md bg-muted group-hover:bg-sky-500/15 flex items-center justify-center transition-colors">
                    <Filter className="w-3 h-3 group-hover:text-sky-400 transition-colors" />
                  </div>
                  Advanced Options
                  {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {/* Advanced Options Panel - Compact */}
                {showAdvanced && (
                  <div className="p-3 rounded-lg bg-muted/40 border border-border/50 mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2.5 cursor-pointer group">
                        <Switch
                          checked={directOnly}
                          onCheckedChange={setDirectOnly}
                          className="data-[state=checked]:bg-sky-500 scale-90"
                        />
                        <div>
                          <p className="text-xs font-semibold group-hover:text-sky-400 transition-colors">Direct only</p>
                          <p className="text-[10px] text-muted-foreground">No layovers</p>
                        </div>
                      </label>
                      
                      <label className="flex items-center gap-2.5 cursor-pointer group">
                        <Switch
                          checked={flexibleDates}
                          onCheckedChange={setFlexibleDates}
                          className="data-[state=checked]:bg-sky-500 scale-90"
                        />
                        <div>
                          <p className="text-xs font-semibold group-hover:text-sky-400 transition-colors">Flexible dates</p>
                          <p className="text-[10px] text-muted-foreground">±3 days</p>
                        </div>
                      </label>
                      
                      <label className="flex items-center gap-2.5 cursor-pointer group">
                        <Switch
                          checked={nearbyAirports}
                          onCheckedChange={setNearbyAirports}
                          className="data-[state=checked]:bg-sky-500 scale-90"
                        />
                        <div>
                          <p className="text-xs font-semibold group-hover:text-sky-400 transition-colors">Nearby airports</p>
                          <p className="text-[10px] text-muted-foreground">100 mi radius</p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Quick Destinations - Compact */}
                <div className="pt-4 border-t border-border/40">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-foreground flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-emerald-500/15 flex items-center justify-center">
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                      </div>
                      Trending destinations
                    </span>
                    <Badge className="px-2 py-1 bg-sky-500/15 text-sky-400 border-sky-500/30 font-semibold text-[10px]">
                      <Zap className="w-2.5 h-2.5 mr-1" />
                      Live
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {quickDestinations.map((dest, index) => (
                      <button
                        key={dest.code}
                        onClick={() => setToCity(`${dest.city} (${dest.code})`)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300 group relative overflow-hidden animate-in fade-in",
                          toCity.includes(dest.code)
                            ? "border-sky-500 bg-gradient-to-r from-sky-500/15 to-blue-500/10 text-sky-400 shadow-md shadow-sky-500/20"
                            : "border-border/50 bg-muted/40 hover:border-sky-500/50 hover:bg-sky-500/5"
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {dest.hot && (
                          <div className="absolute -top-0.5 -right-0.5">
                            <Flame className="w-3 h-3 text-orange-500" />
                          </div>
                        )}
                        <div className="text-left">
                          <span className="font-semibold text-xs text-foreground block">{dest.city}</span>
                          <span className="text-[10px] text-muted-foreground">({dest.code})</span>
                        </div>
                        <Badge className="text-xs px-1.5 py-0.5 bg-gradient-to-r from-sky-500/20 to-blue-500/20 text-sky-400 border-sky-500/30 font-bold">
                          ${dest.price}
                        </Badge>
                        <span className={cn(
                          "text-[10px] font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded",
                          dest.trend < 0 ? "text-emerald-400 bg-emerald-500/15" : "text-orange-400 bg-orange-500/15"
                        )}>
                          {dest.trend < 0 ? <TrendingDown className="w-2.5 h-2.5" /> : <TrendingUp className="w-2.5 h-2.5" />}
                          {Math.abs(dest.trend)}%
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Calendar Toggle - Compact */}
                {toCity && (
                  <div className="pt-4 border-t border-border/40 mt-4">
                    <button
                      onClick={() => setShowPriceCalendar(!showPriceCalendar)}
                      className="flex items-center gap-2 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-sky-500/15 group-hover:bg-sky-500/25 flex items-center justify-center transition-colors">
                        <CalendarDays className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </div>
                      {showPriceCalendar ? "Hide" : "View"} Price Calendar
                      <Badge className="px-2 py-1 bg-sky-500/15 text-sky-400 border-sky-500/30 font-semibold text-[10px]">
                        <Sparkles className="w-2.5 h-2.5 mr-1" />
                        Lowest fares
                      </Badge>
                    </button>
                  </div>
                )}
              </CardContent>
            </div>
          </Card>

          {/* Price Calendar */}
          {showPriceCalendar && toCity && (
            <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <PriceCalendar
                basePrice={299}
                selectedDate={departDate}
                onSelectDate={(date) => {
                  setDepartDate(date);
                  setShowPriceCalendar(false);
                }}
                fromCode={fromCode}
                toCode={toCode}
              />
            </div>
          )}
        </div>
      </div>

      {/* Add shimmer animation to tailwind */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </section>
  );
}
