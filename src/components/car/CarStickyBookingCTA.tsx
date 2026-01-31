import { ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCarRedirect } from "@/hooks/useAffiliateRedirect";
import { AFFILIATE_DISCLOSURE_TEXT } from "@/config/affiliateLinks";

interface CarStickyBookingCTAProps {
  className?: string;
  pickupLocation?: string;
  pickupDate?: string;
  returnDate?: string;
  pickupTime?: string;
  returnTime?: string;
  driverAge?: number;
}

export default function CarStickyBookingCTA({ 
  className, 
  pickupLocation,
  pickupDate,
  returnDate,
  pickupTime,
  returnTime,
  driverAge = 25,
}: CarStickyBookingCTAProps) {
  const { redirectWithParams, redirectSimple } = useCarRedirect('sticky_booking_cta', 'sticky_cta');

  const handleBookClick = () => {
    // Use deep link if we have search parameters
    if (pickupLocation && pickupDate && returnDate) {
      redirectWithParams({
        pickupLocation,
        pickupDate,
        returnDate,
        pickupTime,
        returnTime,
        driverAge,
      });
    } else {
      // Fallback to simple redirect
      redirectSimple();
    }
  };

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
          {/* Info Summary */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-semibold text-violet-500">500+</span>
              <span className="text-xs text-muted-foreground">car providers</span>
            </div>
            <p className="text-[10px] text-muted-foreground truncate">
              Compare prices from EconomyBookings & partners
            </p>
          </div>

          {/* CTA Button - Large, easy to tap */}
          <Button
            size="lg"
            className="gap-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg shadow-violet-500/30 shrink-0 min-h-[48px] px-6 touch-manipulation active:scale-[0.98]"
            onClick={handleBookClick}
          >
            <Sparkles className="w-4 h-4" />
            View Deals
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>

        {/* Disclosure */}
        <p className="text-[9px] text-muted-foreground text-center mt-2 leading-tight">
          {AFFILIATE_DISCLOSURE_TEXT.short}
        </p>
      </div>
    </div>
  );
}
