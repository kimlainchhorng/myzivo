import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Sparkles, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Zap, 
  TrendingDown,
  Clock,
  Plane,
  Filter,
  X,
  CheckCircle,
  ExternalLink,
  Info
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import FlightTicketCard from "./FlightTicketCard";
import FareClassSelector from "./FareClassSelector";
import FlightFilters from "./FlightFilters";
import FlightRouteMapAnimated from "./FlightRouteMapAnimated";
import FlightComparison from "./FlightComparison";
import FlightAmenityComparison from "./FlightAmenityComparison";
import TravelInsuranceSelector from "./TravelInsuranceSelector";
import InFlightServices from "./InFlightServices";
import LoyaltyRedemption from "./LoyaltyRedemption";
import SeatUpgradeBidding from "./SeatUpgradeBidding";
import AirportLoungeAccess from "./AirportLoungeAccess";
import type { GeneratedFlight } from "@/data/flightGenerator";
import { cn } from "@/lib/utils";

interface FlightResultsSectionProps {
  searchResults: GeneratedFlight[];
  fromCity: string;
  toCity: string;
  fromCode: string;
  toCode: string;
  departDate?: Date;
  passengers: string;
  cabinClass: string;
  setCabinClass: (cabin: string) => void;
  onSelectFlight: (flight: GeneratedFlight) => void;
  selectedFlight: GeneratedFlight | null;
}

