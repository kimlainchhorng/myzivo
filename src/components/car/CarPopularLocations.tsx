import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, ArrowRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCarRedirect } from "@/hooks/useAffiliateRedirect";
import { format, addDays } from "date-fns";

const locations = [
  { city: "Los Angeles", state: "CA", cars: 850, avgPrice: 45, airport: "LAX", trending: true },
  { city: "Miami", state: "FL", cars: 680, avgPrice: 42, airport: "MIA", trending: true },
  { city: "Las Vegas", state: "NV", cars: 590, avgPrice: 38, airport: "LAS", trending: true },
  { city: "New York", state: "NY", cars: 920, avgPrice: 55, airport: "JFK", trending: false },
  { city: "San Francisco", state: "CA", cars: 540, avgPrice: 52, airport: "SFO", trending: false },
  { city: "Orlando", state: "FL", cars: 710, avgPrice: 35, airport: "MCO", trending: true },
  { city: "Denver", state: "CO", cars: 420, avgPrice: 48, airport: "DEN", trending: false },
  { city: "Seattle", state: "WA", cars: 380, avgPrice: 50, airport: "SEA", trending: false },
];

interface CarPopularLocationsProps {
  onSelect?: (city: string) => void;
}

const CarPopularLocations = ({ onSelect }: CarPopularLocationsProps) => {
  const { redirectWithParams } = useCarRedirect('popular_locations', 'popular_route');

  // Default dates: tomorrow pickup, 1 week rental
  const pickupDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const returnDate = format(addDays(new Date(), 8), 'yyyy-MM-dd');

  const handleLocationClick = (loc: typeof locations[0]) => {
    // Redirect to partner with deep link including airport code
    redirectWithParams({
      pickupLocation: `${loc.city} ${loc.airport}`,
      pickupDate,
      returnDate,
    });
    
    onSelect?.(loc.city);
  };

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
          <button className="hidden sm:flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-all duration-200 text-sm font-medium hover:translate-x-0.5">
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
              onClick={() => handleLocationClick(loc)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-0">
                <div className="relative h-24 sm:h-28 bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/30 to-purple-500/20 flex items-center justify-center transition-transform group-hover:scale-110">
                    <MapPin className="w-7 h-7 text-violet-400" />
                  </div>
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
                  <h3 className="font-display font-bold text-sm sm:text-base group-hover:text-violet-400 transition-all duration-200">
                    {loc.city}
                  </h3>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs mb-2">
                    <MapPin className="w-3 h-3" />
                    {loc.state}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{loc.cars}+ cars</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-violet-400">From ${loc.avgPrice}*</span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Price Disclaimer */}
        <p className="text-[10px] text-muted-foreground text-center mt-4">
          *Prices are indicative and may change. Final price shown on partner site.
        </p>
      </div>
    </section>
  );
};

export default CarPopularLocations;
