/**
 * Ride Price Breakdown Component
 * Shows detailed fare breakdown before checkout
 */
import { RidePriceBreakdown as BreakdownType, formatCurrency, getRideTypeName } from "@/lib/pricing";
import { Car, MapPin, Clock, Zap, Receipt, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RidePriceBreakdownProps {
  breakdown: BreakdownType;
  rideType: "standard" | "xl" | "premium";
  distance: number;
  duration: number;
  showEstimateNote?: boolean;
  className?: string;
}

export function RidePriceBreakdown({
  breakdown,
  rideType,
  distance,
  duration,
  showEstimateNote = true,
  className,
}: RidePriceBreakdownProps) {
  const hasSurge = breakdown.surgeMultiplier > 1;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Trip Summary */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {distance.toFixed(1)} mi
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          ~{duration} min
        </span>
        <span className="flex items-center gap-1">
          <Car className="w-3.5 h-3.5" />
          {getRideTypeName(rideType)}
        </span>
      </div>

      {/* Surge Alert */}
      {hasSurge && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
          <Zap className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">
            {breakdown.surgeMultiplier}x surge pricing in effect
          </span>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-2 p-3 rounded-xl bg-muted/30 border border-border/50">
        <div className="flex items-center gap-2 pb-2 border-b border-border/50">
          <Receipt className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Fare Breakdown</span>
        </div>

        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Base fare</span>
            <span>{formatCurrency(breakdown.baseFare)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Distance ({distance.toFixed(1)} mi)</span>
            <span>{formatCurrency(breakdown.distanceFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time (~{duration} min)</span>
            <span>{formatCurrency(breakdown.timeFee)}</span>
          </div>
          
          {breakdown.rideTypeMultiplier !== 1 && (
            <div className="flex justify-between text-muted-foreground">
              <span>{getRideTypeName(rideType)} ({breakdown.rideTypeMultiplier}x)</span>
              <span className="text-xs">applied</span>
            </div>
          )}
          
          {hasSurge && (
            <div className="flex justify-between text-amber-600 dark:text-amber-400">
              <span>Surge ({breakdown.surgeMultiplier}x)</span>
              <span className="text-xs">applied</span>
            </div>
          )}
          
          {breakdown.minimumApplied && (
            <div className="flex justify-between text-muted-foreground italic">
              <span>Minimum fare applied</span>
              <span>{formatCurrency(breakdown.subtotal)}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Booking fee</span>
            <span>{formatCurrency(breakdown.bookingFee)}</span>
          </div>
          
          {breakdown.serviceFee > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service fee</span>
              <span>{formatCurrency(breakdown.serviceFee)}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-2 border-t border-border/50 font-bold">
          <span>Total</span>
          <span className="text-rides">{formatCurrency(breakdown.total)}</span>
        </div>
      </div>

      {/* Estimate Note */}
      {showEstimateNote && (
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <p>
            This is an estimated fare. Final price may vary based on actual route and traffic conditions.
            Estimated range: <span className="font-medium">${breakdown.estimatedMin}-${breakdown.estimatedMax}</span>
          </p>
        </div>
      )}
    </div>
  );
}
