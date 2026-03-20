/**
 * FlightLegCard — Shows a single leg (outbound OR return) for step-by-step selection
 */

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock, ChevronRight, ChevronDown, Briefcase, ArrowRight, Repeat, Plane, RefreshCw, ShieldCheck, Luggage, PackageCheck, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { type DuffelOffer, type DuffelSegment } from "@/hooks/useDuffelFlights";
import { AirlineLogo } from "@/components/flight/AirlineLogo";
import { cn } from "@/lib/utils";

export interface LegGroup {
  fingerprint: string;
  /** The cheapest offer in this group */
  representativeOffer: DuffelOffer;
  /** All offers sharing this leg */
  offers: DuffelOffer[];
  /** Segments for this specific leg */
  segments: DuffelSegment[];
  /** Pre-computed summary */
  summary: LegSummary;
  /** Lowest price across all offers in this group */
  fromPrice: number;
  /** Number of fare options */
  fareCount: number;
}

export interface LegSummary {
  depTime: string;
  arrTime: string;
  depCode: string;
  arrCode: string;
  duration: string;
  stops: number;
  stopDetails: { code: string; city: string; layoverDuration: string }[];
  dayDiff: number;
}

interface FlightLegCardProps {
  group: LegGroup;
  index: number;
  sortBy: string;
  isLowest: boolean;
  isFastest: boolean;
  label: "outbound" | "return";
  onSelect: (group: LegGroup) => void;
}

