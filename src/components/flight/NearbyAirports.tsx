import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  MapPin,
  Car,
  Clock,
  DollarSign,
  Plane,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  Navigation,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NearbyAirport {
  id: string;
  code: string;
  name: string;
  city: string;
  distance: number; // miles from origin
  driveTime: number; // minutes
  priceToDestination: number;
  priceDiff: number; // vs main airport (negative = cheaper)
  airlines: string[];
  hasDirectFlight: boolean;
}

interface NearbyAirportsProps {
  className?: string;
  mainAirport?: string;
  destination?: string;
  mainPrice?: number;
}

const MOCK_NEARBY_AIRPORTS: NearbyAirport[] = [
  { 
    id: '1', 
    code: 'EWR', 
    name: 'Newark Liberty', 
    city: 'Newark, NJ',
    distance: 18,
    driveTime: 35,
    priceToDestination: 385,
    priceDiff: -65,
    airlines: ['United', 'Delta', 'JetBlue'],
    hasDirectFlight: true
  },
  { 
    id: '2', 
    code: 'LGA', 
    name: 'LaGuardia', 
    city: 'Queens, NY',
    distance: 8,
    driveTime: 25,
    priceToDestination: 420,
    priceDiff: -30,
    airlines: ['American', 'Delta', 'Southwest'],
    hasDirectFlight: true
  },
  { 
    id: '3', 
    code: 'HPN', 
    name: 'Westchester County', 
    city: 'White Plains, NY',
    distance: 33,
    driveTime: 50,
    priceToDestination: 510,
    priceDiff: 60,
    airlines: ['JetBlue', 'United'],
    hasDirectFlight: false
  },
  { 
    id: '4', 
    code: 'SWF', 
    name: 'Stewart Intl', 
    city: 'New Windsor, NY',
    distance: 60,
    driveTime: 75,
    priceToDestination: 295,
    priceDiff: -155,
    airlines: ['Allegiant', 'Frontier'],
    hasDirectFlight: true
  },
  { 
    id: '5', 
    code: 'PHL', 
    name: 'Philadelphia Intl', 
    city: 'Philadelphia, PA',
    distance: 95,
    driveTime: 110,
    priceToDestination: 320,
    priceDiff: -130,
    airlines: ['American', 'Spirit', 'Frontier'],
    hasDirectFlight: true
  },
];

