import { ExternalLink, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FLIGHT_CTA_TEXT, FLIGHT_DISCLAIMERS } from "@/config/flightCompliance";
import { useFlightRedirect } from "@/hooks/useAffiliateRedirect";
import { useCTAColor, useStickyCTA } from "@/hooks/useABTest";
import { cn } from "@/lib/utils";

interface StickyBookingCTAProps {
  className?: string;
  lowestPrice?: number;
  flightCount?: number;
  origin?: string;
  destination?: string;
  departDate?: string;
  returnDate?: string;
  passengers?: number;
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
}

export default function StickyBookingCTA({ 
  className, 
  lowestPrice, 
  flightCount,
  origin,
  destination,
  departDate,
  returnDate,
  passengers = 1,
  cabinClass = 'economy',
}: StickyBookingCTAProps) {
  const { redirectWithParams, redirectSimple } = useFlightRedirect('sticky_booking_cta', 'sticky_cta');
  
  // A/B Testing hooks - use locked CTA text
  const { className: colorClassName, trackClick: trackColorClick } = useCTAColor('flights');
  const { isSticky, trackClick: trackStickyClick } = useStickyCTA();

  const handleBookClick = () => {
    // Track A/B experiments
    trackColorClick();
    trackStickyClick();
    
    // Use deep link if we have search parameters
    if (origin && destination && departDate) {
      redirectWithParams({
        origin,
        destination,
        departDate,
        returnDate,
        passengers,
        cabinClass,
        tripType: returnDate ? 'roundtrip' : 'oneway',
      });
    } else {
      // Fallback to simple redirect
      redirectSimple();
    }
  };

  // If sticky variant is disabled, don't render
  if (!isSticky) {
    return null;
  }

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 lg:hidden",
      "bg-gradient-to-t from-background via-background/98 to-background/90 backdrop-blur-lg",
      "border-t border-border/50 shadow-2xl shadow-black/20",
      "safe-area-inset-bottom",
      className
    )}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Price Summary */}
          <div className="flex-1 min-w-0">
            {lowestPrice && (
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-muted-foreground">From</span>
                <span className="text-2xl font-bold text-sky-500">${lowestPrice}*</span>
              </div>
            )}
            <p className="text-[10px] text-muted-foreground truncate">
              {flightCount ? `${flightCount} flights • Compare prices` : "Compare flight prices"}
            </p>
          </div>

          {/* CTA Button - Locked compliance text */}
          <Button
            size="lg"
            className={cn(
              "gap-2 text-white shadow-lg shadow-sky-500/30 shrink-0 min-h-[48px] px-6 touch-manipulation active:scale-[0.98]",
              colorClassName
            )}
            onClick={handleBookClick}
          >
            <Lock className="w-4 h-4" />
            {FLIGHT_CTA_TEXT.primary}
            <ExternalLink className="w-4 h-4" />
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
