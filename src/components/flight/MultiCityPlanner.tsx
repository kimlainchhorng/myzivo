import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Plus,
  Minus,
  MapPin,
  Calendar as CalendarIcon,
  Plane,
  ArrowRight,
  GripVertical,
  RotateCcw,
  Sparkles,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Map,
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { format, differenceInDays, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import AirportAutocomplete from "./AirportAutocomplete";

interface FlightLeg {
  id: string;
  from: { code: string; city: string } | null;
  to: { code: string; city: string } | null;
  date: Date | null;
  stayDuration?: number;
}

interface MultiCityPlannerProps {
  onSearch: (legs: FlightLeg[], passengers: number) => void;
  maxLegs?: number;
}

const suggestedItineraries = [
  {
    name: "European Capitals",
    legs: [
      { from: "JFK", to: "LHR", city: "London" },
      { from: "LHR", to: "CDG", city: "Paris" },
      { from: "CDG", to: "FCO", city: "Rome" },
      { from: "FCO", to: "JFK", city: "Return" },
    ],
    duration: "14 days",
    savings: "15%",
  },
  {
    name: "Asia Explorer",
    legs: [
      { from: "LAX", to: "NRT", city: "Tokyo" },
      { from: "NRT", to: "HKG", city: "Hong Kong" },
      { from: "HKG", to: "SIN", city: "Singapore" },
      { from: "SIN", to: "LAX", city: "Return" },
    ],
    duration: "21 days",
    savings: "20%",
  },
  {
    name: "South American Adventure",
    legs: [
      { from: "MIA", to: "BOG", city: "Bogotá" },
      { from: "BOG", to: "LIM", city: "Lima" },
      { from: "LIM", to: "GRU", city: "São Paulo" },
      { from: "GRU", to: "MIA", city: "Return" },
    ],
    duration: "18 days",
    savings: "18%",
  },
];

const MultiCityPlanner = ({ onSearch, maxLegs = 6 }: MultiCityPlannerProps) => {
  const [legs, setLegs] = useState<FlightLeg[]>([
    { id: "1", from: null, to: null, date: null },
    { id: "2", from: null, to: null, date: null },
  ]);
  const [passengers, setPassengers] = useState(1);
  const [showMap, setShowMap] = useState(false);

  const addLeg = () => {
    if (legs.length < maxLegs) {
      const lastLeg = legs[legs.length - 1];
      setLegs([
        ...legs,
        {
          id: Date.now().toString(),
          from: lastLeg.to,
          to: null,
          date: lastLeg.date ? addDays(lastLeg.date, 3) : null,
        },
      ]);
    }
  };

  const removeLeg = (id: string) => {
    if (legs.length > 2) {
      setLegs(legs.filter((leg) => leg.id !== id));
    }
  };

  const updateLeg = (id: string, updates: Partial<FlightLeg>) => {
    setLegs(
      legs.map((leg) => {
        if (leg.id === id) {
          const updated = { ...leg, ...updates };
          // Auto-connect next leg's "from" to this leg's "to"
          if (updates.to) {
            const legIndex = legs.findIndex((l) => l.id === id);
            if (legIndex < legs.length - 1) {
              const nextLeg = legs[legIndex + 1];
              updateLeg(nextLeg.id, { from: updates.to });
            }
          }
          return updated;
        }
        return leg;
      })
    );
  };

  const handleReorder = (newOrder: FlightLeg[]) => {
    // Reconnect the legs after reordering
    const reconnected = newOrder.map((leg, index) => {
      if (index > 0) {
        return { ...leg, from: newOrder[index - 1].to };
      }
      return leg;
    });
    setLegs(reconnected);
  };

  const resetPlanner = () => {
    setLegs([
      { id: "1", from: null, to: null, date: null },
      { id: "2", from: null, to: null, date: null },
    ]);
  };

  const applySuggestedItinerary = (itinerary: typeof suggestedItineraries[0]) => {
    const today = new Date();
    const newLegs = itinerary.legs.map((leg, index) => ({
      id: Date.now().toString() + index,
      from: { code: leg.from, city: leg.city },
      to: { code: leg.to, city: leg.city },
      date: addDays(today, index * 4 + 7),
      stayDuration: 4,
    }));
    setLegs(newLegs);
  };

  const calculateTotalDuration = () => {
    if (legs.length < 2 || !legs[0].date || !legs[legs.length - 1].date) return null;
    return differenceInDays(legs[legs.length - 1].date!, legs[0].date!);
  };

  const isValidItinerary = legs.every(
    (leg) => leg.from && leg.to && leg.date
  );

  const totalDuration = calculateTotalDuration();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            Multi-City Trip Planner
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Plan complex itineraries with up to {maxLegs} destinations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetPlanner}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMap(!showMap)}
          >
            <Map className="h-4 w-4 mr-1" />
            {showMap ? "Hide" : "Show"} Map
          </Button>
        </div>
      </div>

      {/* Suggested Itineraries */}
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Popular Multi-City Routes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {suggestedItineraries.map((itinerary, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="cursor-pointer hover:border-primary/50 transition-all"
                  onClick={() => applySuggestedItinerary(itinerary)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{itinerary.name}</span>
                      <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600">
                        Save {itinerary.savings}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground overflow-hidden">
                      {itinerary.legs.map((leg, legIdx) => (
                        <span key={legIdx} className="flex items-center">
                          <span className="font-mono">{leg.from}</span>
                          {legIdx < itinerary.legs.length - 1 && (
                            <ArrowRight className="h-3 w-3 mx-0.5" />
                          )}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {itinerary.duration}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Flight Legs */}
      <Card>
        <CardContent className="p-4">
          <Reorder.Group axis="y" values={legs} onReorder={handleReorder} className="space-y-4">
            <AnimatePresence>
              {legs.map((leg, index) => (
                <Reorder.Item
                  key={leg.id}
                  value={leg}
                  className="relative"
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-muted">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Drag Handle */}
                          <div className="pt-2 cursor-grab active:cursor-grabbing">
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                          </div>

                          {/* Flight Number Badge */}
                          <div className="flex-shrink-0 pt-1">
                            <Badge
                              variant="outline"
                              className="w-8 h-8 rounded-full flex items-center justify-center p-0 font-bold"
                            >
                              {index + 1}
                            </Badge>
                          </div>

                          {/* Leg Details */}
                          <div className="flex-1 grid gap-4 md:grid-cols-3">
                            {/* From */}
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                <Plane className="h-3 w-3 rotate-[-45deg]" />
                                From
                              </Label>
                              <AirportAutocomplete
                                value={leg.from?.code || ""}
                                onChange={(code) =>
                                  updateLeg(leg.id, {
                                    from: { code, city: code },
                                  })
                                }
                                placeholder="Origin"
                              />
                              {index > 0 && leg.from && (
                                <p className="text-xs text-muted-foreground">
                                  Auto-connected from previous leg
                                </p>
                              )}
                            </div>

                            {/* To */}
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                To
                              </Label>
                              <AirportAutocomplete
                                value={leg.to?.code || ""}
                                onChange={(code) =>
                                  updateLeg(leg.id, {
                                    to: { code, city: code },
                                  })
                                }
                                placeholder="Destination"
                              />
                            </div>

                            {/* Date */}
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" />
                                Departure Date
                              </Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !leg.date && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {leg.date ? format(leg.date, "PPP") : "Select date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={leg.date || undefined}
                                    onSelect={(date) => updateLeg(leg.id, { date })}
                                    disabled={(date) => {
                                      const today = new Date();
                                      today.setHours(0, 0, 0, 0);
                                      if (date < today) return true;
                                      // Must be after previous leg's date
                                      if (index > 0 && legs[index - 1].date) {
                                        return date <= legs[index - 1].date!;
                                      }
                                      return false;
                                    }}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>

                          {/* Remove Button */}
                          {legs.length > 2 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => removeLeg(leg.id)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        {/* Stay Duration */}
                        {index < legs.length - 1 && leg.date && legs[index + 1]?.date && (
                          <div className="mt-3 ml-16 flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>
                              Stay in {leg.to?.city || "destination"}:{" "}
                              <span className="font-medium text-foreground">
                                {differenceInDays(legs[index + 1].date!, leg.date)} days
                              </span>
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Connection Line */}
                    {index < legs.length - 1 && (
                      <div className="flex items-center justify-center py-2">
                        <div className="w-px h-6 bg-border" />
                      </div>
                    )}
                  </motion.div>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>

          {/* Add Leg Button */}
          {legs.length < maxLegs && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex justify-center"
            >
              <Button variant="outline" onClick={addLeg} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Another Destination
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Passengers */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Passengers</Label>
              <p className="text-sm text-muted-foreground">Number of travelers</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPassengers(Math.max(1, passengers - 1))}
                disabled={passengers <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-bold text-lg">{passengers}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPassengers(Math.min(9, passengers + 1))}
                disabled={passengers >= 9}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary & Search */}
      <Card className={cn(
        "transition-all",
        isValidItinerary 
          ? "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20" 
          : "border-dashed"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Flights</p>
                  <p className="font-bold">{legs.length}</p>
                </div>
              </div>
              {totalDuration && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Duration</p>
                    <p className="font-bold">{totalDuration} days</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                {isValidItinerary ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-bold">
                    {isValidItinerary ? "Ready to search" : "Complete all legs"}
                  </p>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              disabled={!isValidItinerary}
              onClick={() => onSearch(legs, passengers)}
              className="gap-2 bg-gradient-to-r from-sky-500 to-blue-600"
            >
              <DollarSign className="h-4 w-4" />
              Search Multi-City Flights
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiCityPlanner;
export type { FlightLeg };
