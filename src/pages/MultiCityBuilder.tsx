/**
 * Multi-City Trip Builder
 * Interactive visual planner for complex multi-stop itineraries
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  MapPin,
  Plus,
  X,
  GripVertical,
  Plane,
  Building2,
  Car,
  Compass,
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  ArrowRight,
  Save,
  Search,
  Loader2,
  ChevronDown,
  Route,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays, differenceInDays } from "date-fns";
import { useCreateTrip, useCreateTripItem } from "@/hooks/useTripItineraries";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import NavBar from "@/components/home/NavBar";
import Footer from "@/components/Footer";

interface CityStop {
  id: string;
  city: string;
  code: string;
  country: string;
  arrivalDate: Date | undefined;
  departureDate: Date | undefined;
  nights: number;
  activities: Activity[];
  budget: number;
}

interface Activity {
  id: string;
  type: "flight" | "hotel" | "car" | "activity";
  title: string;
  cost: number;
}

const POPULAR_ROUTES = [
  {
    name: "European Classics",
    stops: [
      { city: "London", code: "LHR", country: "UK" },
      { city: "Paris", code: "CDG", country: "France" },
      { city: "Rome", code: "FCO", country: "Italy" },
      { city: "Barcelona", code: "BCN", country: "Spain" },
    ],
  },
  {
    name: "Southeast Asia",
    stops: [
      { city: "Bangkok", code: "BKK", country: "Thailand" },
      { city: "Siem Reap", code: "REP", country: "Cambodia" },
      { city: "Ho Chi Minh", code: "SGN", country: "Vietnam" },
      { city: "Bali", code: "DPS", country: "Indonesia" },
    ],
  },
  {
    name: "US Road Trip",
    stops: [
      { city: "New York", code: "JFK", country: "USA" },
      { city: "Chicago", code: "ORD", country: "USA" },
      { city: "Denver", code: "DEN", country: "USA" },
      { city: "San Francisco", code: "SFO", country: "USA" },
    ],
  },
];

const ACTIVITY_TEMPLATES: Activity[] = [
  { id: "", type: "flight", title: "Flight", cost: 350 },
  { id: "", type: "hotel", title: "Hotel Stay", cost: 120 },
  { id: "", type: "car", title: "Car Rental", cost: 55 },
  { id: "", type: "activity", title: "Tour / Activity", cost: 80 },
];

const activityIcons = {
  flight: Plane,
  hotel: Building2,
  car: Car,
  activity: Compass,
};

function createStop(overrides?: Partial<CityStop>): CityStop {
  return {
    id: `stop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    city: "",
    code: "",
    country: "",
    arrivalDate: undefined,
    departureDate: undefined,
    nights: 3,
    activities: [],
    budget: 0,
    ...overrides,
  };
}

export default function MultiCityBuilder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createTrip = useCreateTrip();
  const createItem = useCreateTripItem();

  const [stops, setStops] = useState<CityStop[]>([
    createStop({ city: "", code: "", country: "" }),
    createStop({ city: "", code: "", country: "" }),
  ]);
  const [tripName, setTripName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [expandedStop, setExpandedStop] = useState<string | null>(null);

  const updateStop = useCallback((id: string, updates: Partial<CityStop>) => {
    setStops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  }, []);

  const addStop = () => {
    if (stops.length >= 8) return;
    const lastStop = stops[stops.length - 1];
    setStops((prev) => [
      ...prev,
      createStop({
        arrivalDate: lastStop?.departureDate
          ? addDays(lastStop.departureDate, 0)
          : undefined,
      }),
    ]);
  };

  const removeStop = (id: string) => {
    if (stops.length <= 2) return;
    setStops((prev) => prev.filter((s) => s.id !== id));
  };

  const addActivity = (stopId: string, template: (typeof ACTIVITY_TEMPLATES)[0]) => {
    setStops((prev) =>
      prev.map((s) =>
        s.id === stopId
          ? {
              ...s,
              activities: [
                ...s.activities,
                {
                  ...template,
                  id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                },
              ],
            }
          : s
      )
    );
  };

  const removeActivity = (stopId: string, activityId: string) => {
    setStops((prev) =>
      prev.map((s) =>
        s.id === stopId
          ? { ...s, activities: s.activities.filter((a) => a.id !== activityId) }
          : s
      )
    );
  };

  const loadTemplate = (route: (typeof POPULAR_ROUTES)[0]) => {
    const baseDate = addDays(new Date(), 14);
    let currentDate = baseDate;

    const newStops = route.stops.map((s, i) => {
      const arrival = currentDate;
      const nights = i === route.stops.length - 1 ? 0 : 3;
      const departure = addDays(arrival, nights);
      currentDate = departure;
      return createStop({
        city: s.city,
        code: s.code,
        country: s.country,
        arrivalDate: arrival,
        departureDate: i === route.stops.length - 1 ? undefined : departure,
        nights,
      });
    });

    setStops(newStops);
    setTripName(route.name);
    toast.success(`Loaded "${route.name}" template`);
  };

  const totalNights = stops.reduce((sum, s) => sum + s.nights, 0);
  const totalFlights = stops.length - 1;
  const totalCost = stops.reduce(
    (sum, s) =>
      sum + s.activities.reduce((aSum, a) => aSum + a.cost, 0),
    0
  );

  const handleSaveTrip = async () => {
    if (!user) {
      toast.error("Please log in to save trips");
      navigate("/login");
      return;
    }

    const filledStops = stops.filter((s) => s.city);
    if (filledStops.length < 2) {
      toast.error("Add at least 2 cities to save");
      return;
    }

    setIsSaving(true);
    try {
      const title =
        tripName ||
        `${filledStops[0].city} → ${filledStops[filledStops.length - 1].city}`;
      const trip = await createTrip.mutateAsync({
        title,
        destination: filledStops.map((s) => s.city).join(" → "),
        start_date: filledStops[0].arrivalDate
          ? format(filledStops[0].arrivalDate, "yyyy-MM-dd")
          : undefined,
        end_date: filledStops[filledStops.length - 1].departureDate
          ? format(
              filledStops[filledStops.length - 1].departureDate!,
              "yyyy-MM-dd"
            )
          : undefined,
        total_estimated_cost_cents: totalCost * 100,
      });

      // Create trip items for each stop's activities
      for (const stop of filledStops) {
        // Add a flight item between stops
        const stopIndex = filledStops.indexOf(stop);
        if (stopIndex < filledStops.length - 1) {
          await createItem.mutateAsync({
            itinerary_id: trip.id,
            item_type: "flight",
            title: `${stop.city} (${stop.code}) → ${filledStops[stopIndex + 1].city} (${filledStops[stopIndex + 1].code})`,
            location: `${stop.code} → ${filledStops[stopIndex + 1].code}`,
            start_datetime: stop.departureDate
              ? stop.departureDate.toISOString()
              : undefined,
            sort_order: stopIndex * 10,
          });
        }

        // Add activities
        for (const act of stop.activities) {
          await createItem.mutateAsync({
            itinerary_id: trip.id,
            item_type: act.type,
            title: `${act.title} in ${stop.city}`,
            location: `${stop.city}, ${stop.country}`,
            estimated_cost_cents: act.cost * 100,
            sort_order: stopIndex * 10 + stop.activities.indexOf(act) + 1,
          });
        }
      }

      navigate(`/trip/${trip.id}`);
    } catch (err) {
      toast.error("Failed to save trip");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      <main className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Route className="w-3 h-3 mr-1" />
            Multi-City Builder
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Plan Your Multi-Stop Journey
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Add cities, set durations, and plan activities for each stop.
            Save your itinerary and search flights when ready.
          </p>
        </motion.div>

        {/* Quick Templates */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {POPULAR_ROUTES.map((route) => (
            <Button
              key={route.name}
              variant="outline"
              size="sm"
              className="rounded-full gap-1.5 text-xs"
              onClick={() => loadTemplate(route)}
            >
              <Sparkles className="w-3 h-3 text-primary" />
              {route.name}
            </Button>
          ))}
        </div>

        {/* Trip Name */}
        <div className="mb-6">
          <Input
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            placeholder="Name your trip (e.g., Summer Europe Adventure)"
            className="text-center text-lg font-medium h-12 rounded-xl border-dashed"
          />
        </div>

        {/* Stops List */}
        <div className="space-y-0 relative">
          <AnimatePresence mode="popLayout">
            {stops.map((stop, index) => {
              const isExpanded = expandedStop === stop.id;
              const Icon = index === 0 ? Plane : index === stops.length - 1 ? MapPin : MapPin;

              return (
                <motion.div
                  key={stop.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  {/* Connection line */}
                  {index < stops.length - 1 && (
                    <div className="absolute left-[27px] top-[72px] bottom-0 w-0.5 bg-gradient-to-b from-primary/40 to-primary/10 z-0" />
                  )}

                  <Card
                    className={cn(
                      "mb-3 relative z-10 transition-all duration-200",
                      isExpanded
                        ? "border-primary/30 shadow-lg shadow-primary/5"
                        : "border-border/50 hover:border-border"
                    )}
                  >
                    <CardContent className="p-4">
                      {/* Main row */}
                      <div className="flex items-center gap-3">
                        {/* Stop number */}
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm",
                            index === 0
                              ? "bg-primary text-primary-foreground"
                              : index === stops.length - 1
                                ? "bg-accent/20 text-accent-foreground"
                                : "bg-muted text-muted-foreground"
                          )}
                        >
                          {index + 1}
                        </div>

                        {/* City input */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Input
                              value={stop.city}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateStop(stop.id, {
                                  city: val,
                                  code: val.slice(0, 3).toUpperCase(),
                                });
                              }}
                              placeholder={
                                index === 0
                                  ? "Starting city..."
                                  : index === stops.length - 1
                                    ? "Final destination..."
                                    : "Add a stop..."
                              }
                              className="h-10 rounded-lg border-0 bg-muted/50 font-medium"
                            />
                            {stop.code && (
                              <Badge variant="outline" className="shrink-0 text-xs">
                                {stop.code}
                              </Badge>
                            )}
                          </div>

                          {/* Nights row */}
                          {index > 0 && (
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <button
                                  onClick={() =>
                                    updateStop(stop.id, {
                                      nights: Math.max(0, stop.nights - 1),
                                    })
                                  }
                                  className="w-5 h-5 rounded bg-muted hover:bg-muted/80 flex items-center justify-center"
                                  aria-label="Decrease nights"
                                >
                                  -
                                </button>
                                <span className="w-6 text-center font-semibold text-foreground">
                                  {stop.nights}
                                </span>
                                <button
                                  onClick={() =>
                                    updateStop(stop.id, { nights: stop.nights + 1 })
                                  }
                                  className="w-5 h-5 rounded bg-muted hover:bg-muted/80 flex items-center justify-center"
                                  aria-label="Increase nights"
                                >
                                  +
                                </button>
                                <span>nights</span>
                              </div>

                              {/* Date picker */}
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                                    <CalendarIcon className="w-3 h-3" />
                                    {stop.arrivalDate
                                      ? format(stop.arrivalDate, "MMM d")
                                      : "Set date"}
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={stop.arrivalDate}
                                    onSelect={(date) =>
                                      updateStop(stop.id, {
                                        arrivalDate: date,
                                        departureDate: date
                                          ? addDays(date, stop.nights)
                                          : undefined,
                                      })
                                    }
                                    initialFocus
                                    className="pointer-events-auto"
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              setExpandedStop(isExpanded ? null : stop.id)
                            }
                            aria-label="Toggle details"
                          >
                            <ChevronDown
                              className={cn(
                                "w-4 h-4 transition-transform",
                                isExpanded && "rotate-180"
                              )}
                            />
                          </Button>
                          {stops.length > 2 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive/60 hover:text-destructive"
                              onClick={() => removeStop(stop.id)}
                              aria-label="Remove stop"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Expanded: activities */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <Separator className="my-3" />

                            {/* Activities list */}
                            <div className="space-y-2 mb-3">
                              {stop.activities.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center py-3">
                                  No activities added yet
                                </p>
                              ) : (
                                stop.activities.map((act) => {
                                  const ActIcon = activityIcons[act.type];
                                  return (
                                    <div
                                      key={act.id}
                                      className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 text-sm"
                                    >
                                      <ActIcon className="w-4 h-4 text-primary shrink-0" />
                                      <span className="flex-1 font-medium">
                                        {act.title}
                                      </span>
                                      <span className="text-muted-foreground">
                                        ${act.cost}
                                      </span>
                                      <button
                                        onClick={() =>
                                          removeActivity(stop.id, act.id)
                                        }
                                        className="p-1 rounded hover:bg-destructive/10"
                                        aria-label="Remove activity"
                                      >
                                        <X className="w-3 h-3 text-destructive/60" />
                                      </button>
                                    </div>
                                  );
                                })
                              )}
                            </div>

                            {/* Add activity buttons */}
                            <div className="flex flex-wrap gap-1.5">
                              {ACTIVITY_TEMPLATES.map((template) => {
                                const TIcon = activityIcons[template.type];
                                return (
                                  <Button
                                    key={template.type}
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs gap-1 rounded-lg"
                                    onClick={() => addActivity(stop.id, template)}
                                  >
                                    <TIcon className="w-3 h-3" />
                                    + {template.title}
                                  </Button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>

                  {/* Flight connector badge */}
                  {index < stops.length - 1 && stop.city && stops[index + 1].city && (
                    <div className="flex items-center justify-center -my-1 relative z-20">
                      <Badge
                        variant="outline"
                        className="bg-background text-[10px] gap-1 px-2 py-0.5"
                      >
                        <Plane className="w-3 h-3 text-primary" />
                        {stop.code} → {stops[index + 1].code}
                      </Badge>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Add Stop Button */}
          {stops.length < 8 && (
            <Button
              variant="outline"
              onClick={addStop}
              className="w-full h-12 rounded-xl border-dashed gap-2 mt-3"
            >
              <Plus className="w-4 h-4" />
              Add Stop ({stops.length}/8)
            </Button>
          )}
        </div>

        {/* Trip Summary */}
        <Card className="mt-8 overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Route className="w-4 h-4 text-primary" />
                  Trip Summary
                </h3>
                {stops.filter((s) => s.city).length >= 2 && (
                  <p className="text-sm text-muted-foreground">
                    {stops
                      .filter((s) => s.city)
                      .map((s) => s.code)
                      .join(" → ")}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-xl bg-background/60">
                  <Plane className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="text-xl font-bold">{totalFlights}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">
                    Flights
                  </p>
                </div>
                <div className="text-center p-3 rounded-xl bg-background/60">
                  <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="text-xl font-bold">{totalNights}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">
                    Nights
                  </p>
                </div>
                <div className="text-center p-3 rounded-xl bg-background/60">
                  <DollarSign className="w-5 h-5 mx-auto mb-1 text-accent-foreground" />
                  <p className="text-xl font-bold">
                    ${totalCost.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase">
                    Est. Cost
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="p-4 flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl gap-2"
                onClick={() => {
                  const filledStops = stops.filter((s) => s.city);
                  if (filledStops.length < 2) {
                    toast.error("Add at least 2 cities");
                    return;
                  }
                  const params = new URLSearchParams({
                    type: "multi",
                    legs: String(filledStops.length - 1),
                    passengers: "1",
                    cabin: "economy",
                  });
                  filledStops.forEach((s, i) => {
                    if (i < filledStops.length - 1) {
                      params.set(`origin${i}`, s.code);
                      params.set(`dest${i}`, filledStops[i + 1].code);
                      if (s.departureDate) {
                        params.set(
                          `depart${i}`,
                          format(s.departureDate, "yyyy-MM-dd")
                        );
                      }
                    }
                  });
                  navigate(`/flights/results?${params.toString()}`);
                }}
              >
                <Search className="w-4 h-4" />
                Search Flights
              </Button>
              <Button
                className="flex-1 h-12 rounded-xl gap-2 bg-gradient-to-r from-primary to-primary/80"
                onClick={handleSaveTrip}
                disabled={isSaving || stops.filter((s) => s.city).length < 2}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save as Trip
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
