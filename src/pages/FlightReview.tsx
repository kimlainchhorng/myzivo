/**
 * Flight Review Page — /flights/details/review
 * Premium 3D review experience before proceeding to passenger info
 */

import { useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plane, Clock, MapPin, Luggage, ShieldCheck, AlertTriangle, ChevronRight, Briefcase, Info, ArrowRight, Sparkles } from "lucide-react";
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
import BoardingPass3D from "@/components/flight/BoardingPass3D";
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

  const segments = offer?.segments || [];
  const isRoundTrip = !!searchParams.returnDate;

  // Split segments into outbound and return slices
  const { outboundSegments, returnSegments } = useMemo(() => {
    if (!isRoundTrip || segments.length === 0) {
      return { outboundSegments: segments, returnSegments: [] as DuffelSegment[] };
    }
    const destCode = (searchParams.destination || offer?.arrival?.code || "").toUpperCase();
    
    let splitIdx = -1;
    for (let i = 1; i < segments.length; i++) {
      const segOrigin = segments[i].origin.code.toUpperCase();
      if (segOrigin === destCode) {
        splitIdx = i;
        break;
      }
    }
    
    if (splitIdx === -1 && searchParams.returnDate) {
      const returnDate = new Date(searchParams.returnDate + "T00:00:00").getTime();
      for (let i = 1; i < segments.length; i++) {
        const segDate = new Date(segments[i].departingAt).getTime();
        if (segDate >= returnDate) {
          splitIdx = i;
          break;
        }
      }
    }
    
    if (splitIdx === -1) {
      return { outboundSegments: segments, returnSegments: [] as DuffelSegment[] };
    }
    
    return {
      outboundSegments: segments.slice(0, splitIdx),
      returnSegments: segments.slice(splitIdx),
    };
  }, [segments, isRoundTrip, searchParams]);

  // Helper to get first/last info from a segment list
  const getSliceInfo = (segs: DuffelSegment[]) => {
    if (!segs.length) return null;
    const first = segs[0];
    const last = segs[segs.length - 1];
    const formatTimeLocal = (dateStr: string) => {
      try { return new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }); } catch { return ""; }
    };
    const depTime = formatTimeLocal(first.departingAt);
    const arrTime = formatTimeLocal(last.arrivingAt);
    const depCode = first.origin.code;
    const arrCode = last.destination.code;
    const depCity = first.origin.city;
    const arrCity = last.destination.city;
    const stops = segs.length - 1;
    const totalMs = new Date(last.arrivingAt).getTime() - new Date(first.departingAt).getTime();
    const totalH = Math.floor(totalMs / 3600000);
    const totalM = Math.floor((totalMs % 3600000) / 60000);
    const duration = `${totalH}h ${totalM}m`;
    return { depTime, arrTime, depCode, arrCode, depCity, arrCity, stops, duration, depDate: first.departingAt };
  };

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
  const isRoundTrip = !!searchParams.returnDate;

  // Split segments into outbound and return slices
  const { outboundSegments, returnSegments } = useMemo(() => {
    if (!isRoundTrip || segments.length === 0) {
      return { outboundSegments: segments, returnSegments: [] as DuffelSegment[] };
    }
    // Find the split point: the first segment whose origin matches the search destination
    const destCode = (searchParams.destination || offer.arrival?.code || "").toUpperCase();
    const originCode = (searchParams.origin || offer.departure?.code || "").toUpperCase();
    
    let splitIdx = -1;
    for (let i = 1; i < segments.length; i++) {
      const segOrigin = segments[i].origin.code.toUpperCase();
      // Return slice starts when a segment departs from the destination city
      if (segOrigin === destCode) {
        splitIdx = i;
        break;
      }
    }
    
    // Fallback: if we can't find the split, check by date (return segments depart on/after return date)
    if (splitIdx === -1 && searchParams.returnDate) {
      const returnDate = new Date(searchParams.returnDate + "T00:00:00").getTime();
      for (let i = 1; i < segments.length; i++) {
        const segDate = new Date(segments[i].departingAt).getTime();
        if (segDate >= returnDate) {
          splitIdx = i;
          break;
        }
      }
    }
    
    if (splitIdx === -1) {
      return { outboundSegments: segments, returnSegments: [] as DuffelSegment[] };
    }
    
    return {
      outboundSegments: segments.slice(0, splitIdx),
      returnSegments: segments.slice(splitIdx),
    };
  }, [segments, isRoundTrip, searchParams]);

  // Build carrier info
  const carrierNames = (() => {
    if (!offer.carriers?.length) return offer.airline;
    const unique = [...new Set(offer.carriers.map((c: any) => c.name))];
    return unique.join(" + ");
  })();

  const carrierCodes = (() => {
    if (!offer.carriers?.length) return [offer.airlineCode];
    return [...new Set(offer.carriers.map((c: any) => c.code))];
  })();

  // Helper to get first/last info from a segment list
  const getSliceInfo = (segs: DuffelSegment[]) => {
    if (!segs.length) return null;
    const first = segs[0];
    const last = segs[segs.length - 1];
    const depTime = formatTime(first.departingAt);
    const arrTime = formatTime(last.arrivingAt);
    const depCode = first.origin.code;
    const arrCode = last.destination.code;
    const depCity = first.origin.city;
    const arrCity = last.destination.city;
    const stops = segs.length - 1;
    
    // Calculate total duration
    const totalMs = new Date(last.arrivingAt).getTime() - new Date(first.departingAt).getTime();
    const totalH = Math.floor(totalMs / 3600000);
    const totalM = Math.floor((totalMs % 3600000) / 60000);
    const duration = `${totalH}h ${totalM}m`;
    
    return { depTime, arrTime, depCode, arrCode, depCity, arrCity, stops, duration, depDate: first.departingAt };
  };

  return (
    <div className="min-h-[100dvh] bg-background relative overflow-hidden flex flex-col">
      <SEOHead
        title={`Review Flight ${offer.departure.code} → ${offer.arrival.code} – ZIVO`}
        description={`Review your ${offer.airline} flight from ${offer.departure.city} to ${offer.arrival.city}.`}
      />

      {/* Decorative orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 right-0 w-72 h-72 rounded-full bg-[hsl(var(--flights))]/6 blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-52 h-52 rounded-full bg-[hsl(var(--flights))]/4 blur-3xl" />
      </div>

      <Header />

      <main className="flex-1 pt-14 pb-28 sm:pb-20 relative z-10">
        <div className="mx-auto px-3 sm:px-4 max-w-2xl">

          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-3"
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
            className="mb-4"
          >
            <h1 className="text-xl sm:text-2xl font-bold">Review your flight</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Confirm details before continuing to passenger information
            </p>
          </motion.div>

          {/* ============================================ */}
          {/* PREMIUM FLIGHT OVERVIEW CARD — 3D gradient  */}
          {/* ============================================ */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-[hsl(var(--flights))]/25 shadow-md shadow-[hsl(var(--flights))]/8 overflow-hidden relative">
              {/* Gradient glow top edge */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[hsl(var(--flights))] to-transparent" />
              
              {/* Header strip — multi-carrier aware */}
              <div className="bg-gradient-to-r from-[hsl(var(--flights))]/10 via-[hsl(var(--flights))]/6 to-[hsl(var(--flights))]/10 px-4 py-3 flex items-center gap-3 border-b border-[hsl(var(--flights))]/10">
                {/* Stacked airline logos */}
                <div className="relative shrink-0" style={{ width: carrierCodes.length > 1 ? 52 : 40 }}>
                  <AirlineLogo
                    iataCode={carrierCodes[0]}
                    airlineName={offer.airline}
                    size={40}
                    className="border border-border/20 bg-card shadow-sm"
                  />
                  {carrierCodes.length > 1 && (
                    <AirlineLogo
                      iataCode={carrierCodes[1]}
                      airlineName={offer.carriers?.[1]?.name || ""}
                      size={28}
                      className="absolute -bottom-0.5 -right-0.5 border-2 border-card bg-card shadow-sm"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold truncate">{carrierNames}</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[10px] text-muted-foreground font-medium">{offer.flightNumber}</p>
                    {offer.operatedBy && (
                      <p className="text-[9px] text-muted-foreground/70 truncate">· Operated by {offer.operatedBy}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {offer.isRefundable && (
                    <Badge className="text-[8px] font-semibold bg-primary/10 text-primary border border-primary/20 gap-0.5 px-1.5 py-0.5">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      Refundable
                    </Badge>
                  )}
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                {/* Route summary — enhanced with bigger type and gradient line */}
                <div className="flex items-center gap-2">
                  <div className="text-left shrink-0">
                    <p className="text-[26px] sm:text-3xl font-extrabold tabular-nums leading-none tracking-tight">{offer.departure.time}</p>
                    <p className="text-xs text-[hsl(var(--flights))] font-bold mt-1">{offer.departure.code}</p>
                    <p className="text-[10px] text-muted-foreground">{offer.departure.city}</p>
                  </div>

                  <div className="flex flex-col items-center flex-1 min-w-0 px-1">
                    <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 mb-1.5">
                      <Clock className="w-3 h-3" />
                      {offer.duration}
                    </span>
                    {/* Gradient route line */}
                    <div className="w-full h-[2px] bg-gradient-to-r from-[hsl(var(--flights))] via-[hsl(var(--flights))]/30 to-[hsl(var(--flights))] relative rounded-full">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[hsl(var(--flights))] border-2 border-card shadow-sm shadow-[hsl(var(--flights))]/30" />
                      {offer.stops > 0 && Array.from({ length: Math.min(offer.stops, 3) }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-muted-foreground/40 border-2 border-card"
                          style={{ left: `${((i + 1) / (Math.min(offer.stops, 3) + 1)) * 100}%` }}
                        />
                      ))}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[hsl(var(--flights))] border-2 border-card shadow-sm shadow-[hsl(var(--flights))]/30" />
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold mt-1.5",
                      offer.stops === 0 ? "text-primary" : "text-[hsl(var(--flights))]"
                    )}>
                      {offer.stops === 0 ? "Nonstop" : `${offer.stops} stop${offer.stops > 1 ? "s" : ""}`}
                    </span>
                    {offer.stopDetails?.length > 0 ? (
                      <span className="text-[9px] text-muted-foreground flex items-center gap-0.5 flex-wrap justify-center">
                        {offer.stopDetails.map((s: any, i: number) => (
                          <span key={i} className="flex items-center gap-0.5">
                            {i > 0 && <ArrowRight className="w-1.5 h-1.5" />}
                            <span className="font-medium">{s.code}</span>
                            {s.layoverDuration && <span className="text-muted-foreground/60">({s.layoverDuration})</span>}
                          </span>
                        ))}
                      </span>
                    ) : offer.stopCities?.length > 0 && (
                      <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                        <MapPin className="w-2 h-2" />
                        {offer.stopCities.join(", ")}
                      </span>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[26px] sm:text-3xl font-extrabold tabular-nums leading-none tracking-tight">{offer.arrival.time}</p>
                    <p className="text-xs text-[hsl(var(--flights))] font-bold mt-1">{offer.arrival.code}</p>
                    <p className="text-[10px] text-muted-foreground">{offer.arrival.city}</p>
                  </div>
                </div>

                {/* Date & terminal row */}
                <div className="flex justify-between text-[11px] text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 border border-border/20">
                  <span className="font-medium">{formatDate(offer.departure.date)}</span>
                  {offer.departure.terminal && <span>Terminal {offer.departure.terminal}</span>}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ============================================ */}
          {/* 3D BOARDING PASS PREVIEW                     */}
          {/* ============================================ */}
          <motion.div
            initial={{ opacity: 0, y: 16, rotateX: -8 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mt-4"
          >
            <BoardingPass3D offer={offer} />
          </motion.div>

          {/* ============================================ */}
          {/* SEGMENT TIMELINE — redesigned                */}
          {/* ============================================ */}
          {segments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4"
            >
              <Card className="border-border/30 overflow-hidden">
                {/* Section header */}
                <div className="px-4 py-2.5 bg-muted/30 border-b border-border/20 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[hsl(var(--flights))]/10 flex items-center justify-center">
                    <Plane className="w-3 h-3 text-[hsl(var(--flights))]" />
                  </div>
                  <p className="text-xs font-bold tracking-wide">Flight Segments</p>
                  <Badge variant="secondary" className="text-[8px] ml-auto px-1.5 py-0">{segments.length} leg{segments.length > 1 ? "s" : ""}</Badge>
                </div>
                <CardContent className="p-0">
                  {segments.map((seg: DuffelSegment, i: number) => (
                    <div key={seg.id || i}>
                      {/* Layover badge between segments */}
                      {i > 0 && (
                        <div className="flex items-center gap-2.5 px-4 py-2 bg-accent/30 border-y border-dashed border-border/30">
                          <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                            <Clock className="w-2.5 h-2.5 text-accent-foreground" />
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Layover in <span className="font-semibold text-foreground">{seg.origin.city}</span>
                            {seg.origin.name && <span className="text-muted-foreground/70"> ({seg.origin.name})</span>}
                          </p>
                        </div>
                      )}

                      <div className="px-4 py-3">
                        {/* Segment header — carrier + duration */}
                        <div className="flex items-center gap-2.5 mb-2.5">
                          <AirlineLogo
                            iataCode={seg.operatingCarrierCode || seg.marketingCarrierCode}
                            airlineName={seg.operatingCarrier || seg.marketingCarrier}
                            size={28}
                            className="border border-border/20 bg-card shadow-sm"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold truncate">
                              {seg.operatingCarrier || seg.marketingCarrier} · {seg.flightNumber}
                            </p>
                            <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                              {seg.aircraft && <span>{seg.aircraft}</span>}
                              {seg.aircraft && seg.cabinClass && <span>·</span>}
                              {seg.cabinClass && <span className="capitalize">{seg.cabinClass.replace("_", " ")}</span>}
                            </p>
                          </div>
                          {seg.duration && (
                            <Badge variant="outline" className="text-[9px] font-semibold gap-0.5 px-2 py-0.5 border-border/30">
                              <Clock className="w-2.5 h-2.5" />
                              {seg.duration}
                            </Badge>
                          )}
                        </div>

                        {/* Timeline — vertical dot-line */}
                        <div className="ml-3.5 pl-5 relative">
                          {/* Vertical connecting line */}
                          <div className="absolute left-0 top-2 bottom-2 w-[2px] bg-gradient-to-b from-[hsl(var(--flights))] via-[hsl(var(--flights))]/30 to-[hsl(var(--flights))]" />
                          
                          {/* Departure */}
                          <div className="flex items-start gap-3 relative pb-4">
                            <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-[hsl(var(--flights))] border-2 border-card shadow-sm shadow-[hsl(var(--flights))]/30 z-10" />
                            <div>
                              <p className="text-sm font-bold tabular-nums leading-none">
                                {formatTime(seg.departingAt) || offer.departure.time}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {seg.origin.code} · {seg.origin.city}
                                {seg.origin.terminal && <span className="text-muted-foreground/60"> · T{seg.origin.terminal}</span>}
                              </p>
                            </div>
                          </div>

                          {/* Arrival */}
                          <div className="flex items-start gap-3 relative">
                            <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-[hsl(var(--flights))] border-2 border-card shadow-sm shadow-[hsl(var(--flights))]/30 z-10" />
                            <div>
                              <p className="text-sm font-bold tabular-nums leading-none">
                                {formatTime(seg.arrivingAt) || offer.arrival.time}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {seg.destination.code} · {seg.destination.city}
                                {seg.destination.terminal && <span className="text-muted-foreground/60"> · T{seg.destination.terminal}</span>}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Fare Details */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-3"
          >
            <Card className="border-border/30">
              <CardContent className="p-4 space-y-3">
                <p className="text-xs font-bold flex items-center gap-1.5">
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
            transition={{ delay: 0.3 }}
            className="mt-3"
          >
            <Card className="border-[hsl(var(--flights))]/20 shadow-sm shadow-[hsl(var(--flights))]/5">
              <CardContent className="p-4 space-y-3">
                <p className="text-xs font-bold">Price Summary</p>

                <div className="space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Price per traveler</span>
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
                    <span className="text-sm font-bold">Total</span>
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
            transition={{ delay: 0.35 }}
            className="mt-3"
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
            transition={{ delay: 0.4 }}
            className="mt-5 hidden sm:flex gap-3"
          >
            <Button variant="outline" onClick={handleBack} className="flex-1 border-border/40">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Results
            </Button>
            <Button
              onClick={handleContinue}
              className="flex-1 bg-[hsl(var(--flights))] hover:bg-[hsl(var(--flights))]/90 font-bold gap-2 active:scale-95 transition-all shadow-md shadow-[hsl(var(--flights))]/20"
            >
              Continue to Passenger Details
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </main>

      {/* ============================================ */}
      {/* STICKY MOBILE CTA — glassmorphic upgrade     */}
      {/* ============================================ */}
      <div className="fixed bottom-0 left-0 right-0 z-30 sm:hidden">
        <div className="bg-card/80 backdrop-blur-2xl border-t border-[hsl(var(--flights))]/15 px-4 py-3 safe-area-bottom shadow-[0_-4px_20px_-4px_hsl(var(--flights)/0.1)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] text-muted-foreground font-medium">Total price</p>
              <p className="text-xl font-extrabold text-[hsl(var(--flights))] tabular-nums leading-none">
                ${Math.round((offer.pricePerPerson || offer.price) * totalPassengers)}
              </p>
              <p className="text-[9px] text-muted-foreground mt-0.5">
                {totalPassengers > 1 ? `${totalPassengers} travelers` : "1 traveler"} · {offer.currency || "USD"}
              </p>
            </div>
            <Button
              onClick={handleContinue}
              className="bg-[hsl(var(--flights))] hover:bg-[hsl(var(--flights))]/90 font-bold gap-1.5 active:scale-95 transition-all h-12 px-6 text-sm rounded-xl shadow-lg shadow-[hsl(var(--flights))]/25"
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
