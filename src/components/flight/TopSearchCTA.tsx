import { ExternalLink, Plane, Sparkles, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AFFILIATE_LINKS, AFFILIATE_DISCLOSURE_TEXT } from "@/config/affiliateLinks";
import { trackAffiliateClick } from "@/lib/affiliateTracking";
import { cn } from "@/lib/utils";

interface TopSearchCTAProps {
  flightCount?: number;
  lowestPrice?: number;
  origin?: string;
  destination?: string;
  className?: string;
}

export default function TopSearchCTA({ 
  flightCount, 
  lowestPrice,
  origin,
  destination,
  className 
}: TopSearchCTAProps) {
  const handleSearchClick = () => {
    // Track the click with CTA type
    trackAffiliateClick({
      flightId: `search-${origin}-${destination}`,
      airline: 'Multiple',
      airlineCode: 'ALL',
      origin: origin || '',
      destination: destination || '',
      price: lowestPrice || 0,
      passengers: 1,
      cabinClass: 'economy',
      affiliatePartner: 'searadar',
      referralUrl: AFFILIATE_LINKS.flights.url,
      source: 'top_search_cta',
      ctaType: 'top_cta',
      serviceType: 'flights',
    });

    window.open(AFFILIATE_LINKS.flights.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={cn(
      "p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-cyan-500/10 border border-sky-500/20",
      className
    )}>
      {/* Trust Text */}
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span className="text-sm font-medium text-emerald-600">Compare prices from trusted travel partners</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-sky-500/20 text-sky-500 border-sky-500/30 gap-1">
              <Sparkles className="w-3 h-3" />
              Compare & Save
            </Badge>
            {lowestPrice && (
              <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">
                From ${lowestPrice}*
              </Badge>
            )}
            {flightCount && flightCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {flightCount} options
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Prices are indicative and may change. Final price is shown on partner site.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <Button
            size="lg"
            className="gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/30 w-full sm:w-auto min-h-[48px] touch-manipulation"
            onClick={handleSearchClick}
          >
            <Search className="w-4 h-4" />
            View All Deals
            <ExternalLink className="w-4 h-4" />
          </Button>
          <p className="text-[10px] text-muted-foreground text-right">
            {AFFILIATE_DISCLOSURE_TEXT.short}
          </p>
        </div>
      </div>
    </div>
  );
}
