/**
 * Flight Results Page — /flights/results
 * Full OTA filter system with mobile bottom sheet
 */

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Plane, ArrowLeft, Filter, X, AlertTriangle, WifiOff, RefreshCw, Luggage, Clock, ChevronRight, ArrowRight, Sunrise, Sun, Sunset, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import FlightResultsSkeleton from "@/components/flight/FlightResultsSkeleton";
import { useDuffelFlightSearch, getDuffelAirlineLogo, type DuffelOffer } from "@/hooks/useDuffelFlights";
import { getAirportByCode } from "@/data/airports";
import { cn } from "@/lib/utils";
import DuffelFlightCard from "@/components/flight/DuffelFlightCard";
import FlightEmptyState from "@/components/flight/FlightEmptyState";

type SortBy = "best" | "cheapest" | "fastest" | "earliest" | "shortest";

interface FlightFiltersState {
  maxPrice: number;
  stops: number[];
  departureTime: string[];
  arrivalTime: string[];
  airlines: string[];
  maxDuration: number;
  refundableOnly: boolean;
  baggagePersonalItem: boolean;
  baggageCarryOn: boolean;
  baggageChecked: boolean;
}

const defaultFilters: FlightFiltersState = {
  maxPrice: 0,
  stops: [],
  departureTime: [],
  arrivalTime: [],
  airlines: [],
  maxDuration: 0,
  refundableOnly: false,
  baggagePersonalItem: false,
  baggageCarryOn: false,
  baggageChecked: false,
};

const timeOptions = [
  { id: "early_morning", label: "Early Morning", sub: "12am – 6am", icon: Moon },
  { id: "morning", label: "Morning", sub: "6am – 12pm", icon: Sunrise },
  { id: "afternoon", label: "Afternoon", sub: "12pm – 6pm", icon: Sun },
  { id: "evening", label: "Evening", sub: "6pm – 12am", icon: Sunset },
];

