import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const locations = [
  { city: "Los Angeles", state: "CA", image: "🌴", cars: 850, avgPrice: 45, airport: "LAX", trending: true },
  { city: "Miami", state: "FL", image: "🏖️", cars: 680, avgPrice: 42, airport: "MIA", trending: true },
  { city: "Las Vegas", state: "NV", image: "🎰", cars: 590, avgPrice: 38, airport: "LAS", trending: true },
  { city: "New York", state: "NY", image: "🗽", cars: 920, avgPrice: 55, airport: "JFK", trending: false },
  { city: "San Francisco", state: "CA", image: "🌉", cars: 540, avgPrice: 52, airport: "SFO", trending: false },
  { city: "Orlando", state: "FL", image: "🎢", cars: 710, avgPrice: 35, airport: "MCO", trending: true },
  { city: "Denver", state: "CO", image: "🏔️", cars: 420, avgPrice: 48, airport: "DEN", trending: false },
  { city: "Seattle", state: "WA", image: "☕", cars: 380, avgPrice: 50, airport: "SEA", trending: false },
];

interface CarPopularLocationsProps {
  onSelect?: (city: string) => void;
}

const CarPopularLocations = ({ onSelect }: CarPopularLocationsProps) => {
  return (
    <section className="py-12 sm:py-16 border-t border-border/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
              Popular <span className="bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">Pickup Locations</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Rent a car at top destinations across the US
            </p>
          </div>
          <button className="hidden sm:flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors text-sm font-medium">
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {locations.map((loc, index) => (
            <Card
              key={loc.city}
              className={cn(
                "glass-card overflow-hidden group cursor-pointer transition-all duration-300",
                "hover:border-violet-500/50 hover:-translate-y-1 touch-manipulation active:scale-[0.98]",
                "animate-in fade-in slide-in-from-bottom-4"
              )}
              onClick={() => onSelect?.(loc.city)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-0">
                <div className="relative h-24 sm:h-28 bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                  <span className="text-4xl sm:text-5xl transition-transform group-hover:scale-110">
                    {loc.image}
                  </span>
                  {loc.trending && (
                    <Badge className="absolute top-2 right-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Hot
                    </Badge>
                  )}
                  <Badge className="absolute bottom-2 left-2 bg-background/80 text-foreground text-xs">
                    {loc.airport}
                  </Badge>
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-display font-bold text-sm sm:text-base group-hover:text-violet-400 transition-colors">
                    {loc.city}
                  </h3>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs mb-2">
                    <MapPin className="w-3 h-3" />
                    {loc.state}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{loc.cars}+ cars</span>
                    <span className="text-sm font-bold text-violet-400">From ${loc.avgPrice}/day</span>
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

export default CarPopularLocations;
