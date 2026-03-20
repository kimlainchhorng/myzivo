/**
 * Price Summary Card — detailed breakdown with per-passenger pricing
 */
import { Sparkles, ArrowRightLeft, Users, Tag, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { type DuffelOffer } from "@/hooks/useDuffelFlights";

interface PriceSummaryCardProps {
  offer: DuffelOffer;
  searchParams: Record<string, any>;
  totalPassengers: number;
  isRoundTrip: boolean;
}

export function PriceSummaryCard({ offer, searchParams, totalPassengers, isRoundTrip }: PriceSummaryCardProps) {
  const pricePerPerson = offer.pricePerPerson || offer.price;
  const totalPrice = pricePerPerson * totalPassengers;
  const currency = offer.currency || "USD";

  // Calculate base fare and taxes (estimate if not provided)
  const baseFare = offer.baseFare || totalPrice * 0.7;
  const taxesFees = offer.taxesFees || totalPrice - baseFare;

  return (
    <Card className="border-[hsl(var(--flights))]/20 shadow-sm shadow-[hsl(var(--flights))]/5 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[hsl(var(--flights))] to-transparent" />
      <CardContent className="p-4 space-y-3 relative">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--flights))]" />
            Price Summary
          </p>
          <Badge variant="secondary" className="text-[8px] gap-0.5 px-2 py-0 h-4 font-bold">
            <Tag className="w-2.5 h-2.5" />
            No markup
          </Badge>
        </div>

        <div className="space-y-2">
          {/* Trip type */}
          {isRoundTrip && (
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground flex items-center gap-1">
                <ArrowRightLeft className="w-3 h-3" /> Trip type
              </span>
              <span className="font-medium">Round trip</span>
            </div>
          )}

          {/* Per-person price */}
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" /> Price per traveler
            </span>
            <span className="font-semibold tabular-nums">${pricePerPerson.toFixed(2)}</span>
          </div>

          {/* Passenger breakdown */}
          {totalPassengers > 1 && (
            <>
              <Separator className="bg-border/20" />
              {searchParams.adults > 0 && (
                <div className="flex justify-between text-[11px] pl-4">
                  <span className="text-muted-foreground">Adult × {searchParams.adults}</span>
                  <span className="font-medium tabular-nums">${(pricePerPerson * searchParams.adults).toFixed(2)}</span>
                </div>
              )}
              {searchParams.children > 0 && (
                <div className="flex justify-between text-[11px] pl-4">
                  <span className="text-muted-foreground">Child × {searchParams.children}</span>
                  <span className="font-medium tabular-nums">${(pricePerPerson * searchParams.children).toFixed(2)}</span>
                </div>
              )}
              {searchParams.infants > 0 && (
                <div className="flex justify-between text-[11px] pl-4">
                  <span className="text-muted-foreground">Infant × {searchParams.infants}</span>
                  <span className="font-medium tabular-nums">${(pricePerPerson * searchParams.infants).toFixed(2)}</span>
                </div>
              )}
            </>
          )}

          <Separator className="bg-border/30" />

          {/* Subtotal breakdown */}
          <div className="bg-muted/30 rounded-lg p-2.5 space-y-1.5">
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">Base fare</span>
              <span className="font-medium tabular-nums">${baseFare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-muted-foreground flex items-center gap-0.5 cursor-help">
                      Taxes & fees <Info className="w-2.5 h-2.5" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[10px] max-w-[200px]">
                    Includes government taxes, airport charges, and carrier surcharges
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="font-medium tabular-nums">${taxesFees.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">ZIVO service fee</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">$0.00</span>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-baseline pt-1">
            <span className="text-sm font-bold">Total</span>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-[hsl(var(--flights))] tabular-nums">
                ${totalPrice.toFixed(2)}
              </span>
              <p className="text-[9px] text-muted-foreground mt-0.5">
                {currency} · All taxes included
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
