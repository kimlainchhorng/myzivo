/**
 * Compact flight summary card for the traveler info page
 * Shows real Duffel API fare data: baggage, cabin, conditions
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AirlineLogo } from "@/components/flight/AirlineLogo";
import type { DuffelOffer, DuffelSegment } from "@/hooks/useDuffelFlights";

function calcLayoverMinutes(prev: DuffelSegment, next: DuffelSegment): number {
  try {
    const ms = new Date(next.departingAt).getTime() - new Date(prev.arrivingAt).getTime();
    return Math.max(0, Math.round(ms / 60000));
  } catch {
    return 0;
  }
}

function parseDurationText(duration?: string): number {
  if (!duration) return 0;
  const normalized = duration.trim().toLowerCase();
  const hourMatch = normalized.match(/(\d+)\s*h/);
  const minuteMatch = normalized.match(/(\d+)\s*m/);
  return (Number(hourMatch?.[1] || 0) * 60) + Number(minuteMatch?.[1] || 0);
}

function getSliceInfo(segs: DuffelSegment[]) {
  if (!segs.length) return null;
  const first = segs[0];
  const last = segs[segs.length - 1];
  const depTime = first.departingAt?.split("T")[1]?.slice(0, 5) || "—";
  const arrTime = last.arrivingAt?.split("T")[1]?.slice(0, 5) || "—";

  const flightMinutes = segs.reduce((total, seg) => total + parseDurationText(seg.duration), 0);
  const layoverMinutes = segs.slice(1).reduce((total, seg, index) => total + calcLayoverMinutes(segs[index], seg), 0);
  let totalMin = flightMinutes + layoverMinutes;

  if (totalMin <= 0) {
    const startMs = new Date(first.departingAt).getTime();
    const endMs = new Date(last.arrivingAt).getTime();
    totalMin = Math.max(0, Math.round((endMs - startMs) / 60000));
  }

  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;

  return {
    depTime, arrTime,
    depCode: first.origin.code,
    arrCode: last.destination.code,
    duration: totalMin > 0 ? `${h}h ${m}m` : "",
    stops: segs.length - 1,
  };
}

/** Build baggage summary text from real Duffel data */
function getBaggageSummary(offer: DuffelOffer): string {
  const bag = offer.baggageDetails;
  if (!bag) return offer.baggageIncluded || "";

  const parts: string[] = [];

  // Carry-on
  if (bag.carryOnIncluded) {
    let carryText = `Carry-on ×${bag.carryOnQuantity || 1}`;
    if (bag.carryOnWeightKg) carryText += ` (${bag.carryOnWeightKg}kg)`;
    parts.push(carryText);
  }

  // Checked bags
  if (bag.checkedBagsIncluded && bag.checkedBagQuantity > 0) {
    let checkedText = `Checked ×${bag.checkedBagQuantity}`;
    if (bag.checkedBagWeightKg && bag.checkedBagWeightLb) {
      checkedText += ` (${bag.checkedBagWeightKg}kg / ${bag.checkedBagWeightLb}lb)`;
    } else if (bag.checkedBagWeightKg) {
      checkedText += ` (${bag.checkedBagWeightKg}kg)`;
    } else if (bag.checkedBagWeightLb) {
      checkedText += ` (${bag.checkedBagWeightLb}lb)`;
    }
    parts.push(checkedText);
  }

  if (parts.length === 0) {
    if (bag.carryOnIncluded) return "Carry-on only";
    return "No bags included";
  }

  return parts.join(" · ");
}

