/**
 * Professional Flight Search Form
 * 
 * Features:
 * - Structured airport autocomplete (stores IATA codes)
 * - Smart date validation (return >= depart)
 * - Passenger/cabin controls
 * - Clean URL submission (codes only)
 * - Mobile-first responsive design
 * - Full-screen mobile date picker
 * - Bottom-sheet passenger selector
 * - Multi-city search support
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
import MultiCityLegs from "./MultiCityLegs";
import { MobileDatePickerSheet, MobilePassengerCabinSheet } from "@/components/mobile";
import { useFlightFunnel } from "@/hooks/useFlightFunnel";
import { useTranslation } from "@/hooks/useI18n";

type TripType = "roundtrip" | "oneway" | "multicity";
type CabinClass = "economy" | "premium" | "business" | "first";

interface FlightSearchFormProProps {
  initialFrom?: string;
  initialTo?: string;
  initialDepartDate?: Date;
  initialReturnDate?: Date;
  initialPassengers?: number;
  initialCabin?: CabinClass;
  initialTripType?: TripType;
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
  const { trackSearchStarted } = useFlightFunnel();
  const { t } = useTranslation("flights");

  // Trip type
  const [tripType, setTripType] = useState<TripType>(initialTripType);

  // Location state
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
  
  // Mobile sheet states
  const [departSheetOpen, setDepartSheetOpen] = useState(false);
  const [returnSheetOpen, setReturnSheetOpen] = useState(false);
  const [passengerSheetOpen, setPassengerSheetOpen] = useState(false);

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
    if (!fromOption) newErrors.from = "Please choose an airport from the list.";
    if (!toOption) newErrors.to = "Please choose an airport from the list.";
    if (fromOption && toOption && fromOption.value === toOption.value) {
      newErrors.to = "Destination must differ from origin";
    }
    if (!departDate) newErrors.depart = "Select departure date";
    if (tripType === "roundtrip" && !returnDate) newErrors.return = "Select return date";
    if (tripType === "roundtrip" && departDate && returnDate && isBefore(returnDate, departDate)) {
      newErrors.return = "Return must be after departure";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle search
  const handleSearch = () => {
    if (!validate()) return;
    const fromCode = (fromOption?.value || fromDisplay.match(/\(([A-Z]{3})\)/)?.[1] || "").toUpperCase();
    const toCode = (toOption?.value || toDisplay.match(/\(([A-Z]{3})\)/)?.[1] || "").toUpperCase();
    const departDateStr = departDate ? format(departDate, "yyyy-MM-dd") : "";
    const returnDateStr = tripType === "roundtrip" && returnDate ? format(returnDate, "yyyy-MM-dd") : undefined;

    trackSearchStarted({
      origin: fromCode,
      destination: toCode,
      departureDate: departDateStr,
      returnDate: returnDateStr,
      passengers,
      cabinClass: cabin,
    });

    const resultsParams = new URLSearchParams({
      origin: fromCode,
      dest: toCode,
      depart: departDateStr,
      passengers: String(passengers),
      cabin: cabin,
    });
    if (returnDateStr) resultsParams.set("return", returnDateStr);
    navigate(`/flights/results?${resultsParams.toString()}`);
    if (onSearch) onSearch(resultsParams);
  };

  const isFormValid = useMemo(() => {
    const hasFrom = !!fromOption;
    const hasTo = !!toOption;
    const hasDepart = !!departDate;
    const hasReturn = tripType === "oneway" || tripType === "multicity" || !!returnDate;
    return hasFrom && hasTo && hasDepart && hasReturn;
  }, [fromOption, toOption, departDate, returnDate, tripType]);

  const cabinOptions: { value: CabinClass; label: string }[] = [
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
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { id: "roundtrip" as TripType, label: t("flights.roundtrip"), icon: RefreshCw },
          { id: "oneway" as TripType, label: t("flights.oneway"), icon: Plane },
          { id: "multicity" as TripType, label: "Multi-City", icon: MapPin },
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => setTripType(type.id)}
            className={cn(
              "px-3 sm:px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm",
              tripType === type.id
                ? "bg-gradient-to-r from-sky-500 to-blue-600 text-primary-foreground shadow-lg shadow-sky-500/30"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <type.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {type.label}
          </button>
        ))}
      </div>

      {/* Multi-City Mode */}
      {tripType === "multicity" ? (
        <MultiCityLegs passengers={passengers} cabin={cabin} />
      ) : (
        <>
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
                label={t("flights.from")}
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
                aria-label="Swap cities"
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
                label={t("flights.to")}
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
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                {tripType === "roundtrip" ? `${t("flights.departure")} → ${t("flights.return")}` : t("flights.departure")}
                <span className="text-destructive"> *</span>
              </Label>

              <div
                className={cn(
                  "rounded-xl border border-border bg-background overflow-hidden",
                  (errors.depart || errors.return) && "border-destructive"
                )}
              >
                <div className={cn("grid", tripType === "roundtrip" ? "grid-cols-2" : "grid-cols-1")}>
                  {isMobile ? (
                    <>
                      <Button
                        variant="ghost"
                        type="button"
                        onClick={() => setDepartSheetOpen(true)}
                        className={cn(
                          "h-14 justify-start rounded-none px-4 text-left font-normal touch-manipulation",
                          !departDate && "text-muted-foreground",
                          tripType === "roundtrip" && "border-r border-border"
                        )}
                      >
                        <CalendarIcon className="w-4 h-4 mr-3 text-primary" />
                        <div className="flex flex-col items-start">
                          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            {t("flights.departure")}
                          </span>
                          <span>{departDate ? format(departDate, "EEE, MMM d") : "Select date"}</span>
                        </div>
                      </Button>
                      <MobileDatePickerSheet
                        open={departSheetOpen}
                        onOpenChange={setDepartSheetOpen}
                        selectedDate={departDate}
                        onDateSelect={(date) => {
                          setDepartDate(date);
                          if (date && returnDate && isBefore(returnDate, date)) {
                            setReturnDate(addDays(date, 7));
                          }
                        }}
                        onDateConfirmed={(date) => {
                          if (tripType === "roundtrip") {
                            setReturnDate((current) => (current && !isBefore(current, date) ? current : addDays(date, 7)));
                            setReturnSheetOpen(true);
                          }
                        }}
                        label="Departure Date"
                        accentColor="sky"
                      />

                      {tripType === "roundtrip" && (
                        <>
                          <Button
                            variant="ghost"
                            type="button"
                            onClick={() => setReturnSheetOpen(true)}
                            className={cn(
                              "h-14 justify-start rounded-none px-4 text-left font-normal touch-manipulation",
                              !returnDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="w-4 h-4 mr-3 text-primary" />
                            <div className="flex flex-col items-start">
                              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                {t("flights.return")}
                              </span>
                              <span>{returnDate ? format(returnDate, "EEE, MMM d") : "Select date"}</span>
                            </div>
                          </Button>
                          <MobileDatePickerSheet
                            open={returnSheetOpen}
                            onOpenChange={setReturnSheetOpen}
                            selectedDate={returnDate}
                            onDateSelect={setReturnDate}
                            label="Return Date"
                            minDate={departDate}
                            accentColor="orange"
                          />
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            type="button"
                            className={cn(
                              "h-14 justify-start rounded-none px-4 text-left font-normal hover:bg-muted/50",
                              !departDate && "text-muted-foreground",
                              tripType === "roundtrip" && "border-r border-border"
                            )}
                          >
                            <CalendarIcon className="w-4 h-4 mr-3 text-primary" />
                            <div className="flex flex-col items-start">
                              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                {t("flights.departure")}
                              </span>
                              <span>{departDate ? format(departDate, "EEE, MMM d") : "Select date"}</span>
                            </div>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={departDate}
                            onSelect={(date) => {
                              setDepartDate(date);
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

                      {tripType === "roundtrip" && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              type="button"
                              className={cn(
                                "h-14 justify-start rounded-none px-4 text-left font-normal hover:bg-muted/50",
                                !returnDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="w-4 h-4 mr-3 text-primary" />
                              <div className="flex flex-col items-start">
                                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                  {t("flights.return")}
                                </span>
                                <span>{returnDate ? format(returnDate, "EEE, MMM d") : "Select date"}</span>
                              </div>
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
                      )}
                    </>
                  )}
                </div>
              </div>

              {(errors.depart || errors.return) && (
                <div className="mt-1 space-y-1">
                  {errors.depart && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.depart}
                    </p>
                  )}
                  {errors.return && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.return}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Row 3: Passengers & Cabin */}
            <div className="grid grid-cols-2 gap-3">
              {isMobile ? (
                <>
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Travelers & Cabin</Label>
                    <Button
                      variant="outline"
                      onClick={() => setPassengerSheetOpen(true)}
                      className="w-full h-12 justify-start text-left font-normal rounded-xl touch-manipulation"
                    >
                      <Users className="w-4 h-4 mr-2 text-purple-500" />
                      {passengers} {passengers === 1 ? "Traveler" : "Travelers"} • {cabin.charAt(0).toUpperCase() + cabin.slice(1)}
                    </Button>
                    <MobilePassengerCabinSheet
                      open={passengerSheetOpen}
                      onOpenChange={setPassengerSheetOpen}
                      passengers={passengers}
                      cabin={cabin}
                      onPassengersChange={setPassengers}
                      onCabinChange={setCabin}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">{t("flights.passengers")}</Label>
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
                              aria-label="Fewer passengers"
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
                              aria-label="More passengers"
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

                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">{t("flights.class")}</Label>
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
                                "w-full px-3 py-2 text-left text-sm rounded-xl transition-colors",
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
                </>
              )}
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
              "text-primary-foreground shadow-xl shadow-sky-500/30 hover:shadow-sky-500/40",
              "transition-all duration-200 active:scale-[0.98]",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Search className="w-5 h-5 mr-2" />
            {t("flights.search_title")}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center mt-2">
            Payment completed securely on ZIVO. Tickets issued by licensed partners.
          </p>
        </>
      )}
    </div>
  );
}
