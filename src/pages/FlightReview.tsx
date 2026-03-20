/**
 * Flight Review Page — /flights/details/review
 * Shows full offer details before proceeding to passenger info
 */

import { useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plane, Clock, MapPin, Luggage, ShieldCheck, AlertTriangle, ChevronRight, Briefcase, Info, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { type DuffelOffer, type DuffelSegment } from "@/hooks/useDuffelFlights";
import { AirlineLogo } from "@/components/flight/AirlineLogo";
import { cn } from "@/lib/utils";

const FlightReview = () => {
  const navigate = useNavigate();

  const offer: DuffelOffer | null = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("zivo_selected_offer");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, []);

  const searchParams = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("zivo_search_params");
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }, []);

  const totalPassengers = (searchParams.adults || 1) + (searchParams.children || 0) + (searchParams.infants || 0);

  if (!offer) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Plane className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-bold mb-2">No Flight Selected</h1>
            <p className="text-sm text-muted-foreground mb-6">Please search and select a flight first.</p>
            <Button asChild className="bg-[hsl(var(--flights))]">
              <Link to="/flights">Search Flights</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleContinue = () => {
    navigate("/flights/traveler-info");
  };

  const handleBack = () => {
    navigate(-1);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    } catch { return dateStr; }
  };

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    } catch { return ""; }
  };

  const segments = offer.segments || [];

  return (
    <div className="min-h-[100dvh] bg-background relative overflow-hidden flex flex-col">
      <SEOHead
        title={`Review Flight ${offer.departure.code} → ${offer.arrival.code} – ZIVO`}
        description={`Review your ${offer.airline} flight from ${offer.departure.city} to ${offer.arrival.city}.`}
      />

      {/* Decorative */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 right-0 w-72 h-72 rounded-full bg-[hsl(var(--flights))]/6 blur-3xl" />
      </div>

      <Header />

      <main className="flex-1 pt-14 pb-4 sm:pb-20 relative z-10">
        <div className="mx-auto px-3 sm:px-4 max-w-2xl">

          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-4"
          >
            <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1.5 text-muted-foreground -ml-2 h-8 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to results
            </Button>
          </motion.div>

          {/* Page title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-5"
          >
            <h1 className="text-xl sm:text-2xl font-bold">Review your flight</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Confirm details before continuing to passenger information
            </p>
          </motion.div>

          {/* Flight Overview Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-[hsl(var(--flights))]/20 shadow-sm shadow-[hsl(var(--flights))]/4 overflow-hidden">
              {/* Header strip */}
              <div className="bg-[hsl(var(--flights))]/8 px-4 py-3 flex items-center gap-3 border-b border-[hsl(var(--flights))]/10">
                <div className="w-10 h-10 rounded-lg bg-card border border-border/30 flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src={getDuffelAirlineLogo(offer.airlineCode)}
                    alt={offer.airline}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      const el = e.target as HTMLImageElement;
                      el.style.display = "none";
                      el.parentElement!.innerHTML = `<span class="text-sm font-bold text-muted-foreground">${offer.airlineCode}</span>`;
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{offer.airline}</p>
                  <p className="text-[11px] text-muted-foreground">{offer.flightNumber}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {offer.isRefundable && (
                    <Badge className="text-[9px] font-semibold bg-primary/10 text-primary border border-primary/20 gap-0.5">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      Refundable
                    </Badge>
                  )}
                </div>
              </div>

              <CardContent className="p-4 space-y-4">
                {/* Route summary */}
                <div className="flex items-center gap-2">
                  <div className="text-left shrink-0">
                    <p className="text-2xl font-bold tabular-nums leading-none">{offer.departure.time}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-1">{offer.departure.code}</p>
                    <p className="text-[10px] text-muted-foreground">{offer.departure.city}</p>
                  </div>

                  <div className="flex flex-col items-center flex-1 min-w-0 px-2">
                    <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3" />
                      {offer.duration}
                    </span>
                    <div className="w-full h-[2px] bg-gradient-to-r from-[hsl(var(--flights))] via-border/50 to-[hsl(var(--flights))] relative rounded-full">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[hsl(var(--flights))] border-2 border-card" />
                      {offer.stops > 0 && Array.from({ length: Math.min(offer.stops, 3) }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute top-1/2 -translate-y-1/2 w-[6px] h-[6px] rounded-full bg-muted-foreground/50 border border-card"
                          style={{ left: `${((i + 1) / (Math.min(offer.stops, 3) + 1)) * 100}%` }}
                        />
                      ))}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[hsl(var(--flights))] border-2 border-card" />
                    </div>
                    <span className={cn(
                      "text-[10px] font-semibold mt-1",
                      offer.stops === 0 ? "text-primary" : "text-muted-foreground"
                    )}>
                      {offer.stops === 0 ? "Nonstop" : `${offer.stops} stop${offer.stops > 1 ? "s" : ""}`}
                    </span>
                    {offer.stopCities?.length > 0 && (
                      <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                        <MapPin className="w-2 h-2" />
                        {offer.stopCities.join(", ")}
                      </span>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-2xl font-bold tabular-nums leading-none">{offer.arrival.time}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-1">{offer.arrival.code}</p>
                    <p className="text-[10px] text-muted-foreground">{offer.arrival.city}</p>
                  </div>
                </div>

                {/* Date row */}
                <div className="flex justify-between text-[11px] text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                  <span>{formatDate(offer.departure.date)}</span>
                  {offer.departure.terminal && <span>Terminal {offer.departure.terminal}</span>}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Segment Details */}
          {segments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-4"
            >
              <Card className="border-border/30">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold mb-3 flex items-center gap-1.5">
                    <Plane className="w-3.5 h-3.5 text-[hsl(var(--flights))]" />
                    Flight Segments
                  </p>
                  <div className="space-y-0">
                    {segments.map((seg, i) => (
                      <div key={seg.id || i}>
                        {i > 0 && (
                          <div className="flex items-center gap-2 py-2.5 px-3 my-1 bg-muted/20 rounded-lg border border-dashed border-border/30">
                            <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
                            <p className="text-[10px] text-muted-foreground">
                              Layover in <span className="font-medium text-foreground">{seg.origin.city}</span>
                              {seg.origin.name && <span> ({seg.origin.name})</span>}
                            </p>
                          </div>
                        )}
                        <div className="py-2.5">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded bg-muted/40 border border-border/20 flex items-center justify-center overflow-hidden shrink-0">
                              <img
                                src={getDuffelAirlineLogo(seg.operatingCarrierCode || seg.marketingCarrierCode)}
                                alt=""
                                className="w-5 h-5 object-contain"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-medium truncate">
                                {seg.operatingCarrier || seg.marketingCarrier} · {seg.flightNumber}
                              </p>
                              <p className="text-[9px] text-muted-foreground">
                                {seg.aircraft && `${seg.aircraft} · `}{seg.cabinClass && <span className="capitalize">{seg.cabinClass.replace("_", " ")}</span>}
                              </p>
                            </div>
                            {seg.duration && (
                              <span className="text-[10px] text-muted-foreground ml-auto shrink-0 flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {seg.duration}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 pl-8">
                            <div className="space-y-1.5 relative">
                              <div className="absolute left-1 top-1.5 bottom-1.5 w-px bg-border/50" />
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--flights))] border border-card shrink-0 relative z-10" />
                                <div>
                                  <p className="text-[11px] font-semibold tabular-nums">
                                    {formatTime(seg.departingAt) || offer.departure.time}
                                  </p>
                                  <p className="text-[9px] text-muted-foreground">
                                    {seg.origin.code} · {seg.origin.city}
                                    {seg.origin.terminal && ` · T${seg.origin.terminal}`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 pt-1">
                                <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--flights))] border border-card shrink-0 relative z-10" />
                                <div>
                                  <p className="text-[11px] font-semibold tabular-nums">
                                    {formatTime(seg.arrivingAt) || offer.arrival.time}
                                  </p>
                                  <p className="text-[9px] text-muted-foreground">
                                    {seg.destination.code} · {seg.destination.city}
                                    {seg.destination.terminal && ` · T${seg.destination.terminal}`}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Fare Details */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4"
          >
            <Card className="border-border/30">
              <CardContent className="p-4 space-y-3">
                <p className="text-xs font-semibold flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[hsl(var(--flights))]" />
                  Fare Details
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Cabin class</span>
                    <span className="font-medium capitalize">{offer.cabinClass.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Baggage</span>
                    <span className="font-medium flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {offer.baggageIncluded || "Personal item"}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Refundable</span>
                    <span className={cn("font-medium", offer.isRefundable ? "text-primary" : "text-muted-foreground")}>
                      {offer.isRefundable ? "Yes" : "No"}
                    </span>
                  </div>
                  {offer.conditions?.changeBeforeDeparture !== null && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">Changeable</span>
                      <span className="font-medium">
                        {offer.conditions.changeBeforeDeparture ? "Yes" : "No"}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Price Summary */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-4"
          >
            <Card className="border-[hsl(var(--flights))]/15">
              <CardContent className="p-4 space-y-3">
                <p className="text-xs font-semibold">Price Summary</p>

                <div className="space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">
                      Price per traveler
                    </span>
                    <span className="font-medium tabular-nums">
                      ${Math.round(offer.pricePerPerson || offer.price)} {offer.currency || "USD"}
                    </span>
                  </div>

                  {totalPassengers > 1 && (
                    <>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Travelers</span>
                        <span className="font-medium">{totalPassengers}</span>
                      </div>
                      {searchParams.adults > 0 && (
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground pl-2">Adults × {searchParams.adults}</span>
                          <span className="font-medium tabular-nums">${Math.round((offer.pricePerPerson || offer.price) * searchParams.adults)}</span>
                        </div>
                      )}
                      {searchParams.children > 0 && (
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground pl-2">Children × {searchParams.children}</span>
                          <span className="font-medium tabular-nums">${Math.round((offer.pricePerPerson || offer.price) * searchParams.children)}</span>
                        </div>
                      )}
                      {searchParams.infants > 0 && (
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground pl-2">Infants × {searchParams.infants}</span>
                          <span className="font-medium tabular-nums">${Math.round((offer.pricePerPerson || offer.price) * searchParams.infants)}</span>
                        </div>
                      )}
                    </>
                  )}

                  <Separator className="bg-border/30" />

                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-semibold">Total</span>
                    <span className="text-2xl font-extrabold text-[hsl(var(--flights))] tabular-nums">
                      ${Math.round((offer.pricePerPerson || offer.price) * totalPassengers)}
                    </span>
                  </div>
                  <p className="text-[9px] text-muted-foreground text-right">
                    {offer.currency || "USD"} · Taxes and fees included
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Warning */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4"
          >
            <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-[hsl(var(--flights))]/5 border border-[hsl(var(--flights))]/15">
              <AlertTriangle className="w-4 h-4 text-[hsl(var(--flights))] shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium leading-relaxed">
                  Continuing will proceed to a <span className="font-bold">real booking flow</span>. 
                  You'll be asked for passenger details and payment. 
                  Final price and terms are confirmed at checkout.
                </p>
                <a href="/partner-disclosure" className="text-[10px] text-[hsl(var(--flights))] hover:underline mt-1 inline-block">
                  Partner disclosure →
                </a>
              </div>
            </div>
          </motion.div>

          {/* Desktop CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-6 hidden sm:flex gap-3"
          >
            <Button variant="outline" onClick={handleBack} className="flex-1 border-border/40">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Results
            </Button>
            <Button
              onClick={handleContinue}
              className="flex-1 bg-[hsl(var(--flights))] hover:bg-[hsl(var(--flights))]/90 font-semibold gap-2 active:scale-95 transition-all"
            >
              Continue to Passenger Details
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </main>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 sm:hidden">
        <div className="bg-card/95 backdrop-blur-xl border-t border-border/40 px-4 py-3 safe-area-bottom">
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div>
              <p className="text-[10px] text-muted-foreground">Total price</p>
              <p className="text-xl font-extrabold text-[hsl(var(--flights))] tabular-nums leading-none">
                ${Math.round((offer.pricePerPerson || offer.price) * totalPassengers)}
              </p>
              <p className="text-[9px] text-muted-foreground">
                {totalPassengers > 1 ? `${totalPassengers} travelers` : "1 traveler"} · {offer.currency || "USD"}
              </p>
            </div>
            <Button
              onClick={handleContinue}
              className="bg-[hsl(var(--flights))] hover:bg-[hsl(var(--flights))]/90 font-bold gap-1.5 active:scale-95 transition-all h-11 px-5 text-[13px]"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="hidden sm:block">
        <Footer />
      </div>
    </div>
  );
};

export default FlightReview;
