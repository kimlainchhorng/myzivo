/**
 * Eats Price Breakdown Component
 * Shows detailed order breakdown before checkout
 */
import { EatsPriceBreakdown as BreakdownType, formatCurrency } from "@/lib/pricing";
import { Receipt, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface EatsPriceBreakdownProps {
  breakdown: BreakdownType;
  itemCount: number;
  showTipSelector?: boolean;
  onTipChange?: (tip: number) => void;
  className?: string;
}

const tipOptions = [0, 2, 3, 5, 10];

export function EatsPriceBreakdown({
  breakdown,
  itemCount,
  showTipSelector = true,
  onTipChange,
  className,
}: EatsPriceBreakdownProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Price Breakdown */}
      <div className="space-y-2 p-3 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
        <div className="flex items-center gap-2 pb-2 border-b border-border/50">
          <Receipt className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Order Summary</span>
          <span className="text-xs text-muted-foreground ml-auto">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
        </div>

        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(breakdown.subtotal)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery fee</span>
            <span>{formatCurrency(breakdown.deliveryFee)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service fee</span>
            <span>{formatCurrency(breakdown.serviceFee)}</span>
          </div>
          
          {breakdown.smallOrderFee > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1">
                Small order fee
                <Info className="w-3 h-3" />
              </span>
              <span>{formatCurrency(breakdown.smallOrderFee)}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span>{formatCurrency(breakdown.tax)}</span>
          </div>

          {/* Tip Selector */}
          {showTipSelector && onTipChange && (
            <div className="pt-2 border-t border-border/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Tip</span>
                <span>{formatCurrency(breakdown.tip)}</span>
              </div>
              <div className="flex gap-2">
                {tipOptions.map((tip) => (
                  <button
                    key={tip}
                    onClick={() => onTipChange(tip)}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-medium rounded-xl border transition-all duration-200 active:scale-[0.95] touch-manipulation",
                      breakdown.tip === tip
                        ? "bg-eats text-white border-eats"
                        : "bg-background border-border hover:border-eats/50"
                    )}
                  >
                    {tip === 0 ? "No tip" : `$${tip}`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-2 border-t border-border/50 font-bold">
          <span>Total</span>
          <span className="text-eats">{formatCurrency(breakdown.total)}</span>
        </div>
      </div>
    </div>
  );
}