const sortBadgeConfig: Record<string, { label: string; className: string }> = {
  best: { label: "✨ Best Option", className: "bg-[hsl(var(--flights)/0.1)] text-[hsl(var(--flights))] border-[hsl(var(--flights)/0.25)]" },
  cheapest: { label: "🔥 Cheapest", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25" },
  fastest: { label: "⚡ Fastest", className: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/25" },
};

function SegmentRow({ seg, isLast }: { seg: DuffelSegment; isLast: boolean }) {
  return (
    <div className="relative pl-5">
      <div className="absolute left-1.5 top-0 bottom-0 flex flex-col items-center">
        <div className="w-2 h-2 rounded-full bg-[hsl(var(--flights))] border border-card shrink-0 mt-1" />
        {!isLast && <div className="flex-1 w-px bg-border/40 my-0.5" />}
      </div>
      <div className="pb-3">
        <div className="flex items-center gap-2 mb-1">
          <AirlineLogo
            iataCode={seg.operatingCarrierCode || seg.marketingCarrierCode}
            airlineName={seg.operatingCarrier || seg.marketingCarrier}
            size={22}
            className="shrink-0"
          />
          <span className="text-[10px] font-semibold truncate">
            {seg.marketingCarrier} · {seg.flightNumber}
          </span>
          {seg.aircraft && (
            <span className="text-[9px] text-muted-foreground ml-auto shrink-0">{seg.aircraft}</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <div className="min-w-0">
            <p className="font-bold tabular-nums">{seg.departingAt?.split("T")[1]?.slice(0, 5) || "—"}</p>
            <p className="text-muted-foreground text-[9px]">{seg.origin.code} {seg.origin.terminal ? `T${seg.origin.terminal}` : ""}</p>
          </div>
          <div className="flex-1 flex items-center gap-1">
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-[8px] text-muted-foreground whitespace-nowrap">{seg.duration}</span>
            <div className="flex-1 h-px bg-border/40" />
          </div>
          <div className="text-right min-w-0">
            <p className="font-bold tabular-nums">{seg.arrivingAt?.split("T")[1]?.slice(0, 5) || "—"}</p>
            <p className="text-muted-foreground text-[9px]">{seg.destination.code} {seg.destination.terminal ? `T${seg.destination.terminal}` : ""}</p>
          </div>
        </div>
        {seg.operatingCarrierCode !== seg.marketingCarrierCode && (
          <p className="text-[8px] text-muted-foreground/70 mt-0.5 flex items-center gap-0.5">
            <Repeat className="w-2 h-2" /> Operated by {seg.operatingCarrier}
          </p>
        )}
      </div>
    </div>
  );
}

export default function FlightLegCard({
  group,
  index,
  sortBy,
  isLowest,
  isFastest,
  label,
  onSelect,
}: FlightLegCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isTop = index === 0;
  const badge = isTop ? sortBadgeConfig[sortBy] : null;
  const { summary, segments, representativeOffer, fromPrice, fareCount } = group;

  const carrierCodes = useMemo(() => {
    const codes = new Set<string>();
    segments.forEach(seg => {
      codes.add(seg.marketingCarrierCode);
      if (seg.operatingCarrierCode) codes.add(seg.operatingCarrierCode);
    });
    return [...codes].slice(0, 2);
  }, [segments]);

  const airlineName = segments[0]?.marketingCarrier || representativeOffer.airline;
  const flightNumbers = segments.map(s => s.flightNumber).join(" · ");

  const stopLabel = summary.stops === 0 ? "Nonstop" : `${summary.stops} stop${summary.stops > 1 ? "s" : ""}`;

  return (
    <div
      className={cn(
        "rounded-2xl group overflow-hidden transition-all",
        isTop ? "ring-1 ring-[hsl(var(--flights)/0.25)]" : ""
      )}
      style={{
        background: "hsl(var(--card))",
        boxShadow: isTop
          ? "0 2px 0 0 hsl(var(--flights)/0.06), 0 4px 16px -4px hsl(var(--foreground)/0.07), 0 12px 32px -8px hsl(var(--foreground)/0.04), inset 0 1px 0 0 hsl(0 0% 100%/0.05)"
          : "0 1px 0 0 hsl(var(--border)/0.1), 0 2px 8px -2px hsl(var(--foreground)/0.05), inset 0 1px 0 0 hsl(0 0% 100%/0.04)",
      }}
    >
      {/* Top badge strip */}
      {(isTop || isLowest || isFastest) && (
        <div className="flex gap-1.5 px-3 pt-2.5 sm:px-4 sm:pt-3">
          {badge && (
            <Badge className={cn("text-[9px] font-bold px-2.5 py-0.5 border rounded-lg shadow-sm", badge.className)}>
              {badge.label}
            </Badge>
          )}
          {isLowest && !isTop && (
            <Badge className="text-[9px] font-bold px-2.5 py-0.5 border rounded-lg shadow-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25">
              🔥 Cheapest
            </Badge>
          )}
          {isFastest && !isTop && (
            <Badge className="text-[9px] font-bold px-2.5 py-0.5 border rounded-lg shadow-sm bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/25">
              ⚡ Fastest
            </Badge>
          )}
        </div>
      )}

      <div className="px-3 py-2.5 sm:px-4 sm:py-3.5">
        {/* Row 1: Airline + Price */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0" style={{ width: carrierCodes.length > 1 ? 58 : 44, height: 44 }}>
              <AirlineLogo iataCode={carrierCodes[0]} airlineName={airlineName} size={44} className="border border-border/20 bg-card/80 shadow-sm" />
              {carrierCodes.length > 1 && (
                <AirlineLogo iataCode={carrierCodes[1]} airlineName="" size={30} className="absolute bottom-0 right-0 border-2 border-card bg-card shadow-sm" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] sm:text-sm font-semibold leading-tight truncate">{airlineName}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{flightNumbers}</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-[9px] text-muted-foreground">from</p>
            <p className="text-[22px] sm:text-2xl font-extrabold text-[hsl(var(--flights))] tabular-nums leading-none tracking-tight">
              ${Math.round(fromPrice)}
            </p>
            {fareCount > 1 && (
              <p className="text-[9px] text-muted-foreground mt-0.5">
                {fareCount} fare options
              </p>
            )}
          </div>
        </div>

        {/* Route timeline */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="text-left shrink-0 min-w-[52px] sm:min-w-[58px]">
            <p className="text-[19px] sm:text-xl font-bold tabular-nums leading-none">{summary.depTime}</p>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground font-medium mt-0.5">{summary.depCode}</p>
          </div>

          <div className="flex flex-col items-center flex-1 py-0.5 min-w-0">
            <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium flex items-center gap-0.5 whitespace-nowrap">
              <Clock className="w-2.5 h-2.5 shrink-0" />
              {summary.duration}
            </span>
            <div className="w-full h-[2px] bg-gradient-to-r from-[hsl(var(--flights))] via-border/50 to-[hsl(var(--flights))] relative my-1 rounded-full">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[7px] h-[7px] rounded-full bg-[hsl(var(--flights))] border-[1.5px] border-card" />
              {summary.stopDetails.map((stop, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
                  style={{ left: `${((i + 1) / (summary.stopDetails.length + 1)) * 100}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <div className="w-[6px] h-[6px] rounded-full bg-muted-foreground/60 border border-card" />
                </div>
              ))}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[7px] h-[7px] rounded-full bg-[hsl(var(--flights))] border-[1.5px] border-card" />
            </div>
            <span className={cn(
              "text-[9px] sm:text-[10px] font-semibold leading-tight",
              summary.stops === 0 ? "text-primary" : "text-muted-foreground"
            )}>
              {stopLabel}
            </span>
            {summary.stopDetails.length > 0 && (
              <span className="text-[8px] text-muted-foreground/70 flex items-center gap-0.5 mt-0.5 truncate max-w-full">
                {summary.stopDetails.map((s, i) => (
                  <span key={i} className="flex items-center gap-0.5">
                    {i > 0 && <ArrowRight className="w-1.5 h-1.5 shrink-0" />}
                    <span>{s.code}</span>
                    {s.layoverDuration && <span className="text-muted-foreground/50">({s.layoverDuration})</span>}
                  </span>
                ))}
              </span>
            )}
          </div>

          <div className="text-right shrink-0 min-w-[52px] sm:min-w-[58px]">
            <p className="text-[19px] sm:text-xl font-bold tabular-nums leading-none">
              {summary.arrTime}
              {summary.dayDiff > 0 && (
                <sup className="text-[10px] font-semibold text-muted-foreground ml-0.5">+{summary.dayDiff}</sup>
              )}
            </p>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground font-medium mt-0.5">{summary.arrCode}</p>
          </div>
        </div>

        {/* Baggage amenities row */}
        <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-border/15">
          {/* Personal item */}
          <div className="relative" title="Personal item included">
            <Briefcase className="w-4.5 h-4.5 text-muted-foreground" style={{ width: 18, height: 18 }} />
            <CheckCircle2 className="w-3 h-3 text-emerald-500 absolute -bottom-0.5 -right-1 bg-card rounded-full" />
          </div>
          {/* Carry-on */}
          <div className="relative" title={representativeOffer.baggageDetails?.carryOnIncluded ? "Carry-on included" : "Carry-on not included"}>
            <PackageCheck className="text-muted-foreground" style={{ width: 18, height: 18, opacity: representativeOffer.baggageDetails?.carryOnIncluded ? 1 : 0.35 }} />
            {representativeOffer.baggageDetails?.carryOnIncluded && (
              <CheckCircle2 className="w-3 h-3 text-emerald-500 absolute -bottom-0.5 -right-1 bg-card rounded-full" />
            )}
          </div>
          {/* Checked bag */}
          <div className="relative" title={representativeOffer.baggageDetails?.checkedBagsIncluded ? `${representativeOffer.baggageDetails.checkedBagQuantity} checked bag(s)` : "No checked bag"}>
            <Luggage className="text-muted-foreground" style={{ width: 18, height: 18, opacity: representativeOffer.baggageDetails?.checkedBagsIncluded ? 1 : 0.35 }} />
            {representativeOffer.baggageDetails?.checkedBagsIncluded && (
              <CheckCircle2 className="w-3 h-3 text-emerald-500 absolute -bottom-0.5 -right-1 bg-card rounded-full" />
            )}
          </div>
          {/* Refundable indicator */}
          {representativeOffer.isRefundable && (
            <div className="relative ml-1" title="Refundable">
              <RefreshCw className="text-emerald-500" style={{ width: 16, height: 16 }} />
            </div>
          )}

          <div className="flex-1" />
          <p className="text-[10px] text-muted-foreground capitalize">{label} flight</p>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-end gap-2 mt-2">
          <Button
            size="sm"
            className={cn(
              "h-9 px-5 text-[12px] font-bold active:scale-[0.97] transition-all gap-1 shrink-0 rounded-xl",
              "bg-[hsl(var(--flights))] hover:bg-[hsl(var(--flights))]/90 text-primary-foreground"
            )}
            style={{
              boxShadow: "0 2px 8px -2px hsl(var(--flights)/0.3), 0 1px 2px 0 hsl(var(--flights)/0.15)",
            }}
            onClick={(e) => { e.stopPropagation(); onSelect(group); }}
          >
            Select {label === "outbound" ? "Departure" : "Return"}
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Expand toggle */}
        {segments.length > 0 && (
          <button
            onClick={() => setExpanded(prev => !prev)}
            className="w-full flex items-center justify-center gap-1 mt-2.5 pt-2 border-t border-border/20 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className={cn("w-3 h-3 transition-transform", expanded && "rotate-180")} />
            {expanded ? "Hide details" : "Flight details"}
          </button>
        )}
      </div>

      {/* Expandable segment details */}
      <AnimatePresence>
        {expanded && segments.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 sm:px-4 sm:pb-4 pt-2 border-t border-border/20 bg-muted/5 space-y-2">
              {segments.map((seg, i) => (
                <SegmentRow key={seg.id || i} seg={seg} isLast={i === segments.length - 1} />
              ))}
              {summary.stopDetails.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {summary.stopDetails.map((stop, i) => (
                    <Badge key={i} variant="outline" className="text-[8px] border-amber-500/20 bg-amber-500/5 text-amber-600 h-[18px] px-1.5 gap-0.5">
                      <Clock className="w-2 h-2" /> {stop.layoverDuration} layover in {stop.city || stop.code}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
