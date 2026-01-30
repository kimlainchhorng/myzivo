import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles } from "lucide-react";
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

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold flex items-center gap-2">
              {searchResults.length} flights found
              {searchResults.some((f) => f.isRealPrice) && (
                <Badge className="bg-emerald-500/20 text-emerald-500 text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Live Prices
                </Badge>
              )}
            </h2>
            <p className="text-sm text-muted-foreground">
              {fromCity.split(" (")[0]} → {toCity.split(" (")[0]} •{" "}
              {departDate ? format(departDate, "MMM d, yyyy") : "Select date"}
            </p>
          </div>
          <Select defaultValue="price">
            <SelectTrigger className="w-[180px]">
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

        {/* Fare Class Quick Filter */}
        <div className="mb-6">
          <FareClassSelector
            selectedFare={cabinClass}
            onSelectFare={setCabinClass}
            basePrice={searchResults[0]?.price || 299}
            compact
          />
        </div>

        {/* Advanced Filters */}
        <div className="mb-6">
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
          {searchResults.map((flight, index) => (
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
