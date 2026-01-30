import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plane, Clock, Wifi, Coffee, Tv, Luggage, Star, X,
  Check, Minus, Crown, Leaf, Zap, Shield, ArrowRight,
  ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';
import type { GeneratedFlight } from '@/data/flightGenerator';

interface FlightComparisonProps {
  flights: GeneratedFlight[];
  onSelect: (flight: GeneratedFlight) => void;
  onRemove: (flightId: string) => void;
  onClose: () => void;
  maxCompare?: number;
}

const featureCategories = [
  {
    name: 'Flight Details',
    features: [
      { key: 'departure', label: 'Departure Time' },
      { key: 'arrival', label: 'Arrival Time' },
      { key: 'duration', label: 'Flight Duration' },
      { key: 'stops', label: 'Stops' },
      { key: 'aircraft', label: 'Aircraft' },
    ],
  },
  {
    name: 'Comfort & Amenities',
    features: [
      { key: 'wifi', label: 'In-Flight WiFi', icon: Wifi },
      { key: 'entertainment', label: 'Entertainment', icon: Tv },
      { key: 'meals', label: 'Meals Included', icon: Coffee },
      { key: 'legroom', label: 'Legroom' },
      { key: 'powerOutlets', label: 'Power Outlets' },
    ],
  },
  {
    name: 'Baggage',
    features: [
      { key: 'carryOn', label: 'Carry-on Included' },
      { key: 'checkedBag', label: 'Checked Bag Included' },
      { key: 'baggageIncluded', label: 'Baggage Allowance' },
    ],
  },
  {
    name: 'Flexibility',
    features: [
      { key: 'refundable', label: 'Refundable' },
      { key: 'changeAllowed', label: 'Free Changes' },
      { key: 'seatSelection', label: 'Free Seat Selection' },
    ],
  },
  {
    name: 'Performance',
    features: [
      { key: 'onTimePerformance', label: 'On-Time Performance' },
      { key: 'carbonOffset', label: 'CO₂ Emissions' },
      { key: 'category', label: 'Airline Tier' },
    ],
  },
];

