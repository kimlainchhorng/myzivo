import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { 
  Plane, Clock, Wifi, Coffee, Tv, Luggage, Star, X,
  Check, Minus, Crown, Leaf, Zap, Shield, ArrowRight,
  ChevronDown, ChevronUp, Sparkles, Armchair, Power,
  Battery, Globe, CreditCard, CalendarCheck,
  TrendingUp, Award, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GeneratedFlight } from '@/data/flightGenerator';
import { toast } from 'sonner';

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
    icon: Plane,
    features: [
      { key: 'departure', label: 'Departure Time', icon: Clock },
      { key: 'arrival', label: 'Arrival Time', icon: Clock },
      { key: 'duration', label: 'Flight Duration', icon: Clock },
      { key: 'stops', label: 'Stops', icon: Globe },
      { key: 'aircraft', label: 'Aircraft', icon: Plane },
    ],
  },
  {
    name: 'Comfort & Amenities',
    icon: Armchair,
    features: [
      { key: 'wifi', label: 'In-Flight WiFi', icon: Wifi },
      { key: 'entertainment', label: 'Entertainment', icon: Tv },
      { key: 'meals', label: 'Meals Included', icon: Coffee },
      { key: 'legroom', label: 'Legroom', icon: Armchair },
      { key: 'powerOutlets', label: 'Power Outlets', icon: Power },
      { key: 'usb', label: 'USB Charging', icon: Battery },
    ],
  },
  {
    name: 'Baggage',
    icon: Luggage,
    features: [
      { key: 'carryOn', label: 'Carry-on Included', icon: Luggage },
      { key: 'checkedBag', label: 'Checked Bag Included', icon: Luggage },
      { key: 'baggageIncluded', label: 'Baggage Allowance', icon: Luggage },
    ],
  },
  {
    name: 'Flexibility',
    icon: CalendarCheck,
    features: [
      { key: 'refundable', label: 'Refundable', icon: CreditCard },
      { key: 'changeAllowed', label: 'Free Changes', icon: CalendarCheck },
      { key: 'seatSelection', label: 'Free Seat Selection', icon: Armchair },
    ],
  },
  {
    name: 'Performance & Value',
    icon: TrendingUp,
    features: [
      { key: 'onTimePerformance', label: 'On-Time Performance', icon: Clock },
      { key: 'carbonOffset', label: 'CO₂ Emissions', icon: Leaf },
      { key: 'category', label: 'Airline Tier', icon: Crown },
      { key: 'value', label: 'Value Score', icon: Award },
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
  const [highlightBest, setHighlightBest] = useState(true);
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);

  const toggleCategory = (name: string) => {
    setExpandedCategories(prev =>
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
  };

  // Calculate value score based on amenities and price
  const calculateValueScore = (flight: GeneratedFlight): number => {
    let score = 0;
    if (flight.wifi) score += 10;
    if (flight.entertainment) score += 10;
    if (flight.meals) score += 15;
    if (flight.stops === 0) score += 20;
    if (flight.category === 'premium') score += 25;
    if (flight.category === 'full-service') score += 15;
    if (flight.refundable) score += 10;
    if (flight.onTimePerformance && flight.onTimePerformance >= 90) score += 10;
    
    // Price factor (lower is better)
    const lowestPrice = Math.min(...flights.map(f => f.price));
    const priceRatio = lowestPrice / flight.price;
    score += Math.round(priceRatio * 20);
    
    return Math.min(100, score);
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
          <span className="text-emerald-400 font-medium">Direct</span>
        ) : (
          <span className="text-amber-400">{flight.stops} stop{flight.stops > 1 ? 's' : ''}</span>
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
      case 'usb':
        return flight.amenities?.includes('usb') || flight.category !== 'low-cost' ? 
          <Check className="w-5 h-5 text-emerald-400" /> : <Minus className="w-5 h-5 text-muted-foreground" />;
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
          <span className="text-emerald-400 font-medium">Free</span>
        ) : (
          <span className="text-amber-400">Fee applies</span>
        );
      case 'seatSelection':
        return flight.category !== 'low-cost' ? (
          <span className="text-emerald-400 font-medium">Free</span>
        ) : (
          <span className="text-amber-400">$15+</span>
        );
      case 'onTimePerformance':
        const otp = flight.onTimePerformance || 85;
        return (
          <span className={cn(
            "font-medium",
            otp >= 90 ? 'text-emerald-400' : otp >= 80 ? 'text-amber-400' : 'text-red-400'
          )}>
            {otp}%
          </span>
        );
      case 'carbonOffset':
        const carbon = flight.carbonOffset || 180;
        return (
          <span className={cn(
            "flex items-center gap-1",
            carbon <= 150 ? 'text-emerald-400' : carbon <= 200 ? 'text-amber-400' : 'text-red-400'
          )}>
            <Leaf className="w-4 h-4" />
            {carbon}kg
          </span>
        );
      case 'category':
        return (
          <Badge className={cn(
            "border-0 text-xs",
            flight.category === 'premium' && 'bg-amber-500/20 text-amber-400',
            flight.category === 'full-service' && 'bg-sky-500/20 text-sky-400',
            flight.category === 'low-cost' && 'bg-emerald-500/20 text-emerald-400'
          )}>
            {flight.category === 'premium' && <Crown className="w-3 h-3 mr-1" />}
            {flight.category === 'premium' ? '5-Star' : flight.category === 'full-service' ? 'Full Service' : 'Budget'}
          </Badge>
        );
      case 'value':
        const valueScore = calculateValueScore(flight);
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
              <motion.div 
                className={cn(
                  "h-full rounded-full",
                  valueScore >= 80 ? 'bg-emerald-500' : valueScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${valueScore}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
            <span className="text-sm font-medium">{valueScore}</span>
          </div>
        );
      default:
        return 'N/A';
    }
  };

  const getBestValue = (key: string): string | null => {
    if (flights.length < 2 || !highlightBest) return null;
    
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
      case 'value':
        const scores = flights.map(f => calculateValueScore(f));
        const maxScore = Math.max(...scores);
        return flights.find((f, i) => scores[i] === maxScore)?.id || null;
      default:
        return null;
    }
  };

  // Check if values differ for filtering
  const valuesDiffer = (key: string): boolean => {
    if (flights.length < 2) return true;
    const values = flights.map(f => JSON.stringify(getFeatureValue(f, key)));
    return new Set(values).size > 1;
  };

  const lowestPrice = Math.min(...flights.map(f => f.price));
  const bestValue = flights.reduce((best, current) => 
    calculateValueScore(current) > calculateValueScore(best) ? current : best
  );

  const handleShareComparison = () => {
    const text = flights.map(f => 
      `${f.airline} ${f.flightNumber}: $${f.price} (${f.departure.code} → ${f.arrival.code})`
    ).join('\n');
    navigator.clipboard.writeText(`Flight Comparison:\n${text}`);
    toast.success('Comparison copied to clipboard!');
  };

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
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleShareComparison}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Filter Options */}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border/30">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="highlight" 
                  checked={highlightBest}
                  onCheckedChange={(checked) => setHighlightBest(checked as boolean)}
                />
                <Label htmlFor="highlight" className="text-sm cursor-pointer">Highlight best values</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="differences" 
                  checked={showDifferencesOnly}
                  onCheckedChange={(checked) => setShowDifferencesOnly(checked as boolean)}
                />
                <Label htmlFor="differences" className="text-sm cursor-pointer">Show differences only</Label>
              </div>
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
                  <motion.div
                    key={flight.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className={cn(
                      "relative overflow-hidden border-border/50",
                      flight.price === lowestPrice && "ring-2 ring-emerald-500",
                      flight.id === bestValue.id && flight.price !== lowestPrice && "ring-2 ring-sky-500"
                    )}>
                      {flight.price === lowestPrice && (
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500" />
                      )}
                      {flight.id === bestValue.id && flight.price !== lowestPrice && (
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-500 to-blue-500" />
                      )}
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/90 dark:bg-muted/50 flex items-center justify-center overflow-hidden border border-border/30">
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
                          <div className="flex flex-col gap-1">
                            {flight.price === lowestPrice && (
                              <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                                <Zap className="w-3 h-3 mr-1" />
                                Lowest
                              </Badge>
                            )}
                            {flight.id === bestValue.id && (
                              <Badge className="bg-sky-500/20 text-sky-400 border-0">
                                <Award className="w-3 h-3 mr-1" />
                                Best Value
                              </Badge>
                            )}
                          </div>
                        </div>

                        <Button 
                          className="w-full mt-4 bg-sky-500 hover:bg-sky-600"
                          onClick={() => onSelect(flight)}
                        >
                          Select Flight
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Feature Comparison */}
            <div className="space-y-4 mt-6">
              {featureCategories.map((category) => {
                const CategoryIcon = category.icon;
                const filteredFeatures = showDifferencesOnly 
                  ? category.features.filter(f => valuesDiffer(f.key))
                  : category.features;

                if (filteredFeatures.length === 0) return null;

                return (
                  <Card key={category.name} className="overflow-hidden border-border/50">
                    <button
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                      onClick={() => toggleCategory(category.name)}
                    >
                      <div className="flex items-center gap-3">
                        <CategoryIcon className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">{category.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {filteredFeatures.length} features
                        </Badge>
                      </div>
                      {expandedCategories.includes(category.name) ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>

                    <AnimatePresence>
                      {expandedCategories.includes(category.name) && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <CardContent className="p-0">
                            {filteredFeatures.map((feature, idx) => {
                              const bestId = getBestValue(feature.key);
                              const FeatureIcon = feature.icon;
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
                                    {FeatureIcon && <FeatureIcon className="w-4 h-4" />}
                                    {feature.label}
                                  </div>
                                  {flights.map(flight => (
                                    <motion.div 
                                      key={flight.id}
                                      className={cn(
                                        "text-sm font-medium flex items-center justify-center",
                                        bestId === flight.id && "relative"
                                      )}
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: idx * 0.05 }}
                                    >
                                      {bestId === flight.id && (
                                        <motion.div 
                                          className="absolute inset-0 bg-emerald-500/10 rounded-xl -m-1"
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                        />
                                      )}
                                      <span className="relative">{getFeatureValue(flight, feature.key)}</span>
                                    </motion.div>
                                  ))}
                                </div>
                              );
                            })}
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
