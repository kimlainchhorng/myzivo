import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Minus, Calendar, Bell, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PricePoint {
  date: string;
  price: number;
  label: string;
}

const mockPriceHistory: PricePoint[] = [
  { date: "Dec 1", price: 420, label: "6 weeks ago" },
  { date: "Dec 15", price: 385, label: "4 weeks ago" },
  { date: "Jan 1", price: 450, label: "2 weeks ago" },
  { date: "Jan 10", price: 410, label: "1 week ago" },
  { date: "Jan 17", price: 375, label: "3 days ago" },
  { date: "Today", price: 349, label: "Now" },
];

const FlightPriceHistory = () => {
  const [showAlert, setShowAlert] = useState(false);
  
  const currentPrice = mockPriceHistory[mockPriceHistory.length - 1].price;
  const previousPrice = mockPriceHistory[mockPriceHistory.length - 2].price;
  const lowestPrice = Math.min(...mockPriceHistory.map(p => p.price));
  const highestPrice = Math.max(...mockPriceHistory.map(p => p.price));
  const priceChange = previousPrice - currentPrice;
  const percentChange = ((priceChange / previousPrice) * 100).toFixed(1);

  const getBarHeight = (price: number) => {
    const range = highestPrice - lowestPrice;
    const normalized = (price - lowestPrice) / range;
    return 30 + normalized * 70; // 30% to 100%
  };

  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-sky-500/10 via-card/50 to-blue-500/10 border border-sky-500/20 rounded-3xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <Badge className="mb-2 bg-sky-500/20 text-sky-400 border-sky-500/30">
                <TrendingDown className="w-3 h-3 mr-1" /> Price Tracker
              </Badge>
              <h3 className="text-xl md:text-2xl font-display font-bold">
                Price History & Predictions
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Track price trends to find the best time to book
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={cn(
                "px-4 py-2 rounded-xl",
                priceChange > 0 ? "bg-emerald-500/10" : "bg-rose-500/10"
              )}>
                {priceChange > 0 ? (
                  <div className="flex items-center gap-2 text-emerald-500">
                    <TrendingDown className="w-4 h-4" />
                    <span className="font-bold">${priceChange} ({percentChange}%)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-rose-500">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-bold">+${Math.abs(priceChange)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Price Chart */}
          <div className="bg-card/50 rounded-2xl p-4 mb-6">
            <div className="flex items-end justify-between gap-2 h-32">
              {mockPriceHistory.map((point, index) => (
                <div key={point.date} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-foreground">${point.price}</span>
                  <div 
                    className={cn(
                      "w-full rounded-t-lg transition-all duration-500",
                      index === mockPriceHistory.length - 1 
                        ? "bg-gradient-to-t from-sky-500 to-sky-400" 
                        : point.price === lowestPrice 
                          ? "bg-gradient-to-t from-emerald-500 to-emerald-400"
                          : "bg-gradient-to-t from-muted to-muted/50"
                    )}
                    style={{ height: `${getBarHeight(point.price)}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground">{point.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-500 mb-1">
                <TrendingDown className="w-4 h-4" />
                <span className="text-sm font-bold">Lowest Price</span>
              </div>
              <p className="text-2xl font-bold text-emerald-500">${lowestPrice}</p>
              <p className="text-xs text-muted-foreground">Current price is the lowest!</p>
            </div>
            
            <div className="p-4 bg-sky-500/10 rounded-xl border border-sky-500/20">
              <div className="flex items-center gap-2 text-sky-500 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-bold">Best Time to Book</span>
              </div>
              <p className="text-2xl font-bold text-sky-500">Now</p>
              <p className="text-xs text-muted-foreground">Prices may rise soon</p>
            </div>
            
            <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-500 mb-1">
                <Info className="w-4 h-4" />
                <span className="text-sm font-bold">Price Confidence</span>
              </div>
              <p className="text-2xl font-bold text-amber-500">High</p>
              <p className="text-xs text-muted-foreground">Based on historical data</p>
            </div>
          </div>

          {/* Alert Button */}
          <div className="flex items-center justify-between p-4 bg-card/80 rounded-xl border border-border/50">
            <div className="flex items-center gap-3">
              <Bell className={cn("w-5 h-5", showAlert ? "text-primary" : "text-muted-foreground")} />
              <div>
                <p className="font-semibold text-sm">Price Drop Alerts</p>
                <p className="text-xs text-muted-foreground">Get notified when prices drop below $349</p>
              </div>
            </div>
            <Button 
              variant={showAlert ? "default" : "outline"} 
              size="sm"
              onClick={() => setShowAlert(!showAlert)}
            >
              {showAlert ? "Alert Set" : "Set Alert"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlightPriceHistory;
