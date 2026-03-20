/**
 * Compact flight summary card for the traveler info page
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AirlineLogo } from "@/components/flight/AirlineLogo";
import type { DuffelOffer, DuffelSegment } from "@/hooks/useDuffelFlights";

function getSliceInfo(segs: DuffelSegment[]) {
  if (!segs.length) return null;
  const first = segs[0];
  const last = segs[segs.length - 1];
  const depTime = first.departingAt?.split("T")[1]?.slice(0, 5) || "—";
  const arrTime = last.arrivingAt?.split("T")[1]?.slice(0, 5) || "—";
  const startMs = new Date(first.departingAt).getTime();
  const endMs = new Date(last.arrivingAt).getTime();
  const totalMin = Math.round((endMs - startMs) / 60000);
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

  const renderLeg = (info: ReturnType<typeof getSliceInfo>, _label: string) => {
    if (!info) return null;
    return (
      <div className="flex items-center gap-2">
        <div className="min-w-[40px]">
          <p className="text-sm font-bold tabular-nums leading-none">{info.depTime}</p>
          <p className="text-[9px] text-muted-foreground">{info.depCode}</p>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <span className="text-[8px] text-muted-foreground">{info.duration}</span>
          <div className="w-full h-[1.5px] bg-gradient-to-r from-[hsl(var(--flights))] via-border/40 to-[hsl(var(--flights))] relative my-0.5 rounded-full">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[hsl(var(--flights))]" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[hsl(var(--flights))]" />
          </div>
          <span className="text-[8px] text-muted-foreground">
            {info.stops === 0 ? "Direct" : `${info.stops} stop${info.stops > 1 ? "s" : ""}`}
          </span>
        </div>
        <div className="text-right min-w-[40px]">
          <p className="text-sm font-bold tabular-nums leading-none">{info.arrTime}</p>
          <p className="text-[9px] text-muted-foreground">{info.arrCode}</p>
        </div>
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="mb-4 overflow-hidden border-[hsl(var(--flights))]/15 shadow-sm">
        <div className="h-0.5 bg-gradient-to-r from-[hsl(var(--flights))] via-[hsl(var(--flights))]/60 to-[hsl(var(--flights))]" />
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="relative shrink-0" style={{ width: carrierCodes.length > 1 ? 42 : 32, height: 32 }}>
                <AirlineLogo iataCode={carrierCodes[0]} airlineName={offer.airline} size={32} className="border border-border/20 shadow-sm" />
                {carrierCodes.length > 1 && (
                  <AirlineLogo iataCode={carrierCodes[1]} airlineName="" size={22} className="absolute bottom-0 right-0 border-2 border-card shadow-sm" />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold">{offer.airline}</p>
                <p className="text-[9px] text-muted-foreground">{offer.flightNumber}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-base font-bold text-[hsl(var(--flights))] tabular-nums">${Math.round(offer.price)}</p>
              <p className="text-[8px] text-muted-foreground">{isRoundTrip ? "round trip" : "one way"}</p>
            </div>
          </div>

          {outInfo && (
            <div>
              {retInfo && <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Outbound</p>}
              {renderLeg(outInfo, "Outbound")}
            </div>
          )}

          {retInfo && (
            <div className="mt-2 pt-2 border-t border-dashed border-border/30">
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Return</p>
              {renderLeg(retInfo, "Return")}
            </div>
          )}

          <div className="flex gap-1 mt-2.5 flex-wrap">
            <Badge variant="outline" className="text-[7px] h-4 px-1.5 capitalize border-border/20 bg-muted/20">
              {offer.cabinClass.replace("_", " ")}
            </Badge>
            {isRoundTrip && (
              <Badge variant="outline" className="text-[7px] h-4 px-1.5 border-[hsl(var(--flights))]/20 text-[hsl(var(--flights))] bg-[hsl(var(--flights))]/5">
                Round trip
              </Badge>
            )}
            {offer.baggageIncluded && (
              <Badge variant="outline" className="text-[7px] h-4 px-1.5 border-border/20 bg-muted/20">
                {offer.baggageIncluded}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
