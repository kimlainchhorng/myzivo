import { ExternalLink, Hotel, Sparkles, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { hotelAffiliatePartners } from "@/data/hotelAffiliatePartners";

interface HotelTopSearchCTAProps {
  hotelCount?: number;
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  rooms?: number;
  className?: string;
}

export default function HotelTopSearchCTA({ 
  hotelCount, 
  destination,
  checkIn,
  checkOut,
  guests = 2,
  rooms = 1,
  className 
}: HotelTopSearchCTAProps) {
  const handleSearchClick = () => {
    const partner = hotelAffiliatePartners[0]; // Booking.com
    const url = partner.urlTemplate({
      destination: destination || '',
      checkIn,
      checkOut,
      guests,
      rooms,
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={cn(
      "p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-yellow-500/10 border border-amber-500/20",
      className
    )}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 gap-1">
              <Sparkles className="w-3 h-3" />
              Compare & Save
            </Badge>
            {hotelCount && hotelCount > 0 && (
              <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">
                {hotelCount} hotels found
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Compare prices from Booking.com, Hotels.com, Expedia & more. Prices shown are indicative — final price on partner site.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <Button
            size="lg"
            className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30 w-full sm:w-auto"
            onClick={handleSearchClick}
          >
            <Search className="w-4 h-4" />
            Compare All Hotels
            <ExternalLink className="w-4 h-4" />
          </Button>
          <p className="text-[10px] text-muted-foreground text-right max-w-[200px]">
            Opens in new tab
          </p>
        </div>
      </div>
    </div>
  );
}
