/**
 * DuffelFlightCard — Premium OTA-style flight result card
 * Displays all flight details in a dense, scannable layout
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ChevronRight, Briefcase, ShieldCheck, ShieldX, ArrowRight, Repeat } from "lucide-react";
import { type DuffelOffer } from "@/hooks/useDuffelFlights";
import { AirlineLogo } from "@/components/flight/AirlineLogo";
import { cn } from "@/lib/utils";

interface DuffelFlightCardProps {
  offer: DuffelOffer;
  index: number;
  sortBy: string;
  isLowest: boolean;
  isFastest: boolean;
  totalPassengers: number;
  hasReturn: boolean;
  onSelect: (offer: DuffelOffer) => void;
}

const sortBadgeConfig: Record<string, { label: string; className: string }> = {
  best: { label: "✨ Best Option", className: "bg-[hsl(var(--flights))]/10 text-[hsl(var(--flights))] border-[hsl(var(--flights))]/25" },
  cheapest: { label: "💰 Cheapest", className: "bg-primary/10 text-primary border-primary/25" },
  fastest: { label: "⚡ Fastest", className: "bg-[hsl(var(--flights))]/10 text-[hsl(var(--flights))] border-[hsl(var(--flights))]/25" },
  earliest: { label: "🕐 Earliest", className: "bg-[hsl(var(--flights))]/10 text-[hsl(var(--flights))] border-[hsl(var(--flights))]/25" },
  shortest: { label: "📏 Shortest", className: "bg-[hsl(var(--flights))]/10 text-[hsl(var(--flights))] border-[hsl(var(--flights))]/25" },
};

export default function DuffelFlightCard({
  offer,
  index,
  sortBy,
  isLowest,
  isFastest,
  totalPassengers,
  hasReturn,
  onSelect,
}: DuffelFlightCardProps) {
  const isTop = index === 0;
  const badge = isTop ? sortBadgeConfig[sortBy] : null;

  const stopLabel = offer.stops === 0
    ? "Nonstop"
    : `${offer.stops} stop${offer.stops > 1 ? "s" : ""}`;

  // Get up to 2 unique carrier codes for stacked logos
  const carrierCodes = offer.carriers?.length
    ? [...new Set(offer.carriers.map(c => c.code))].slice(0, 2)
    : [offer.airlineCode];
  const carrierSummary = carrierCodes.filter(Boolean).join(" · ");

  return (
    <div
      className={cn(
        "bg-card rounded-xl sm:rounded-xl border p-0 cursor-pointer group transition-all duration-200 overflow-hidden",
        "hover:shadow-md hover:border-[hsl(var(--flights))]/40",
        "active:scale-[0.98] active:bg-muted/20",
        isTop
          ? "border-[hsl(var(--flights))]/30 shadow-sm shadow-[hsl(var(--flights))]/4"
          : "border-border/30"
      )}
      onClick={() => onSelect(offer)}
    >
      {/* Top badge strip */}
      {(isTop || isLowest || isFastest) && (
        <div className="flex gap-1.5 px-3 pt-2 sm:px-4 sm:pt-3">
          {badge && (
            <Badge className={cn("text-[9px] font-bold px-2 py-0.5 border", badge.className)}>
              {badge.label}
            </Badge>
          )}
          {isLowest && !isTop && (
            <Badge className="text-[9px] font-bold px-2 py-0.5 border bg-primary/10 text-primary border-primary/25">
              💰 Cheapest
            </Badge>
          )}
          {isFastest && !isTop && (
            <Badge className="text-[9px] font-bold px-2 py-0.5 border bg-[hsl(var(--flights))]/10 text-[hsl(var(--flights))] border-[hsl(var(--flights))]/25">
              ⚡ Fastest
            </Badge>
          )}
        </div>
      )}

      <div className="px-3 py-2.5 sm:px-4 sm:py-3.5">
        {/* Row 1: Stacked airline logos + name + Price */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Stacked logos */}
            <div className="relative shrink-0" style={{ width: carrierCodes.length > 1 ? 52 : 40 }}>
              <AirlineLogo
                iataCode={carrierCodes[0]}
                airlineName={offer.airline}
                size={40}
                className="border border-border/20 bg-muted/40"
              />
              {carrierCodes.length > 1 && (
                <AirlineLogo
                  iataCode={carrierCodes[1]}
                  airlineName=""
                  size={28}
                  className="absolute bottom-0 right-0 border-2 border-card bg-muted/40"
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] sm:text-sm font-semibold leading-tight truncate">{offer.airline}</p>
              <div className="flex items-center gap-1">
                <p className="text-[10px] text-muted-foreground leading-tight">{offer.flightNumber}</p>
                {offer.operatedBy && (
                  <p className="text-[9px] text-muted-foreground/70 leading-tight truncate">· {offer.operatedBy}</p>
                )}
              </div>
            </div>
          </div>

          {/* Price block */}
          <div className="text-right shrink-0">
            <p className="text-[22px] sm:text-2xl font-extrabold text-[hsl(var(--flights))] tabular-nums leading-none tracking-tight">
              ${Math.round(offer.price)}
            </p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">
              {hasReturn ? "/person round trip" : "/person"}
            </p>
            {totalPassengers > 1 && (
              <p className="text-[9px] text-muted-foreground/70">
                ${Math.round(offer.price * totalPassengers)} total
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Route timeline with labeled stops */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Departure */}
          <div className="text-left shrink-0 min-w-[52px] sm:min-w-[58px]">
            <p className="text-[19px] sm:text-xl font-bold tabular-nums leading-none">{offer.departure.time}</p>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground font-medium mt-0.5">{offer.departure.code}</p>
          </div>

          {/* Timeline connector with stop labels */}
          <div className="flex flex-col items-center flex-1 py-0.5 min-w-0">
            <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium flex items-center gap-0.5 whitespace-nowrap">
              <Clock className="w-2.5 h-2.5 shrink-0" />
              {offer.duration}
            </span>

            {/* Route line */}
            <div className="w-full h-[2px] bg-gradient-to-r from-[hsl(var(--flights))] via-border/50 to-[hsl(var(--flights))] relative my-1 rounded-full">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[7px] h-[7px] rounded-full bg-[hsl(var(--flights))] border-[1.5px] border-card" />
              {offer.stopDetails?.length > 0
                ? offer.stopDetails.map((stop, i) => (
                    <div
                      key={i}
                      className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
                      style={{ left: `${((i + 1) / (offer.stopDetails.length + 1)) * 100}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      <div className="w-[6px] h-[6px] rounded-full bg-muted-foreground/60 border border-card" />
                    </div>
                  ))
                : offer.stops > 0 && Array.from({ length: Math.min(offer.stops, 3) }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-1/2 -translate-y-1/2 w-[5px] h-[5px] rounded-full bg-muted-foreground/60 border border-card"
                      style={{ left: `${((i + 1) / (Math.min(offer.stops, 3) + 1)) * 100}%` }}
                    />
                  ))
              }
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[7px] h-[7px] rounded-full bg-[hsl(var(--flights))] border-[1.5px] border-card" />
            </div>

            {/* Stop label + cities */}
            <span className={cn(
              "text-[9px] sm:text-[10px] font-semibold leading-tight",
              offer.stops === 0 ? "text-primary" : "text-muted-foreground"
            )}>
              {stopLabel}
            </span>
            {offer.stopDetails?.length > 0 && (
              <span className="text-[8px] text-muted-foreground/70 flex items-center gap-0.5 mt-0.5 truncate max-w-full">
                {offer.stopDetails.map((s, i) => (
                  <span key={i} className="flex items-center gap-0.5">
                    {i > 0 && <ArrowRight className="w-1.5 h-1.5 shrink-0" />}
                    <span>{s.code}</span>
                    {s.layoverDuration && (
                      <span className="text-muted-foreground/50">({s.layoverDuration})</span>
                    )}
                  </span>
                ))}
              </span>
            )}
          </div>

          {/* Arrival */}
          <div className="text-right shrink-0 min-w-[52px] sm:min-w-[58px]">
            <p className="text-[19px] sm:text-xl font-bold tabular-nums leading-none">{offer.arrival.time}</p>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground font-medium mt-0.5">{offer.arrival.code}</p>
          </div>
        </div>

        {/* Row 3: Tags + CTA */}
        <div className="flex items-end justify-between gap-2 mt-3">
          <div className="flex gap-1 flex-wrap min-w-0">
            <Badge variant="outline" className="text-[8px] sm:text-[9px] border-border/25 bg-muted/25 capitalize h-[18px] px-1.5 font-medium">
              {offer.cabinClass.replace("_", " ")}
            </Badge>
            {offer.baggageIncluded && (
              <Badge variant="outline" className="text-[8px] sm:text-[9px] border-border/25 bg-muted/25 gap-0.5 h-[18px] px-1.5 font-medium">
                <Briefcase className="w-2 h-2 shrink-0" />
                {offer.baggageIncluded}
              </Badge>
            )}
            {offer.isRefundable ? (
              <Badge variant="outline" className="text-[8px] sm:text-[9px] border-primary/25 text-primary bg-primary/5 h-[18px] px-1.5 font-medium gap-0.5">
                <ShieldCheck className="w-2 h-2 shrink-0" />
                Refundable
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[8px] sm:text-[9px] border-border/25 bg-muted/25 text-muted-foreground gap-0.5 h-[18px] px-1.5 font-medium">
                <ShieldX className="w-2 h-2 shrink-0" />
                Non-refundable
              </Badge>
            )}
            {offer.operatedBy && (
              <Badge variant="outline" className="text-[8px] sm:text-[9px] border-border/25 bg-muted/25 text-muted-foreground gap-0.5 h-[18px] px-1.5 font-medium">
                <Repeat className="w-2 h-2 shrink-0" />
                Codeshare
              </Badge>
            )}
          </div>

          <Button
            size="sm"
            className={cn(
              "h-8 px-4 text-[11px] font-bold shadow-sm active:scale-95 transition-all gap-1 shrink-0",
              "bg-[hsl(var(--flights))] hover:bg-[hsl(var(--flights))]/90 text-primary-foreground"
            )}
            onClick={(e) => { e.stopPropagation(); onSelect(offer); }}
          >
            Select
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