const FlightResults = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortBy>("best");
  const [filters, setFilters] = useState<FlightFiltersState>(defaultFilters);
  const [pendingFilters, setPendingFilters] = useState<FlightFiltersState>(defaultFilters);
  const [sheetOpen, setSheetOpen] = useState(false);

  const origin = params.get("origin") || "";
  const destination = params.get("destination") || "";
  const departureDate = params.get("departureDate") || "";
  const returnDate = params.get("returnDate") || undefined;
  const adults = Number(params.get("adults") || 1);
  const children = Number(params.get("children") || 0);
  const infants = Number(params.get("infants") || 0);
  const cabinClass = (params.get("cabinClass") || "economy") as 'economy' | 'premium_economy' | 'business' | 'first';
  const totalPassengers = adults + children + infants;

  const originAirport = getAirportByCode(origin);
  const destAirport = getAirportByCode(destination);

  const { data, isLoading, error, refetch } = useDuffelFlightSearch({
    origin, destination, departureDate, returnDate,
    passengers: { adults, children, infants },
    cabinClass,
    enabled: !!origin && !!destination && !!departureDate,
  });

  const offers = data?.offers || [];

  const priceRange = useMemo(() => {
    if (offers.length === 0) return { min: 0, max: 2000 };
    const prices = offers.map((o) => o.price);
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  }, [offers]);

  const maxDurationRange = useMemo(() => {
    if (offers.length === 0) return { min: 0, max: 1440 };
    const durations = offers.map(o => o.durationMinutes);
    return { min: Math.floor(Math.min(...durations)), max: Math.ceil(Math.max(...durations)) };
  }, [offers]);

  const availableAirlines = useMemo(() => {
    const map = new Map<string, { code: string; name: string; count: number }>();
    offers.forEach(o => {
      const existing = map.get(o.airlineCode);
      if (existing) existing.count++;
      else map.set(o.airlineCode, { code: o.airlineCode, name: o.airline, count: 1 });
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [offers]);

  const getTimeBucket = (time: string): string => {
    const hour = parseInt(time.split(":")[0], 10);
    if (hour < 6) return "early_morning";
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };

  const applyFilters = (f: FlightFiltersState, offerList: DuffelOffer[]) => {
    let result = [...offerList];
    if (f.maxPrice > 0) result = result.filter(o => o.price <= f.maxPrice);
    if (f.stops.length > 0) result = result.filter(o => f.stops.some(s => s === 2 ? o.stops >= 2 : o.stops === s));
    if (f.departureTime.length > 0) result = result.filter(o => f.departureTime.includes(getTimeBucket(o.departure.time)));
    if (f.arrivalTime.length > 0) result = result.filter(o => f.arrivalTime.includes(getTimeBucket(o.arrival.time)));
    if (f.airlines.length > 0) result = result.filter(o => f.airlines.includes(o.airlineCode));
    if (f.maxDuration > 0) result = result.filter(o => o.durationMinutes <= f.maxDuration);
    if (f.refundableOnly) result = result.filter(o => o.isRefundable);
    if (f.baggagePersonalItem) result = result.filter(o => o.baggageIncluded && o.baggageIncluded.toLowerCase().includes("personal"));
    if (f.baggageCarryOn) result = result.filter(o => o.baggageIncluded && (o.baggageIncluded.toLowerCase().includes("carry") || o.baggageIncluded.toLowerCase().includes("cabin")));
    if (f.baggageChecked) result = result.filter(o => o.baggageIncluded && o.baggageIncluded.toLowerCase().includes("checked"));
    return result;
  };

  const sortOffers = (offerList: DuffelOffer[], sort: SortBy) => {
    const sorted = [...offerList];
    switch (sort) {
      case "cheapest": sorted.sort((a, b) => a.price - b.price); break;
      case "fastest": sorted.sort((a, b) => a.durationMinutes - b.durationMinutes); break;
      case "earliest": sorted.sort((a, b) => a.departure.time.localeCompare(b.departure.time)); break;
      case "shortest": sorted.sort((a, b) => a.durationMinutes - b.durationMinutes); break;
      case "best":
        sorted.sort((a, b) => {
          const maxP = priceRange.max || 1;
          const maxD = Math.max(...offerList.map(o => o.durationMinutes), 1);
          const scoreA = (a.price / maxP) * 0.4 + (a.durationMinutes / maxD) * 0.4 + (a.stops > 0 ? 0.2 : 0);
          const scoreB = (b.price / maxP) * 0.4 + (b.durationMinutes / maxD) * 0.4 + (b.stops > 0 ? 0.2 : 0);
          return scoreA - scoreB;
        });
        break;
    }
    return sorted;
  };

  const filtered = useMemo(() => sortOffers(applyFilters(filters, offers), sortBy), [offers, filters, sortBy, priceRange]);

  const lowestPriceId = useMemo(() => {
    if (filtered.length === 0) return null;
    return filtered.reduce((min, o) => o.price < min.price ? o : min, filtered[0]).id;
  }, [filtered]);

  const fastestId = useMemo(() => {
    if (filtered.length === 0) return null;
    return filtered.reduce((min, o) => o.durationMinutes < min.durationMinutes ? o : min, filtered[0]).id;
  }, [filtered]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.maxPrice > 0) count++;
    if (filters.stops.length > 0) count++;
    if (filters.departureTime.length > 0) count++;
    if (filters.arrivalTime.length > 0) count++;
    if (filters.airlines.length > 0) count++;
    if (filters.maxDuration > 0) count++;
    if (filters.refundableOnly) count++;
    if (filters.baggagePersonalItem || filters.baggageCarryOn || filters.baggageChecked) count++;
    return count;
  }, [filters]);

  const activeChips = useMemo(() => {
    const chips: { label: string; key: string }[] = [];
    if (filters.maxPrice > 0) chips.push({ label: `Max $${filters.maxPrice}`, key: "maxPrice" });
    if (filters.stops.length > 0) chips.push({ label: filters.stops.map(s => s === 0 ? "Direct" : s === 1 ? "1 stop" : "2+").join(", "), key: "stops" });
    if (filters.departureTime.length > 0) chips.push({ label: `Depart: ${filters.departureTime.length}`, key: "departureTime" });
    if (filters.arrivalTime.length > 0) chips.push({ label: `Arrive: ${filters.arrivalTime.length}`, key: "arrivalTime" });
    if (filters.airlines.length > 0) chips.push({ label: `${filters.airlines.length} airline${filters.airlines.length > 1 ? "s" : ""}`, key: "airlines" });
    if (filters.maxDuration > 0) chips.push({ label: `≤ ${Math.floor(filters.maxDuration / 60)}h ${filters.maxDuration % 60}m`, key: "maxDuration" });
    if (filters.refundableOnly) chips.push({ label: "Refundable", key: "refundableOnly" });
    if (filters.baggagePersonalItem) chips.push({ label: "Personal item", key: "baggagePersonalItem" });
    if (filters.baggageCarryOn) chips.push({ label: "Carry-on", key: "baggageCarryOn" });
    if (filters.baggageChecked) chips.push({ label: "Checked bag", key: "baggageChecked" });
    return chips;
  }, [filters]);

  const removeChip = (key: string) => {
    setFilters(prev => {
      const next = { ...prev };
      switch (key) {
        case "maxPrice": next.maxPrice = 0; break;
        case "stops": next.stops = []; break;
        case "departureTime": next.departureTime = []; break;
        case "arrivalTime": next.arrivalTime = []; break;
        case "airlines": next.airlines = []; break;
        case "maxDuration": next.maxDuration = 0; break;
        case "refundableOnly": next.refundableOnly = false; break;
        case "baggagePersonalItem": next.baggagePersonalItem = false; break;
        case "baggageCarryOn": next.baggageCarryOn = false; break;
        case "baggageChecked": next.baggageChecked = false; break;
      }
      return next;
    });
  };

  const clearFilters = () => setFilters(defaultFilters);

  const handleOpenSheet = () => {
    setPendingFilters(filters);
    setSheetOpen(true);
  };

  const handleApplySheet = () => {
    setFilters(pendingFilters);
    setSheetOpen(false);
  };

  const handleResetSheet = () => {
    setPendingFilters(defaultFilters);
  };

  const handleSelect = (offer: DuffelOffer) => {
    sessionStorage.setItem("zivo_selected_offer", JSON.stringify(offer));
    sessionStorage.setItem("zivo_search_params", JSON.stringify({
      origin, destination, departureDate, returnDate, adults, children, infants, cabinClass,
    }));
    navigate("/flights/details/review");
  };

  const getErrorDisplay = (err: unknown) => {
    const msg = err instanceof Error ? err.message : "Something went wrong";
    const isNetwork = msg.toLowerCase().includes("network") || msg.toLowerCase().includes("fetch");
    const isRateLimit = msg.toLowerCase().includes("rate") || msg.toLowerCase().includes("too many");
    return {
      icon: isNetwork ? WifiOff : AlertTriangle,
      title: isRateLimit ? "Too Many Searches" : isNetwork ? "Connection Error" : "Search Failed",
      message: isRateLimit ? "Please wait a moment before searching again."
        : isNetwork ? "Please check your internet connection and try again." : msg,
      canRetry: !isRateLimit,
    };
  };

  const lowestPrice = useMemo(() => {
    if (filtered.length === 0) return 0;
    return Math.round(Math.min(...filtered.map(o => o.price)));
  }, [filtered]);

  const pendingFiltered = useMemo(() => applyFilters(pendingFilters, offers), [offers, pendingFilters]);

  // Toggle helpers for pending filters
  const togglePendingArray = <K extends keyof FlightFiltersState>(key: K, value: string | number) => {
    setPendingFilters(prev => {
      const arr = prev[key] as (string | number)[];
      const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
      return { ...prev, [key]: next };
    });
  };

  // Shared filter content renderer
  const renderFilterContent = (f: FlightFiltersState, onChange: (partial: Partial<FlightFiltersState>) => void, toggleArray: (key: keyof FlightFiltersState, value: string | number) => void) => (
    <div className="space-y-5">
      {/* Price */}
      <div>
        <p className="text-xs font-semibold mb-2.5">Max Price</p>
        <div className="px-0.5">
          <div className="flex justify-center mb-2">
            <span className="text-lg font-bold text-[hsl(var(--flights))] tabular-nums">
              ${f.maxPrice > 0 ? f.maxPrice : priceRange.max}
            </span>
          </div>
          <Slider
            value={[f.maxPrice > 0 ? f.maxPrice : priceRange.max]}
            min={priceRange.min}
            max={priceRange.max}
            step={10}
            onValueChange={([v]) => onChange({ maxPrice: v >= priceRange.max ? 0 : v })}
            className="mb-1"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>${priceRange.min}</span>
            <span>${priceRange.max}</span>
          </div>
        </div>
      </div>

      <Separator className="bg-border/30" />

      {/* Stops */}
      <div>
        <p className="text-xs font-semibold mb-2.5">Stops</p>
        <div className="flex flex-wrap gap-1.5">
          {[
            { val: 0, label: "Direct" },
            { val: 1, label: "1 Stop" },
            { val: 2, label: "2+ Stops" },
          ].map(item => (
            <button
              key={item.val}
              onClick={() => toggleArray("stops", item.val)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all active:scale-95",
                (f.stops as number[]).includes(item.val)
                  ? "bg-[hsl(var(--flights))] text-primary-foreground border-[hsl(var(--flights))]"
                  : "bg-card border-border/40 text-muted-foreground hover:border-[hsl(var(--flights))]/40"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <Separator className="bg-border/30" />

      {/* Departure Time */}
      <div>
        <p className="text-xs font-semibold mb-2.5">Departure Time</p>
        <div className="grid grid-cols-2 gap-1.5">
          {timeOptions.map(t => (
            <button
              key={t.id}
              onClick={() => toggleArray("departureTime", t.id)}
              className={cn(
                "p-2 rounded-lg border text-center transition-all active:scale-95",
                (f.departureTime as string[]).includes(t.id)
                  ? "bg-[hsl(var(--flights))]/15 border-[hsl(var(--flights))]/50 text-[hsl(var(--flights))]"
                  : "bg-card border-border/40 text-muted-foreground hover:border-[hsl(var(--flights))]/30"
              )}
            >
              <t.icon className="w-4 h-4 mx-auto mb-0.5" />
              <p className="text-[10px] font-semibold">{t.label}</p>
              <p className="text-[8px] text-muted-foreground">{t.sub}</p>
            </button>
          ))}
        </div>
      </div>

      <Separator className="bg-border/30" />

      {/* Arrival Time */}
      <div>
        <p className="text-xs font-semibold mb-2.5">Arrival Time</p>
        <div className="grid grid-cols-2 gap-1.5">
          {timeOptions.map(t => (
            <button
              key={t.id}
              onClick={() => toggleArray("arrivalTime", t.id)}
              className={cn(
                "p-2 rounded-lg border text-center transition-all active:scale-95",
                (f.arrivalTime as string[]).includes(t.id)
                  ? "bg-primary/15 border-primary/50 text-primary"
                  : "bg-card border-border/40 text-muted-foreground hover:border-primary/30"
              )}
            >
              <t.icon className="w-4 h-4 mx-auto mb-0.5" />
              <p className="text-[10px] font-semibold">{t.label}</p>
              <p className="text-[8px] text-muted-foreground">{t.sub}</p>
            </button>
          ))}
        </div>
      </div>

      <Separator className="bg-border/30" />

      {/* Airlines */}
      {availableAirlines.length > 0 && (
        <>
          <div>
            <p className="text-xs font-semibold mb-2.5">Airlines</p>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {availableAirlines.map(al => (
                <label key={al.code} className="flex items-center gap-2.5 cursor-pointer py-1">
                  <Checkbox
                    checked={(f.airlines as string[]).includes(al.code)}
                    onCheckedChange={() => toggleArray("airlines", al.code)}
                  />
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <img
                      src={getDuffelAirlineLogo(al.code)}
                      alt={al.name}
                      className="w-5 h-5 object-contain rounded"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement;
                        el.style.display = 'none';
                      }}
                    />
                    <span className="text-[11px] truncate">{al.name}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto shrink-0">({al.count})</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <Separator className="bg-border/30" />
        </>
      )}

      {/* Duration */}
      <div>
        <p className="text-xs font-semibold mb-2.5">
          Max Duration: {f.maxDuration > 0 ? `${Math.floor(f.maxDuration / 60)}h ${f.maxDuration % 60}m` : "Any"}
        </p>
        <div className="px-0.5">
          <Slider
            value={[f.maxDuration > 0 ? f.maxDuration : maxDurationRange.max]}
            min={maxDurationRange.min}
            max={maxDurationRange.max}
            step={15}
            onValueChange={([v]) => onChange({ maxDuration: v >= maxDurationRange.max ? 0 : v })}
            className="mb-1"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{Math.floor(maxDurationRange.min / 60)}h</span>
            <span>{Math.floor(maxDurationRange.max / 60)}h</span>
          </div>
        </div>
      </div>

      <Separator className="bg-border/30" />

      {/* Refundability */}
      <div className="flex items-center justify-between py-1">
        <span className="text-[11px] font-semibold">Refundable only</span>
        <Switch
          checked={f.refundableOnly}
          onCheckedChange={(v) => onChange({ refundableOnly: v })}
        />
      </div>

      <Separator className="bg-border/30" />

      {/* Baggage */}
      <div>
        <p className="text-xs font-semibold mb-2.5 flex items-center gap-1.5">
          <Luggage className="w-3.5 h-3.5 text-[hsl(var(--flights))]" />
          Baggage
        </p>
        <div className="space-y-2">
          {[
            { key: "baggagePersonalItem" as const, label: "Personal item included" },
            { key: "baggageCarryOn" as const, label: "Carry-on included" },
            { key: "baggageChecked" as const, label: "Checked bag included" },
          ].map(bag => (
            <label key={bag.key} className="flex items-center gap-2.5 cursor-pointer">
              <Checkbox
                checked={f[bag.key] as boolean}
                onCheckedChange={(v) => onChange({ [bag.key]: !!v })}
              />
              <span className="text-[11px]">{bag.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  // Desktop filter onChange
  const desktopFilterChange = (partial: Partial<FlightFiltersState>) => setFilters(prev => ({ ...prev, ...partial }));
  const desktopToggleArray = (key: keyof FlightFiltersState, value: string | number) => {
    setFilters(prev => {
      const arr = prev[key] as (string | number)[];
      const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
      return { ...prev, [key]: next };
    });
  };

  // Pending filter onChange (for mobile sheet)
  const pendingFilterChange = (partial: Partial<FlightFiltersState>) => setPendingFilters(prev => ({ ...prev, ...partial }));

  return (
    <div className="min-h-[100dvh] bg-background relative overflow-hidden flex flex-col">
      <SEOHead
        title={`Flights ${origin} → ${destination} – ZIVO`}
        description={`Compare flight deals from ${origin} to ${destination}.`}
      />

      {/* Decorative orbs — subtle */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 right-0 w-72 h-72 rounded-full bg-[hsl(var(--flights))]/6 blur-3xl" />
      </div>

      <Header />

      <main className="flex-1 pt-14 pb-4 sm:pb-20 relative z-10">
        <div className="mx-auto px-3 sm:px-4 max-w-5xl">

          {/* Sticky summary bar — app-like nav bar */}
          <div className="sticky top-14 z-20 -mx-3 sm:-mx-4 px-3 sm:px-4 mb-3">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-card/90 backdrop-blur-xl sm:rounded-2xl border-b sm:border border-border/30 shadow-sm p-2.5 sm:p-3.5"
            >
              <div className="flex items-center gap-2.5">
                <Button variant="ghost" size="icon" asChild className="shrink-0 -ml-1 w-8 h-8">
                  <Link to="/flights"><ArrowLeft className="w-4 h-4" /></Link>
                </Button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-sm font-bold truncate">
                    <span>{originAirport?.city || origin}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[hsl(var(--flights))] shrink-0" />
                    <span>{destAirport?.city || destination}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {departureDate}{returnDate ? ` — ${returnDate}` : ""} · {totalPassengers} pax · <span className="capitalize">{cabinClass.replace("_", " ")}</span>
                  </p>
                </div>
                {lowestPrice > 0 && (
                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="text-[10px] text-muted-foreground">From</p>
                    <p className="text-sm font-bold text-[hsl(var(--flights))] tabular-nums">${lowestPrice}</p>
                  </div>
                )}
                <Button variant="outline" size="sm" asChild className="shrink-0 h-7 text-[11px] px-2.5 border-border/40">
                  <Link to="/flights">Edit</Link>
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Limited coverage notice for Cambodia routes */}
          {offers.length > 0 && offers.length <= 5 && ["PNH", "KTI", "REP", "KOS"].some(c => origin.toUpperCase() === c || destination.toUpperCase() === c) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-2.5 px-3 py-2 bg-muted/40 border border-border/30 rounded-xl text-xs text-muted-foreground text-center"
            >
              Some local airlines may not be available through this booking source. Showing best available partner airlines.
            </motion.div>
          )}

          {/* Sort tabs + filter — native app toolbar feel */}
          {offers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="flex items-center justify-between mb-2.5 gap-2 -mx-3 sm:mx-0 px-3 sm:px-0"
            >
              <div className="flex gap-0.5 p-0.5 bg-muted/40 backdrop-blur-sm rounded-lg border border-border/20 overflow-x-auto no-scrollbar">
                {([
                  { key: "best" as SortBy, label: "✨ Best" },
                  { key: "cheapest" as SortBy, label: "💰 Cheapest" },
                  { key: "fastest" as SortBy, label: "⚡ Fastest" },
                ]).map(s => (
                  <button
                    key={s.key}
                    onClick={() => setSortBy(s.key)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap",
                      sortBy === s.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground tabular-nums hidden sm:inline">
                  {filtered.length} flight{filtered.length !== 1 ? "s" : ""}
                </span>

                {/* Mobile filter button + sheet */}
                <Sheet open={sheetOpen} onOpenChange={(open) => { if (open) handleOpenSheet(); else setSheetOpen(false); }}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1 border-border/40 relative h-7 px-2.5 text-[11px] sm:hidden">
                      <Filter className="w-3 h-3" />
                      Filter
                      {activeFilterCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[hsl(var(--flights))] text-[9px] text-primary-foreground font-bold flex items-center justify-center">
                          {activeFilterCount}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] flex flex-col p-0">
                    <SheetHeader className="px-4 pt-4 pb-2 border-b border-border/30 shrink-0">
                      <div className="flex items-center justify-between">
                        <SheetTitle className="text-base">Filters</SheetTitle>
                        <button onClick={handleResetSheet} className="text-[11px] font-medium text-[hsl(var(--flights))]">
                          Reset all
                        </button>
                      </div>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto px-4 py-4 overscroll-contain">
                      {renderFilterContent(pendingFilters, pendingFilterChange, togglePendingArray)}
                    </div>
                    <div className="shrink-0 px-4 py-3 border-t border-border/30 bg-card/90 backdrop-blur-sm safe-area-bottom">
                      <Button
                        className="w-full bg-[hsl(var(--flights))] hover:bg-[hsl(var(--flights))]/90 font-semibold"
                        onClick={handleApplySheet}
                      >
                        Show {pendingFiltered.length} flight{pendingFiltered.length !== 1 ? "s" : ""}
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </motion.div>
          )}

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex flex-wrap gap-1.5 mb-3"
            >
              {activeChips.map(chip => (
                <Badge
                  key={chip.key}
                  variant="secondary"
                  className="text-[10px] h-6 px-2 gap-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                  onClick={() => removeChip(chip.key)}
                >
                  {chip.label}
                  <X className="w-2.5 h-2.5" />
                </Badge>
              ))}
              <button
                onClick={clearFilters}
                className="text-[10px] font-medium text-destructive hover:underline px-1"
              >
                Clear all
              </button>
            </motion.div>
          )}

          <div className="flex gap-4 sm:gap-5">
            {/* Desktop filters sidebar */}
            {offers.length > 0 && (
              <div className="hidden sm:block w-56 shrink-0">
                <div className="sticky top-32 bg-card/70 backdrop-blur-xl rounded-2xl border border-border/40 p-3.5 max-h-[calc(100vh-9rem)] overflow-y-auto">
                  <p className="text-xs font-semibold mb-3 flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-[hsl(var(--flights))]" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="text-[9px] h-4 px-1.5">{activeFilterCount}</Badge>
                    )}
                  </p>
                  {renderFilterContent(filters, desktopFilterChange, desktopToggleArray)}
                  {activeFilterCount > 0 && (
                    <>
                      <Separator className="bg-border/30 my-4" />
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full text-muted-foreground text-xs">
                        <X className="w-3 h-3 mr-1" /> Clear All
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Results column */}
            <div className="flex-1 min-w-0">
              {isLoading && <FlightResultsSkeleton count={6} />}

              {/* Error */}
              {error && !isLoading && (() => {
                const errInfo = getErrorDisplay(error);
                const ErrIcon = errInfo.icon;
                return (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <Card className="border-destructive/20 bg-destructive/5">
                      <CardContent className="p-8 sm:p-12 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                          <ErrIcon className="w-7 h-7 text-destructive" />
                        </div>
                        <h2 className="text-lg font-bold mb-2">{errInfo.title}</h2>
                        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">{errInfo.message}</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          {errInfo.canRetry && (
                            <Button onClick={() => refetch()} className="gap-2 bg-[hsl(var(--flights))]">
                              <RefreshCw className="w-4 h-4" /> Try Again
                            </Button>
                          )}
                          <Button variant="outline" asChild><Link to="/flights">New Search</Link></Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })()}

              {/* Empty — smart suggestions */}
              {!isLoading && !error && offers.length === 0 && data && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <FlightEmptyState
                    origin={origin}
                    destination={destination}
                    departureDate={departureDate}
                    returnDate={returnDate}
                    adults={adults}
                    children={children}
                    infants={infants}
                    cabinClass={cabinClass}
                  />
                </motion.div>
              )}

              {/* Filtered empty */}
              {!isLoading && !error && offers.length > 0 && filtered.length === 0 && (
                <Card className="border-border/40">
                  <CardContent className="p-8 text-center">
                    <Filter className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-medium mb-1">No flights match filters</p>
                    <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters.</p>
                    <Button variant="outline" size="sm" onClick={clearFilters}>Clear Filters</Button>
                  </CardContent>
                </Card>
              )}

              {/* Results list */}
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {filtered.map((offer, idx) => (
                    <motion.div
                      key={offer.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: Math.min(idx * 0.025, 0.15), ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                      <DuffelFlightCard
                        offer={offer}
                        index={idx}
                        sortBy={sortBy}
                        isLowest={offer.id === lowestPriceId && idx !== 0}
                        isFastest={offer.id === fastestId && idx !== 0}
                        totalPassengers={totalPassengers}
                        hasReturn={!!returnDate}
                        onSelect={handleSelect}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filtered.length > 0 && (
                <p className="text-center text-[10px] text-muted-foreground mt-4 sm:hidden">
                  Showing {filtered.length} of {offers.length} flights
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer only on desktop */}
      <div className="hidden sm:block">
        <Footer />
      </div>
    </div>
  );
};

export default FlightResults;
