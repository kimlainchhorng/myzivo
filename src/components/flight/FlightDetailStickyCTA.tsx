/**
 * Flight Detail Sticky CTA
 * Mobile sticky bottom CTA for flight detail pages
 * Uses locked compliance text
 */

import { Lock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FLIGHT_CTA_TEXT, FLIGHT_DISCLAIMERS } from "@/config/flightCompliance";
import { cn } from "@/lib/utils";

interface FlightDetailStickyCTAProps {
  price: number;
  currency?: string;
  passengers?: number;
  onContinue: () => void;
  className?: string;
  isLoading?: boolean;
}

export default function FlightDetailStickyCTA({
  price,
  currency = "USD",
  passengers = 1,
  onContinue,
  className,
  isLoading = false,
}: FlightDetailStickyCTAProps) {
  const totalPrice = price * passengers;
  const currencySymbol = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 lg:hidden",
      "bg-gradient-to-t from-background via-background/98 to-background/90 backdrop-blur-lg",
      "border-t border-border/50 shadow-2xl shadow-black/20",
      "safe-area-inset-bottom",
      className
    )}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Price Summary */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="text-2xl font-bold text-sky-500">
                {currencySymbol}{totalPrice.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground truncate">
              {passengers} traveler{passengers > 1 ? "s" : ""} · Taxes included*
            </p>
          </div>

          {/* CTA Button - Locked compliance text */}
          <Button
            size="lg"
            disabled={isLoading}
            onClick={onContinue}
            className={cn(
              "gap-2 text-white shadow-lg shadow-sky-500/30 shrink-0",
              "min-h-[48px] px-5 touch-manipulation active:scale-[0.98]",
              "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
            )}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                {FLIGHT_CTA_TEXT.primary}
                <ExternalLink className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        {/* Compliance Disclosure */}
        <p className="text-[9px] text-muted-foreground text-center mt-2 leading-tight">
          {FLIGHT_DISCLAIMERS.redirect}
        </p>
      </div>
    </div>
  );
}
