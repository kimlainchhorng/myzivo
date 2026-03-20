/**
 * Flight Results Page — /flights/results
 * 2026 Spatial UI: sticky summary bar, premium cards, glassmorphic filters
 */

import { useState, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Plane, ArrowLeft, Filter, X, AlertTriangle, WifiOff, RefreshCw, Luggage, Clock, ChevronRight, ArrowRight } from "lucide-react";
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

  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [stopsFilter, setStopsFilter] = useState<number | null>(null);
  const [timeFilter, setTimeFilter] = useState<string | null>(null);

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

  const priceRange = useMemo(() => {
    if (offers.length === 0) return { min: 0, max: 2000 };
    const prices = offers.map((o) => o.price);
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  }, [offers]);

  const activeMaxPrice = maxPrice > 0 ? maxPrice : priceRange.max;

  const getTimeBucket = (time: string): string => {
    const hour = parseInt(time.split(":")[0], 10);
    if (hour < 6) return "night";
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };

  const filtered = useMemo(() => {
    let result = [...offers];
    if (maxPrice > 0) result = result.filter((o) => o.price <= maxPrice);
    if (stopsFilter !== null) result = result.filter((o) => (stopsFilter === 2 ? o.stops >= 2 : o.stops === stopsFilter));
    if (timeFilter) result = result.filter((o) => getTimeBucket(o.departure.time) === timeFilter);

    switch (sortBy) {
      case "cheapest":
        result.sort((a, b) => a.price - b.price);
        break;
      case "fastest":
        result.sort((a, b) => a.durationMinutes - b.durationMinutes);
        break;
      case "best":
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

  const lowestPrice = useMemo(() => {
    if (filtered.length === 0) return 0;
    return Math.round(Math.min(...filtered.map(o => o.price)));
  }, [filtered]);

  // Filter sidebar content
  const filterContent = (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold mb-2.5">Max Price</p>
        <Slider
          value={[activeMaxPrice]}
          min={priceRange.min}
          max={priceRange.max}
          step={10}
          onValueChange={([v]) => setMaxPrice(v === priceRange.max ? 0 : v)}
          className="mb-1.5"
        />
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>${priceRange.min}</span>
          <span className="font-semibold text-foreground">${activeMaxPrice}</span>
        </div>
      </div>

      <Separator className="bg-border/30" />

      <div>
        <p className="text-xs font-semibold mb-2.5">Stops</p>
        <div className="flex flex-wrap gap-1.5">
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
                "px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all duration-200 active:scale-95",
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

      <Separator className="bg-border/30" />

      <div>
        <p className="text-xs font-semibold mb-2.5">Departure Time</p>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { val: null, label: "Any", icon: "🕐" },
            { val: "morning", label: "Morning", icon: "🌅" },
            { val: "afternoon", label: "Afternoon", icon: "☀️" },
            { val: "evening", label: "Evening", icon: "🌆" },
          ].map((item) => (
            <button
              key={String(item.val)}
              onClick={() => setTimeFilter(item.val)}
              className={cn(
                "px-2.5 py-2 rounded-lg text-[11px] font-semibold border transition-all duration-200 flex items-center gap-1.5 active:scale-95",
                timeFilter === item.val
                  ? "bg-[hsl(var(--flights))] text-primary-foreground border-[hsl(var(--flights))]"
                  : "bg-card border-border/40 text-muted-foreground hover:border-[hsl(var(--flights))]/40"
              )}
            >
              <span className="text-xs">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <>
          <Separator className="bg-border/30" />
          <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full text-muted-foreground text-xs">
            <X className="w-3 h-3 mr-1" />
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

      <main className="pt-16 pb-20 relative z-10">
        <div className="container mx-auto px-4 max-w-5xl">

          {/* Sticky summary bar — glassmorphic, compact */}
          <div className="sticky top-14 z-20 -mx-4 px-4 mb-4">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-card/85 backdrop-blur-xl rounded-2xl border border-border/40 shadow-lg shadow-background/50 p-3 sm:p-3.5"
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
                {/* Price indicator */}
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

          {/* Sort tabs + filter — compact row */}
          {offers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="flex items-center justify-between mb-3 gap-2"
            >
              {/* Sort pills */}
              <div className="flex gap-0.5 p-0.5 bg-muted/40 backdrop-blur-sm rounded-lg border border-border/20">
                {(["best", "cheapest", "fastest"] as SortBy[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-200 capitalize",
                      sortBy === s
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {s === "best" ? "✨ Best" : s === "cheapest" ? "💰 Cheapest" : "⚡ Fastest"}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {/* Result count */}
                <span className="text-[10px] text-muted-foreground tabular-nums hidden sm:inline">
                  {filtered.length} flight{filtered.length !== 1 ? "s" : ""}
                </span>

                {/* Filter button (mobile = sheet) */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1 border-border/40 relative h-7 px-2.5 text-[11px] sm:hidden">
                      <Filter className="w-3 h-3" />
                      Filter
                      {activeFilterCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[hsl(var(--flights))] text-[8px] text-primary-foreground font-bold flex items-center justify-center">
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
              </div>
            </motion.div>
          )}

          <div className="flex gap-5">
            {/* Desktop filters sidebar */}
            {offers.length > 0 && (
              <div className="hidden sm:block w-52 shrink-0">
                <div className="sticky top-32 bg-card/70 backdrop-blur-xl rounded-2xl border border-border/40 p-3.5">
                  <p className="text-xs font-semibold mb-3 flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-[hsl(var(--flights))]" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="text-[9px] h-4 px-1.5">{activeFilterCount}</Badge>
                    )}
                  </p>
                  {filterContent}
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

              {/* Results list — premium cards */}
              <div className="space-y-2.5">
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
                      <div
                        className={cn(
                          "bg-card/80 backdrop-blur-sm rounded-xl border border-border/30 p-3.5 sm:p-4 cursor-pointer group transition-all duration-200",
                          "hover:border-[hsl(var(--flights))]/40 hover:shadow-lg hover:shadow-[hsl(var(--flights))]/5",
                          "active:scale-[0.99]",
                          idx === 0 && "border-[hsl(var(--flights))]/25"
                        )}
                        onClick={() => handleSelect(offer)}
                      >
                        {/* Top badge */}
                        {idx === 0 && (
                          <div className="mb-2">
                            <Badge className={cn(
                              "text-[9px] font-bold px-2 py-0.5 border",
                              sortBy === "best" && "bg-[hsl(var(--flights))]/10 text-[hsl(var(--flights))] border-[hsl(var(--flights))]/20",
                              sortBy === "cheapest" && "bg-primary/10 text-primary border-primary/20",
                              sortBy === "fastest" && "bg-amber-500/10 text-amber-600 border-amber-500/20",
                            )}>
                              {sortBy === "best" ? "✨ Best Option" : sortBy === "cheapest" ? "💰 Lowest Price" : "⚡ Fastest"}
                            </Badge>
                          </div>
                        )}

                        {/* Two-column: route info | price */}
                        <div className="flex items-start justify-between gap-3">
                          {/* Left: airline + route */}
                          <div className="flex-1 min-w-0 space-y-2.5">
                            {/* Airline row */}
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-muted/50 border border-border/20 flex items-center justify-center overflow-hidden shrink-0">
                                <img
                                  src={getDuffelAirlineLogo(offer.airlineCode)}
                                  alt={offer.airline}
                                  className="w-6 h-6 object-contain"
                                  onError={(e) => {
                                    const el = e.target as HTMLImageElement;
                                    el.style.display = 'none';
                                    el.parentElement!.innerHTML = `<span class="text-[10px] font-bold text-muted-foreground">${offer.airlineCode}</span>`;
                                  }}
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold leading-tight truncate">{offer.airline}</p>
                                <p className="text-[10px] text-muted-foreground">{offer.flightNumber}</p>
                              </div>
                            </div>

                            {/* Route timeline — the visual centerpiece */}
                            <div className="flex items-center gap-2">
                              <div className="text-left min-w-[46px]">
                                <p className="text-lg font-bold tabular-nums leading-none">{offer.departure.time}</p>
                                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{offer.departure.code}</p>
                              </div>

                              <div className="flex flex-col items-center flex-1 py-1">
                                <span className="text-[9px] text-muted-foreground font-medium flex items-center gap-0.5">
                                  <Clock className="w-2.5 h-2.5" />
                                  {offer.duration}
                                </span>
                                <div className="w-full h-[1.5px] bg-gradient-to-r from-[hsl(var(--flights))]/60 via-border/40 to-[hsl(var(--flights))]/60 relative my-1 rounded-full">
                                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[hsl(var(--flights))] border-[1.5px] border-card" />
                                  {offer.stops > 0 && Array.from({ length: Math.min(offer.stops, 2) }).map((_, i) => (
                                    <div
                                      key={i}
                                      className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-muted-foreground/50 border border-card"
                                      style={{ left: `${((i + 1) / (offer.stops + 1)) * 100}%` }}
                                    />
                                  ))}
                                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[hsl(var(--flights))] border-[1.5px] border-card" />
                                </div>
                                <span className={cn(
                                  "text-[9px] font-semibold",
                                  offer.stops === 0 ? "text-primary" : "text-muted-foreground"
                                )}>
                                  {offer.stops === 0 ? "Direct" : `${offer.stops} stop${offer.stops > 1 ? "s" : ""}`}
                                </span>
                              </div>

                              <div className="text-right min-w-[46px]">
                                <p className="text-lg font-bold tabular-nums leading-none">{offer.arrival.time}</p>
                                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{offer.arrival.code}</p>
                              </div>
                            </div>
                          </div>

                          {/* Right: price + CTA */}
                          <div className="flex flex-col items-end justify-between shrink-0 min-h-[80px]">
                            <div className="text-right">
                              <p className="text-xl font-bold text-[hsl(var(--flights))] tabular-nums leading-none">
                                ${Math.round(offer.price)}
                              </p>
                              <p className="text-[9px] text-muted-foreground mt-0.5">/person</p>
                            </div>
                            <Button
                              size="sm"
                              className="h-7 px-3 text-[10px] font-bold bg-[hsl(var(--flights))] hover:bg-[hsl(var(--flights))]/90 shadow-sm active:scale-95 transition-all gap-1 mt-2"
                              onClick={(e) => { e.stopPropagation(); handleSelect(offer); }}
                            >
                              Select
                              <ChevronRight className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Bottom tags */}
                        <div className="flex gap-1 mt-2.5 flex-wrap">
                          <Badge variant="outline" className="text-[8px] border-border/20 bg-muted/20 capitalize h-4 px-1.5">
                            {offer.cabinClass}
                          </Badge>
                          {offer.baggageIncluded && (
                            <Badge variant="outline" className="text-[8px] border-border/20 bg-muted/20 gap-0.5 h-4 px-1.5">
                              <Luggage className="w-2 h-2" />
                              {offer.baggageIncluded}
                            </Badge>
                          )}
                          {offer.isRefundable && (
                            <Badge variant="outline" className="text-[8px] border-primary/20 text-primary bg-primary/5 h-4 px-1.5">
                              Refundable
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Results count footer */}
              {filtered.length > 0 && (
                <p className="text-center text-[10px] text-muted-foreground mt-4 sm:hidden">
                  Showing {filtered.length} of {offers.length} flights
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FlightResults;
