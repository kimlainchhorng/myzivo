import { Plane, Search, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AFFILIATE_LINKS, AFFILIATE_DISCLOSURE_TEXT } from "@/config/affiliateLinks";

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
  const handleSearchPartner = () => {
    window.open(AFFILIATE_LINKS.flights.url, "_blank", "noopener,noreferrer");
  };

  return (
    <Card className="p-8 sm:p-12 text-center">
      <div className="w-20 h-20 rounded-full bg-sky-500/10 flex items-center justify-center mx-auto mb-6">
        <Plane className="w-10 h-10 text-sky-500" />
      </div>
      
      <h3 className="text-xl sm:text-2xl font-bold mb-2">No flights found</h3>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        We couldn't find flights matching your criteria. Try adjusting your filters or search directly with our partner for more options.
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
      <div className="max-w-md mx-auto">
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
            Search All Flights
            <ExternalLink className="w-4 h-4" />
          </Button>
          <p className="text-[10px] text-muted-foreground mt-3">
            {AFFILIATE_DISCLOSURE_TEXT.short}
          </p>
        </div>
      </div>
    </Card>
  );
}
