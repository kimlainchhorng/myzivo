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
  ChevronRight,
  X,
  Sparkles,
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

  const swapCities = () => {
    const temp = fromCity;
    onFromCityChange(toCity);
    onToCityChange(temp);
  };

  const fromCode = fromCity.match(/\(([A-Z]{3})\)/)?.[1] || '';
  const toCode = toCity.match(/\(([A-Z]{3})\)/)?.[1] || '';

  return (
    <div className={cn("space-y-3", className)}>
      {/* Trip Type Toggle - Compact */}
      <div className="flex gap-2 p-1 rounded-xl bg-muted/50">
        <button
          onClick={() => onTripTypeChange("roundtrip")}
          className={cn(
            "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all",
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
            "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all",
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
            <button className="w-full p-3 text-left border-b border-border/30 active:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">From</p>
                  <p className="font-medium truncate">
                    {fromCity || 'Select departure'}
                  </p>
                </div>
                {fromCode && (
                  <Badge variant="outline" className="shrink-0">{fromCode}</Badge>
                )}
              </div>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
            <SheetHeader>
              <SheetTitle>Where from?</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
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
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-sky-500 text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeftRight className="w-4 h-4 rotate-90" />
        </button>

        {/* To */}
        <Sheet open={activeSheet === 'to'} onOpenChange={(open) => setActiveSheet(open ? 'to' : null)}>
          <SheetTrigger asChild>
            <button className="w-full p-3 text-left active:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">To</p>
                  <p className="font-medium truncate">
                    {toCity || 'Select destination'}
                  </p>
                </div>
                {toCode && (
                  <Badge variant="outline" className="shrink-0">{toCode}</Badge>
                )}
              </div>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
            <SheetHeader>
              <SheetTitle>Where to?</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
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
            <button className="p-3 rounded-xl border border-border/50 bg-card/50 text-left active:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-sky-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Dates</p>
                  <p className="font-medium text-sm truncate">
                    {departDate 
                      ? `${format(departDate, 'MMM d')}${returnDate && tripType === 'roundtrip' ? ` - ${format(returnDate, 'MMM d')}` : ''}`
                      : 'Select dates'}
                  </p>
                </div>
              </div>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
            <SheetHeader>
              <SheetTitle>Select dates</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Departure</p>
                <Calendar
                  mode="single"
                  selected={departDate}
                  onSelect={(date) => {
                    onDepartDateChange(date);
                    if (tripType === 'oneway') setActiveSheet(null);
                  }}
                  disabled={(date) => date < new Date()}
                  className="rounded-xl border"
                />
              </div>
              {tripType === 'roundtrip' && departDate && (
                <div>
                  <p className="text-sm font-medium mb-2">Return</p>
                  <Calendar
                    mode="single"
                    selected={returnDate}
                    onSelect={(date) => {
                      onReturnDateChange(date);
                      setActiveSheet(null);
                    }}
                    disabled={(date) => date < departDate}
                    className="rounded-xl border"
                  />
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Passengers */}
        <Sheet open={activeSheet === 'passengers'} onOpenChange={(open) => setActiveSheet(open ? 'passengers' : null)}>
          <SheetTrigger asChild>
            <button className="p-3 rounded-xl border border-border/50 bg-card/50 text-left active:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Travelers</p>
                  <p className="font-medium text-sm">
                    {passengers} passenger{parseInt(passengers) > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl">
            <SheetHeader>
              <SheetTitle>How many travelers?</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-2">
              {['1', '2', '3', '4', '5'].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    onPassengersChange(num);
                    setActiveSheet(null);
                  }}
                  className={cn(
                    "w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between",
                    passengers === num
                      ? "border-sky-500 bg-sky-500/10"
                      : "border-border/50 hover:border-border"
                  )}
                >
                  <span className="font-medium">{num} passenger{parseInt(num) > 1 ? 's' : ''}</span>
                  {passengers === num && <Sparkles className="w-4 h-4 text-sky-500" />}
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Search Button */}
      <Button
        onClick={onSearch}
        disabled={isSearching || !fromCity || !toCity}
        className="w-full h-14 text-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 rounded-2xl shadow-lg shadow-sky-500/30"
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
