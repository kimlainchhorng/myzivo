import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plane,
  Clock,
  ArrowRight,
  ChevronLeft,
  SlidersHorizontal,
  ArrowUpDown,
  Zap,
  TrendingDown,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { generateFlights, type GeneratedFlight } from "@/data/flightGenerator";
import { useRealFlightSearch } from "@/hooks/useRealFlightSearch";
import { getAirlineLogo } from "@/data/airlines";

const FlightResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState<"price" | "duration" | "departure">("price");

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
    return generateFlights(fromCode, toCode, departDate, 12);
  }, [fromCode, toCode, departDate]);

  // Combine results
  const flights = useMemo(() => {
    const combined: GeneratedFlight[] = [];
    
    if (realFlights && realFlights.length > 0) {
      combined.push(...realFlights);
    }

    const realAirlineCodes = new Set((realFlights || []).map((f: GeneratedFlight) => f.airlineCode));
    const uniqueGenerated = generatedFlights.filter((f) => !realAirlineCodes.has(f.airlineCode));
    combined.push(...uniqueGenerated);

    // Sort
    return combined.sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.price - b.price;
        case "duration":
          const dA = parseInt(a.duration.match(/(\d+)h/)?.[1] || "0");
          const dB = parseInt(b.duration.match(/(\d+)h/)?.[1] || "0");
          return dA - dB;
        case "departure":
          return a.departure.time.localeCompare(b.departure.time);
        default:
          return 0;
      }
    });
  }, [realFlights, generatedFlights, sortBy]);

  const handleSelectFlight = (flight: GeneratedFlight) => {
    // Store flight in session and navigate to details
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

  const lowestPrice = flights.length > 0 ? Math.min(...flights.map(f => f.price)) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-20">
        <div className="container mx-auto px-4">
          {/* Back Button & Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/book-flight")}
              className="mb-4 gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Modify Search
            </Button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                <p className="text-sm text-muted-foreground mt-1">
                  {fromCity.split(" (")[0]} → {toCity.split(" (")[0]} •{" "}
                  {departDate ? format(departDate, "MMM d, yyyy") : ""} • {passengers} passenger{parseInt(passengers) > 1 ? "s" : ""}
                </p>
              </div>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-[180px]">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Lowest Price</SelectItem>
                  <SelectItem value="duration">Shortest Duration</SelectItem>
                  <SelectItem value="departure">Departure Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card className="bg-gradient-to-r from-emerald-500/10 to-green-500/5 border-emerald-500/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">From</p>
                  <p className="text-xl font-bold text-emerald-500">${lowestPrice}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-sky-500/10 to-blue-500/5 border-sky-500/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
                  <Plane className="w-5 h-5 text-sky-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Direct</p>
                  <p className="text-xl font-bold text-sky-500">
                    {flights.filter(f => f.stops === 0).length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-purple-500/10 to-indigo-500/5 border-purple-500/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Airlines</p>
                  <p className="text-xl font-bold text-purple-500">
                    {new Set(flights.map(f => f.airlineCode)).size}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              <span className="ml-3 text-muted-foreground">Searching 500+ airlines...</span>
            </div>
          )}

          {/* Flight Results */}
          <div className="space-y-4">
            {flights.map((flight, index) => (
              <Card
                key={flight.id}
                className={cn(
                  "overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/10 cursor-pointer group",
                  "animate-in fade-in slide-in-from-bottom-4",
                  flight.price === lowestPrice && "ring-2 ring-emerald-500/50"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => handleSelectFlight(flight)}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Airline Info */}
                    <div className="p-4 md:p-6 flex items-center gap-4 md:w-48 border-b md:border-b-0 md:border-r border-border/50">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                        <img
                          src={getAirlineLogo(flight.airlineCode)}
                          alt={flight.airline}
                          className="w-10 h-10 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${flight.airlineCode}&background=0ea5e9&color=fff&size=48`;
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-semibold">{flight.airline}</p>
                        <p className="text-xs text-muted-foreground">{flight.flightNumber}</p>
                      </div>
                    </div>

                    {/* Flight Times */}
                    <div className="flex-1 p-4 md:p-6">
                      <div className="flex items-center justify-between">
                        {/* Departure */}
                        <div className="text-center">
                          <p className="text-2xl font-bold">{flight.departure.time}</p>
                          <p className="text-sm font-medium">{flight.departure.code}</p>
                        </div>

                        {/* Duration & Stops */}
                        <div className="flex-1 px-4 md:px-8">
                          <div className="relative flex items-center">
                            <div className="flex-1 border-t-2 border-dashed border-muted-foreground/30" />
                            <Plane className="w-5 h-5 text-sky-500 mx-2 -rotate-45" />
                            <div className="flex-1 border-t-2 border-dashed border-muted-foreground/30" />
                          </div>
                          <div className="flex justify-center mt-1 gap-2">
                            <span className="text-xs text-muted-foreground">{flight.duration}</span>
                            <span className="text-xs">•</span>
                            <span className={cn(
                              "text-xs font-medium",
                              flight.stops === 0 ? "text-emerald-500" : "text-amber-500"
                            )}>
                              {flight.stops === 0 ? "Direct" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
                            </span>
                          </div>
                        </div>

                        {/* Arrival */}
                        <div className="text-center">
                          <p className="text-2xl font-bold">{flight.arrival.time}</p>
                          <p className="text-sm font-medium">{flight.arrival.code}</p>
                        </div>
                      </div>
                    </div>

                    {/* Price & Book */}
                    <div className="p-4 md:p-6 md:w-48 border-t md:border-t-0 md:border-l border-border/50 flex flex-col items-center justify-center gap-2 bg-muted/30">
                      {flight.price === lowestPrice && (
                        <Badge className="bg-emerald-500 text-white text-xs">Lowest Price</Badge>
                      )}
                      <p className="text-3xl font-bold text-sky-500">${flight.price}</p>
                      <p className="text-xs text-muted-foreground">per person</p>
                      <Button
                        size="sm"
                        className="w-full mt-2 bg-gradient-to-r from-sky-500 to-blue-600 gap-1"
                      >
                        View Details
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {flights.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Plane className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No flights found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search criteria</p>
              <Button onClick={() => navigate("/book-flight")}>Modify Search</Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FlightResults;
