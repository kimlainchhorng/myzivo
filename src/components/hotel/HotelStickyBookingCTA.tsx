import { ExternalLink, Hotel, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { hotelAffiliatePartners } from "@/data/hotelAffiliatePartners";
import { trackAffiliateClick } from "@/lib/affiliateTracking";

interface HotelStickyBookingCTAProps {
  className?: string;
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  rooms?: number;
  hotelCount?: number;
}

export default function HotelStickyBookingCTA({ 
  className, 
  destination,
  checkIn,
  checkOut,
  guests = 2,
  rooms = 1,
  hotelCount 
}: HotelStickyBookingCTAProps) {
  const handleBookClick = () => {
    // Use Booking.com as default partner
    const partner = hotelAffiliatePartners[0];
    const url = partner.urlTemplate({
      destination: destination || '',
      checkIn,
      checkOut,
      guests,
      rooms,
    });

    // Track the click
    trackAffiliateClick({
      flightId: `hotel-sticky-${destination}`,
      airline: partner.name,
      airlineCode: partner.id.toUpperCase(),
      origin: 'ZIVO',
      destination: destination || '',
      price: 0,
      passengers: guests,
      cabinClass: 'standard',
      affiliatePartner: partner.id,
      referralUrl: url,
      source: 'sticky_booking_cta',
      ctaType: 'sticky_cta',
      serviceType: 'hotels',
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
            {hotelCount && hotelCount > 0 && (
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-amber-500">{hotelCount}</span>
                <span className="text-xs text-muted-foreground">hotels found</span>
              </div>
            )}
            <p className="text-[10px] text-muted-foreground truncate">
              Compare prices from Booking.com, Hotels.com & more
            </p>
          </div>

          {/* CTA Button - Large, easy to tap */}
          <Button
            size="lg"
            className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30 shrink-0 min-h-[48px] px-6 touch-manipulation active:scale-[0.98]"
            onClick={handleBookClick}
          >
            <Sparkles className="w-4 h-4" />
            View Deals
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
