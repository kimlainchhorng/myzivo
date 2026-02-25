import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Car, MapPin, ArrowRight, Clock, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const popularRoutes = [
  {
    from: "Los Angeles (LAX)",
    to: "Las Vegas",
    distance: "270 miles",
    duration: "4h drive",
    price: 45,
    searches: "8.5K",
    image: "🌴→🎰",
  },
  {
    from: "San Francisco (SFO)",
    to: "Napa Valley",
    distance: "60 miles",
    duration: "1h drive",
    price: 39,
    searches: "5.2K",
    image: "🌉→🍷",
  },
  {
    from: "Miami (MIA)",
    to: "Key West",
    distance: "160 miles",
    duration: "3.5h drive",
    price: 55,
    searches: "6.8K",
    image: "🏖️→🌺",
  },
  {
    from: "Denver (DEN)",
    to: "Aspen",
    distance: "200 miles",
    duration: "3.5h drive",
    price: 65,
    searches: "4.1K",
    image: "🏔️→⛷️",
  },
];

const CarPopularRoutes = () => {
  return (
    <section className="py-12 px-4 bg-gradient-to-b from-primary/5 to-transparent">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
            <TrendingUp className="w-3 h-3 mr-1" /> Road Trip Favorites
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Popular Rental Routes
          </h2>
          <p className="text-muted-foreground">Most booked road trips by travelers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {popularRoutes.map((route, index) => (
            <Link key={route.from + route.to} to="/rent-car">
              <div
                className={cn(
                  "group p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm",
                  "hover:border-primary/30 hover:-translate-y-1 transition-all duration-200 cursor-pointer",
                  "animate-in fade-in slide-in-from-bottom-4"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{route.image}</div>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {route.searches} bookings
                  </Badge>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                      {route.from}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 ml-6 mb-2">
                    <div className="w-px h-4 bg-border" />
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                      {route.to}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Car className="w-4 h-4" />
                      {route.distance}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {route.duration}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">From</p>
                    <p className="text-xl font-bold text-primary">${route.price}/day</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link to="/rent-car">
            <Button variant="outline" className="gap-2">
              Explore All Routes <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CarPopularRoutes;
