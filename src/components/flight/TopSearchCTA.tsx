import { ExternalLink, Plane, Sparkles, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AFFILIATE_LINKS, AFFILIATE_DISCLOSURE_TEXT } from "@/config/affiliateLinks";
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
    window.open(AFFILIATE_LINKS.flights.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={cn(
      "p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-cyan-500/10 border border-sky-500/20",
      className
    )}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-sky-500/20 text-sky-500 border-sky-500/30 gap-1">
              <Sparkles className="w-3 h-3" />
              Compare & Save
            </Badge>
            {lowestPrice && (
              <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">
                From ${lowestPrice}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Compare prices from 728+ airlines. Prices shown are indicative — final price on partner site.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <Button
            size="lg"
            className="gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/30 w-full sm:w-auto"
            onClick={handleSearchClick}
          >
            <Search className="w-4 h-4" />
            Compare All Flights
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
