import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Plus,
  Trash2,
  GripVertical,
  CalendarIcon,
  Plane,
  MapPin,
  Search,
  Route,
  Sparkles,
  ChevronRight,
  Globe,
  Clock,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import AirportAutocomplete from "./AirportAutocomplete";

interface FlightLeg {
  id: string;
  from: string;
  to: string;
  date: Date | undefined;
}

interface FlightMultiCityProps {
  onSearch?: (legs: FlightLeg[]) => void;
  maxLegs?: number;
  className?: string;
}

const createLeg = (from = "", to = "", date?: Date): FlightLeg => ({
  id: Math.random().toString(36).substring(2, 9),
  from,
  to,
  date,
});

export const FlightMultiCity = ({
  onSearch,
  maxLegs = 6,
  className,
}: FlightMultiCityProps) => {
  const [legs, setLegs] = useState<FlightLeg[]>([
    createLeg("", "", addDays(new Date(), 7)),
    createLeg("", "", addDays(new Date(), 14)),
  ]);

  const addLeg = () => {
    if (legs.length >= maxLegs) return;
    
    const lastLeg = legs[legs.length - 1];
    const newDate = lastLeg?.date ? addDays(lastLeg.date, 7) : addDays(new Date(), 7);
    
    setLegs([...legs, createLeg(lastLeg?.to || "", "", newDate)]);
  };

  const removeLeg = (id: string) => {
    if (legs.length <= 2) return;
    setLegs(legs.filter((leg) => leg.id !== id));
  };

  const updateLeg = (id: string, updates: Partial<FlightLeg>) => {
    setLegs(
      legs.map((leg) => (leg.id === id ? { ...leg, ...updates } : leg))
    );
  };

  const handleSearch = () => {
    // Validate all legs have required data
    const isValid = legs.every((leg) => leg.from && leg.to && leg.date);
    if (isValid) {
      onSearch?.(legs);
    }
  };

  // Calculate total trip stats
  const validLegs = legs.filter((leg) => leg.from && leg.to);
  const uniqueCities = new Set([
    ...validLegs.map((l) => l.from),
    ...validLegs.map((l) => l.to),
  ]).size;
  
  const tripDuration = legs[0]?.date && legs[legs.length - 1]?.date
    ? Math.ceil(
        (legs[legs.length - 1].date!.getTime() - legs[0].date!.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/10 border border-purple-500/40 flex items-center justify-center">
            <Route className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Multi-City Trip</h3>
            <p className="text-sm text-muted-foreground">
              Plan a complex itinerary with multiple stops
            </p>
          </div>
        </div>

        {/* Trip Stats */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Globe className="w-4 h-4 text-sky-500" />
            <span>
              <strong>{uniqueCities}</strong> cities
            </span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2 text-sm">
            <Plane className="w-4 h-4 text-purple-500" />
            <span>
              <strong>{legs.length}</strong> flights
            </span>
          </div>
          {tripDuration > 0 && (
            <>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>
                  <strong>{tripDuration}</strong> days
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Flight Legs */}
      <Reorder.Group
        axis="y"
        values={legs}
        onReorder={setLegs}
        className="space-y-3"
      >
        {legs.map((leg, index) => (
          <Reorder.Item
            key={leg.id}
            value={leg}
            className="list-none"
          >
            <motion.div
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur hover:border-border transition-all duration-200 group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Drag Handle */}
                    <div className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground transition-all duration-200">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    {/* Flight Number Badge */}
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 font-mono",
                        index === 0
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/40"
                          : index === legs.length - 1
                          ? "bg-red-500/10 text-red-500 border-red-500/40"
                          : "bg-sky-500/10 text-sky-500 border-sky-500/40"
                      )}
                    >
                      Flight {index + 1}
                    </Badge>

                    {/* From City */}
                    <div className="flex-1 min-w-0">
                      <AirportAutocomplete
                        value={leg.from}
                        onChange={(value) => updateLeg(leg.id, { from: value })}
                        placeholder="From city"
                      />
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />

                    {/* To City */}
                    <div className="flex-1 min-w-0">
                      <AirportAutocomplete
                        value={leg.to}
                        onChange={(value) => {
                          updateLeg(leg.id, { to: value });
                          // Auto-fill next leg's "from" if empty
                          if (index < legs.length - 1 && !legs[index + 1].from) {
                            updateLeg(legs[index + 1].id, { from: value });
                          }
                        }}
                        placeholder="To city"
                      />
                    </div>

                    {/* Date Picker */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-40 justify-start text-left font-normal bg-muted/50 border-0",
                            !leg.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {leg.date ? format(leg.date, "MMM d, yyyy") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={leg.date}
                          onSelect={(date) => updateLeg(leg.id, { date })}
                          disabled={(date) => {
                            // Disable dates before previous leg's date
                            if (index > 0 && legs[index - 1].date) {
                              return date < legs[index - 1].date!;
                            }
                            return date < new Date();
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    {/* Remove Button */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className={cn(
                        "shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
                        legs.length <= 2 && "invisible"
                      )}
                      onClick={() => removeLeg(leg.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>

                  {/* Connection indicator */}
                  {index < legs.length - 1 && (
                    <div className="ml-[52px] mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      {leg.to && legs[index + 1]?.from && leg.to !== legs[index + 1].from && (
                        <Badge variant="outline" className="text-amber-500 border-amber-500/40 bg-amber-500/10">
                          ⚠️ Cities don't match
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {/* Add Flight Button */}
      <AnimatePresence>
        {legs.length < maxLegs && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <button
              onClick={addLeg}
              className="w-full p-4 rounded-xl border-2 border-dashed border-border/50 hover:border-sky-500/50 hover:bg-sky-500/5 transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-sky-500"
            >
              <Plus className="w-4 h-4" />
              Add another flight
              <span className="text-xs">({maxLegs - legs.length} remaining)</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trip Summary & Search */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-purple-500/10 via-violet-500/5 to-sky-500/10 ring-1 ring-purple-500/20">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Route Preview */}
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">Your journey</p>
              <div className="flex items-center gap-2 flex-wrap">
                {legs.map((leg, index) => {
                  const fromCode = leg.from.match(/\(([A-Z]{3})\)/)?.[1] || "???";
                  const toCode = leg.to.match(/\(([A-Z]{3})\)/)?.[1] || "???";
                  
                  return (
                    <div key={leg.id} className="flex items-center gap-2">
                      {index === 0 && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
                          {fromCode}
                        </Badge>
                      )}
                      <Plane className="w-3 h-3 text-muted-foreground rotate-45" />
                      <Badge
                        className={cn(
                          index === legs.length - 1
                            ? "bg-red-500/20 text-red-400 border-red-500/40"
                            : "bg-sky-500/20 text-sky-400 border-sky-500/40"
                        )}
                      >
                        {toCode}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Search Button */}
            <Button
              size="lg"
              onClick={handleSearch}
              disabled={!legs.every((leg) => leg.from && leg.to && leg.date)}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-500 via-violet-600 to-sky-500 hover:from-purple-600 hover:via-violet-700 hover:to-sky-600 text-white font-semibold shadow-lg shadow-purple-500/30"
            >
              <Search className="w-4 h-4 mr-2" />
              Search Multi-City
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
        <Sparkles className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
        <div className="text-sm">
          <p className="font-medium mb-1">Pro Tips for Multi-City Trips</p>
          <ul className="text-muted-foreground space-y-1">
            <li>• Drag flights to reorder your itinerary</li>
            <li>• Connect cities for a smooth journey</li>
            <li>• Add up to {maxLegs} flights per booking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FlightMultiCity;
