/**
 * NoHotelsFound Component
 * LOCKED COMPLIANCE: Uses hotelCompliance.ts for all text
 */
import { Hotel, Search, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useHotelRedirect } from "@/hooks/useAffiliateRedirect";
import { HOTEL_CTA_TEXT, HOTEL_DISCLAIMERS } from "@/config/hotelCompliance";

interface NoHotelsFoundProps {
  onModifySearch?: () => void;
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  rooms?: number;
}

export default function NoHotelsFound({ 
  onModifySearch,
  destination,
  checkIn,
  checkOut,
  guests = 2,
  rooms = 1,
}: NoHotelsFoundProps) {
  const { redirectWithParams, redirectSimple } = useHotelRedirect('no_hotels_found', 'no_results_fallback');

  const handleSearchPartner = () => {
    if (destination && checkIn && checkOut) {
      redirectWithParams({
        destination,
        checkIn,
        checkOut,
        guests,
        rooms,
      });
    } else {
      redirectSimple();
    }
  };

  return (
    <Card className="p-8 sm:p-12 text-center">
      <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
        <Hotel className="w-10 h-10 text-amber-500" />
      </div>
      
      <h3 className="text-xl sm:text-2xl font-bold mb-2">No hotels found</h3>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        We couldn't find hotels matching your criteria. Try adjusting your search or check directly with our partner for more options.
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6">
        {onModifySearch && (
          <Button variant="outline" onClick={onModifySearch} className="gap-2">
            <Search className="w-4 h-4" />
            Modify Search
          </Button>
        )}
      </div>

      {/* Primary Affiliate CTA */}
      <div className="max-w-md mx-auto">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-yellow-500/10 border border-amber-500/20">
          <p className="text-sm text-muted-foreground mb-4">
            Search thousands of hotels with our trusted partner
          </p>
          <Button
            size="lg"
            className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30 min-h-[48px] touch-manipulation active:scale-[0.98]"
            onClick={handleSearchPartner}
          >
            <Hotel className="w-5 h-5" />
            {HOTEL_CTA_TEXT.viewDeal}
            <ExternalLink className="w-4 h-4" />
          </Button>
          <p className="text-[10px] text-muted-foreground mt-3">
            {HOTEL_DISCLAIMERS.partnerBookingShort}
          </p>
        </div>
      </div>
    </Card>
  );
}
