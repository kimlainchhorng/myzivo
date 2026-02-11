import { useNavigate } from "react-router-dom";
import { MapPin, Star, Hotel, ArrowRight, TrendingUp, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const destinations = [
  {
    id: 1,
    city: "Paris",
    country: "France",
    iconColor: "text-amber-400",
    hotels: 4250,
    avgPrice: 189,
    rating: 4.7,
    highlight: "City of Lights",
    trending: true,
  },
  {
    id: 2,
    city: "Tokyo",
    country: "Japan",
    iconColor: "text-rose-400",
    hotels: 3890,
    avgPrice: 165,
    rating: 4.8,
    highlight: "Modern & Traditional",
    trending: true,
  },
  {
    id: 3,
    city: "New York",
    country: "USA",
    iconColor: "text-sky-400",
    hotels: 5120,
    avgPrice: 245,
    rating: 4.6,
    highlight: "The Big Apple",
    trending: false,
  },
  {
    id: 4,
    city: "Dubai",
    country: "UAE",
    iconColor: "text-violet-400",
    hotels: 2890,
    avgPrice: 210,
    rating: 4.8,
    highlight: "Luxury Paradise",
    trending: true,
  },
  {
    id: 5,
    city: "Bali",
    country: "Indonesia",
    iconColor: "text-emerald-400",
    hotels: 3450,
    avgPrice: 95,
    rating: 4.7,
    highlight: "Island Escape",
    trending: false,
  },
  {
    id: 6,
    city: "London",
    country: "UK",
    iconColor: "text-indigo-400",
    hotels: 4780,
    avgPrice: 195,
    rating: 4.6,
    highlight: "Royal Heritage",
    trending: false,
  },
];

const HotelDestinationGuides = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              <h2 className="font-display text-2xl md:text-3xl font-bold">
                Destination Guides
              </h2>
            </div>
            <p className="text-muted-foreground">Explore the world's most popular cities</p>
          </div>
          <Button variant="outline" className="hidden md:flex rounded-xl">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest, index) => (
            <button
              key={dest.id}
              onClick={() => navigate("/book-hotel")}
              className={cn(
                "group relative p-5 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm",
                "text-left transition-all duration-300 hover:border-amber-500/30 hover:shadow-xl",
                "touch-manipulation active:scale-[0.98]",
                "animate-in fade-in slide-in-from-bottom-4"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {dest.trending && (
                <div className="absolute -top-2 right-4 flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-[10px] font-bold text-green-400">Trending</span>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center">
                  <Building2 className={`w-8 h-8 ${dest.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg group-hover:text-amber-400 transition-colors">
                    {dest.city}
                  </h3>
                  <p className="text-sm text-muted-foreground">{dest.country}</p>
                  <p className="text-xs text-amber-400 mt-1">{dest.highlight}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/50">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <Hotel className="w-3 h-3" />
                  </div>
                  <p className="text-sm font-bold">{dest.hotels.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">Hotels</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <span className="text-xs">$</span>
                  </div>
                  <p className="text-sm font-bold">${dest.avgPrice}</p>
                  <p className="text-[10px] text-muted-foreground">Avg/night</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                    <Star className="w-3 h-3 fill-current" />
                  </div>
                  <p className="text-sm font-bold">{dest.rating}</p>
                  <p className="text-[10px] text-muted-foreground">Rating</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 text-center md:hidden">
          <Button variant="outline" className="rounded-xl">
            View All Destinations
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HotelDestinationGuides;
