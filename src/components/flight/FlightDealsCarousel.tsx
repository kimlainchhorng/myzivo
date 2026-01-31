import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plane, Clock, ArrowRight, Zap, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const deals = [
  {
    id: 1,
    from: "LAX",
    fromCity: "Los Angeles",
    to: "JFK",
    toCity: "New York",
    price: 149,
    originalPrice: 299,
    airline: "United",
    departure: "7:00 AM",
    duration: "5h 30m",
    savings: 50,
    expires: "2h left",
  },
  {
    id: 2,
    from: "SFO",
    fromCity: "San Francisco",
    to: "LHR",
    toCity: "London",
    price: 449,
    originalPrice: 799,
    airline: "British Airways",
    departure: "9:15 PM",
    duration: "10h 45m",
    savings: 44,
    expires: "5h left",
  },
  {
    id: 3,
    from: "MIA",
    fromCity: "Miami",
    to: "CDG",
    toCity: "Paris",
    price: 389,
    originalPrice: 649,
    airline: "Air France",
    departure: "6:30 PM",
    duration: "9h 20m",
    savings: 40,
    expires: "8h left",
  },
  {
    id: 4,
    from: "ORD",
    fromCity: "Chicago",
    to: "NRT",
    toCity: "Tokyo",
    price: 599,
    originalPrice: 999,
    airline: "ANA",
    departure: "12:45 PM",
    duration: "13h 15m",
    savings: 40,
    expires: "3h left",
  },
];

interface FlightDealsCarouselProps {
  onSelect?: (from: string, to: string) => void;
}

const FlightDealsCarousel = ({ onSelect }: FlightDealsCarouselProps) => {
  return (
    <section className="py-12 sm:py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium mb-3">
              <Zap className="w-3 h-3" />
              Flash Deals • Limited Time
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold">
              Today's <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">Best Deals</span>
            </h2>
          </div>
          <button className="hidden sm:flex items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors text-sm font-medium">
            View all deals <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {deals.map((deal, index) => (
            <Card
              key={deal.id}
              className={cn(
                "glass-card overflow-hidden group cursor-pointer transition-all duration-300 flex-shrink-0 w-[300px] sm:w-[320px]",
                "hover:border-sky-500/50 hover:-translate-y-1 touch-manipulation active:scale-[0.98]",
                "animate-in fade-in slide-in-from-right-4"
              )}
              onClick={() => onSelect?.(deal.from, deal.to)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-0">
                <div className="relative p-4 bg-gradient-to-r from-sky-500/10 to-blue-500/10">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-red-500 text-white">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      {deal.savings}% OFF
                    </Badge>
                    <Badge variant="outline" className="text-xs border-red-500/50 text-red-400">
                      <Clock className="w-3 h-3 mr-1" />
                      {deal.expires}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{deal.from}</p>
                      <p className="text-xs text-muted-foreground">{deal.fromCity}</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center px-3">
                      <div className="flex-1 h-px bg-border" />
                      <Plane className="w-5 h-5 mx-2 text-sky-400 rotate-90" />
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{deal.to}</p>
                      <p className="text-xs text-muted-foreground">{deal.toCity}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm text-muted-foreground">{deal.airline}</p>
                      <p className="text-xs text-muted-foreground">{deal.departure} • {deal.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground line-through">${deal.originalPrice}</p>
                      <p className="text-2xl font-bold text-sky-400">${deal.price}</p>
                    </div>
                  </div>
                  <Button className="w-full bg-sky-500 hover:bg-sky-600 text-white">
                    Book Now <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FlightDealsCarousel;
