import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  Plane, 
  ArrowRight, 
  Clock, 
  Wifi, 
  Coffee, 
  Tv, 
  Luggage,
  Star,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  Crown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { premiumAirlines, fullServiceAirlines, lowCostAirlines, type Airline } from "@/data/airlines";

interface Flight {
  id: number;
  airline: string;
  airlineLogo: string;
  flight: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  stops: number;
  stopCity?: string;
  amenities: string[];
  seatsLeft?: number;
  co2?: string;
  isLowest?: boolean;
  isFastest?: boolean;
}

interface FlightSearchProps {
  onSelectFlight?: (flight: Flight) => void;
  showFilters?: boolean;
}

const FlightSearch = ({ onSelectFlight, showFilters = true }: FlightSearchProps) => {
  const [sortBy, setSortBy] = useState<"price" | "duration" | "departure">("price");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [directOnly, setDirectOnly] = useState(false);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [hoveredFlight, setHoveredFlight] = useState<number | null>(null);

  // Use real airline data for search results
  const [searchResults] = useState<Flight[]>([
    { 
      id: 1, 
      airline: "Singapore Airlines", 
      airlineLogo: "🇸🇬",
      flight: "SQ 1234", 
      departure: "08:00", 
      arrival: "11:30", 
      duration: "3h 30m", 
      price: 459, 
      stops: 0,
      amenities: ["wifi", "entertainment", "meals"],
      seatsLeft: 4,
      co2: "120kg",
      isLowest: false
    },
    { 
      id: 2, 
      airline: "Emirates", 
      airlineLogo: "🇦🇪",
      flight: "EK 205", 
      departure: "10:15", 
      arrival: "14:00", 
      duration: "3h 45m", 
      price: 549, 
      stops: 0,
      amenities: ["wifi", "entertainment", "meals", "lounge"],
      seatsLeft: 3,
      co2: "135kg"
    },
    { 
      id: 3, 
      airline: "Delta Airlines", 
      airlineLogo: "🇺🇸",
      flight: "DL 890", 
      departure: "14:30", 
      arrival: "19:15", 
      duration: "4h 45m", 
      price: 249, 
      stops: 1,
      stopCity: "Denver",
      amenities: ["wifi"],
      seatsLeft: 12,
      co2: "180kg",
      isLowest: true
    },
    { 
      id: 4, 
      airline: "Qatar Airways", 
      airlineLogo: "🇶🇦",
      flight: "QR 1100", 
      departure: "18:00", 
      arrival: "21:30", 
      duration: "3h 30m", 
      price: 499, 
      stops: 0,
      amenities: ["wifi", "entertainment", "meals", "lounge"],
      seatsLeft: 2,
      co2: "118kg",
      isFastest: true
    },
    { 
      id: 5, 
      airline: "JetBlue", 
      airlineLogo: "🇺🇸",
      flight: "B6 422", 
      departure: "06:30", 
      arrival: "10:00", 
      duration: "3h 30m", 
      price: 189, 
      stops: 0,
      amenities: ["wifi", "entertainment"],
      seatsLeft: 18,
      co2: "125kg"
    },
    { 
      id: 6, 
      airline: "ANA", 
      airlineLogo: "🇯🇵",
      flight: "NH 1055", 
      departure: "23:00", 
      arrival: "06:30", 
      duration: "4h 30m", 
      price: 529, 
      stops: 0,
      amenities: ["wifi", "entertainment", "meals"],
      seatsLeft: 6,
      co2: "142kg"
    },
  ]);

  const airlines = [...new Set(searchResults.map(f => f.airline))];

  const filteredResults = searchResults
    .filter(flight => {
      if (directOnly && flight.stops > 0) return false;
      if (flight.price < priceRange[0] || flight.price > priceRange[1]) return false;
      if (selectedAirlines.length > 0 && !selectedAirlines.includes(flight.airline)) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price": return a.price - b.price;
        case "duration": return parseInt(a.duration) - parseInt(b.duration);
        case "departure": return a.departure.localeCompare(b.departure);
        default: return 0;
      }
    });

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case "wifi": return <Wifi className="w-3.5 h-3.5" />;
      case "entertainment": return <Tv className="w-3.5 h-3.5" />;
      case "meals": return <Coffee className="w-3.5 h-3.5" />;
      case "lounge": return <Luggage className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  const toggleAirline = (airline: string) => {
    setSelectedAirlines(prev => 
      prev.includes(airline) 
        ? prev.filter(a => a !== airline)
        : [...prev, airline]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Sort & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display">Available Flights</h2>
          <p className="text-muted-foreground text-sm">{filteredResults.length} flights found</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Quick Sort Pills */}
          <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-lg">
            {[
              { key: "price", label: "Cheapest", icon: TrendingUp },
              { key: "duration", label: "Fastest", icon: Zap },
              { key: "departure", label: "Earliest", icon: Clock },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSortBy(key as typeof sortBy)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  sortBy === key 
                    ? "bg-sky-500 text-white shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {showFilters && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={cn(filtersOpen && "border-sky-500 bg-sky-500/10")}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {(directOnly || selectedAirlines.length > 0) && (
                <Badge className="ml-2 bg-sky-500 text-white text-xs px-1.5">
                  {(directOnly ? 1 : 0) + selectedAirlines.length}
                </Badge>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Collapsible Filters */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="glass-card overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Price Range */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Price Range</Label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={500}
                      step={10}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>

                  {/* Direct Only */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Stops</Label>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm">Direct flights only</span>
                      <Switch 
                        checked={directOnly} 
                        onCheckedChange={setDirectOnly}
                      />
                    </div>
                  </div>

                  {/* Airlines */}
                  <div className="space-y-3 sm:col-span-2">
                    <Label className="text-sm font-medium">Airlines</Label>
                    <div className="flex flex-wrap gap-2">
                      {airlines.map(airline => (
                        <button
                          key={airline}
                          onClick={() => toggleAirline(airline)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                            selectedAirlines.includes(airline)
                              ? "bg-sky-500 text-white"
                              : "bg-muted hover:bg-muted/80 text-muted-foreground"
                          )}
                        >
                          {airline}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                {(directOnly || selectedAirlines.length > 0 || priceRange[0] > 0 || priceRange[1] < 500) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-4 text-sky-500"
                    onClick={() => {
                      setDirectOnly(false);
                      setSelectedAirlines([]);
                      setPriceRange([0, 500]);
                    }}
                  >
                    Clear all filters
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flight Results */}
      <div className="space-y-3">
        {filteredResults.map((flight, index) => (
          <motion.div
            key={flight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onMouseEnter={() => setHoveredFlight(flight.id)}
            onMouseLeave={() => setHoveredFlight(null)}
          >
            <Card className={cn(
              "glass-card overflow-hidden transition-all duration-300",
              hoveredFlight === flight.id && "border-sky-500/50 shadow-lg shadow-sky-500/10"
            )}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                  {/* Airline Info */}
                  <div className="flex items-center gap-3 lg:w-36">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 flex items-center justify-center text-2xl">
                      {flight.airlineLogo}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{flight.airline}</p>
                      <p className="text-xs text-muted-foreground">{flight.flight}</p>
                    </div>
                  </div>

                  {/* Flight Times */}
                  <div className="flex-1 flex items-center gap-3 sm:gap-6">
                    <div className="text-center min-w-[60px]">
                      <p className="text-xl sm:text-2xl font-bold">{flight.departure}</p>
                      <p className="text-xs text-muted-foreground">JFK</p>
                    </div>

                    <div className="flex-1 flex flex-col items-center relative">
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {flight.duration}
                      </p>
                      <div className="w-full flex items-center">
                        <div className="h-[2px] flex-1 bg-gradient-to-r from-sky-500/50 to-sky-500" />
                        <motion.div 
                          className="mx-2"
                          animate={{ x: hoveredFlight === flight.id ? [0, 5, 0] : 0 }}
                          transition={{ duration: 0.5, repeat: hoveredFlight === flight.id ? Infinity : 0 }}
                        >
                          <Plane className="w-4 h-4 text-sky-500" />
                        </motion.div>
                        <div className="h-[2px] flex-1 bg-gradient-to-r from-sky-500 to-sky-500/50" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {flight.stops === 0 ? (
                          <span className="text-green-500 font-medium">Direct</span>
                        ) : (
                          <span>{flight.stops} stop{flight.stops > 1 ? "s" : ""} {flight.stopCity && `• ${flight.stopCity}`}</span>
                        )}
                      </p>
                    </div>

                    <div className="text-center min-w-[60px]">
                      <p className="text-xl sm:text-2xl font-bold">{flight.arrival}</p>
                      <p className="text-xs text-muted-foreground">LAX</p>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="hidden lg:flex items-center gap-1.5">
                    {flight.amenities.slice(0, 4).map((amenity) => (
                      <div
                        key={amenity}
                        className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title={amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                      >
                        {getAmenityIcon(amenity)}
                      </div>
                    ))}
                  </div>

                  {/* Price & CTA */}
                  <div className="lg:w-36 flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2">
                    <div className="flex items-center gap-2">
                      {flight.isLowest && (
                        <Badge className="bg-green-500/20 text-green-500 text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Best
                        </Badge>
                      )}
                      {flight.isFastest && (
                        <Badge className="bg-sky-500/20 text-sky-500 text-xs">
                          <Zap className="w-3 h-3 mr-1" />
                          Fast
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-sky-400">${flight.price}</p>
                      <p className="text-xs text-muted-foreground">per person</p>
                    </div>
                    {flight.seatsLeft && flight.seatsLeft <= 5 && (
                      <p className="text-xs text-orange-500 font-medium">
                        Only {flight.seatsLeft} left
                      </p>
                    )}
                    <Button 
                      className="w-full lg:w-auto bg-sky-500 hover:bg-sky-600 text-white"
                      onClick={() => onSelectFlight?.(flight)}
                    >
                      Select
                    </Button>
                  </div>
                </div>

                {/* Expandable Details Row */}
                <AnimatePresence>
                  {hoveredFlight === flight.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-4 mt-4 border-t border-border/50"
                    >
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-green-500" />
                          <span>Free cancellation</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Luggage className="w-3.5 h-3.5" />
                          <span>23kg checked bag included</span>
                        </div>
                        {flight.co2 && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-green-500">🌱</span>
                            <span>{flight.co2} CO₂</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 lg:hidden">
                          {flight.amenities.map((amenity) => (
                            <span key={amenity} className="capitalize">{amenity}</span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredResults.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Plane className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No flights found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
          <Button 
            variant="outline"
            onClick={() => {
              setDirectOnly(false);
              setSelectedAirlines([]);
              setPriceRange([0, 500]);
            }}
          >
            Clear all filters
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default FlightSearch;
