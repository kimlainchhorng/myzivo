import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Plane,
  Search,
  CalendarIcon,
  Users,
  ArrowLeftRight,
  MapPin,
  Sparkles,
  Crown,
  Minus,
  Plus,
  Baby,
  User,
  Briefcase,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import AirportAutocomplete from "./AirportAutocomplete";

interface MobileFlightSearchProps {
  fromCity: string;
  toCity: string;
  departDate?: Date;
  returnDate?: Date;
  passengers: string;
  tripType: "roundtrip" | "oneway";
  onFromCityChange: (value: string) => void;
  onToCityChange: (value: string) => void;
  onDepartDateChange: (date?: Date) => void;
  onReturnDateChange: (date?: Date) => void;
  onPassengersChange: (value: string) => void;
  onTripTypeChange: (type: "roundtrip" | "oneway") => void;
  onSearch: () => void;
  isSearching?: boolean;
  className?: string;
}

interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

export const MobileFlightSearch = ({
  fromCity,
  toCity,
  departDate,
  returnDate,
  passengers,
  tripType,
  onFromCityChange,
  onToCityChange,
  onDepartDateChange,
  onReturnDateChange,
  onPassengersChange,
  onTripTypeChange,
  onSearch,
  isSearching,
  className,
}: MobileFlightSearchProps) => {
  const [activeSheet, setActiveSheet] = useState<'from' | 'to' | 'dates' | 'passengers' | null>(null);
  const [passengerCounts, setPassengerCounts] = useState<PassengerCounts>({
    adults: parseInt(passengers) || 1,
    children: 0,
    infants: 0,
  });
  const [fareClass, setFareClass] = useState<'economy' | 'premium' | 'business' | 'first'>('economy');

  const swapCities = () => {
    const temp = fromCity;
    onFromCityChange(toCity);
    onToCityChange(temp);
  };

  const fromCode = fromCity.match(/\(([A-Z]{3})\)/)?.[1] || '';
  const toCode = toCity.match(/\(([A-Z]{3})\)/)?.[1] || '';

  const totalPassengers = passengerCounts.adults + passengerCounts.children + passengerCounts.infants;

  const updatePassengerCount = (type: keyof PassengerCounts, delta: number) => {
    setPassengerCounts(prev => {
      const newCount = Math.max(type === 'adults' ? 1 : 0, Math.min(9, prev[type] + delta));
      const newCounts = { ...prev, [type]: newCount };
      
      // Ensure infants don't exceed adults
      if (type === 'adults' && newCounts.infants > newCounts.adults) {
        newCounts.infants = newCounts.adults;
      }
      
      onPassengersChange((newCounts.adults + newCounts.children + newCounts.infants).toString());
      return newCounts;
    });
  };

  const getPassengerSummary = () => {
    const parts = [];
    if (passengerCounts.adults > 0) parts.push(`${passengerCounts.adults} adult${passengerCounts.adults > 1 ? 's' : ''}`);
    if (passengerCounts.children > 0) parts.push(`${passengerCounts.children} child${passengerCounts.children > 1 ? 'ren' : ''}`);
    if (passengerCounts.infants > 0) parts.push(`${passengerCounts.infants} infant${passengerCounts.infants > 1 ? 's' : ''}`);
    return parts.join(', ');
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Trip Type Toggle - Compact */}
      <div className="flex gap-2 p-1 rounded-xl bg-muted/50">
        <button
          onClick={() => onTripTypeChange("roundtrip")}
          className={cn(
            "flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all touch-manipulation active:scale-95",
            tripType === "roundtrip"
              ? "bg-sky-500 text-white shadow-md"
              : "text-muted-foreground"
          )}
        >
          Round Trip
        </button>
        <button
          onClick={() => onTripTypeChange("oneway")}
          className={cn(
            "flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all touch-manipulation active:scale-95",
            tripType === "oneway"
              ? "bg-sky-500 text-white shadow-md"
              : "text-muted-foreground"
          )}
        >
          One Way
        </button>
      </div>

      {/* Route Selection - Compact Card */}
      <div className="relative rounded-2xl border border-border/50 bg-card/50 overflow-hidden">
        {/* From */}
        <Sheet open={activeSheet === 'from'} onOpenChange={(open) => setActiveSheet(open ? 'from' : null)}>
          <SheetTrigger asChild>
            <button className="w-full p-4 text-left border-b border-border/30 active:bg-muted/50 transition-colors touch-manipulation">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">From</p>
                  <p className="font-semibold truncate text-base">
                    {fromCity || 'Select departure'}
                  </p>
                </div>
                {fromCode && (
                  <Badge variant="outline" className="shrink-0 text-base px-3 py-1">{fromCode}</Badge>
                )}
              </div>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
            <SheetHeader className="pb-4">
              <SheetTitle className="text-xl">Where from?</SheetTitle>
            </SheetHeader>
            <div className="mt-2">
              <AirportAutocomplete
                value={fromCity}
                onChange={(val) => {
                  onFromCityChange(val);
                  setActiveSheet(null);
                }}
                placeholder="Search cities or airports"
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Swap Button */}
        <button
          onClick={swapCities}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-sky-500 text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform touch-manipulation"
        >
          <ArrowLeftRight className="w-5 h-5 rotate-90" />
        </button>

        {/* To */}
        <Sheet open={activeSheet === 'to'} onOpenChange={(open) => setActiveSheet(open ? 'to' : null)}>
          <SheetTrigger asChild>
            <button className="w-full p-4 text-left active:bg-muted/50 transition-colors touch-manipulation">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">To</p>
                  <p className="font-semibold truncate text-base">
                    {toCity || 'Select destination'}
                  </p>
                </div>
                {toCode && (
                  <Badge variant="outline" className="shrink-0 text-base px-3 py-1">{toCode}</Badge>
                )}
              </div>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
            <SheetHeader className="pb-4">
              <SheetTitle className="text-xl">Where to?</SheetTitle>
            </SheetHeader>
            <div className="mt-2">
              <AirportAutocomplete
                value={toCity}
                onChange={(val) => {
                  onToCityChange(val);
                  setActiveSheet(null);
                }}
                placeholder="Search cities or airports"
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Dates & Passengers Row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Dates */}
        <Sheet open={activeSheet === 'dates'} onOpenChange={(open) => setActiveSheet(open ? 'dates' : null)}>
          <SheetTrigger asChild>
            <button className="p-4 rounded-xl border border-border/50 bg-card/50 text-left active:bg-muted/50 transition-colors touch-manipulation">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-sky-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Dates</p>
                  <p className="font-semibold text-sm truncate">
                    {departDate 
                      ? `${format(departDate, 'MMM d')}${returnDate && tripType === 'roundtrip' ? ` - ${format(returnDate, 'MMM d')}` : ''}`
                      : 'Select dates'}
                  </p>
                </div>
              </div>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl overflow-y-auto">
            <SheetHeader className="pb-4">
              <SheetTitle className="text-xl">Select dates</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 pb-8">
              <div>
                <p className="text-sm font-medium mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  Departure
                </p>
                <Calendar
                  mode="single"
                  selected={departDate}
                  onSelect={(date) => {
                    onDepartDateChange(date);
                    if (tripType === 'oneway') setActiveSheet(null);
                  }}
                  disabled={(date) => date < new Date()}
                  className="rounded-xl border mx-auto"
                />
              </div>
              {tripType === 'roundtrip' && departDate && (
                <div>
                  <p className="text-sm font-medium mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-violet-500" />
                    Return
                  </p>
                  <Calendar
                    mode="single"
                    selected={returnDate}
                    onSelect={(date) => {
                      onReturnDateChange(date);
                      setActiveSheet(null);
                    }}
                    disabled={(date) => date < departDate}
                    className="rounded-xl border mx-auto"
                  />
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Passengers */}
        <Sheet open={activeSheet === 'passengers'} onOpenChange={(open) => setActiveSheet(open ? 'passengers' : null)}>
          <SheetTrigger asChild>
            <button className="p-4 rounded-xl border border-border/50 bg-card/50 text-left active:bg-muted/50 transition-colors touch-manipulation">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Travelers</p>
                  <p className="font-semibold text-sm">
                    {totalPassengers} pax
                  </p>
                </div>
              </div>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl">
            <SheetHeader className="pb-4">
              <SheetTitle className="text-xl">Travelers & Class</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 pb-8">
              {/* Passenger Types */}
              <div className="space-y-4">
                {/* Adults */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-sky-500" />
                    </div>
                    <div>
                      <p className="font-medium">Adults</p>
                      <p className="text-xs text-muted-foreground">12+ years</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updatePassengerCount('adults', -1)}
                      disabled={passengerCounts.adults <= 1}
                      className="w-10 h-10 rounded-full border border-border flex items-center justify-center disabled:opacity-30 touch-manipulation active:scale-95"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold text-lg">{passengerCounts.adults}</span>
                    <button
                      onClick={() => updatePassengerCount('adults', 1)}
                      disabled={totalPassengers >= 9}
                      className="w-10 h-10 rounded-full border border-border flex items-center justify-center disabled:opacity-30 touch-manipulation active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-medium">Children</p>
                      <p className="text-xs text-muted-foreground">2-11 years</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updatePassengerCount('children', -1)}
                      disabled={passengerCounts.children <= 0}
                      className="w-10 h-10 rounded-full border border-border flex items-center justify-center disabled:opacity-30 touch-manipulation active:scale-95"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold text-lg">{passengerCounts.children}</span>
                    <button
                      onClick={() => updatePassengerCount('children', 1)}
                      disabled={totalPassengers >= 9}
                      className="w-10 h-10 rounded-full border border-border flex items-center justify-center disabled:opacity-30 touch-manipulation active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Infants */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Baby className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium">Infants</p>
                      <p className="text-xs text-muted-foreground">Under 2 years</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updatePassengerCount('infants', -1)}
                      disabled={passengerCounts.infants <= 0}
                      className="w-10 h-10 rounded-full border border-border flex items-center justify-center disabled:opacity-30 touch-manipulation active:scale-95"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold text-lg">{passengerCounts.infants}</span>
                    <button
                      onClick={() => updatePassengerCount('infants', 1)}
                      disabled={passengerCounts.infants >= passengerCounts.adults || totalPassengers >= 9}
                      className="w-10 h-10 rounded-full border border-border flex items-center justify-center disabled:opacity-30 touch-manipulation active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Fare Class */}
              <div>
                <p className="text-sm font-medium mb-3">Cabin Class</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'economy', label: 'Economy', icon: User },
                    { id: 'premium', label: 'Premium', icon: Sparkles },
                    { id: 'business', label: 'Business', icon: Briefcase },
                    { id: 'first', label: 'First', icon: Crown },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setFareClass(id as typeof fareClass)}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all flex items-center gap-2 touch-manipulation active:scale-95",
                        fareClass === id
                          ? "border-sky-500 bg-sky-500/10"
                          : "border-border/50 hover:border-border"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", fareClass === id ? "text-sky-500" : "text-muted-foreground")} />
                      <span className={cn("font-medium text-sm", fareClass === id && "text-sky-500")}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => setActiveSheet(null)}
                className="w-full h-12 bg-sky-500 hover:bg-sky-600"
              >
                Done · {getPassengerSummary()}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Search Button */}
      <Button
        onClick={onSearch}
        disabled={isSearching || !fromCity || !toCity}
        className="w-full h-14 text-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 rounded-2xl shadow-lg shadow-sky-500/30 touch-manipulation active:scale-[0.98]"
      >
        {isSearching ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Plane className="w-5 h-5" />
          </motion.div>
        ) : (
          <>
            <Search className="w-5 h-5 mr-2" />
            Search Flights
          </>
        )}
      </Button>
    </div>
  );
};

export default MobileFlightSearch;
