import { Car, Search, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { carAffiliatePartners } from "@/data/carAffiliatePartners";

interface NoCarsFoundProps {
  onModifySearch?: () => void;
  pickupLocation?: string;
  pickupDate?: string;
  returnDate?: string;
  driverAge?: number;
}

export default function NoCarsFound({ 
  onModifySearch,
  pickupLocation,
  pickupDate,
  returnDate,
  driverAge = 25,
}: NoCarsFoundProps) {
  const handleSearchPartner = () => {
    const partner = carAffiliatePartners[0]; // Rentalcars.com
    const url = partner.urlTemplate({
      pickupLocation: pickupLocation || '',
      pickupDate,
      returnDate,
      driverAge,
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Card className="p-8 sm:p-12 text-center">
      <div className="w-20 h-20 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-6">
        <Car className="w-10 h-10 text-violet-500" />
      </div>
      
      <h3 className="text-xl sm:text-2xl font-bold mb-2">No cars found</h3>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        We couldn't find car rentals matching your criteria. Try adjusting your search or check directly with our partner for more options.
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
        <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-indigo-500/10 border border-violet-500/20">
          <p className="text-sm text-muted-foreground mb-4">
            Search thousands of rental cars with our trusted partner
          </p>
          <Button
            size="lg"
            className="w-full gap-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg shadow-violet-500/30"
            onClick={handleSearchPartner}
          >
            <Car className="w-5 h-5" />
            Search All Cars
            <ExternalLink className="w-4 h-4" />
          </Button>
          <p className="text-[10px] text-muted-foreground mt-3">
            You will be redirected to our trusted travel partner to complete your booking.
          </p>
        </div>
      </div>
    </Card>
  );
}
