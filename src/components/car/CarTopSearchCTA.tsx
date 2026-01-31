import { ExternalLink, Car, Sparkles, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { carAffiliatePartners } from "@/data/carAffiliatePartners";

interface CarTopSearchCTAProps {
  pickupLocation?: string;
  pickupDate?: string;
  returnDate?: string;
  pickupTime?: string;
  returnTime?: string;
  driverAge?: number;
  className?: string;
}

export default function CarTopSearchCTA({ 
  pickupLocation,
  pickupDate,
  returnDate,
  pickupTime,
  returnTime,
  driverAge = 25,
  className 
}: CarTopSearchCTAProps) {
  const handleSearchClick = () => {
    const partner = carAffiliatePartners[0]; // Rentalcars.com
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
      "p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-indigo-500/10 border border-violet-500/20",
      className
    )}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-violet-500/20 text-violet-500 border-violet-500/30 gap-1">
              <Sparkles className="w-3 h-3" />
              Compare & Save
            </Badge>
            <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">
              6+ rental sites
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Compare prices from Rentalcars, Kayak, Expedia & more. Prices shown are indicative — final price on partner site.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <Button
            size="lg"
            className="gap-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg shadow-violet-500/30 w-full sm:w-auto"
            onClick={handleSearchClick}
          >
            <Search className="w-4 h-4" />
            Compare All Rentals
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
