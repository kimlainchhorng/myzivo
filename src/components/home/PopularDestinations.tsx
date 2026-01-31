import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Hotel, CarFront, ArrowRight, TrendingUp, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

// Popular flight routes
const popularRoutes = [
  { from: "New York", to: "London", fromCode: "JFK", toCode: "LHR", image: "🗽→🇬🇧" },
  { from: "Los Angeles", to: "Tokyo", fromCode: "LAX", toCode: "NRT", image: "🌴→🗼" },
  { from: "Chicago", to: "Paris", fromCode: "ORD", toCode: "CDG", image: "🏙️→🗼" },
  { from: "Miami", to: "Cancun", fromCode: "MIA", toCode: "CUN", image: "🏖️→🌺" },
];

// Popular hotel cities
const popularCities = [
  { city: "New York", country: "USA", image: "🗽" },
  { city: "Paris", country: "France", image: "🗼" },
  { city: "London", country: "UK", image: "🇬🇧" },
  { city: "Tokyo", country: "Japan", image: "🗾" },
];

// Popular car rental locations
const popularLocations = [
  { city: "Los Angeles", state: "CA", airport: "LAX", image: "🌴" },
  { city: "Miami", state: "FL", airport: "MIA", image: "🏖️" },
  { city: "Las Vegas", state: "NV", airport: "LAS", image: "🎰" },
  { city: "Orlando", state: "FL", airport: "MCO", image: "🎢" },
];

export default function PopularDestinations() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Trending Now</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
            Popular{" "}
            <span className="bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent">
              Destinations
            </span>
          </h2>
        </div>

        {/* Three Columns */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Popular Flight Routes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-lg">Popular Routes</h3>
            </div>
            <div className="space-y-3">
              {popularRoutes.map((route) => (
                <Link
                  key={`${route.fromCode}-${route.toCode}`}
                  to={`/flights/${route.fromCode.toLowerCase()}-to-${route.toCode.toLowerCase()}`}
                  className="group block"
                >
                  <Card className="border-border/50 hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300 group-hover:-translate-y-0.5">
                    <CardContent className="p-4 flex items-center gap-3">
                      <span className="text-2xl">{route.image}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {route.from} → {route.to}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {route.fromCode} - {route.toCode}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <Link
              to="/book-flight"
              className="inline-flex items-center gap-1 text-sm text-sky-500 hover:text-sky-400 font-medium"
            >
              View all routes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Popular Hotel Cities */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Hotel className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-lg">Top Cities</h3>
            </div>
            <div className="space-y-3">
              {popularCities.map((city) => (
                <Link
                  key={city.city}
                  to={`/hotels/${city.city.toLowerCase().replace(/\s+/g, '-')}`}
                  className="group block"
                >
                  <Card className="border-border/50 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 group-hover:-translate-y-0.5">
                    <CardContent className="p-4 flex items-center gap-3">
                      <span className="text-2xl">{city.image}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{city.city}</p>
                        <p className="text-xs text-muted-foreground">{city.country}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <Link
              to="/book-hotel"
              className="inline-flex items-center gap-1 text-sm text-amber-500 hover:text-amber-400 font-medium"
            >
              View all cities <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Popular Car Rental Locations */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <CarFront className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-lg">Pickup Locations</h3>
            </div>
            <div className="space-y-3">
              {popularLocations.map((loc) => (
                <Link
                  key={loc.airport}
                  to={`/rent-car?location=${loc.airport}`}
                  className="group block"
                >
                  <Card className="border-border/50 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 group-hover:-translate-y-0.5">
                    <CardContent className="p-4 flex items-center gap-3">
                      <span className="text-2xl">{loc.image}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{loc.city}</p>
                        <p className="text-xs text-muted-foreground">
                          {loc.state} • {loc.airport}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <Link
              to="/rent-car"
              className="inline-flex items-center gap-1 text-sm text-violet-500 hover:text-violet-400 font-medium"
            >
              View all locations <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
