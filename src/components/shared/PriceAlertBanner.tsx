import { Bell, TrendingDown, ArrowRight, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PriceAlertBannerProps {
  route?: string;
  currentPrice?: number;
  previousPrice?: number;
  savings?: number;
}

const PriceAlertBanner = ({
  route = "New York → London",
  currentPrice = 449,
  previousPrice = 649,
  savings = 200,
}: PriceAlertBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const percentOff = Math.round(((previousPrice - currentPrice) / previousPrice) * 100);

  return (
    <div className="relative bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-500/20 rounded-2xl p-4 md:p-6 overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-3xl rounded-full" />
      
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
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
            <span className="text-2xl font-bold text-green-400">${currentPrice}</span>
            <span className="text-lg text-muted-foreground line-through">${previousPrice}</span>
            <span className="text-sm text-green-400">Save ${savings}!</span>
          </div>
        </div>

        <Button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          Book Now <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default PriceAlertBanner;
