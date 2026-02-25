import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, ArrowRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHotelRedirect } from "@/hooks/useAffiliateRedirect";
import { format, addDays } from "date-fns";

const destinations = [
  { city: "New York", country: "USA", image: "🗽", hotels: 2450, avgPrice: 189, trending: true },
  { city: "Paris", country: "France", image: "🗼", hotels: 1890, avgPrice: 165, trending: true },
  { city: "Tokyo", country: "Japan", image: "🏯", hotels: 2100, avgPrice: 142, trending: false },
  { city: "London", country: "UK", image: "🎡", hotels: 1980, avgPrice: 175, trending: true },
  { city: "Dubai", country: "UAE", image: "🌴", hotels: 1250, avgPrice: 225, trending: true },
  { city: "Bali", country: "Indonesia", image: "🏝️", hotels: 820, avgPrice: 95, trending: false },
  { city: "Barcelona", country: "Spain", image: "⛪", hotels: 1120, avgPrice: 135, trending: false },
  { city: "Sydney", country: "Australia", image: "🦘", hotels: 890, avgPrice: 168, trending: false },
];

interface HotelPopularDestinationsProps {
  onSelect?: (city: string) => void;
}

const HotelPopularDestinations = ({ onSelect }: HotelPopularDestinationsProps) => {
  const { redirectWithParams } = useHotelRedirect('popular_destinations', 'popular_route');

  // Default dates: 2 weeks out, 3 night stay
  const checkIn = format(addDays(new Date(), 14), 'yyyy-MM-dd');
  const checkOut = format(addDays(new Date(), 17), 'yyyy-MM-dd');

  const handleDestinationClick = (dest: typeof destinations[0]) => {
    // Redirect to partner with deep link
    redirectWithParams({
      destination: dest.city,
      checkIn,
      checkOut,
      guests: 2,
      rooms: 1,
    });
    
    onSelect?.(dest.city);
  };

  return (
    <section className="py-12 sm:py-16 border-t border-border/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
              Popular <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Destinations</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Explore top-rated hotels in these trending cities
            </p>
          </div>
          <button className="hidden sm:flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors text-sm font-medium">
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {destinations.map((dest, index) => (
            <Card
              key={dest.city}
              className={cn(
                "glass-card overflow-hidden group cursor-pointer transition-all duration-300",
                "hover:border-amber-500/50 hover:-translate-y-1 touch-manipulation active:scale-[0.98] rounded-2xl",
                "animate-in fade-in slide-in-from-bottom-4"
              )}
              onClick={() => handleDestinationClick(dest)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-0">
                <div className="relative h-24 sm:h-32 bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                  <span className="text-4xl sm:text-5xl transition-transform group-hover:scale-110">
                    {dest.image}
                  </span>
                  {dest.trending && (
                    <Badge className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Hot
                    </Badge>
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-display font-bold text-sm sm:text-base group-hover:text-amber-400 transition-all duration-200">
                    {dest.city}
                  </h3>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs mb-2">
                    <MapPin className="w-3 h-3" />
                    {dest.country}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{dest.hotels.toLocaleString()} hotels</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-amber-400">From ${dest.avgPrice}*</span>
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

export default HotelPopularDestinations;
