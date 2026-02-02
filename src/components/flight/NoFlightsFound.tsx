/**
 * NoFlightsFound Component
 * LOCKED COMPLIANCE: Uses flightCompliance.ts for all text
 */
import { Plane, Search, ExternalLink, Hotel, Car, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AFFILIATE_LINKS } from "@/config/affiliateLinks";
import { FLIGHT_CTA_TEXT, FLIGHT_DISCLAIMERS } from "@/config/flightCompliance";
import { trackAffiliateClick } from "@/lib/affiliateTracking";
import { useNavigate } from "react-router-dom";

interface NoFlightsFoundProps {
  onClearFilters?: () => void;
  onModifySearch?: () => void;
  origin?: string;
  destination?: string;
}

export default function NoFlightsFound({ 
  onClearFilters, 
  onModifySearch,
  origin,
  destination 
}: NoFlightsFoundProps) {
  const navigate = useNavigate();

  const handleSearchPartner = () => {
    // Track this click for analytics
    trackAffiliateClick({
      flightId: `no_results-${origin}-${destination}`,
      airline: 'Multiple',
      airlineCode: 'ALL',
      origin: origin || '',
      destination: destination || '',
      price: 0,
      passengers: 1,
      cabinClass: 'economy',
      affiliatePartner: 'searadar',
      referralUrl: AFFILIATE_LINKS.flights.url,
      source: 'no_flights_found',
      ctaType: 'no_results_fallback',
      serviceType: 'flights',
    });
    
    // Open same affiliate link in new tab
    window.open(AFFILIATE_LINKS.flights.url, "_blank", "noopener,noreferrer");
  };

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
      <div className="w-20 h-20 rounded-full bg-sky-500/10 flex items-center justify-center mx-auto mb-6">
        <Plane className="w-10 h-10 text-sky-500" />
      </div>
      
      <h3 className="text-xl sm:text-2xl font-bold mb-2">Comparing live deals</h3>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        We're searching licensed travel partners for the best options. Try adjusting your filters or explore deals below.
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6">
        {onClearFilters && (
          <Button variant="outline" onClick={onClearFilters} className="gap-2">
            Clear Filters
          </Button>
        )}
        {onModifySearch && (
          <Button variant="outline" onClick={onModifySearch} className="gap-2">
            <Search className="w-4 h-4" />
            Modify Search
          </Button>
        )}
      </div>

      {/* Primary Affiliate CTA */}
      <div className="max-w-md mx-auto mb-8">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-cyan-500/10 border border-sky-500/20">
          <p className="text-sm text-muted-foreground mb-4">
            Search 728+ airlines with our trusted partner
          </p>
          <Button
            size="lg"
            className="w-full gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/30"
            onClick={handleSearchPartner}
          >
            <Plane className="w-5 h-5" />
            {FLIGHT_CTA_TEXT.primary}
            <ExternalLink className="w-4 h-4" />
          </Button>
          <p className="text-[10px] text-muted-foreground mt-3">
            {FLIGHT_DISCLAIMERS.ticketingShort}
          </p>
        </div>
      </div>

      {/* Cross-Sell Options */}
      {destination && (
        <div className="max-w-lg mx-auto">
          <p className="text-sm text-muted-foreground mb-4">Or explore other options for your trip:</p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleCrossSellClick('hotel')}
              className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
            >
              <Hotel className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Hotels</p>
            </button>
            <button
              onClick={() => handleCrossSellClick('car')}
              className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
            >
              <Car className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Cars</p>
            </button>
            <button
              onClick={() => handleCrossSellClick('activities')}
              className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-all"
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
