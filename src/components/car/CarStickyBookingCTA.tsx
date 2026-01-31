import { ExternalLink, Car, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { carAffiliatePartners } from "@/data/carAffiliatePartners";

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
  const handleBookClick = () => {
    // Use Rentalcars.com as default partner
    const partner = carAffiliatePartners[0];
    const url = partner.urlTemplate({
      pickupLocation: pickupLocation || '',
      pickupDate,
      returnDate,
      pickupTime,
      returnTime,
      driverAge,
    });
    window.open(url, "_blank", "noopener,noreferrer");
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
              <span className="text-sm font-semibold text-violet-500">6+</span>
              <span className="text-xs text-muted-foreground">rental sites</span>
            </div>
            <p className="text-[10px] text-muted-foreground truncate">
              Compare prices from Rentalcars, Kayak & more
            </p>
          </div>

          {/* CTA Button */}
          <Button
            size="lg"
            className="gap-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg shadow-violet-500/30 shrink-0"
            onClick={handleBookClick}
          >
            <Sparkles className="w-4 h-4" />
            Compare Cars
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>

        {/* Disclosure */}
        <p className="text-[9px] text-muted-foreground text-center mt-2 leading-tight">
          You will be redirected to our trusted travel partner to complete your booking.
        </p>
      </div>
    </div>
  );
}