export default function FlightComparison({
  flights,
  onSelect,
  onRemove,
  onClose,
  maxCompare = 3,
}: FlightComparisonProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    featureCategories.map(c => c.name)
  );

  const toggleCategory = (name: string) => {
    setExpandedCategories(prev =>
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
  };

  const getFeatureValue = (flight: GeneratedFlight, key: string): React.ReactNode => {
    switch (key) {
      case 'departure':
        return flight.departure.time;
      case 'arrival':
        return flight.arrival.time;
      case 'duration':
        return flight.duration;
      case 'stops':
        return flight.stops === 0 ? (
          <span className="text-emerald-400">Direct</span>
        ) : (
          <span className="text-amber-400">{flight.stops} stop</span>
        );
      case 'aircraft':
        return flight.aircraft || 'N/A';
      case 'wifi':
        return flight.wifi ? <Check className="w-5 h-5 text-emerald-400" /> : <Minus className="w-5 h-5 text-muted-foreground" />;
      case 'entertainment':
        return flight.entertainment ? <Check className="w-5 h-5 text-emerald-400" /> : <Minus className="w-5 h-5 text-muted-foreground" />;
      case 'meals':
        return flight.meals ? <Check className="w-5 h-5 text-emerald-400" /> : <Minus className="w-5 h-5 text-muted-foreground" />;
      case 'legroom':
        return flight.legroom || '31"';
      case 'powerOutlets':
        return flight.amenities?.includes('power') ? <Check className="w-5 h-5 text-emerald-400" /> : <Minus className="w-5 h-5 text-muted-foreground" />;
      case 'carryOn':
        return <Check className="w-5 h-5 text-emerald-400" />;
      case 'checkedBag':
        return flight.baggageIncluded?.includes('checked') ? (
          <Check className="w-5 h-5 text-emerald-400" />
        ) : (
          <Minus className="w-5 h-5 text-muted-foreground" />
        );
      case 'baggageIncluded':
        return flight.baggageIncluded || 'Personal item only';
      case 'refundable':
        return flight.refundable ? (
          <Check className="w-5 h-5 text-emerald-400" />
        ) : (
          <Minus className="w-5 h-5 text-muted-foreground" />
        );
      case 'changeAllowed':
        return flight.category === 'premium' ? (
          <Check className="w-5 h-5 text-emerald-400" />
        ) : (
          <span className="text-amber-400">Fee applies</span>
        );
      case 'seatSelection':
        return flight.category !== 'low-cost' ? (
          <Check className="w-5 h-5 text-emerald-400" />
        ) : (
          <span className="text-amber-400">$15+</span>
        );
      case 'onTimePerformance':
        const otp = flight.onTimePerformance || 85;
        return (
          <span className={cn(
            otp >= 90 ? 'text-emerald-400' : otp >= 80 ? 'text-amber-400' : 'text-red-400'
          )}>
            {otp}%
          </span>
        );
      case 'carbonOffset':
        return (
          <span className="flex items-center gap-1 text-emerald-400">
            <Leaf className="w-4 h-4" />
            {flight.carbonOffset || 180}kg
          </span>
        );
      case 'category':
        return (
          <Badge className={cn(
            "border-0",
            flight.category === 'premium' && 'bg-amber-500/20 text-amber-400',
            flight.category === 'full-service' && 'bg-sky-500/20 text-sky-400',
            flight.category === 'low-cost' && 'bg-emerald-500/20 text-emerald-400'
          )}>
            {flight.category === 'premium' && <Crown className="w-3 h-3 mr-1" />}
            {flight.category === 'premium' ? '5-Star' : flight.category === 'full-service' ? 'Full Service' : 'Budget'}
          </Badge>
        );
      default:
        return 'N/A';
    }
  };

  const getBestValue = (key: string): string | null => {
    if (flights.length < 2) return null;
    
    switch (key) {
      case 'duration':
        const durations = flights.map(f => parseInt(f.duration.replace(/\D/g, '')) || 999);
        const minDuration = Math.min(...durations);
        return flights.find((f, i) => durations[i] === minDuration)?.id || null;
      case 'stops':
        const minStops = Math.min(...flights.map(f => f.stops));
        return flights.find(f => f.stops === minStops)?.id || null;
      case 'onTimePerformance':
        const maxOtp = Math.max(...flights.map(f => f.onTimePerformance || 0));
        return flights.find(f => (f.onTimePerformance || 0) === maxOtp)?.id || null;
      case 'carbonOffset':
        const minCarbon = Math.min(...flights.map(f => f.carbonOffset || 999));
        return flights.find(f => (f.carbonOffset || 999) === minCarbon)?.id || null;
      default:
        return null;
    }
  };

  const lowestPrice = Math.min(...flights.map(f => f.price));

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-border/50 bg-card/50 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-sky-400" />
                  Compare Flights
                </h2>
                <p className="text-sm text-muted-foreground">
                  Comparing {flights.length} of {maxCompare} flights
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="container mx-auto px-4 py-6">
            {/* Flight Cards Header */}
            <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl pb-4">
              <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${flights.length}, 1fr)` }}>
                <div /> {/* Empty cell for feature labels */}
                {flights.map((flight, idx) => (
                  <Card key={flight.id} className={cn(
                    "relative overflow-hidden border-border/50",
                    flight.price === lowestPrice && "ring-2 ring-emerald-500"
                  )}>
                    {flight.price === lowestPrice && (
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500" />
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white/90 dark:bg-muted/50 flex items-center justify-center overflow-hidden border border-border/30">
                            <img 
                              src={flight.logo} 
                              alt={flight.airline}
                              className="w-8 h-8 object-contain"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{flight.airline}</p>
                            <p className="text-xs text-muted-foreground">{flight.flightNumber}</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 -mt-1 -mr-1"
                          onClick={() => onRemove(flight.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 text-sm mb-3">
                        <span className="font-semibold">{flight.departure.code}</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{flight.arrival.code}</span>
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-2xl font-bold">${flight.price}</p>
                          <p className="text-xs text-muted-foreground">per person</p>
                        </div>
                        {flight.price === lowestPrice && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                            <Zap className="w-3 h-3 mr-1" />
                            Best Price
                          </Badge>
                        )}
                      </div>

                      <Button 
                        className="w-full mt-4 bg-sky-500 hover:bg-sky-600"
                        onClick={() => onSelect(flight)}
                      >
                        Select Flight
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Feature Comparison */}
            <div className="space-y-4 mt-6">
              {featureCategories.map((category) => (
                <Card key={category.name} className="overflow-hidden border-border/50">
                  <button
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                    onClick={() => toggleCategory(category.name)}
                  >
                    <h3 className="font-semibold">{category.name}</h3>
                    {expandedCategories.includes(category.name) ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>

                  {expandedCategories.includes(category.name) && (
                    <CardContent className="p-0">
                      {category.features.map((feature, idx) => {
                        const bestId = getBestValue(feature.key);
                        return (
                          <div 
                            key={feature.key}
                            className={cn(
                              "grid gap-4 py-3 px-4 border-t border-border/30",
                              idx % 2 === 0 && "bg-muted/20"
                            )}
                            style={{ gridTemplateColumns: `200px repeat(${flights.length}, 1fr)` }}
                          >
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {feature.icon && <feature.icon className="w-4 h-4" />}
                              {feature.label}
                            </div>
                            {flights.map(flight => (
                              <div 
                                key={flight.id}
                                className={cn(
                                  "text-sm font-medium flex items-center justify-center",
                                  bestId === flight.id && "relative"
                                )}
                              >
                                {bestId === flight.id && (
                                  <div className="absolute inset-0 bg-emerald-500/10 rounded-lg -m-1" />
                                )}
                                <span className="relative">{getFeatureValue(flight, feature.key)}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
