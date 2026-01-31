import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Plane,
  Clock,
  ChevronLeft,
  SlidersHorizontal,
  ArrowUpDown,
  Zap,
  TrendingDown,
  Loader2,
  Star,
  Shield,
  Wifi,
  Utensils,
  Tv,
  Sunrise,
  Sunset,
  Moon,
  Sun,
  Filter,
  X,
  Sparkles,
  Heart,
  Share2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { generateFlights, type GeneratedFlight } from "@/data/flightGenerator";
import { useRealFlightSearch } from "@/hooks/useRealFlightSearch";
import { getAirlineLogo } from "@/data/airlines";
import { AFFILIATE_LINKS, AFFILIATE_DISCLOSURE_TEXT } from "@/config/affiliateLinks";
import { trackAffiliateClick } from "@/lib/affiliateTracking";
import StickyBookingCTA from "@/components/flight/StickyBookingCTA";
import TopSearchCTA from "@/components/flight/TopSearchCTA";
import NoFlightsFound from "@/components/flight/NoFlightsFound";
import CrossSellSection from "@/components/flight/CrossSellSection";
import TravelExtrasSection from "@/components/flight/TravelExtrasSection";

const FlightResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState<"price" | "duration" | "departure" | "best">("best");
  const [maxPrice, setMaxPrice] = useState(2000);
  const [stopsFilter, setStopsFilter] = useState<number[]>([]);
  const [timeFilter, setTimeFilter] = useState<string[]>([]);
  const [savedFlights, setSavedFlights] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Parse search params
  const fromCity = searchParams.get("from") || "";
  const toCity = searchParams.get("to") || "";
  const departDateStr = searchParams.get("depart") || "";
  const returnDateStr = searchParams.get("return") || "";
  const passengers = searchParams.get("passengers") || "1";
  const cabinClass = searchParams.get("cabin") || "economy";
  const tripType = searchParams.get("tripType") || "roundtrip";

  // Extract codes
  const fromMatch = fromCity.match(/\(([A-Z]{3})\)/);
  const toMatch = toCity.match(/\(([A-Z]{3})\)/);
  const fromCode = fromMatch ? fromMatch[1] : "LAX";
  const toCode = toMatch ? toMatch[1] : "JFK";

  const departDate = departDateStr ? parseISO(departDateStr) : undefined;
  const destinationName = toCity.split(" (")[0] || toCode;

  // Fetch real flights
  const { data: realFlights, isLoading } = useRealFlightSearch({
    origin: fromCode,
    destination: toCode,
    departureDate: departDateStr,
    returnDate: returnDateStr || undefined,
    enabled: !!fromCode && !!toCode && !!departDateStr,
  });

  // Generate fallback flights
  const generatedFlights = useMemo(() => {
    return generateFlights(fromCode, toCode, departDate, 15);
  }, [fromCode, toCode, departDate]);

  // Combine and filter results
  const flights = useMemo(() => {
    const combined: GeneratedFlight[] = [];
    
    if (realFlights && realFlights.length > 0) {
      combined.push(...realFlights);
    }

    const realAirlineCodes = new Set((realFlights || []).map((f: GeneratedFlight) => f.airlineCode));
    const uniqueGenerated = generatedFlights.filter((f) => !realAirlineCodes.has(f.airlineCode));
    combined.push(...uniqueGenerated);

    // Apply filters
    let filtered = combined.filter(f => f.price <= maxPrice);
    
    if (stopsFilter.length > 0) {
      filtered = filtered.filter(f => stopsFilter.includes(f.stops));
    }

    if (timeFilter.length > 0) {
      filtered = filtered.filter(f => {
        const hour = parseInt(f.departure.time.split(":")[0]);
        if (timeFilter.includes("morning") && hour >= 5 && hour < 12) return true;
        if (timeFilter.includes("afternoon") && hour >= 12 && hour < 17) return true;
        if (timeFilter.includes("evening") && hour >= 17 && hour < 21) return true;
        if (timeFilter.includes("night") && (hour >= 21 || hour < 5)) return true;
        return false;
      });
    }

    // Sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.price - b.price;
        case "duration":
          const dA = parseInt(a.duration.match(/(\d+)h/)?.[1] || "0");
          const dB = parseInt(b.duration.match(/(\d+)h/)?.[1] || "0");
          return dA - dB;
        case "departure":
          return a.departure.time.localeCompare(b.departure.time);
        case "best":
          const scoreA = a.price + (parseInt(a.duration.match(/(\d+)h/)?.[1] || "0") * 20);
          const scoreB = b.price + (parseInt(b.duration.match(/(\d+)h/)?.[1] || "0") * 20);
          return scoreA - scoreB;
        default:
          return 0;
      }
    });
  }, [realFlights, generatedFlights, sortBy, maxPrice, stopsFilter, timeFilter]);

  const handleSelectFlight = (flight: GeneratedFlight) => {
    sessionStorage.setItem("selectedFlight", JSON.stringify(flight));
    sessionStorage.setItem("flightSearchParams", JSON.stringify({
      fromCity,
      toCity,
      departDate: departDateStr,
      returnDate: returnDateStr,
      passengers,
      cabinClass,
      tripType,
    }));
    navigate(`/flights/details/${flight.id}`);
  };

  const toggleSaveFlight = (flightId: string) => {
    setSavedFlights(prev => 
      prev.includes(flightId) 
        ? prev.filter(id => id !== flightId)
        : [...prev, flightId]
    );
  };

  const lowestPrice = flights.length > 0 ? Math.min(...flights.map(f => f.price)) : 0;
  const fastestFlight = flights.length > 0 ? flights.reduce((a, b) => {
    const dA = parseInt(a.duration.match(/(\d+)h/)?.[1] || "99");
    const dB = parseInt(b.duration.match(/(\d+)h/)?.[1] || "99");
    return dA < dB ? a : b;
  }) : null;

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-emerald-500" />
          Max Price: ${maxPrice}
        </h3>
        <Slider
          value={[maxPrice]}
          onValueChange={(v) => setMaxPrice(v[0])}
          min={100}
          max={3000}
          step={50}
          className="py-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>$100</span>
          <span>$3,000</span>
        </div>
      </div>

      {/* Stops */}
      <div>
        <h3 className="font-semibold mb-3">Stops</h3>
        <div className="space-y-2">
          {[
            { value: 0, label: "Non-stop", count: flights.filter(f => f.stops === 0).length },
            { value: 1, label: "1 Stop", count: flights.filter(f => f.stops === 1).length },
            { value: 2, label: "2+ Stops", count: flights.filter(f => f.stops >= 2).length },
          ].map(stop => (
            <label key={stop.value} className="flex items-center gap-3 cursor-pointer group">
              <Checkbox
                checked={stopsFilter.includes(stop.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setStopsFilter(prev => [...prev, stop.value]);
                  } else {
                    setStopsFilter(prev => prev.filter(s => s !== stop.value));
                  }
                }}
              />
              <span className="flex-1 group-hover:text-foreground transition-colors">
                {stop.label}
              </span>
              <Badge variant="secondary" className="text-xs">{stop.count}</Badge>
            </label>
          ))}
        </div>
      </div>

      {/* Departure Time */}
      <div>
        <h3 className="font-semibold mb-3">Departure Time</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "morning", label: "Morning", icon: Sunrise, time: "5am-12pm" },
            { id: "afternoon", label: "Afternoon", icon: Sun, time: "12pm-5pm" },
            { id: "evening", label: "Evening", icon: Sunset, time: "5pm-9pm" },
            { id: "night", label: "Night", icon: Moon, time: "9pm-5am" },
          ].map(time => (
            <button
              key={time.id}
              onClick={() => {
                setTimeFilter(prev => 
                  prev.includes(time.id) 
                    ? prev.filter(t => t !== time.id)
                    : [...prev, time.id]
                );
              }}
              className={cn(
                "p-3 rounded-xl border text-center transition-all",
                timeFilter.includes(time.id)
                  ? "bg-sky-500/20 border-sky-500/50 text-sky-500"
                  : "bg-muted/50 border-border hover:border-sky-500/30"
              )}
            >
              <time.icon className="w-5 h-5 mx-auto mb-1" />
              <p className="text-xs font-medium">{time.label}</p>
              <p className="text-[10px] text-muted-foreground">{time.time}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {(stopsFilter.length > 0 || timeFilter.length > 0 || maxPrice < 2000) && (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => {
            setStopsFilter([]);
            setTimeFilter([]);
            setMaxPrice(2000);
          }}
        >
          <X className="w-4 h-4" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  const handleBookFlight = (flight: GeneratedFlight, e: React.MouseEvent) => {
    e.stopPropagation();
    
    trackAffiliateClick({
      flightId: flight.id,
      airline: flight.airline,
      airlineCode: flight.airlineCode,
      origin: fromCode,
      destination: toCode,
      price: flight.price,
      passengers: parseInt(passengers),
      cabinClass,
      affiliatePartner: 'searadar',
      referralUrl: AFFILIATE_LINKS.flights.url,
      source: 'result_card',
      ctaType: 'result_card',
      serviceType: 'flights',
    });
    
    window.open(AFFILIATE_LINKS.flights.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`Flights ${fromCode} to ${toCode} – Compare Prices | ZIVO`}
        description={`Compare flight prices from ${fromCode} to ${toCode}. Search ${flights.length}+ options from trusted airlines and book with our travel partners.`}
      />
      <Header />

      <main className="pt-20 pb-32 lg:pb-20">
        <div className="container mx-auto px-4">
          {/* Search Summary Bar */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-cyan-500/10 border border-sky-500/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/book-flight")}
                  className="shrink-0"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div>
                  <div className="flex items-center gap-2 text-lg font-bold">
                    <span>{fromCity.split(" (")[0] || fromCode}</span>
                    <Plane className="w-4 h-4 text-sky-500 -rotate-45" />
                    <span>{toCity.split(" (")[0] || toCode}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {departDate ? format(departDate, "EEE, MMM d") : ""} • {passengers} passenger{parseInt(passengers) > 1 ? "s" : ""} • {cabinClass}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/book-flight")}>
                Modify Search
              </Button>
            </div>
          </div>

          {/* Trust Signal */}
          <div className="flex items-center justify-center gap-2 mb-6 text-sm text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Compare prices from trusted travel partners</span>
          </div>

          <div className="flex gap-6">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block w-72 shrink-0">
              <Card className="sticky top-24">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                      <Filter className="w-5 h-5 text-sky-500" />
                      Filters
                    </h2>
                    {(stopsFilter.length > 0 || timeFilter.length > 0) && (
                      <Badge className="bg-sky-500/20 text-sky-500">
                        {stopsFilter.length + timeFilter.length} active
                      </Badge>
                    )}
                  </div>
                  <FiltersContent />
                </CardContent>
              </Card>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-3">
                    <span className="text-sky-500">{flights.length}</span> flights found
                    {flights.some(f => f.isRealPrice) && (
                      <Badge className="bg-emerald-500/20 text-emerald-500 text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        Live Prices
                      </Badge>
                    )}
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mobile Filter Button */}
                  <Sheet open={showFilters} onOpenChange={setShowFilters}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden gap-2">
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                        {(stopsFilter.length > 0 || timeFilter.length > 0) && (
                          <Badge className="bg-sky-500 text-white ml-1">{stopsFilter.length + timeFilter.length}</Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80">
                      <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                          <Filter className="w-5 h-5 text-sky-500" />
                          Filters
                        </SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FiltersContent />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                    <SelectTrigger className="w-[180px]">
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="best">
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-sky-500" />
                          Best Match
                        </span>
                      </SelectItem>
                      <SelectItem value="price">Lowest Price</SelectItem>
                      <SelectItem value="duration">Shortest Duration</SelectItem>
                      <SelectItem value="departure">Departure Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Top Search CTA */}
              <TopSearchCTA 
                flightCount={flights.length}
                lowestPrice={lowestPrice}
                origin={fromCode}
                destination={toCode}
                className="mb-6"
              />

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <Card className="bg-gradient-to-r from-emerald-500/10 to-green-500/5 border-emerald-500/20">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <TrendingDown className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">From</p>
                      <p className="text-xl font-bold text-emerald-500">${lowestPrice}*</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-sky-500/10 to-blue-500/5 border-sky-500/20">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center shrink-0">
                      <Plane className="w-5 h-5 text-sky-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Direct</p>
                      <p className="text-xl font-bold text-sky-500">
                        {flights.filter(f => f.stops === 0).length}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-purple-500/10 to-indigo-500/5 border-purple-500/20">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Fastest</p>
                      <p className="text-xl font-bold text-purple-500">
                        {fastestFlight?.duration.split(" ")[0] || "N/A"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 border-amber-500/20">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                      <Star className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Airlines</p>
                      <p className="text-xl font-bold text-amber-500">
                        {new Set(flights.map(f => f.airlineCode)).size}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="relative inline-flex">
                      <div className="w-16 h-16 rounded-full bg-sky-500/20 animate-ping absolute" />
                      <div className="w-16 h-16 rounded-full bg-sky-500/30 flex items-center justify-center relative">
                        <Plane className="w-8 h-8 text-sky-500 animate-pulse" />
                      </div>
                    </div>
                    <p className="mt-4 text-muted-foreground">Searching 500+ airlines...</p>
                  </div>
                </div>
              )}

              {/* Flight Results */}
              <div className="space-y-4">
                {flights.map((flight, index) => {
                  const isBestPrice = flight.price === lowestPrice;
                  const isFastest = flight === fastestFlight;
                  const isSaved = savedFlights.includes(flight.id);

                  return (
                    <Card
                      key={flight.id}
                      className={cn(
                        "overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer group",
                        "animate-in fade-in slide-in-from-bottom-4",
                        isBestPrice && "ring-2 ring-emerald-500/50 shadow-emerald-500/20",
                        isFastest && !isBestPrice && "ring-2 ring-purple-500/50"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Top Badges */}
                      {(isBestPrice || isFastest || flight.isRealPrice) && (
                        <div className="flex gap-2 px-4 py-2 bg-muted/30 border-b border-border/50">
                          {isBestPrice && (
                            <Badge className="bg-emerald-500 text-white text-xs gap-1">
                              <TrendingDown className="w-3 h-3" /> Best Price
                            </Badge>
                          )}
                          {isFastest && !isBestPrice && (
                            <Badge className="bg-purple-500 text-white text-xs gap-1">
                              <Clock className="w-3 h-3" /> Fastest
                            </Badge>
                          )}
                          {flight.isRealPrice && (
                            <Badge className="bg-sky-500/20 text-sky-500 text-xs gap-1">
                              <Zap className="w-3 h-3" /> Live Price
                            </Badge>
                          )}
                        </div>
                      )}

                      <CardContent className="p-0" onClick={() => handleSelectFlight(flight)}>
                        <div className="flex flex-col lg:flex-row">
                          {/* Airline Info */}
                          <div className="p-4 lg:p-6 flex items-center gap-4 lg:w-56 border-b lg:border-b-0 lg:border-r border-border/50">
                            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center overflow-hidden shadow-lg">
                              <img
                                src={getAirlineLogo(flight.airlineCode)}
                                alt={flight.airline}
                                className="w-10 h-10 object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${flight.airlineCode}&background=0ea5e9&color=fff&size=48`;
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold truncate">{flight.airline}</p>
                              <p className="text-xs text-muted-foreground">{flight.flightNumber}</p>
                              <div className="flex items-center gap-1 mt-1">
                                {flight.amenities?.includes("wifi") && <Wifi className="w-3 h-3 text-muted-foreground" />}
                                {flight.amenities?.includes("entertainment") && <Tv className="w-3 h-3 text-muted-foreground" />}
                                {flight.amenities?.includes("meals") && <Utensils className="w-3 h-3 text-muted-foreground" />}
                              </div>
                            </div>
                          </div>

                          {/* Flight Times */}
                          <div className="flex-1 p-4 lg:p-6">
                            <div className="flex items-center justify-between">
                              {/* Departure */}
                              <div className="text-center">
                                <p className="text-2xl lg:text-3xl font-bold">{flight.departure.time}</p>
                                <p className="text-sm font-semibold text-sky-500">{flight.departure.code}</p>
                                <p className="text-xs text-muted-foreground hidden sm:block">{flight.departure.city}</p>
                              </div>

                              {/* Duration & Stops */}
                              <div className="flex-1 px-4 lg:px-8">
                                <div className="relative flex items-center">
                                  <div className="flex-1 h-0.5 bg-gradient-to-r from-sky-500/30 via-sky-500 to-sky-500/30 rounded-full" />
                                  <div className="absolute left-1/2 -translate-x-1/2 bg-background px-2">
                                    <div className="w-10 h-10 rounded-full bg-sky-500/10 border-2 border-sky-500/30 flex items-center justify-center">
                                      <Plane className="w-5 h-5 text-sky-500 -rotate-45" />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex justify-center mt-2 gap-3">
                                  <Badge variant="outline" className="text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {flight.duration}
                                  </Badge>
                                  <Badge 
                                    variant="outline"
                                    className={cn(
                                      "text-xs",
                                      flight.stops === 0 ? "text-emerald-500 border-emerald-500/50" : "text-amber-500 border-amber-500/50"
                                    )}
                                  >
                                    {flight.stops === 0 ? "Direct" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
                                  </Badge>
                                </div>
                              </div>

                              {/* Arrival */}
                              <div className="text-center">
                                <p className="text-2xl lg:text-3xl font-bold">{flight.arrival.time}</p>
                                <p className="text-sm font-semibold text-sky-500">{flight.arrival.code}</p>
                                <p className="text-xs text-muted-foreground hidden sm:block">{flight.arrival.city}</p>
                              </div>
                            </div>
                          </div>

                          {/* Price & Actions */}
                          <div className="p-4 lg:p-6 lg:w-56 border-t lg:border-t-0 lg:border-l border-border/50 flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-4 bg-muted/20">
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">From</p>
                              <p className="text-3xl lg:text-4xl font-bold text-sky-500">${flight.price}</p>
                              <p className="text-[10px] text-muted-foreground">per person*</p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button
                                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 gap-1 shadow-lg shadow-sky-500/20 min-h-[44px] touch-manipulation active:scale-[0.98]"
                                onClick={(e) => handleBookFlight(flight, e)}
                              >
                                View Deal
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                              <p className="text-[9px] text-muted-foreground text-center max-w-[120px] leading-tight">
                                Opens partner site
                              </p>
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSaveFlight(flight.id);
                                  }}
                                >
                                  <Heart className={cn("w-4 h-4", isSaved && "fill-red-500 text-red-500")} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Share2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {flights.length === 0 && !isLoading && (
                <NoFlightsFound
                  onClearFilters={() => {
                    setStopsFilter([]);
                    setTimeFilter([]);
                    setMaxPrice(2000);
                  }}
                  onModifySearch={() => navigate("/book-flight")}
                  origin={fromCode}
                  destination={toCode}
                />
              )}

              {/* Price Disclaimer */}
              {flights.length > 0 && (
                <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border/50">
                  <p className="text-xs text-muted-foreground text-center">
                    *Prices are indicative and may change. Final price will be confirmed on our travel partner's website.
                    {" "}{AFFILIATE_DISCLOSURE_TEXT.full}
                  </p>
                </div>
              )}

              {/* Cross-Sell Section - Hotels, Cars, Activities */}
              {flights.length > 0 && (
                <div className="mt-12">
                  <CrossSellSection 
                    destination={destinationName}
                    origin={fromCity.split(" (")[0]}
                    checkIn={departDateStr}
                    checkOut={returnDateStr}
                  />
                </div>
              )}

              {/* Travel Extras Section */}
              {flights.length > 0 && (
                <TravelExtrasSection 
                  destination={destinationName}
                  className="mt-8"
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Mobile CTA */}
      <StickyBookingCTA 
        lowestPrice={lowestPrice}
        flightCount={flights.length}
        origin={fromCode}
        destination={toCode}
      />

      <Footer />
    </div>
  );
};

export default FlightResults;