export default function FlightResultsSection({
  searchResults,
  fromCity,
  toCity,
  fromCode,
  toCode,
  departDate,
  passengers,
  cabinClass,
  setCabinClass,
  onSelectFlight,
  selectedFlight,
}: FlightResultsSectionProps) {
  const [compareFlights, setCompareFlights] = useState<GeneratedFlight[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [milesUsed, setMilesUsed] = useState(0);
  const [sortBy, setSortBy] = useState<"price" | "duration" | "departure" | "rating">("price");
  const [showFilters, setShowFilters] = useState(false);
  const [inFlightServices, setInFlightServices] = useState<{
    meals: { passengerId: number; mealId: string }[];
    wifi: string | null;
    entertainment: string | null;
    extras: string[];
  }>({ meals: [], wifi: null, entertainment: null, extras: [] });
  const [filters, setFilters] = useState({
    stops: "any" as "any" | "nonstop" | "1stop" | "2plus",
    airlines: [] as string[],
    alliances: [] as string[],
    priceRange: [0, 5000] as [number, number],
    departureTime: "any" as "any" | "morning" | "afternoon" | "evening" | "night",
    duration: "any" as "any" | "short" | "medium" | "long",
  });

  // Calculate stats
  const stats = useMemo(() => {
    const prices = searchResults.map(f => f.price);
    const durations = searchResults.map(f => {
      const match = f.duration.match(/(\d+)h/);
      return match ? parseInt(match[1]) : 0;
    });
    return {
      lowestPrice: Math.min(...prices),
      fastestDuration: Math.min(...durations),
      directFlights: searchResults.filter(f => f.stops === 0).length,
      realPrices: searchResults.filter(f => f.isRealPrice).length,
    };
  }, [searchResults]);

  // Sort flights
  const sortedResults = useMemo(() => {
    return [...searchResults].sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.price - b.price;
        case "duration":
          const durationA = parseInt(a.duration.match(/(\d+)h/)?.[1] || "0");
          const durationB = parseInt(b.duration.match(/(\d+)h/)?.[1] || "0");
          return durationA - durationB;
        case "departure":
          return a.departure.time.localeCompare(b.departure.time);
        case "rating":
          return (b.onTimePerformance || 0) - (a.onTimePerformance || 0);
        default:
          return 0;
      }
    });
  }, [searchResults, sortBy]);

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        {/* Affiliate Disclosure Notice */}
        <div className="mb-6 p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center shrink-0">
            <ExternalLink className="w-4 h-4 text-sky-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Book with our trusted partners:</span>{" "}
              When you select a flight, you'll be redirected to our partner site to complete your booking. 
              ZIVO may earn a commission at no extra cost to you.{" "}
              <a href="/affiliate-disclosure" className="text-sky-500 hover:underline">Learn more</a>
            </p>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-3">
              <span className="text-sky-500">{searchResults.length}</span> flights found
              {stats.realPrices > 0 && (
                <Badge className="bg-emerald-500/20 text-emerald-500 text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  {stats.realPrices} Live Prices
                </Badge>
              )}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {fromCity.split(" (")[0]} → {toCity.split(" (")[0]} •{" "}
              {departDate ? format(departDate, "MMM d, yyyy") : "Select date"} • {passengers} passenger{parseInt(passengers) > 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "gap-2",
                showFilters && "border-sky-500 text-sky-500"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-[180px]">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">Lowest Price</SelectItem>
                <SelectItem value="duration">Shortest Duration</SelectItem>
                <SelectItem value="departure">Departure Time</SelectItem>
                <SelectItem value="rating">Best Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="bg-gradient-to-r from-emerald-500/10 to-green-500/5 border-emerald-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Lowest Price</p>
                <p className="text-xl font-bold text-emerald-500">${stats.lowestPrice}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-sky-500/10 to-blue-500/5 border-sky-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-sky-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fastest</p>
                <p className="text-xl font-bold text-sky-500">{stats.fastestDuration}h</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500/10 to-indigo-500/5 border-purple-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Plane className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Direct Flights</p>
                <p className="text-xl font-bold text-purple-500">{stats.directFlights}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 border-amber-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Verified</p>
                <p className="text-xl font-bold text-amber-500">{stats.realPrices}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fare Class Quick Filter */}
        <div className="mb-6">
          <FareClassSelector
            selectedFare={cabinClass}
            onSelectFare={setCabinClass}
            basePrice={searchResults[0]?.price || 299}
            compact
          />
        </div>

        {/* Advanced Filters - Collapsible */}
        {showFilters && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <FlightFilters
              filters={{
                priceRange: filters.priceRange,
                durationMax: 24,
                directOnly: filters.stops === "nonstop",
                refundableOnly: false,
                airlines: filters.airlines,
                categories: [],
                alliances: filters.alliances,
                departureTime: { start: 0, end: 24 },
                amenities: [],
              }}
              onFiltersChange={(newFilters) =>
                setFilters((prev) => ({
                  ...prev,
                  priceRange: newFilters.priceRange,
                  airlines: newFilters.airlines,
                  alliances: newFilters.alliances,
                  stops: newFilters.directOnly ? "nonstop" : "any",
                }))
              }
              maxPrice={Math.max(...searchResults.map((f) => f.price), 5000)}
              maxDuration={24}
              availableAirlines={[...new Set(searchResults.map((f) => f.airlineCode))]}
            />
          </div>
        )}

        {/* Compare Button */}
        {compareFlights.length > 0 && (
          <div className="mb-4 flex items-center gap-3">
            <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30">
              {compareFlights.length} selected for comparison
            </Badge>
            <Button
              size="sm"
              onClick={() => setShowComparison(true)}
              disabled={compareFlights.length < 2}
            >
              Compare Flights
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setCompareFlights([])}>
              Clear
            </Button>
          </div>
        )}

        {/* Animated Route Map */}
        {searchResults.length > 0 && (
          <div className="mb-6">
            <FlightRouteMapAnimated
              departure={{
                code: fromCode,
                city: fromCity.split(" (")[0],
              }}
              arrival={{
                code: toCode,
                city: toCity.split(" (")[0],
              }}
              duration={searchResults[0]?.duration || "5h 30m"}
              flightNumber={searchResults[0]?.flightNumber}
              airline={searchResults[0]?.airline}
              className="h-48 rounded-xl overflow-hidden"
            />
          </div>
        )}

        <div className="space-y-4">
          {sortedResults.map((flight, index) => (
            <div
              key={flight.id}
              className="animate-in fade-in slide-in-from-bottom-4 duration-300"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <div className="relative">
                <FlightTicketCard
                  flight={{
                    ...flight,
                    id: String(flight.id),
                    flightNumber: flight.flightNumber,
                    isLowest: index === 0,
                    isFastest: flight.stops === 0 && parseFloat(flight.duration) < 5.5,
                    co2: flight.carbonOffset
                      ? `${flight.carbonOffset}kg`
                      : `${120 + index * 15}kg`,
                    isRealPrice: flight.isRealPrice || false,
                  }}
                  onSelect={() => onSelectFlight(flight)}
                  isSelected={selectedFlight?.id === flight.id}
                />
                {/* Compare checkbox */}
                <button
                  className={`absolute top-3 right-3 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                    compareFlights.some((f) => f.id === flight.id)
                      ? "bg-sky-500 border-sky-500 text-white"
                      : "border-muted-foreground/30 hover:border-sky-500"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCompareFlights((prev) =>
                      prev.some((f) => f.id === flight.id)
                        ? prev.filter((f) => f.id !== flight.id)
                        : prev.length < 3
                        ? [...prev, flight]
                        : prev
                    );
                  }}
                >
                  {compareFlights.some((f) => f.id === flight.id) && (
                    <span className="text-xs font-bold">✓</span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Travel Insurance Upsell */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <TravelInsuranceSelector
            tripDuration={7}
            tripCost={searchResults[0]?.price * parseInt(passengers) || 299}
            passengers={parseInt(passengers)}
            onSelect={(plan) => {
              if (plan) toast.success(`Added ${plan.name} insurance`);
            }}
          />
        </div>

        {/* Amenity Comparison */}
        {searchResults.length >= 2 && (
          <div className="mt-8">
            <FlightAmenityComparison
              flights={searchResults.slice(0, 4).map((f) => ({
                airline: f.airline,
                airlineCode: f.airlineCode,
                category: f.category || "full-service",
                fareClass:
                  cabinClass.charAt(0).toUpperCase() + cabinClass.slice(1),
                price: f.price,
                amenities: {
                  wifi: f.wifi || f.amenities?.includes("wifi") || false,
                  entertainment:
                    f.entertainment || f.amenities?.includes("entertainment") || false,
                  meals: f.meals || f.amenities?.includes("meals") || false,
                  drinks: f.amenities?.includes("meals") || false,
                  power: f.amenities?.includes("power") || false,
                  seatPitch: f.legroom || '31"',
                  seatWidth: '18"',
                  recline: '3"',
                  loungeAccess: f.amenities?.includes("lounge") || false,
                  priorityBoarding: f.category === "premium",
                  checkedBaggage: f.baggageIncluded || "1 × 23kg",
                  carryOn: "1 carry-on",
                  seatSelection: true,
                  changePolicy: f.refundable ? "free" : "fee",
                  refundPolicy: f.refundable ? "full" : "partial",
                },
              }))}
              className="max-w-4xl mx-auto"
            />
          </div>
        )}

        {/* In-Flight Services Pre-order */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <InFlightServices
            flightDuration={searchResults[0]?.duration || "5h 30m"}
            passengers={parseInt(passengers)}
            cabinClass={cabinClass}
            onServicesChange={(services) => setInFlightServices(services)}
          />
        </div>

        {/* Loyalty Redemption */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <LoyaltyRedemption
            totalPrice={searchResults[0]?.price * parseInt(passengers) || 599}
            availableMiles={45680}
            tierStatus="gold"
            onRedemptionChange={(miles, discount) => {
              setMilesUsed(miles);
              if (miles > 0) {
                toast.success(
                  `Applied ${miles.toLocaleString()} miles for $${discount.toFixed(0)} off`
                );
              }
            }}
          />
        </div>

        {/* Seat Upgrade Bidding */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <SeatUpgradeBidding
            flightNumber={searchResults[0]?.flightNumber || "ZV-1234"}
            departureDate={departDate || new Date()}
            currentCabinClass={cabinClass}
            onBidPlaced={(optionId, amount) =>
              toast.success(`Bid of $${amount} placed for upgrade!`)
            }
          />
        </div>

        {/* Airport Lounge Access */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <AirportLoungeAccess
            airport={fromCode}
            terminal="Terminal 1"
            flightTime={departDate || new Date()}
            onLoungeBooked={(loungeId, guests) =>
              toast.success(`Lounge access booked for ${guests} guests!`)
            }
          />
        </div>
      </div>

      {/* Flight Comparison Modal */}
      {showComparison && compareFlights.length >= 2 && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-auto">
            <FlightComparison
              flights={compareFlights}
              onSelect={(flight) => {
                onSelectFlight(flight);
                setShowComparison(false);
                setCompareFlights([]);
              }}
              onRemove={(flightId) => {
                setCompareFlights((prev) => prev.filter((f) => f.id !== flightId));
              }}
              onClose={() => setShowComparison(false)}
            />
          </div>
        </div>
      )}
    </section>
  );
}
