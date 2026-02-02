/**
 * Professional Flight Search Form
 * 
 * Features:
 * - Structured airport autocomplete (stores IATA codes)
 * - Smart date validation (return >= depart)
 * - Passenger/cabin controls
 * - Clean URL submission (codes only)
 * - Mobile-first responsive design
 */

import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Plane, 
  Search, 
  ArrowLeftRight, 
  RefreshCw, 
  MapPin, 
  Users,
  Crown,
  Calendar as CalendarIcon,
  AlertCircle,
  ChevronDown,
  Minus,
  ExternalLink,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { format, addDays, isBefore, startOfToday } from "date-fns";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import LocationAutocomplete, { type LocationOption } from "./LocationAutocomplete";
import { useAirportSearch } from "./hooks/useLocationSearch";

type TripType = "roundtrip" | "oneway";
type CabinClass = "economy" | "premium" | "business" | "first";

interface FlightSearchFormProProps {
  // Initial values (from URL or defaults)
  initialFrom?: string;
  initialTo?: string;
  initialDepartDate?: Date;
  initialReturnDate?: Date;
  initialPassengers?: number;
  initialCabin?: CabinClass;
  initialTripType?: TripType;
  // Callbacks
  onSearch?: (params: URLSearchParams) => void;
  navigateOnSearch?: boolean;
  className?: string;
}

