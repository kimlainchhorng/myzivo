import { Bell, TrendingDown, ArrowRight, X, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useFlightRedirect } from "@/hooks/useAffiliateRedirect";
import { format, addDays } from "date-fns";

interface PriceAlertBannerProps {
  route?: string;
  origin?: string;
  destination?: string;
  currentPrice?: number;
  previousPrice?: number;
  savings?: number;
}

const PriceAlertBanner = ({
  route = "New York → London",
  origin = "JFK",
  destination = "LHR",
  currentPrice = 449,
  previousPrice = 649,
  savings = 200,
}: PriceAlertBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const { redirectWithParams } = useFlightRedirect('price_alert_banner', 'trending_deal');

  if (!isVisible) return null;

  const percentOff = Math.round(((previousPrice - currentPrice) / previousPrice) * 100);

  // Generate dynamic dates for the deal
  const departDate = format(addDays(new Date(), 14), 'yyyy-MM-dd');
  const returnDate = format(addDays(new Date(), 21), 'yyyy-MM-dd');

  const handleBookNow = () => {
    redirectWithParams({
      origin,
      destination,
      departDate,
      returnDate,
      passengers: 1,
      cabinClass: 'economy',
      tripType: 'roundtrip',
    });
  };

  return (
    <div className="relative bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-500/20 rounded-2xl p-4 md:p-6 overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-3xl rounded-full" />
      
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-all duration-200"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center animate-pulse">
          <TrendingDown className="w-6 h-6 text-green-400" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Bell className="w-3 h-3 mr-1" /> Price Drop Alert
            </Badge>
            <Badge className="bg-green-500 text-white border-0">
              {percentOff}% OFF
            </Badge>
          </div>
          <h3 className="font-bold text-lg">{route}</h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-2xl font-bold text-green-400">${currentPrice}*</span>
            <span className="text-lg text-muted-foreground line-through">${previousPrice}</span>
            <span className="text-sm text-green-400">Save ${savings}!</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <Button 
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white gap-2 min-h-[44px] touch-manipulation active:scale-[0.98]"
            onClick={handleBookNow}
          >
            Book Now 
            <ExternalLink className="w-4 h-4" />
          </Button>
          <p className="text-[9px] text-muted-foreground">Opens partner site</p>
        </div>
      </div>
      
      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground mt-3">
        *Prices are indicative and may change. Final price shown on partner site.
      </p>
    </div>
  );
};

export default PriceAlertBanner;
