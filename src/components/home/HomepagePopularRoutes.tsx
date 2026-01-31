import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, ArrowRight, TrendingUp, MapPin, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const popularRoutes = [
  { from: "New York", fromCode: "JFK", to: "London", toCode: "LHR", price: 349, trending: true },
  { from: "Los Angeles", fromCode: "LAX", to: "New York", toCode: "JFK", price: 129, trending: true },
  { from: "Chicago", fromCode: "ORD", to: "Miami", toCode: "MIA", price: 99, trending: false },
  { from: "San Francisco", fromCode: "SFO", to: "Tokyo", toCode: "NRT", price: 599, trending: true },
  { from: "Dallas", fromCode: "DFW", to: "Las Vegas", toCode: "LAS", price: 79, trending: false },
  { from: "Boston", fromCode: "BOS", to: "Paris", toCode: "CDG", price: 399, trending: false },
];

const popularDestinations = [
  { city: "New York", country: "USA", image: "🗽", flights: 2450 },
  { city: "London", country: "UK", image: "🎡", flights: 1890 },
  { city: "Tokyo", country: "Japan", image: "🏯", flights: 1250 },
  { city: "Paris", country: "France", image: "🗼", flights: 1680 },
  { city: "Dubai", country: "UAE", image: "🌴", flights: 980 },
  { city: "Miami", country: "USA", image: "🏖️", flights: 1120 },
];

export default function HomepagePopularRoutes() {
  const navigate = useNavigate();

  const handleRouteClick = (from: string, to: string) => {
    const fromSlug = from.toLowerCase().replace(/\s+/g, "-");
    const toSlug = to.toLowerCase().replace(/\s+/g, "-");
    navigate(`/flights/${fromSlug}-to-${toSlug}`);
  };

  const handleDestinationClick = (city: string) => {
    const slug = city.toLowerCase().replace(/\s+/g, "-");
    navigate(`/flights/to-${slug}`);
  };

  return (
    <section className="py-12 sm:py-16 border-t border-border/50 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-500/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-sky-500/10">
                <Plane className="w-5 h-5 text-sky-400" />
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold">
                Popular Flight Routes
              </h2>
            </div>
            <p className="text-muted-foreground">
              Find the best deals on trending routes
            </p>
          </div>
          <Link
            to="/flights"
            className="hidden sm:flex items-center gap-2 text-sky-400 hover:text-sky-300 font-semibold transition-colors"
          >
            View all routes
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Popular Routes Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {popularRoutes.map((route, index) => (
            <button
              key={`${route.fromCode}-${route.toCode}`}
              onClick={() => handleRouteClick(route.from, route.to)}
              className={cn(
                "group p-5 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm",
                "hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10",
                "transition-all duration-300 hover:-translate-y-1 text-left",
                "animate-in fade-in slide-in-from-bottom-4"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/10 border border-sky-500/30 flex items-center justify-center">
                    <Plane className="w-5 h-5 text-sky-400 rotate-45" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold">
                      <span>{route.fromCode}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span>{route.toCode}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {route.from} → {route.to}
                    </p>
                  </div>
                </div>
                {route.trending && (
                  <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Hot
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground">From</span>
                  <p className="text-lg font-bold text-sky-400">${route.price}*</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-sky-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Popular Destinations */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-display text-xl font-bold">Trending Destinations</h3>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
            {popularDestinations.map((dest, index) => (
              <button
                key={dest.city}
                onClick={() => handleDestinationClick(dest.city)}
                className={cn(
                  "group p-4 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm",
                  "hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10",
                  "transition-all duration-300 hover:-translate-y-1 text-center",
                  "animate-in fade-in zoom-in-95"
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                  {dest.image}
                </div>
                <h4 className="font-bold text-sm truncate group-hover:text-amber-400 transition-colors">
                  {dest.city}
                </h4>
                <p className="text-xs text-muted-foreground">{dest.country}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Flexible Dates CTA */}
        <div className="text-center">
          <Link
            to="/flights"
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-sky-500/10 to-blue-500/10 border border-sky-500/30 hover:border-sky-500/50 transition-all group"
          >
            <MapPin className="w-5 h-5 text-sky-400" />
            <span className="font-medium">
              Flexible dates? <span className="text-sky-400">Compare prices across dates</span>
            </span>
            <ArrowRight className="w-4 h-4 text-sky-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Price Disclaimer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          *Prices are indicative and may change. Final price shown on partner site.
        </p>
      </div>
    </section>
  );
}