export default function FlightSearchFormPro({
  initialFrom = "",
  initialTo = "",
  initialDepartDate,
  initialReturnDate,
  initialPassengers = 1,
  initialCabin = "economy",
  initialTripType = "roundtrip",
  onSearch,
  navigateOnSearch = true,
  className,
}: FlightSearchFormProProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { search: searchAirports, getPopular, getByCode, allOptions } = useAirportSearch();

  // Trip type
  const [tripType, setTripType] = useState<TripType>(initialTripType);

  // Location state - store both code and display value
  const [fromOption, setFromOption] = useState<LocationOption | null>(null);
  const [fromDisplay, setFromDisplay] = useState("");
  const [toOption, setToOption] = useState<LocationOption | null>(null);
  const [toDisplay, setToDisplay] = useState("");

  // Date state
  const [departDate, setDepartDate] = useState<Date | undefined>(
    initialDepartDate || addDays(new Date(), 7)
  );
  const [returnDate, setReturnDate] = useState<Date | undefined>(
    initialReturnDate || addDays(new Date(), 14)
  );

  // Passengers & cabin
  const [passengers, setPassengers] = useState(initialPassengers);
  const [cabin, setCabin] = useState<CabinClass>(initialCabin);
  const [isPassengerOpen, setIsPassengerOpen] = useState(false);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize from props
  useEffect(() => {
    if (initialFrom) {
      const option = getByCode(initialFrom);
      if (option) {
        setFromOption(option);
        setFromDisplay(option.label);
      } else {
        setFromDisplay(initialFrom);
      }
    }
    if (initialTo) {
      const option = getByCode(initialTo);
      if (option) {
        setToOption(option);
        setToDisplay(option.label);
      } else {
        setToDisplay(initialTo);
      }
    }
  }, [initialFrom, initialTo, getByCode]);

  // Swap cities
  const handleSwap = () => {
    const tempOption = fromOption;
    const tempDisplay = fromDisplay;
    setFromOption(toOption);
    setFromDisplay(toDisplay);
    setToOption(tempOption);
    setToDisplay(tempDisplay);
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Origin validation
    if (!fromOption && !fromDisplay.match(/\([A-Z]{3}\)/)) {
      newErrors.from = "Select a departure airport";
    }

    // Destination validation
    if (!toOption && !toDisplay.match(/\([A-Z]{3}\)/)) {
      newErrors.to = "Select an arrival airport";
    }

    // Same origin/destination check
    const fromCode = fromOption?.value || fromDisplay.match(/\(([A-Z]{3})\)/)?.[1];
    const toCode = toOption?.value || toDisplay.match(/\(([A-Z]{3})\)/)?.[1];
    if (fromCode && toCode && fromCode === toCode) {
      newErrors.to = "Destination must differ from origin";
    }

    // Date validation
    if (!departDate) {
      newErrors.depart = "Select departure date";
    }

    if (tripType === "roundtrip" && !returnDate) {
      newErrors.return = "Select return date";
    }

    if (tripType === "roundtrip" && departDate && returnDate && isBefore(returnDate, departDate)) {
      newErrors.return = "Return must be after departure";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Build white label URL for live results
  const buildWhitelabelUrl = (fromCode: string, toCode: string) => {
    const marker = '618730';
    const base = 'https://search.jetradar.com/flights';
    
    const cabinMap: Record<string, string> = {
      'economy': 'Y',
      'premium': 'W',
      'business': 'C',
      'first': 'F'
    };
    
    const urlParams = new URLSearchParams({
      origin_iata: fromCode,
      destination_iata: toCode,
      depart_date: departDate ? format(departDate, "yyyy-MM-dd") : "",
      adults: String(passengers),
      trip_class: cabinMap[cabin] || 'Y',
      marker,
      with_request: 'true'
    });
    
    if (tripType === "roundtrip" && returnDate) {
      urlParams.set('return_date', format(returnDate, "yyyy-MM-dd"));
    }
    
    return `${base}?${urlParams.toString()}`;
  };

  // Handle search - opens white label in new tab (Phase 1: API not enabled)
  const handleSearch = () => {
    if (!validate()) return;

    // Extract IATA codes
    const fromCode = fromOption?.value || fromDisplay.match(/\(([A-Z]{3})\)/)?.[1] || "";
    const toCode = toOption?.value || toDisplay.match(/\(([A-Z]{3})\)/)?.[1] || "";

    // Phase 1: Open white label directly since API access is pending
    const whitelabelUrl = buildWhitelabelUrl(fromCode.toUpperCase(), toCode.toUpperCase());
    window.open(whitelabelUrl, "_blank", "noopener,noreferrer");
  };

  // Check if form is valid for enabling button
  const isFormValid = useMemo(() => {
    const hasFrom = !!fromOption || !!fromDisplay.match(/\([A-Z]{3}\)/);
    const hasTo = !!toOption || !!toDisplay.match(/\([A-Z]{3}\)/);
    const hasDepart = !!departDate;
    const hasReturn = tripType === "oneway" || !!returnDate;
    return hasFrom && hasTo && hasDepart && hasReturn;
  }, [fromOption, fromDisplay, toOption, toDisplay, departDate, returnDate, tripType]);

  const cabinOptions: { value: CabinClass; label: string; icon?: string }[] = [
    { value: "economy", label: "Economy" },
    { value: "premium", label: "Premium Economy" },
    { value: "business", label: "Business" },
    { value: "first", label: "First Class" },
  ];

  return (
    <div className={cn(
      "bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl p-4 sm:p-6 shadow-2xl",
      className
    )}>
      {/* Accent bar */}
      <div className="h-1 bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 rounded-t-2xl mb-4 sm:mb-5" />

      {/* Trip Type Toggle */}
      <div className="flex gap-2 mb-4">
        {[
          { id: "roundtrip" as TripType, label: "Round Trip", icon: RefreshCw },
          { id: "oneway" as TripType, label: "One Way", icon: Plane },
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => setTripType(type.id)}
            className={cn(
              "px-3 sm:px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm",
              tripType === type.id
                ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <type.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {type.label}
          </button>
        ))}
      </div>

      {/* Search Fields Grid */}
      <div className="space-y-4">
        {/* Row 1: From / Swap / To */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-3 items-end">
          <LocationAutocomplete
            value={fromOption?.value || ""}
            displayValue={fromDisplay}
            onChange={setFromOption}
            onDisplayChange={setFromDisplay}
            options={allOptions}
            searchFn={searchAirports}
            popularFn={getPopular}
            placeholder="From where?"
            label="From"
            icon="plane"
            accentColor="sky"
            error={errors.from}
            required
          />

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleSwap}
            className="h-11 sm:h-12 w-11 sm:w-12 rounded-full border-dashed hover:border-sky-500 hover:bg-sky-500/10 shrink-0 transition-all hover:rotate-180 duration-500 hidden md:flex"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </Button>

          <LocationAutocomplete
            value={toOption?.value || ""}
            displayValue={toDisplay}
            onChange={setToOption}
            onDisplayChange={setToDisplay}
            options={allOptions.filter(o => o.value !== fromOption?.value)}
            searchFn={(q, l) => searchAirports(q, l).filter(o => o.value !== fromOption?.value)}
            popularFn={(l) => getPopular(l).filter(o => o.value !== fromOption?.value)}
            placeholder="To where?"
            label="To"
            icon="plane"
            accentColor="sky"
            error={errors.to}
            required
          />
        </div>

        {/* Mobile swap button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleSwap}
          className="w-full h-10 md:hidden rounded-xl border-dashed gap-2"
        >
          <ArrowLeftRight className="w-4 h-4" />
          Swap
        </Button>

        {/* Row 2: Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Departure Date */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Departure <span className="text-destructive">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-11 sm:h-12 justify-start text-left font-normal rounded-xl",
                    !departDate && "text-muted-foreground",
                    errors.depart && "border-destructive"
                  )}
                >
                  <CalendarIcon className="w-4 h-4 mr-2 text-sky-500" />
                  {departDate ? format(departDate, "EEE, MMM d") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={departDate}
                  onSelect={(date) => {
                    setDepartDate(date);
                    // Auto-adjust return if needed
                    if (date && returnDate && isBefore(returnDate, date)) {
                      setReturnDate(addDays(date, 7));
                    }
                  }}
                  disabled={(date) => isBefore(date, startOfToday())}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {errors.depart && (
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.depart}
              </p>
            )}
          </div>

          {/* Return Date (roundtrip only) */}
          {tripType === "roundtrip" && (
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                Return <span className="text-destructive">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-11 sm:h-12 justify-start text-left font-normal rounded-xl",
                      !returnDate && "text-muted-foreground",
                      errors.return && "border-destructive"
                    )}
                  >
                    <CalendarIcon className="w-4 h-4 mr-2 text-orange-500" />
                    {returnDate ? format(returnDate, "EEE, MMM d") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={returnDate}
                    onSelect={setReturnDate}
                    disabled={(date) => departDate ? isBefore(date, departDate) : isBefore(date, startOfToday())}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {errors.return && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.return}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Row 3: Passengers & Cabin */}
        <div className="grid grid-cols-2 gap-3">
          {/* Passengers */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Passengers</Label>
            <Popover open={isPassengerOpen} onOpenChange={setIsPassengerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-11 sm:h-12 justify-start text-left font-normal rounded-xl"
                >
                  <Users className="w-4 h-4 mr-2 text-purple-500" />
                  {passengers} {passengers === 1 ? "Traveler" : "Travelers"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-4" align="start">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Adults</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPassengers(Math.max(1, passengers - 1))}
                      disabled={passengers <= 1}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center font-semibold">{passengers}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPassengers(Math.min(9, passengers + 1))}
                      disabled={passengers >= 9}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <Button
                  className="w-full mt-4"
                  size="sm"
                  onClick={() => setIsPassengerOpen(false)}
                >
                  Done
                </Button>
              </PopoverContent>
            </Popover>
          </div>

          {/* Cabin Class */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Cabin</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-11 sm:h-12 justify-start text-left font-normal rounded-xl"
                >
                  <Crown className={cn(
                    "w-4 h-4 mr-2",
                    cabin === "first" ? "text-amber-500" :
                    cabin === "business" ? "text-blue-500" : "text-emerald-500"
                  )} />
                  <span className="capitalize truncate">{cabin.replace("premium", "Premium Eco")}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="start">
                <div className="space-y-1">
                  {cabinOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setCabin(opt.value)}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm rounded-lg transition-colors",
                        cabin === opt.value
                          ? "bg-sky-500/15 text-sky-500 font-medium"
                          : "hover:bg-muted"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Search Button */}
      <Button
        onClick={handleSearch}
        disabled={!isFormValid}
        size="lg"
        className={cn(
          "w-full h-12 sm:h-14 mt-5 font-bold text-base sm:text-lg rounded-xl",
          "bg-gradient-to-r from-sky-500 via-blue-600 to-sky-500 hover:from-sky-600 hover:via-blue-700 hover:to-sky-600",
          "text-white shadow-xl shadow-sky-500/30 hover:shadow-sky-500/40",
          "transition-all duration-300 active:scale-[0.98]",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <ExternalLink className="w-5 h-5 mr-2" />
        View Live Results
      </Button>

      {/* Compliance notice */}
      <p className="text-[10px] sm:text-xs text-muted-foreground text-center mt-3">
        Live prices and final booking on partner site. We may earn a commission.
      </p>
    </div>
  );
}
