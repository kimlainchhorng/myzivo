/**
 * NoFlightsFound Component
 * OTA Mode: Shows "No flights available" UI when Duffel returns 0 offers
 * Includes sandbox test helper for development
 */
import { Plane, Search, Hotel, Car, Ticket, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AFFILIATE_LINKS } from "@/config/affiliateLinks";
import { trackAffiliateClick } from "@/lib/affiliateTracking";
import { useNavigate } from "react-router-dom";
import SandboxTestHelper from "./SandboxTestHelper";
import { isSandboxMode } from "@/config/duffelConfig";

interface NoFlightsFoundProps {
  onClearFilters?: () => void;
  onModifySearch?: () => void;
  origin?: string;
  destination?: string;
  isAdmin?: boolean;
}

export default function NoFlightsFound({ 
  onClearFilters, 
  onModifySearch,
  origin,
  destination,
  isAdmin = false
}: NoFlightsFoundProps) {
  const navigate = useNavigate();
  // Only show sandbox helper for admin users in sandbox mode
  const showSandboxHelper = isSandboxMode() && isAdmin;

  const handleCrossSellClick = (type: 'hotel' | 'car' | 'activities') => {
    trackAffiliateClick({
      flightId: `no_results_crosssell-${type}`,
      airline: 'ZIVO',
      airlineCode: 'ZV',
      origin: origin || '',
      destination: destination || '',
      price: 0,
      passengers: 1,
      cabinClass: 'economy',
      affiliatePartner: type === 'activities' ? 'klook' : 'zivo_internal',
      referralUrl: type === 'activities' ? AFFILIATE_LINKS.activities.url : `/${type === 'hotel' ? 'book-hotel' : 'rent-car'}`,
      source: 'no_results_cross_sell',
      ctaType: 'cross_sell',
      serviceType: type === 'hotel' ? 'hotels' : type === 'car' ? 'car_rental' : 'activities',
    });

    if (type === 'activities') {
      window.open(AFFILIATE_LINKS.activities.url, "_blank", "noopener,noreferrer");
    } else {
      navigate(type === 'hotel' ? '/book-hotel' : '/rent-car');
    }
  };

  return (
    <Card className="p-8 sm:p-12 text-center">
      {/* Sandbox Helper Banner - INTERNAL ADMIN ONLY (never in production) */}
      {showSandboxHelper && (
        <SandboxTestHelper className="mb-6 text-left" isAdmin={isAdmin} />
      )}

      <div className="w-20 h-20 rounded-full bg-sky-500/10 flex items-center justify-center mx-auto mb-6">
        <Plane className="w-10 h-10 text-sky-500" />
      </div>
      
      <h3 className="text-xl sm:text-2xl font-bold mb-2">No flights available</h3>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        No flights found for these dates. Try different dates or nearby airports.
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-3 mb-8">
        {onClearFilters && (
          <Button variant="outline" onClick={onClearFilters} className="gap-2 rounded-xl min-h-[44px] active:scale-[0.97] transition-all duration-200 touch-manipulation">
            Clear Filters
          </Button>
        )}
        {onModifySearch && (
          <Button variant="outline" onClick={onModifySearch} className="gap-2 rounded-xl min-h-[44px] active:scale-[0.97] transition-all duration-200 touch-manipulation">
            <Search className="w-4 h-4" />
            Modify Search
          </Button>
        )}
      </div>

      {/* Cross-Sell Options - Hotels/Cars remain affiliate model */}
      {destination && (
        <div className="max-w-lg mx-auto">
          <p className="text-sm text-muted-foreground mb-4">Or explore other options for your trip:</p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleCrossSellClick('hotel')}
              className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all duration-200 active:scale-[0.95] touch-manipulation"
            >
              <Hotel className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Hotels</p>
            </button>
            <button
              onClick={() => handleCrossSellClick('car')}
              className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all duration-200 active:scale-[0.95] touch-manipulation"
            >
              <Car className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Cars</p>
            </button>
            <button
              onClick={() => handleCrossSellClick('activities')}
              className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-all duration-200 active:scale-[0.95] touch-manipulation"
            >
              <Ticket className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Activities</p>
              <ExternalLink className="w-3 h-3 text-muted-foreground mx-auto mt-1" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