export function FlightSummaryCompact({ offer, search }: { offer: DuffelOffer; search: any }) {
  const isRoundTrip = !!search?.returnDate;
  const segments = offer.segments || [];

  const { outbound, returnSegs } = useMemo(() => {
    if (!isRoundTrip || segments.length === 0) return { outbound: segments, returnSegs: [] };
    const dest = (search.destination || offer.arrival?.code || "").toUpperCase();
    const splitIdx = segments.findIndex((seg: DuffelSegment, i: number) =>
      i > 0 && seg.origin.code.toUpperCase() === dest
    );
    if (splitIdx <= 0) return { outbound: segments, returnSegs: [] };
    return { outbound: segments.slice(0, splitIdx), returnSegs: segments.slice(splitIdx) };
  }, [segments, isRoundTrip, search?.destination, offer.arrival?.code]);

  const outInfo = getSliceInfo(outbound);
  const retInfo = returnSegs.length > 0 ? getSliceInfo(returnSegs) : null;

  const carrierCodes = offer.carriers?.length
    ? [...new Set(offer.carriers.map((c: any) => c.code))].slice(0, 2)
    : [offer.airlineCode];

  const baggageSummary = getBaggageSummary(offer);

  const renderLeg = (info: ReturnType<typeof getSliceInfo>, label: string) => {
    if (!info) return null;
    return (
      <div>
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</p>
        <div className="flex items-center gap-2">
          <div className="min-w-[44px]">
            <p className="text-[15px] font-bold tabular-nums leading-none">{info.depTime}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{info.depCode}</p>
          </div>

          {/* Flight path line */}
          <div className="flex-1 flex flex-col items-center gap-0.5">
            <span className="text-[9px] text-muted-foreground tabular-nums">{info.duration}</span>
            <div className="w-full h-[2px] rounded-full relative"
              style={{
                background: "linear-gradient(90deg, hsl(var(--flights)) 0%, hsl(var(--flights)/0.3) 50%, hsl(var(--flights)) 100%)"
              }}
            >
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[6px] h-[6px] rounded-full bg-[hsl(var(--flights))] border-2 border-card" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[6px] h-[6px] rounded-full bg-[hsl(var(--flights))] border-2 border-card" />
            </div>
            <span className="text-[9px] text-muted-foreground">
              {info.stops === 0 ? "Direct" : `${info.stops} stop${info.stops > 1 ? "s" : ""}`}
            </span>
          </div>

          <div className="text-right min-w-[44px]">
            <p className="text-[15px] font-bold tabular-nums leading-none">{info.arrTime}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{info.arrCode}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card
        className="mb-4 overflow-hidden border-border/40"
        style={{
          boxShadow: "0 1px 0 0 hsl(var(--flights)/0.06), 0 4px 16px -4px hsl(var(--foreground)/0.06), 0 12px 36px -8px hsl(var(--foreground)/0.04), inset 0 1px 0 0 hsl(0 0% 100%/0.06)"
        }}
      >
        {/* Top accent line */}
        <div className="h-[2px] bg-gradient-to-r from-[hsl(var(--flights))] via-[hsl(var(--flights))]/50 to-[hsl(var(--flights))]" />

        <CardContent className="p-3.5">
          {/* Airline + Price header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0" style={{ width: carrierCodes.length > 1 ? 44 : 34, height: 34 }}>
                <AirlineLogo iataCode={carrierCodes[0]} airlineName={offer.airline} size={34} className="border border-border/20 shadow-sm" />
                {carrierCodes.length > 1 && (
                  <AirlineLogo iataCode={carrierCodes[1]} airlineName="" size={22} className="absolute bottom-0 right-0 border-2 border-card shadow-sm" />
                )}
              </div>
              <div>
                <p className="text-[13px] font-semibold leading-tight">{offer.airline}</p>
                <p className="text-[10px] text-muted-foreground">{offer.flightNumber}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-[hsl(var(--flights))] tabular-nums leading-tight">
                ${Math.round(offer.price).toLocaleString()}
              </p>
              <p className="text-[9px] text-muted-foreground">{isRoundTrip ? "round trip" : "one way"}</p>
            </div>
          </div>

          {/* Outbound leg */}
          {outInfo && renderLeg(outInfo, retInfo ? "Outbound" : "Flight")}

          {/* Return leg */}
          {retInfo && (
            <div className="mt-3 pt-3 border-t border-dashed border-border/30">
              {renderLeg(retInfo, "Return")}
            </div>
          )}

          {/* Fare badges — real Duffel data */}
          <div className="flex gap-1.5 mt-3 pt-2.5 border-t border-border/20 flex-wrap">
            {/* Cabin class */}
            <Badge variant="outline" className="text-[8px] h-[18px] px-1.5 capitalize border-border/30 bg-muted/30 font-medium">
              {offer.cabinClass?.replace("_", " ") || "Economy"}
            </Badge>

            {/* Round trip */}
            {isRoundTrip && (
              <Badge variant="outline" className="text-[8px] h-[18px] px-1.5 border-[hsl(var(--flights))]/20 text-[hsl(var(--flights))] bg-[hsl(var(--flights))]/5 font-medium">
                Round trip
              </Badge>
            )}

            {/* Fare brand name from Duffel */}
            {offer.fareBrandName && (
              <Badge variant="outline" className="text-[8px] h-[18px] px-1.5 border-border/30 bg-muted/30 font-medium">
                {offer.fareBrandName}
              </Badge>
            )}

            {/* Baggage summary from real data */}
            {baggageSummary && (
              <Badge variant="outline" className="text-[8px] h-[18px] px-1.5 border-border/30 bg-muted/30 font-medium">
                {baggageSummary}
              </Badge>
            )}

            {/* Refundable / Changeable conditions from Duffel */}
            {offer.conditions?.refundable && (
              <Badge variant="outline" className="text-[8px] h-[18px] px-1.5 border-emerald-500/20 text-emerald-600 bg-emerald-500/5 font-medium">
                Refundable
              </Badge>
            )}
            {offer.conditions?.changeable && (
              <Badge variant="outline" className="text-[8px] h-[18px] px-1.5 border-sky-500/20 text-sky-600 bg-sky-500/5 font-medium">
                Changeable
              </Badge>
            )}
          </div>

          {/* Penalty details if present */}
          {(offer.conditions?.changePenalty || offer.conditions?.refundPenalty) && (
            <div className="mt-2 flex gap-3 text-[8px] text-muted-foreground/70">
              {offer.conditions.changePenalty != null && offer.conditions.changePenalty > 0 && (
                <span>Change fee: ${offer.conditions.changePenalty} {offer.conditions.penaltyCurrency}</span>
              )}
              {offer.conditions.refundPenalty != null && offer.conditions.refundPenalty > 0 && (
                <span>Cancel fee: ${offer.conditions.refundPenalty} {offer.conditions.penaltyCurrency}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
