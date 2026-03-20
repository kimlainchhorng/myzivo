/**
 * Flight Results Page — /flights/results
 * 2026 Spatial UI with glassmorphism, filters, sorting, airline logos
 */

import { useState, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Plane, ArrowLeft, SortAsc, Filter, X, AlertTriangle, WifiOff, RefreshCw, Luggage, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import FlightResultsSkeleton from "@/components/flight/FlightResultsSkeleton";
import { useDuffelFlightSearch, getDuffelAirlineLogo, type DuffelOffer } from "@/hooks/useDuffelFlights";
import { getAirportByCode } from "@/data/airports";
import { cn } from "@/lib/utils";

type SortBy = "cheapest" | "fastest" | "best";

const FlightResults = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortBy>("best");

  // Filters
  const [maxPrice, setMaxPrice] = useState<number>(0); // 0 = no limit
  const [stopsFilter, setStopsFilter] = useState<number | null>(null); // null = any
  const [timeFilter, setTimeFilter] = useState<string | null>(null); // null = any

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
    origin,
    destination,
    departureDate,
    returnDate,
    passengers: { adults, children, infants },
    cabinClass,
    enabled: !!origin && !!destination && !!departureDate,
  });

  const offers = data?.offers || [];

  // Compute price range for slider
  const priceRange = useMemo(() => {
    if (offers.length === 0) return { min: 0, max: 2000 };
    const prices = offers.map((o) => o.price);
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  }, [offers]);

  // Active max price (default to max when not set)
  const activeMaxPrice = maxPrice > 0 ? maxPrice : priceRange.max;

  // Departure time buckets
  const getTimeBucket = (time: string): string => {
    const hour = parseInt(time.split(":")[0], 10);
    if (hour < 6) return "night";
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };

  // Filter + sort
  const filtered = useMemo(() => {
    let result = [...offers];

    // Price filter
    if (maxPrice > 0) {
      result = result.filter((o) => o.price <= maxPrice);
    }

    // Stops filter
    if (stopsFilter !== null) {
      result = result.filter((o) => (stopsFilter === 2 ? o.stops >= 2 : o.stops === stopsFilter));
    }

    // Time filter
    if (timeFilter) {
      result = result.filter((o) => getTimeBucket(o.departure.time) === timeFilter);
    }

    // Sort
    switch (sortBy) {
      case "cheapest":
        result.sort((a, b) => a.price - b.price);
        break;
      case "fastest":
        result.sort((a, b) => a.durationMinutes - b.durationMinutes);
        break;
      case "best":
        // Score: normalized price (40%) + normalized duration (40%) + direct bonus (20%)
        result.sort((a, b) => {
          const maxP = priceRange.max || 1;
          const maxD = Math.max(...offers.map((o) => o.durationMinutes), 1);
          const scoreA = (a.price / maxP) * 0.4 + (a.durationMinutes / maxD) * 0.4 + (a.stops > 0 ? 0.2 : 0);
          const scoreB = (b.price / maxP) * 0.4 + (b.durationMinutes / maxD) * 0.4 + (b.stops > 0 ? 0.2 : 0);
          return scoreA - scoreB;
        });
        break;
    }

    return result;
  }, [offers, maxPrice, stopsFilter, timeFilter, sortBy, priceRange]);

  const activeFilterCount = [maxPrice > 0, stopsFilter !== null, timeFilter !== null].filter(Boolean).length;

  const clearFilters = () => {
    setMaxPrice(0);
    setStopsFilter(null);
    setTimeFilter(null);
  };

  const handleSelect = (offer: DuffelOffer) => {
    sessionStorage.setItem("zivo_selected_offer", JSON.stringify(offer));
    sessionStorage.setItem("zivo_search_params", JSON.stringify({
      origin, destination, departureDate, returnDate, adults, children, infants, cabinClass,
    }));
    navigate("/flights/details/review");
  };

  // Error UI helper
  const getErrorDisplay = (err: unknown) => {
    const msg = err instanceof Error ? err.message : "Something went wrong";
    const isNetwork = msg.toLowerCase().includes("network") || msg.toLowerCase().includes("fetch");
    const isRateLimit = msg.toLowerCase().includes("rate") || msg.toLowerCase().includes("too many");
    return {
      icon: isNetwork ? WifiOff : AlertTriangle,
      title: isRateLimit ? "Too Many Searches" : isNetwork ? "Connection Error" : "Search Failed",
      message: isRateLimit
        ? "Please wait a moment before searching again."
        : isNetwork
        ? "Please check your internet connection and try again."
        : msg,
      canRetry: !isRateLimit,
    };
  };

  // Filter sidebar content (shared between sheet and inline)
  const filterContent = (
    <div className="space-y-6">
      {/* Price */}
      <div>
        <p className="text-sm font-semibold mb-3">Max Price</p>
        <Slider
          value={[activeMaxPrice]}
          min={priceRange.min}
          max={priceRange.max}
          step={10}
          onValueChange={([v]) => setMaxPrice(v === priceRange.max ? 0 : v)}
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>${priceRange.min}</span>
          <span className="font-medium text-foreground">${activeMaxPrice}</span>
        </div>
      </div>

      <Separator />

      {/* Stops */}
      <div>
        <p className="text-sm font-semibold mb-3">Stops</p>
        <div className="flex flex-wrap gap-2">
          {[
            { val: null, label: "Any" },
            { val: 0, label: "Direct" },
            { val: 1, label: "1 Stop" },
            { val: 2, label: "2+" },
          ].map((item) => (
            <button
              key={String(item.val)}
              onClick={() => setStopsFilter(item.val as number | null)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-medium border transition-all duration-200 active:scale-95",
                stopsFilter === item.val
                  ? "bg-[hsl(var(--flights))] text-primary-foreground border-[hsl(var(--flights))]"
                  : "bg-card border-border/40 text-muted-foreground hover:border-[hsl(var(--flights))]/40"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Time of day */}
      <div>
        <p className="text-sm font-semibold mb-3">Departure Time</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { val: null, label: "Any Time", icon: "🕐" },
            { val: "morning", label: "Morning", icon: "🌅" },
            { val: "afternoon", label: "Afternoon", icon: "☀️" },
            { val: "evening", label: "Evening", icon: "🌆" },
          ].map((item) => (
            <button
              key={String(item.val)}
              onClick={() => setTimeFilter(item.val)}
              className={cn(
                "px-3 py-2.5 rounded-xl text-xs font-medium border transition-all duration-200 flex items-center gap-2 active:scale-95",
                timeFilter === item.val
                  ? "bg-[hsl(var(--flights))] text-primary-foreground border-[hsl(var(--flights))]"
                  : "bg-card border-border/40 text-muted-foreground hover:border-[hsl(var(--flights))]/40"
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <>
          <Separator />
          <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full text-muted-foreground">
            <X className="w-3.5 h-3.5 mr-1.5" />
            Clear All Filters
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <SEOHead
        title={`Flights ${origin} → ${destination} – ZIVO`}
        description={`Compare flight deals from ${origin} to ${destination}.`}
      />

      {/* Decorative orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 right-0 w-72 h-72 rounded-full bg-[hsl(var(--flights))]/6 blur-3xl" />
        <div className="absolute bottom-0 -left-32 w-64 h-64 rounded-full bg-primary/4 blur-3xl" />
      </div>

      <Header />

      <main className="pt-20 pb-20 relative z-10">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Route header — glassmorphic */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-card/70 backdrop-blur-xl rounded-2xl border border-border/40 p-4 sm:p-5 mb-5"
          >
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild className="shrink-0 -ml-1">
                <Link to="/flights"><ArrowLeft className="w-5 h-5" /></Link>
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-bold truncate flex items-center gap-2">
                  <span>{originAirport?.city || origin}</span>
                  <Plane className="w-4 h-4 text-[hsl(var(--flights))] -rotate-12 shrink-0" />
                  <span>{destAirport?.city || destination}</span>
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {departureDate}{returnDate ? ` — ${returnDate}` : " · One Way"} · {totalPassengers} traveler{totalPassengers > 1 ? "s" : ""} · <span className="capitalize">{cabinClass.replace("_", " ")}</span>
                </p>
              </div>
              <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                <Link to="/flights">Edit</Link>
              </Button>
            </div>
          </motion.div>

          {/* Sort tabs + filter button */}
          {offers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between mb-4 gap-3"
            >
              {/* Sort pills */}
              <div className="flex gap-1 p-1 bg-muted/50 backdrop-blur-sm rounded-xl border border-border/30">
                {(["best", "cheapest", "fastest"] as SortBy[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={cn(
                      "px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 capitalize",
                      sortBy === s
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Filter button (mobile = sheet, desktop = visible) */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 border-border/40 relative sm:hidden">
                    <Filter className="w-3.5 h-3.5" />
                    Filter
                    {activeFilterCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[hsl(var(--flights))] text-[10px] text-primary-foreground font-bold flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh]">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="py-4 overflow-y-auto">{filterContent}</div>
                  <SheetClose asChild>
                    <Button className="w-full bg-[hsl(var(--flights))]">
                      Show {filtered.length} flight{filtered.length !== 1 ? "s" : ""}
                    </Button>
                  </SheetClose>
                </SheetContent>
              </Sheet>

              <p className="text-xs text-muted-foreground hidden sm:block">
                {filtered.length} of {offers.length} flights
              </p>
            </motion.div>
          )}

          <div className="flex gap-5">
            {/* Desktop filters sidebar */}
            {offers.length > 0 && (
              <div className="hidden sm:block w-56 shrink-0">
                <div className="sticky top-24 bg-card/70 backdrop-blur-xl rounded-2xl border border-border/40 p-4">
                  <p className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[hsl(var(--flights))]" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="text-[10px] h-5">{activeFilterCount}</Badge>
                    )}
                  </p>
                  {filterContent}
                </div>
              </div>
            )}

            {/* Results column */}
            <div className="flex-1 min-w-0">
              {/* Loading */}
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
                          <Button variant="outline" asChild>
                            <Link to="/flights">New Search</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })()}

              {/* Empty */}
              {!isLoading && !error && offers.length === 0 && data && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card className="border-border/40">
                    <CardContent className="p-8 sm:p-12 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                        <Plane className="w-7 h-7 text-muted-foreground" />
                      </div>
                      <h2 className="text-lg font-bold mb-2">No Flights Found</h2>
                      <p className="text-sm text-muted-foreground mb-6">Try different dates, airports, or cabin class.</p>
                      <Button asChild className="bg-[hsl(var(--flights))]">
                        <Link to="/flights">Modify Search</Link>
                      </Button>
                    </CardContent>
                  </Card>
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
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {filtered.map((offer, idx) => (
                    <motion.div
                      key={offer.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.2), ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                      <Card
                        className="bg-card/80 backdrop-blur-sm border-border/40 hover:border-[hsl(var(--flights))]/40 hover:shadow-lg hover:shadow-[hsl(var(--flights))]/5 transition-all duration-200 cursor-pointer group"
                        onClick={() => handleSelect(offer)}
                      >
                        <CardContent className="p-3.5 sm:p-5">
                          {/* Best tag */}
                          {idx === 0 && sortBy === "best" && (
                            <div className="mb-2.5">
                              <Badge className="bg-[hsl(var(--flights))]/10 text-[hsl(var(--flights))] border-[hsl(var(--flights))]/20 text-[10px] font-semibold">
                                ✨ Best Option
                              </Badge>
                            </div>
                          )}
                          {idx === 0 && sortBy === "cheapest" && (
                            <div className="mb-2.5">
                              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold">
                                💰 Cheapest
                              </Badge>
                            </div>
                          )}
                          {idx === 0 && sortBy === "fastest" && (
                            <div className="mb-2.5">
                              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-semibold">
                                ⚡ Fastest
                              </Badge>
                            </div>
                          )}

                          <div className="flex flex-col gap-3">
                            {/* Top row: airline + price (mobile) */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-muted/60 border border-border/30 flex items-center justify-center overflow-hidden shrink-0">
                                  <img
                                    src={getDuffelAirlineLogo(offer.airlineCode)}
                                    alt={offer.airline}
                                    className="w-7 h-7 object-contain"
                                    onError={(e) => {
                                      const el = e.target as HTMLImageElement;
                                      el.style.display = 'none';
                                      el.parentElement!.innerHTML = `<span class="text-xs font-bold text-muted-foreground">${offer.airlineCode}</span>`;
                                    }}
                                  />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold leading-tight">{offer.airline}</p>
                                  <p className="text-[11px] text-muted-foreground">{offer.flightNumber}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg sm:text-xl font-bold text-[hsl(var(--flights))] tabular-nums">
                                  ${Math.round(offer.price)}
                                </p>
                                <p className="text-[10px] text-muted-foreground">per person</p>
                              </div>
                            </div>

                            {/* Route timeline */}
                            <div className="flex items-center gap-2 sm:gap-4">
                              <div className="text-left min-w-[52px]">
                                <p className="text-base sm:text-lg font-bold tabular-nums leading-tight">{offer.departure.time}</p>
                                <p className="text-[11px] text-muted-foreground font-medium">{offer.departure.code}</p>
                              </div>

                              <div className="flex flex-col items-center flex-1">
                                <span className="text-[10px] text-muted-foreground font-medium">{offer.duration}</span>
                                <div className="w-full h-px bg-border/60 relative my-1">
                                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[hsl(var(--flights))] border-2 border-card" />
                                  {offer.stops > 0 && Array.from({ length: Math.min(offer.stops, 2) }).map((_, i) => (
                                    <div
                                      key={i}
                                      className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-muted-foreground/40"
                                      style={{ left: `${((i + 1) / (offer.stops + 1)) * 100}%` }}
                                    />
                                  ))}
                                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[hsl(var(--flights))] border-2 border-card" />
                                </div>
                                <span className={cn(
                                  "text-[10px] font-medium",
                                  offer.stops === 0 ? "text-primary" : "text-muted-foreground"
                                )}>
                                  {offer.stops === 0 ? "Direct" : `${offer.stops} stop${offer.stops > 1 ? "s" : ""}`}
                                </span>
                              </div>

                              <div className="text-right min-w-[52px]">
                                <p className="text-base sm:text-lg font-bold tabular-nums leading-tight">{offer.arrival.time}</p>
                                <p className="text-[11px] text-muted-foreground font-medium">{offer.arrival.code}</p>
                              </div>
                            </div>

                            {/* Tags + Select */}
                            <div className="flex items-center justify-between">
                              <div className="flex gap-1.5 flex-wrap">
                                <Badge variant="outline" className="text-[10px] border-border/30 bg-muted/30 capitalize">
                                  {offer.cabinClass}
                                </Badge>
                                {offer.baggageIncluded && (
                                  <Badge variant="outline" className="text-[10px] border-border/30 bg-muted/30 gap-1">
                                    <Luggage className="w-2.5 h-2.5" />
                                    {offer.baggageIncluded}
                                  </Badge>
                                )}
                                {offer.isRefundable && (
                                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary bg-primary/5">
                                    Refundable
                                  </Badge>
                                )}
                              </div>
                              <Button
                                size="sm"
                                className="h-8 px-4 text-xs font-semibold bg-[hsl(var(--flights))] hover:bg-[hsl(var(--flights))]/90 shadow-sm active:scale-95 transition-all"
                                onClick={(e) => { e.stopPropagation(); handleSelect(offer); }}
                              >
                                Select
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FlightResults;
