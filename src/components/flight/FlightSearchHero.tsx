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
    <section className="relative min-h-[90vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={flightHeroImage}
          alt="Airplane window view at sunset"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/75 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-transparent to-background/70" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-sky-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-[15%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute top-24 right-10 hidden lg:block animate-float">
        <div className="w-16 h-16 rounded-2xl bg-sky-500/20 backdrop-blur-xl border border-sky-500/30 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <Plane className="w-8 h-8 text-sky-400" />
        </div>
      </div>
      <div
        className="absolute top-40 right-32 hidden lg:block animate-float"
        style={{ animationDelay: "0.5s" }}
      >
        <div className="w-12 h-12 rounded-xl bg-blue-500/20 backdrop-blur-xl border border-blue-500/30 flex items-center justify-center">
          <Globe className="w-6 h-6 text-blue-400" />
        </div>
      </div>
      <div
        className="absolute bottom-40 left-10 hidden lg:block animate-float"
        style={{ animationDelay: "0.8s" }}
      >
        <div className="w-14 h-14 rounded-xl bg-amber-500/20 backdrop-blur-xl border border-amber-500/30 flex items-center justify-center">
          <Star className="w-7 h-7 text-amber-400" />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-20 pb-12">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Live Indicator */}
          <div className="flex justify-center mb-4">
            <Badge className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-2 text-sm font-medium">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Live Prices from 500+ Airlines
            </Badge>
          </div>
          
          <Badge className="mb-6 px-5 py-2.5 bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 text-white border-0 shadow-xl shadow-sky-500/40 text-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            ZIVO Flights — Premium Air Travel
          </Badge>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
            Your journey to
            <br />
            <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
              anywhere starts here
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6">
            Compare prices from 500+ airlines worldwide. Book premium flights at
            the best prices with our exclusive deals and real-time pricing.
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
            {trustBadges.map((item, index) => (
              <div
                key={item.text}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-card/60 backdrop-blur-xl border border-border/50 hover:border-sky-500/40 hover:bg-card/80 transition-all duration-300 animate-in fade-in group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <item.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", item.color)} />
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Search Card */}
        <div
          className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700"
          style={{ animationDelay: "0.2s" }}
        >
          <Card className="overflow-hidden border-0 bg-card/90 backdrop-blur-2xl shadow-2xl shadow-black/30 ring-1 ring-white/10">
            {/* Top accent line with shimmer effect */}
            <div className="h-1.5 bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
            
            <CardContent className="p-5 sm:p-8">
              {/* Trip Type Toggle - Enhanced */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { type: "roundtrip" as const, label: "Round Trip", icon: RefreshCw },
                  { type: "oneway" as const, label: "One Way", icon: Plane },
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => setTripType(item.type)}
                    className={cn(
                      "px-4 sm:px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2",
                      tripType === item.type
                        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 scale-[1.02]"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
                <button
                  className="px-4 sm:px-5 py-2.5 rounded-xl font-semibold bg-muted/60 text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all duration-300 flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Multi-City
                </button>
              </div>

              {/* Search Fields - Enhanced Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 relative">
                {/* From */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500/20 to-blue-500/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur" />
                  <div className="relative">
                    <AirportAutocomplete
                      value={fromCity}
                      onChange={setFromCity}
                      label="From"
                      placeholder="City or airport"
                      recentSearches={recentSearches}
                      excludeCode={toCode}
                    />
                  </div>
                </div>

                {/* Swap Button - Enhanced */}
                <button
                  onClick={swapCities}
                  className="hidden lg:flex absolute left-[calc(25%-12px)] top-[38px] w-10 h-10 items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700 transition-all z-20 shadow-lg shadow-sky-500/30 hover:scale-110 active:scale-95"
                >
                  <ArrowLeftRight className="w-5 h-5" />
                </button>

                {/* To */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500/20 to-blue-500/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity blur" />
                  <div className="relative">
                    <AirportAutocomplete
                      value={toCity}
                      onChange={setToCity}
                      label="To"
                      placeholder="Where to?"
                      recentSearches={recentSearches}
                      excludeCode={fromCode}
                    />
                  </div>
                </div>

                {/* Departure Date */}
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block font-medium">
                    Departure
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-12 justify-start bg-background/60 hover:bg-background/80 border-border/60 hover:border-sky-500/50 transition-all",
                          !departDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-sky-500" />
                        {departDate
                          ? format(departDate, "EEE, MMM d")
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={departDate}
                        onSelect={setDepartDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Return Date */}
                {tripType === "roundtrip" && (
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block font-medium">
                      Return
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-12 justify-start bg-background/60 hover:bg-background/80 border-border/60 hover:border-sky-500/50 transition-all",
                            !returnDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-sky-500" />
                          {returnDate
                            ? format(returnDate, "EEE, MMM d")
                            : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={returnDate}
                          onSelect={setReturnDate}
                          initialFocus
                          className="p-3 pointer-events-auto"
                          disabled={(date) => date < (departDate || new Date())}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>

              {/* Passengers, Class & Search - Enhanced */}
              <div className="flex flex-wrap gap-3 sm:gap-4 items-end mb-5">
                {/* Passengers Dropdown - Enhanced */}
                <div className="flex-1 min-w-[180px]">
                  <label className="text-sm text-muted-foreground mb-1.5 block font-medium">
                    Travelers
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-12 justify-between bg-background/60 hover:bg-background/80 border-border/60 hover:border-sky-500/50"
                      >
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-sky-500" />
                          <span>{totalPassengers} Traveler{totalPassengers > 1 ? "s" : ""}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-4" align="start">
                      <div className="space-y-4">
                        {/* Adults */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-sky-500" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">Adults</p>
                              <p className="text-xs text-muted-foreground">12+ years</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-lg"
                              onClick={() => setAdults(Math.max(1, adults - 1))}
                              disabled={adults <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center font-semibold">{adults}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-lg"
                              onClick={() => setAdults(Math.min(9, adults + 1))}
                              disabled={adults >= 9}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Children */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-amber-500" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">Children</p>
                              <p className="text-xs text-muted-foreground">2-11 years</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-lg"
                              onClick={() => setChildren(Math.max(0, children - 1))}
                              disabled={children <= 0}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center font-semibold">{children}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-lg"
                              onClick={() => setChildren(Math.min(6, children + 1))}
                              disabled={children >= 6}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Infants */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-pink-500/10 flex items-center justify-center">
                              <Baby className="w-4 h-4 text-pink-500" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">Infants</p>
                              <p className="text-xs text-muted-foreground">Under 2</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-lg"
                              onClick={() => setInfants(Math.max(0, infants - 1))}
                              disabled={infants <= 0}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center font-semibold">{infants}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-lg"
                              onClick={() => setInfants(Math.min(adults, infants + 1))}
                              disabled={infants >= adults}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        <Button
                          className="w-full mt-2 bg-sky-500 hover:bg-sky-600"
                          onClick={updatePassengers}
                        >
                          Done
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Cabin Class - Enhanced */}
                <div className="flex-1 min-w-[160px]">
                  <label className="text-sm text-muted-foreground mb-1.5 block font-medium">
                    Cabin Class
                  </label>
                  <Select value={cabinClass} onValueChange={setCabinClass}>
                    <SelectTrigger className="h-12 bg-background/60 hover:bg-background/80 border-border/60 hover:border-sky-500/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economy">
                        <div className="flex items-center gap-2">
                          <span>Economy</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5">Most Popular</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="premium">Premium Economy</SelectItem>
                      <SelectItem value="business">Business Class</SelectItem>
                      <SelectItem value="first">
                        <div className="flex items-center gap-2">
                          <span>First Class</span>
                          <Badge className="text-[10px] px-1.5 bg-amber-500/20 text-amber-500 border-amber-500/30">Luxury</Badge>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Search Button - Enhanced */}
                <Button
                  onClick={onSearch}
                  disabled={!fromCity || !toCity || !departDate || isSearching}
                  size="lg"
                  className="h-14 px-8 sm:px-12 bg-gradient-to-r from-sky-500 via-blue-600 to-sky-500 hover:from-sky-600 hover:via-blue-700 hover:to-sky-600 text-white font-bold text-base shadow-xl shadow-sky-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-sky-500/50 hover:scale-[1.02] active:scale-[0.98] rounded-xl relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  {isSearching ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Search Flights
                    </>
                  )}
                </Button>
              </div>

              {/* Advanced Options Toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <Filter className="w-4 h-4" />
                Advanced Search Options
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {/* Advanced Options Panel */}
              {showAdvanced && (
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 mb-5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex flex-wrap gap-6">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <Switch
                        checked={directOnly}
                        onCheckedChange={setDirectOnly}
                      />
                      <div>
                        <p className="text-sm font-medium group-hover:text-sky-500 transition-colors">Direct flights only</p>
                        <p className="text-xs text-muted-foreground">No layovers</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <Switch
                        checked={flexibleDates}
                        onCheckedChange={setFlexibleDates}
                      />
                      <div>
                        <p className="text-sm font-medium group-hover:text-sky-500 transition-colors">Flexible dates</p>
                        <p className="text-xs text-muted-foreground">±3 days</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <Switch
                        checked={nearbyAirports}
                        onCheckedChange={setNearbyAirports}
                      />
                      <div>
                        <p className="text-sm font-medium group-hover:text-sky-500 transition-colors">Include nearby airports</p>
                        <p className="text-xs text-muted-foreground">Within 100mi</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Quick Destinations - Enhanced */}
              <div className="pt-4 border-t border-border/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    Trending destinations from your area
                  </span>
                  <Badge variant="outline" className="text-[10px] border-sky-500/40 text-sky-400">
                    <Zap className="w-2.5 h-2.5 mr-1" />
                    Live prices
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickDestinations.map((dest) => (
                    <button
                      key={dest.code}
                      onClick={() => setToCity(`${dest.city} (${dest.code})`)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all duration-300 group relative overflow-hidden",
                        toCity.includes(dest.code)
                          ? "border-sky-500 bg-sky-500/15 text-sky-400 shadow-lg shadow-sky-500/20"
                          : "border-border/50 bg-muted/30 hover:border-sky-500/50 hover:bg-sky-500/5"
                      )}
                    >
                      {dest.hot && (
                        <Flame className="w-3.5 h-3.5 text-orange-500 absolute -top-0.5 -right-0.5" />
                      )}
                      <span className="font-semibold">{dest.city}</span>
                      <span className="text-xs text-muted-foreground">({dest.code})</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground line-through">${dest.oldPrice}</span>
                        <Badge className="text-xs px-1.5 py-0 bg-sky-500/20 text-sky-400 border-sky-500/30 font-bold">
                          ${dest.price}
                        </Badge>
                      </div>
                      <span className={cn(
                        "text-xs font-bold flex items-center gap-0.5",
                        dest.trend < 0 ? "text-emerald-500" : "text-orange-500"
                      )}>
                        {dest.trend < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                        {Math.abs(dest.trend)}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Calendar Toggle - Enhanced */}
              {toCity && (
                <div className="pt-4 border-t border-border/30 mt-4">
                  <button
                    onClick={() => setShowPriceCalendar(!showPriceCalendar)}
                    className="flex items-center gap-2 text-sm text-sky-500 hover:text-sky-400 transition-colors group"
                  >
                    <CalendarDays className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    {showPriceCalendar ? "Hide" : "View"} Price Calendar
                    <Badge
                      variant="outline"
                      className="text-[10px] border-sky-500/40 text-sky-400"
                    >
                      <Sparkles className="w-2.5 h-2.5 mr-1" />
                      Find lowest fares
                    </Badge>
                  </button>
                </div>
              )}
            </CardContent>
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