export const NearbyAirports = ({ 
  className, 
  mainAirport = "JFK",
  destination = "London",
  mainPrice = 450
}: NearbyAirportsProps) => {
  const navigate = useNavigate();
  const [maxDistance, setMaxDistance] = useState(100);
  const [sortBy, setSortBy] = useState<'price' | 'distance' | 'savings'>('savings');
  const [expandedAirport, setExpandedAirport] = useState<string | null>(null);
  const [selectedAirport, setSelectedAirport] = useState<string | null>(null);

  const filteredAirports = useMemo(() => {
    const filtered = MOCK_NEARBY_AIRPORTS.filter(a => a.distance <= maxDistance);
    
    return [...filtered].sort((a, b) => {
      if (sortBy === 'price') return a.priceToDestination - b.priceToDestination;
      if (sortBy === 'distance') return a.distance - b.distance;
      return a.priceDiff - b.priceDiff; // savings (most negative first)
    });
  }, [maxDistance, sortBy]);

  const bestSavings = Math.min(...MOCK_NEARBY_AIRPORTS.map(a => a.priceDiff));
  const cheapestAirport = MOCK_NEARBY_AIRPORTS.find(a => a.priceDiff === bestSavings);

  return (
    <Card className={cn("overflow-hidden border-border/50 bg-card/50 backdrop-blur", className)}>
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/40 flex items-center justify-center">
              <Navigation className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-xl">Nearby Airports</CardTitle>
              <p className="text-sm text-muted-foreground">
                Compare prices from airports near {mainAirport}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Best Deal Banner */}
        {cheapestAirport && (
          <div className="p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border-b border-emerald-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-emerald-400 font-medium">Best Deal Found!</p>
                  <p className="text-sm text-muted-foreground">
                    Save ${Math.abs(bestSavings)} flying from {cheapestAirport.code}
                  </p>
                </div>
              </div>
              <Button 
                size="sm" 
                className="bg-emerald-500 hover:bg-emerald-600 gap-1"
                onClick={() => {
                  // OTA Mode: Navigate to internal search with cheapest airport
                  const params = new URLSearchParams({
                    origin: cheapestAirport.code,
                    dest: destination,
                  });
                  navigate(`/flights/results?${params.toString()}`);
                }}
              >
                View Deal
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="p-4 border-b border-border/50 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Maximum Distance</label>
              <span className="text-sm text-muted-foreground">{maxDistance} miles</span>
            </div>
            <Slider
              value={[maxDistance]}
              onValueChange={(v) => setMaxDistance(v[0])}
              min={10}
              max={150}
              step={5}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={sortBy === 'savings' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('savings')}
            >
              Best Savings
            </Button>
            <Button
              variant={sortBy === 'price' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('price')}
            >
              Lowest Price
            </Button>
            <Button
              variant={sortBy === 'distance' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('distance')}
            >
              Closest
            </Button>
          </div>
        </div>

        {/* Main Airport Reference */}
        <div className="p-4 border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Plane className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{mainAirport} - Your Selected Airport</p>
                <p className="text-sm text-muted-foreground">to {destination}</p>
              </div>
            </div>
            <p className="text-xl font-bold">${mainPrice}</p>
          </div>
        </div>

        {/* Airport List */}
        <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
          {filteredAirports.map((airport, i) => (
            <motion.div
              key={airport.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "rounded-xl border transition-all overflow-hidden",
                selectedAirport === airport.id
                  ? "border-primary bg-primary/5"
                  : "border-border/50 bg-muted/30 hover:border-border"
              )}
            >
              <div 
                className="p-4 cursor-pointer"
                onClick={() => setExpandedAirport(expandedAirport === airport.id ? null : airport.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
                    <span className="font-bold text-lg">{airport.code}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{airport.name}</h4>
                      {airport.hasDirectFlight && (
                        <Badge variant="outline" className="text-xs">Direct</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Car className="w-3 h-3" />
                        {airport.distance} mi
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {airport.driveTime} min
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold">${airport.priceToDestination}</p>
                    <Badge className={cn(
                      "text-xs",
                      airport.priceDiff < 0 
                        ? "bg-emerald-500/20 text-emerald-400" 
                        : airport.priceDiff > 0
                        ? "bg-rose-500/20 text-rose-400"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {airport.priceDiff < 0 ? '-' : airport.priceDiff > 0 ? '+' : ''}
                      ${Math.abs(airport.priceDiff)}
                    </Badge>
                  </div>

                  {expandedAirport === airport.id ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedAirport === airport.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-4 border-t border-border/50"
                >
                  <div className="pt-4 space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Airlines with flights:</p>
                      <div className="flex flex-wrap gap-2">
                        {airport.airlines.map(airline => (
                          <Badge key={airline} variant="outline" className="text-xs">
                            {airline}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Total Cost Comparison</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Flight</p>
                          <p className="font-medium">${airport.priceToDestination}</p>
                        </div>
                        <div className="text-muted-foreground">+</div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">~Gas/Parking</p>
                          <p className="font-medium">${Math.round(airport.distance * 0.5)}</p>
                        </div>
                        <div className="text-muted-foreground">=</div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="font-bold text-primary">
                            ${airport.priceToDestination + Math.round(airport.distance * 0.5)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 gap-2"
                        onClick={() => {
                          setSelectedAirport(airport.id);
                          // OTA Mode: Navigate to internal search with this airport
                          const params = new URLSearchParams({
                            origin: airport.code,
                            dest: destination,
                          });
                          navigate(`/flights/results?${params.toString()}`);
                        }}
                      >
                        <Plane className="w-4 h-4" />
                        Search Flights
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                      <Button variant="outline">
                        <Navigation className="w-4 h-4 mr-2" />
                        Directions
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NearbyAirports;
