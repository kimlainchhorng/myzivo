import { ExternalLink, Plane, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AFFILIATE_LINKS, AFFILIATE_DISCLOSURE_TEXT } from "@/config/affiliateLinks";
import { cn } from "@/lib/utils";

interface StickyBookingCTAProps {
  className?: string;
  lowestPrice?: number;
  flightCount?: number;
}

export default function StickyBookingCTA({ className, lowestPrice, flightCount }: StickyBookingCTAProps) {
  const handleBookClick = () => {
    window.open(AFFILIATE_LINKS.flights.url, "_blank", "noopener,noreferrer");
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
          {/* Price Summary */}
          <div className="flex-1 min-w-0">
            {lowestPrice && (
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-muted-foreground">From</span>
                <span className="text-2xl font-bold text-sky-500">${lowestPrice}</span>
              </div>
            )}
            <p className="text-[10px] text-muted-foreground truncate">
              {flightCount ? `${flightCount} flights available` : "Compare flight prices"}
            </p>
          </div>

          {/* CTA Button */}
          <Button
            size="lg"
            className="gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/30 shrink-0"
            onClick={handleBookClick}
          >
            <Sparkles className="w-4 h-4" />
            Search Flights
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
