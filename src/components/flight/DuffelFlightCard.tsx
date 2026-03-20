/**
 * DuffelFlightCard — Premium OTA-style flight result card
 * Displays all flight details in a dense, scannable layout
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ChevronRight, Luggage, Briefcase, ShieldCheck, MapPin } from "lucide-react";
import { getDuffelAirlineLogo, type DuffelOffer } from "@/hooks/useDuffelFlights";
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

  const layoverSummary = offer.stopCities?.length > 0
    ? offer.stopCities.join(", ")
    : null;

  return (
    <div
      className={cn(
        "bg-card rounded-xl border p-0 cursor-pointer group transition-all duration-200 overflow-hidden",
        "hover:shadow-lg hover:shadow-[hsl(var(--flights))]/6 hover:border-[hsl(var(--flights))]/40",
        "active:scale-[0.995]",
        isTop
          ? "border-[hsl(var(--flights))]/30 shadow-sm shadow-[hsl(var(--flights))]/4"
          : "border-border/30"
      )}
      onClick={() => onSelect(offer)}
    >
      {/* Top badge strip */}
      {(isTop || isLowest || isFastest) && (
        <div className="flex gap-1.5 px-3.5 pt-2.5 sm:px-4 sm:pt-3">
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

      <div className="px-3.5 py-3 sm:px-4 sm:py-3.5">
        {/* Row 1: Airline + Price */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted/40 border border-border/20 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src={getDuffelAirlineLogo(offer.airlineCode)}
                alt={offer.airline}
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = "none";
                  el.parentElement!.innerHTML = `<span class="text-xs font-bold text-muted-foreground">${offer.airlineCode}</span>`;
                }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] sm:text-sm font-semibold leading-tight truncate">{offer.airline}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{offer.flightNumber}</p>
            </div>
          </div>

          {/* Price block — strong visual weight */}
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

        {/* Row 2: Route timeline — the hero of the card */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Departure */}
          <div className="text-left shrink-0 min-w-[52px] sm:min-w-[58px]">
            <p className="text-[19px] sm:text-xl font-bold tabular-nums leading-none">{offer.departure.time}</p>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground font-medium mt-0.5">{offer.departure.code}</p>
          </div>

          {/* Timeline connector */}
          <div className="flex flex-col items-center flex-1 py-0.5 min-w-0">
            <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium flex items-center gap-0.5 whitespace-nowrap">
              <Clock className="w-2.5 h-2.5 shrink-0" />
              {offer.duration}
            </span>
            <div className="w-full h-[2px] bg-gradient-to-r from-[hsl(var(--flights))] via-border/50 to-[hsl(var(--flights))] relative my-1 rounded-full">
              {/* Origin dot */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[7px] h-[7px] rounded-full bg-[hsl(var(--flights))] border-[1.5px] border-card" />
              {/* Stop dots */}
              {offer.stops > 0 && Array.from({ length: Math.min(offer.stops, 3) }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 -translate-y-1/2 w-[5px] h-[5px] rounded-full bg-muted-foreground/60 border border-card"
                  style={{ left: `${((i + 1) / (Math.min(offer.stops, 3) + 1)) * 100}%` }}
                />
              ))}
              {/* Destination dot */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[7px] h-[7px] rounded-full bg-[hsl(var(--flights))] border-[1.5px] border-card" />
            </div>
            <span className={cn(
              "text-[9px] sm:text-[10px] font-semibold leading-tight",
              offer.stops === 0 ? "text-primary" : "text-muted-foreground"
            )}>
              {stopLabel}
            </span>
            {/* Layover cities */}
            {layoverSummary && (
              <span className="text-[8px] text-muted-foreground/70 flex items-center gap-0.5 mt-0.5 truncate max-w-full">
                <MapPin className="w-2 h-2 shrink-0" />
                {layoverSummary}
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
          {/* Tags */}
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
            {offer.isRefundable && (
              <Badge variant="outline" className="text-[8px] sm:text-[9px] border-primary/25 text-primary bg-primary/5 h-[18px] px-1.5 font-medium gap-0.5">
                <ShieldCheck className="w-2 h-2 shrink-0" />
                Refundable
              </Badge>
            )}
          </div>

          {/* CTA */}
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
