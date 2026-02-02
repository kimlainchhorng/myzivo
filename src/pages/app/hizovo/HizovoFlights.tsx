/**
 * Hizovo Travel App - Flights Tab
 * Mobile flight search with results and partner handoff
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plane, Search, Calendar, Users, MapPin, ArrowRight, 
  Shield, ArrowLeftRight, ChevronDown, Loader2, Clock, X
} from "lucide-react";
import HizovoAppLayout from "@/components/app/HizovoAppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { getSearchSessionId, createNewSearchSession } from "@/config/trackingParams";
import { logPartnerRedirect } from "@/lib/partnerRedirectLog";

// Demo flight results
const flightResults = [
  { id: "1", airline: "Delta Air Lines", airlineCode: "DL", from: "JFK", to: "LAX", price: 199, duration: "5h 30m", durationMin: 330, stops: 0, departTime: "08:00", arriveTime: "11:30", cabinClass: "Economy" },
  { id: "2", airline: "United Airlines", airlineCode: "UA", from: "JFK", to: "LAX", price: 215, duration: "5h 45m", durationMin: 345, stops: 0, departTime: "10:15", arriveTime: "14:00", cabinClass: "Economy" },
  { id: "3", airline: "American Airlines", airlineCode: "AA", from: "JFK", to: "LAX", price: 189, duration: "6h 15m", durationMin: 375, stops: 1, departTime: "07:30", arriveTime: "12:45", cabinClass: "Economy" },
  { id: "4", airline: "JetBlue", airlineCode: "B6", from: "JFK", to: "LAX", price: 175, duration: "5h 50m", durationMin: 350, stops: 0, departTime: "14:00", arriveTime: "17:50", cabinClass: "Economy" },
  { id: "5", airline: "Southwest", airlineCode: "WN", from: "JFK", to: "LAX", price: 169, duration: "6h 30m", durationMin: 390, stops: 1, departTime: "06:00", arriveTime: "10:30", cabinClass: "Economy" },
];

const cabinOptions = ["Economy", "Premium Economy", "Business", "First"];

const HizovoFlights = () => {
  const navigate = useNavigate();
  
  // Search state
  const [origin, setOrigin] = useState("New York (JFK)");
  const [destination, setDestination] = useState("Los Angeles (LAX)");
  const [departDate, setDepartDate] = useState("Feb 15, 2026");
  const [returnDate, setReturnDate] = useState("Feb 22, 2026");
  const [passengers, setPassengers] = useState("1 Adult");
  const [cabinClass, setCabinClass] = useState("Economy");
  
  // UI state
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<typeof flightResults[0] | null>(null);
  
  const handleSearch = async () => {
    createNewSearchSession();
    setIsSearching(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSearching(false);
    setHasSearched(true);
  };

  const handleViewDeal = (flight: typeof flightResults[0]) => {
    setSelectedFlight(flight);
    navigate(`/app/flights/${flight.id}`, { 
      state: { flight, searchParams: { origin, destination, departDate, returnDate, passengers, cabinClass } } 
    });
  };

  const swapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  return (
    <HizovoAppLayout title="Flights">
      <div className="pb-4">
        {/* Search Form */}
        <div className="p-4 space-y-4 bg-flights/5">
          {/* From/To */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="From" 
                  className="pl-9 h-12 rounded-xl" 
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-flights" />
                <Input 
                  placeholder="To" 
                  className="pl-9 h-12 rounded-xl" 
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
            </div>
            {/* Swap button */}
            <button
              onClick={swapLocations}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-flights text-white rounded-full flex items-center justify-center shadow-lg touch-manipulation active:scale-95"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Departure" 
                className="pl-9 h-12 rounded-xl" 
                value={departDate}
                onChange={(e) => setDepartDate(e.target.value)}
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Return" 
                className="pl-9 h-12 rounded-xl" 
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>
          </div>

          {/* Passengers & Class */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Passengers" 
                className="pl-9 h-12 rounded-xl" 
                value={passengers}
                onChange={(e) => setPassengers(e.target.value)}
              />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <button className="h-12 px-4 rounded-xl border border-input bg-background text-left flex items-center justify-between">
                  <span className="text-sm">{cabinClass}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-3xl">
                <SheetHeader>
                  <SheetTitle>Select Cabin Class</SheetTitle>
                </SheetHeader>
                <div className="py-4 space-y-2">
                  {cabinOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => setCabinClass(option)}
                      className={cn(
                        "w-full p-4 rounded-xl text-left transition-colors",
                        cabinClass === option 
                          ? "bg-flights/10 border-2 border-flights" 
                          : "bg-muted border border-border"
                      )}
                    >
                      <span className="font-medium">{option}</span>
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full h-14 rounded-xl font-bold text-lg gap-2 bg-flights hover:bg-flights/90"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Search Flights
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {hasSearched && (
          <div className="px-4 space-y-4 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Disclosure */}
            <div className="py-3 px-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground text-center">
                <Shield className="w-3 h-3 inline mr-1" />
                Prices are indicative. Final price confirmed on partner site.
              </p>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {flightResults.length} flights found
              </p>
              <button className="text-sm text-flights font-medium">
                Sort & Filter
              </button>
            </div>

            {/* Flight Cards */}
            <div className="space-y-3">
              {flightResults.map((flight) => (
                <div 
                  key={flight.id}
                  className="p-4 rounded-2xl bg-card border border-border/50 space-y-4"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                        <Plane className="w-5 h-5 text-flights" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{flight.airline}</p>
                        <p className="text-xs text-muted-foreground">
                          {flight.stops === 0 ? "Nonstop" : `${flight.stops} stop`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl text-flights">${flight.price}</p>
                      <p className="text-xs text-muted-foreground">per person</p>
                    </div>
                  </div>

                  {/* Times */}
                  <div className="flex items-center">
                    <div className="text-center">
                      <p className="font-bold text-lg">{flight.departTime}</p>
                      <p className="text-xs text-muted-foreground">{flight.from}</p>
                    </div>
                    <div className="flex-1 mx-4 flex flex-col items-center">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{flight.duration}</span>
                      </div>
                      <div className="w-full h-px bg-border mt-1 relative">
                        <Plane className="w-3 h-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card text-flights rotate-90" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg">{flight.arriveTime}</p>
                      <p className="text-xs text-muted-foreground">{flight.to}</p>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button 
                    className="w-full rounded-xl gap-2 bg-flights hover:bg-flights/90"
                    onClick={() => handleViewDeal(flight)}
                  >
                    View Deal <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasSearched && (
          <div className="px-4 py-12 text-center">
            <div className="w-20 h-20 bg-flights/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plane className="w-10 h-10 text-flights" />
            </div>
            <h3 className="font-bold text-lg mb-2">Search for Flights</h3>
            <p className="text-sm text-muted-foreground">
              Enter your trip details above to find the best flight deals.
            </p>
          </div>
        )}
      </div>
    </HizovoAppLayout>
  );
};

export default HizovoFlights;
