import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, TrendingUp, ArrowRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { AFFILIATE_LINKS } from "@/config/affiliateLinks";

const routes = [
  { from: "LAX", fromCity: "Los Angeles", to: "JFK", toCity: "New York", price: 149, searches: "50K+", trending: true },
  { from: "SFO", fromCity: "San Francisco", to: "LAX", toCity: "Los Angeles", price: 79, searches: "45K+", trending: true },
  { from: "ORD", fromCity: "Chicago", to: "MIA", toCity: "Miami", price: 119, searches: "38K+", trending: false },
  { from: "JFK", fromCity: "New York", to: "LHR", toCity: "London", price: 349, searches: "42K+", trending: true },
  { from: "LAX", fromCity: "Los Angeles", to: "HNL", toCity: "Honolulu", price: 189, searches: "35K+", trending: true },
  { from: "DFW", fromCity: "Dallas", to: "LAX", toCity: "Los Angeles", price: 99, searches: "32K+", trending: false },
  { from: "SEA", fromCity: "Seattle", to: "SFO", toCity: "San Francisco", price: 89, searches: "28K+", trending: false },
  { from: "ATL", fromCity: "Atlanta", to: "JFK", toCity: "New York", price: 109, searches: "30K+", trending: false },
];

interface FlightPopularRoutesProps {
  onSelect?: (from: string, to: string) => void;
}

const FlightPopularRoutes = ({ onSelect }: FlightPopularRoutesProps) => {
  return (
    <section className="py-12 sm:py-16 border-t border-border/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-500/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
              Most Searched <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">Routes</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Popular flight routes with the best deals
            </p>
          </div>
          <button className="hidden sm:flex items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors text-sm font-medium">
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {routes.map((route, index) => (
            <Card
              key={`${route.from}-${route.to}`}
              className={cn(
                "glass-card overflow-hidden group cursor-pointer transition-all duration-300",
                "hover:border-sky-500/50 hover:-translate-y-1 touch-manipulation active:scale-[0.98]",
                "animate-in fade-in slide-in-from-bottom-4"
              )}
              onClick={() => {
                window.open(AFFILIATE_LINKS.flights.url, "_blank", "noopener,noreferrer");
                onSelect?.(route.from, route.to);
              }}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="text-center">
                      <p className="font-bold text-lg">{route.from}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[60px]">{route.fromCity}</p>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-px bg-border" />
                      <Plane className="w-4 h-4 mx-1 text-sky-400 rotate-90" />
                      <div className="w-6 h-px bg-border" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg">{route.to}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[60px]">{route.toCity}</p>
                    </div>
                  </div>
                  {route.trending && (
                    <Badge className="bg-gradient-to-r from-sky-500 to-blue-500 text-white text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Hot
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{route.searches} searches</span>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-sky-400">From ${route.price}</span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FlightPopularRoutes;
