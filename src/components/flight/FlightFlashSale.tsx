import { Sparkles, Zap, TrendingDown, Bell, ArrowRight, Plane, Clock, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { AFFILIATE_LINKS } from "@/config/affiliateLinks";
import { trackAffiliateClick } from "@/lib/affiliateTracking";

const flashDeals = [
  { route: "LAX → NYC", price: 89, originalPrice: 189, airline: "JetBlue", expires: 3600, origin: "LAX", destination: "JFK" },
  { route: "SFO → SEA", price: 49, originalPrice: 129, airline: "Alaska", expires: 7200, origin: "SFO", destination: "SEA" },
  { route: "MIA → ATL", price: 59, originalPrice: 149, airline: "Delta", expires: 1800, origin: "MIA", destination: "ATL" },
  { route: "ORD → DEN", price: 79, originalPrice: 169, airline: "United", expires: 5400, origin: "ORD", destination: "DEN" },
];

const FlightFlashSale = () => {
  const [timeLeft, setTimeLeft] = useState(flashDeals.map((d) => d.expires));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev.map((t) => Math.max(0, t - 1)));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Badge className="mb-2 bg-red-500/20 text-red-400 border-red-500/20 animate-pulse">
              <Zap className="w-3 h-3 mr-1" /> Flash Sale
            </Badge>
            <h2 className="text-2xl md:text-3xl font-display font-bold">
              Lightning Deals
            </h2>
          </div>
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-1" /> Get Alerts
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {flashDeals.map((deal, index) => (
            <div
              key={deal.route}
              className="relative overflow-hidden bg-gradient-to-br from-red-500/10 via-card/80 to-orange-500/10 border border-red-500/20 rounded-2xl p-5 hover:border-red-500/50 transition-all group"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/20 blur-2xl rounded-full" />

              <div className="flex items-center gap-2 mb-3">
                <Plane className="w-4 h-4 text-sky-400" />
                <span className="font-bold">{deal.route}</span>
              </div>

              <p className="text-sm text-muted-foreground mb-2">{deal.airline}</p>

              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-xs text-muted-foreground">From</span>
                <span className="text-3xl font-bold text-green-400">${deal.price}*</span>
                <span className="text-lg text-muted-foreground line-through">${deal.originalPrice}</span>
                <Badge className="bg-green-500/20 text-green-400 border-0">
                  -{Math.round((1 - deal.price / deal.originalPrice) * 100)}%
                </Badge>
              </div>

              <div className="flex items-center gap-1 text-xs text-red-400 mb-4">
                <Clock className="w-3 h-3" />
                <span className="font-mono">{formatTime(timeLeft[index])}</span>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 group-hover:shadow-lg group-hover:shadow-red-500/20 min-h-[44px] touch-manipulation active:scale-[0.98]" 
                size="sm"
                onClick={() => {
                  trackAffiliateClick({
                    flightId: `flash-${deal.origin}-${deal.destination}`,
                    airline: deal.airline,
                    airlineCode: deal.airline.substring(0, 2).toUpperCase(),
                    origin: deal.origin,
                    destination: deal.destination,
                    price: deal.price,
                    passengers: 1,
                    cabinClass: 'economy',
                    affiliatePartner: 'searadar',
                    referralUrl: AFFILIATE_LINKS.flights.url,
                    source: 'flash_sale',
                    ctaType: 'result_card',
                    serviceType: 'flights',
                  });
                  window.open(AFFILIATE_LINKS.flights.url, "_blank", "noopener,noreferrer");
                }}
              >
                View Deal <ExternalLink className="w-4 h-4 ml-1" />
              </Button>
              <p className="text-[8px] text-muted-foreground text-center mt-2">*Indicative price</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FlightFlashSale;
