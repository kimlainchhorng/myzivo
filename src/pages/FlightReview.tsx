/**
 * Flight Review Page — /flights/details/review
 * Complete booking flow review with step indicator, trip details, fare rules
 */

import { useMemo, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Plane, Clock, ChevronRight, ArrowRightLeft,
  MapPin, Timer, Calendar, Users, AlertTriangle, Shield
} from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { type DuffelOffer, type DuffelSegment } from "@/hooks/useDuffelFlights";
import { AirlineLogo } from "@/components/flight/AirlineLogo";
import BoardingPass3D from "@/components/flight/BoardingPass3D";
import { StepIndicator } from "@/components/flight/review/StepIndicator";
import { FareRulesCard } from "@/components/flight/review/FareRulesCard";
import { PriceSummaryCard } from "@/components/flight/review/PriceSummaryCard";
import { cn } from "@/lib/utils";

/* ── Helpers ─────────────────────────────────────────── */
function calcLayover(prev: DuffelSegment, next: DuffelSegment): string {
  try {
    const ms = new Date(next.departingAt).getTime() - new Date(prev.arrivingAt).getTime();
    if (ms <= 0) return "";
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m`;
  } catch { return ""; }
}

const formatDate = (d: string) => {
  try { return new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }); } catch { return d; }
};
const formatDateShort = (d: string) => {
  try { return new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }); } catch { return d; }
};
const formatTime = (d: string) => {
  try { return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }); } catch { return ""; }
};

function getSliceInfo(segs: DuffelSegment[]) {
  if (!segs.length) return null;
  const first = segs[0];
  const last = segs[segs.length - 1];
  const totalMs = new Date(last.arrivingAt).getTime() - new Date(first.departingAt).getTime();
  const totalH = Math.floor(totalMs / 3600000);
  const totalM = Math.floor((totalMs % 3600000) / 60000);
  return {
    depTime: formatTime(first.departingAt), arrTime: formatTime(last.arrivingAt),
    depCode: first.origin.code, arrCode: last.destination.code,
    depCity: first.origin.city, arrCity: last.destination.city,
    stops: segs.length - 1, duration: `${totalH}h ${totalM}m`,
    depDate: first.departingAt, arrDate: last.arrivingAt,
    stopCities: segs.slice(1).map(s => s.origin.code),
    carriers: [...new Set(segs.map(s => s.operatingCarrier || s.marketingCarrier))],
    carrierCodes: [...new Set(segs.map(s => s.operatingCarrierCode || s.marketingCarrierCode))],
  };
}

/* ── Slice Overview Card ─────────────────────────────── */
function SliceCard({ info, label, rotate, segs }: {
  info: NonNullable<ReturnType<typeof getSliceInfo>>;
  label: string; rotate?: boolean; segs: DuffelSegment[];
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-lg bg-[hsl(var(--flights))]/10 flex items-center justify-center">
          <Plane className={cn("w-3.5 h-3.5 text-[hsl(var(--flights))]", rotate && "rotate-180")} />
        </div>
        <p className="text-xs font-bold text-[hsl(var(--flights))] uppercase tracking-wider">{label}</p>
        <Badge variant="secondary" className="text-[8px] ml-auto px-1.5 py-0 h-4">
          {formatDateShort(info.depDate)}
        </Badge>
      </div>

      <Card className="border-[hsl(var(--flights))]/25 shadow-md shadow-[hsl(var(--flights))]/8 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[hsl(var(--flights))] to-transparent" />

        {/* Carrier strip */}
        <div className="bg-gradient-to-r from-[hsl(var(--flights))]/10 via-[hsl(var(--flights))]/5 to-[hsl(var(--flights))]/10 px-4 py-2.5 flex items-center gap-3 border-b border-[hsl(var(--flights))]/10">
          <div className="flex items-center -space-x-2">
            {info.carrierCodes.slice(0, 2).map((code, ci) => (
              <AirlineLogo
                key={code + ci}
                iataCode={code}
                airlineName={info.carriers[ci] || ""}
                size={ci === 0 ? 36 : 28}
                className={cn("border border-border/20 bg-card shadow-sm", ci > 0 && "relative z-10")}
              />
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold truncate">{info.carriers.join(" + ")}</p>
            <p className="text-[9px] text-muted-foreground">{segs[0].flightNumber}</p>
          </div>
          <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <Timer className="w-3 h-3" />
            <span className="font-semibold">{info.duration}</span>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Route timeline */}
          <div className="flex items-center gap-2">
            <div className="text-left shrink-0">
              <p className="text-[26px] sm:text-3xl font-extrabold tabular-nums leading-none tracking-tight">{info.depTime}</p>
              <p className="text-xs text-[hsl(var(--flights))] font-bold mt-1">{info.depCode}</p>
              <p className="text-[10px] text-muted-foreground">{info.depCity}</p>
            </div>
            <div className="flex flex-col items-center flex-1 min-w-0 px-1">
              <div className="w-full h-[2px] bg-gradient-to-r from-[hsl(var(--flights))] via-[hsl(var(--flights))]/30 to-[hsl(var(--flights))] relative rounded-full">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[hsl(var(--flights))] border-2 border-card shadow-sm" />
                {info.stops > 0 && Array.from({ length: Math.min(info.stops, 3) }).map((_, i) => (
                  <div key={i} className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-muted-foreground/40 border-2 border-card"
                    style={{ left: `${((i + 1) / (Math.min(info.stops, 3) + 1)) * 100}%` }} />
                ))}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[hsl(var(--flights))] border-2 border-card shadow-sm" />
              </div>
              <span className={cn("text-[10px] font-bold mt-1.5", info.stops === 0 ? "text-primary" : "text-[hsl(var(--flights))]")}>
                {info.stops === 0 ? "Nonstop" : `${info.stops} stop${info.stops > 1 ? "s" : ""}`}
              </span>
              {info.stopCities.length > 0 && (
                <span className="text-[9px] text-muted-foreground mt-0.5">via {info.stopCities.join(", ")}</span>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-[26px] sm:text-3xl font-extrabold tabular-nums leading-none tracking-tight">{info.arrTime}</p>
              <p className="text-xs text-[hsl(var(--flights))] font-bold mt-1">{info.arrCode}</p>
              <p className="text-[10px] text-muted-foreground">{info.arrCity}</p>
            </div>
          </div>

          <div className="flex justify-between text-[10px] text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 border border-border/20">
            <span className="font-medium flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(info.depDate)}</span>
            {segs[0].origin.terminal && <span>Terminal {segs[0].origin.terminal}</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Segment Detail Card ─────────────────────────────── */
function SegmentDetails({ segs, label, rotate }: { segs: DuffelSegment[]; label: string; rotate?: boolean }) {
  return (
    <Card className="border-border/30 overflow-hidden">
      <div className="px-4 py-2.5 bg-muted/30 border-b border-border/20 flex items-center gap-2">
        <div className="w-5 h-5 rounded-md bg-[hsl(var(--flights))]/10 flex items-center justify-center">
          <Plane className={cn("w-3 h-3 text-[hsl(var(--flights))]", rotate && "rotate-180")} />
        </div>
        <p className="text-xs font-bold tracking-wide">{label}</p>
        <Badge variant="secondary" className="text-[8px] ml-auto px-1.5 py-0">{segs.length} leg{segs.length > 1 ? "s" : ""}</Badge>
      </div>
      <CardContent className="p-0">
        {segs.map((seg, i) => (
          <div key={seg.id || i}>
            {i > 0 && (
              <div className="flex items-center gap-2.5 px-4 py-2.5 bg-accent/30 border-y border-dashed border-border/30">
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                  <Clock className="w-3 h-3 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-foreground">Layover in {seg.origin.city} ({seg.origin.code})</p>
                  <p className="text-[9px] text-muted-foreground">{calcLayover(segs[i - 1], seg)} · {seg.origin.name}</p>
                </div>
              </div>
            )}
            <div className="px-4 py-3">
              <div className="flex items-center gap-2.5 mb-2.5">
                <AirlineLogo
                  iataCode={seg.operatingCarrierCode || seg.marketingCarrierCode}
                  airlineName={seg.operatingCarrier || seg.marketingCarrier}
                  size={28} className="border border-border/20 bg-card shadow-sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold truncate">{seg.operatingCarrier || seg.marketingCarrier} · {seg.flightNumber}</p>
                  <p className="text-[9px] text-muted-foreground flex items-center gap-1 flex-wrap">
                    {seg.aircraft && <span>{seg.aircraft}</span>}
                    {seg.aircraft && seg.cabinClass && <span>·</span>}
                    {seg.cabinClass && <span className="capitalize">{seg.cabinClass.replace("_", " ")}</span>}
                  </p>
                </div>
                {seg.duration && (
                  <Badge variant="outline" className="text-[9px] font-semibold gap-0.5 px-2 py-0.5 border-border/30 shrink-0">
                    <Clock className="w-2.5 h-2.5" />{seg.duration}
                  </Badge>
                )}
              </div>
              <div className="ml-3.5 pl-5 relative">
                <div className="absolute left-0 top-2 bottom-2 w-[2px] bg-gradient-to-b from-[hsl(var(--flights))] via-[hsl(var(--flights))]/30 to-[hsl(var(--flights))]" />
                <div className="flex items-start gap-3 relative pb-4">
                  <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-[hsl(var(--flights))] border-2 border-card shadow-sm z-10" />
                  <div>
                    <p className="text-sm font-bold tabular-nums leading-none">{formatTime(seg.departingAt)}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {seg.origin.code} · {seg.origin.city}
                      {seg.origin.terminal && <span className="text-muted-foreground/60"> · T{seg.origin.terminal}</span>}
                    </p>
                    <p className="text-[9px] text-muted-foreground/60">{formatDateShort(seg.departingAt)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 relative">
                  <div className="absolute -left-5 top-1 w-3 h-3 rounded-full bg-[hsl(var(--flights))] border-2 border-card shadow-sm z-10" />
                  <div>
                    <p className="text-sm font-bold tabular-nums leading-none">{formatTime(seg.arrivingAt)}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {seg.destination.code} · {seg.destination.city}
                      {seg.destination.terminal && <span className="text-muted-foreground/60"> · T{seg.destination.terminal}</span>}
                    </p>
                    <p className="text-[9px] text-muted-foreground/60">{formatDateShort(seg.arrivingAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* ── Main Page ───────────────────────────────────────── */
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

  const { outboundSegments, returnSegments } = useMemo(() => {
    if (!isRoundTrip || segments.length === 0) {
      return { outboundSegments: segments, returnSegments: [] as DuffelSegment[] };
    }
    const destCode = (searchParams.destination || offer?.arrival?.code || "").toUpperCase();
    let splitIdx = -1;
    for (let i = 1; i < segments.length; i++) {
      if (segments[i].origin.code.toUpperCase() === destCode) { splitIdx = i; break; }
    }
    if (splitIdx === -1 && searchParams.returnDate) {
      const returnDate = new Date(searchParams.returnDate + "T00:00:00").getTime();
      for (let i = 1; i < segments.length; i++) {
        if (new Date(segments[i].departingAt).getTime() >= returnDate) { splitIdx = i; break; }
      }
    }
    if (splitIdx === -1) return { outboundSegments: segments, returnSegments: [] as DuffelSegment[] };
    return { outboundSegments: segments.slice(0, splitIdx), returnSegments: segments.slice(splitIdx) };
  }, [segments, isRoundTrip, searchParams]);

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
            <Button asChild className="bg-[hsl(var(--flights))]"><Link to="/flights">Search Flights</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleContinue = () => navigate("/flights/traveler-info");
  const handleBack = () => navigate(-1);
  const outboundInfo = getSliceInfo(outboundSegments);
  const returnInfo = getSliceInfo(returnSegments);

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

      <main className="flex-1 pt-14 pb-32 sm:pb-20 relative z-10">
        <div className="mx-auto px-3 sm:px-4 max-w-2xl">

          {/* Step indicator */}
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mb-2">
            <StepIndicator current={2} />
          </motion.div>

          {/* Back + badges */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-3 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1.5 text-muted-foreground -ml-2 h-8 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to results
            </Button>
            <div className="flex items-center gap-2">
              {isRoundTrip && (
                <Badge className="text-[9px] font-bold bg-[hsl(var(--flights))]/10 text-[hsl(var(--flights))] border border-[hsl(var(--flights))]/20 gap-1 px-2 py-0.5">
                  <ArrowRightLeft className="w-3 h-3" /> Round trip
                </Badge>
              )}
              <Badge variant="outline" className="text-[9px] font-bold gap-1 px-2 py-0.5 border-border/40">
                <Users className="w-3 h-3" /> {totalPassengers} traveler{totalPassengers > 1 ? "s" : ""}
              </Badge>
            </div>
          </motion.div>

          {/* Page title */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold">Review your flight</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Confirm all details before continuing to passenger information
            </p>
          </motion.div>

          {/* Outbound slice */}
          {outboundInfo && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <SliceCard info={outboundInfo} label={isRoundTrip ? "Outbound Flight" : "Your Flight"} segs={outboundSegments} />
            </motion.div>
          )}

          {/* Return slice */}
          {returnInfo && returnSegments.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }} className="mt-4">
              <SliceCard info={returnInfo} label="Return Flight" rotate segs={returnSegments} />
            </motion.div>
          )}

          {/* 3D Boarding Pass */}
          <motion.div initial={{ opacity: 0, y: 16, rotateX: -8 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ delay: 0.15, duration: 0.5 }} className="mt-4">
            <BoardingPass3D offer={offer} />
          </motion.div>

          {/* Segment timelines */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-4 space-y-3">
            <SegmentDetails segs={outboundSegments} label={isRoundTrip ? "Outbound Segments" : "Flight Segments"} />
            {returnSegments.length > 0 && <SegmentDetails segs={returnSegments} label="Return Segments" rotate />}
          </motion.div>

          {/* Fare Rules & Policies */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-3">
            <FareRulesCard offer={offer} />
          </motion.div>

          {/* Price Summary */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-3">
            <PriceSummaryCard offer={offer} searchParams={searchParams} totalPassengers={totalPassengers} isRoundTrip={isRoundTrip} />
          </motion.div>

          {/* Partner disclosure */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-3">
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

          {/* Trust badges row */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }} className="mt-3">
            <div className="flex items-center justify-center gap-4 py-2.5">
              {[
                { icon: Shield, text: "Secure booking" },
                { icon: MapPin, text: "Real-time prices" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Icon className="w-3.5 h-3.5 text-[hsl(var(--flights))]/70" />
                  <span className="font-medium">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Desktop CTA */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-4 hidden sm:flex gap-3">
            <Button variant="outline" onClick={handleBack} className="flex-1 border-border/40">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Results
            </Button>
            <Button
              onClick={handleContinue}
              className="flex-1 bg-[hsl(var(--flights))] hover:bg-[hsl(var(--flights))]/90 font-bold gap-2 active:scale-95 transition-all shadow-md shadow-[hsl(var(--flights))]/20"
            >
              Continue to Passenger Details <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </main>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 sm:hidden">
        <div className="bg-card/80 backdrop-blur-2xl border-t border-[hsl(var(--flights))]/15 px-4 py-3 safe-area-bottom shadow-[0_-4px_20px_-4px_hsl(var(--flights)/0.1)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] text-muted-foreground font-medium">Total price</p>
              <p className="text-xl font-extrabold text-[hsl(var(--flights))] tabular-nums leading-none">
                ${((offer.pricePerPerson || offer.price) * totalPassengers).toFixed(2)}
              </p>
              <p className="text-[9px] text-muted-foreground mt-0.5">
                {totalPassengers > 1 ? `${totalPassengers} travelers` : "1 traveler"} · {isRoundTrip ? "Round trip" : "One way"} · {offer.currency || "USD"}
              </p>
            </div>
            <Button
              onClick={handleContinue}
              className="bg-[hsl(var(--flights))] hover:bg-[hsl(var(--flights))]/90 font-bold gap-1.5 active:scale-95 transition-all h-12 px-6 text-sm rounded-xl shadow-lg shadow-[hsl(var(--flights))]/25"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="hidden sm:block"><Footer /></div>
    </div>
  );
};

export default FlightReview;
