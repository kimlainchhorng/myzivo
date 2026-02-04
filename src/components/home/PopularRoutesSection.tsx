/**
 * Popular Routes Section
 * Clickable route cards that auto-fill flight search
 */

import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAirlineLogo } from "@/data/airlines";

const popularRoutes = [
  {
    from: { city: "New York", code: "JFK" },
    to: { city: "Los Angeles", code: "LAX" },
    trend: "hot",
    airline: "AA",
  },
  {
    from: { city: "New York", code: "JFK" },
    to: { city: "London", code: "LHR" },
    trend: "trending",
    airline: "BA",
  },
  {
    from: { city: "San Francisco", code: "SFO" },
    to: { city: "Tokyo", code: "NRT" },
    trend: null,
    airline: "UA",
  },
  {
    from: { city: "Los Angeles", code: "LAX" },
    to: { city: "Paris", code: "CDG" },
    trend: null,
    airline: "AF",
  },
  {
    from: { city: "Chicago", code: "ORD" },
    to: { city: "Miami", code: "MIA" },
    trend: "hot",
    airline: "AA",
  },
  {
    from: { city: "New York", code: "JFK" },
    to: { city: "Dubai", code: "DXB" },
    trend: "trending",
    airline: "EK",
  },
  {
    from: { city: "Los Angeles", code: "LAX" },
    to: { city: "Cancun", code: "CUN" },
    trend: null,
    airline: "AA",
  },
  {
    from: { city: "Boston", code: "BOS" },
    to: { city: "San Juan", code: "SJU" },
    trend: null,
    airline: "B6",
  },
];

// Generate a date 2 weeks from now
const getDefaultDepartDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toISOString().split('T')[0];
};

export default function PopularRoutesSection() {
  const departDate = getDefaultDepartDate();

  return (
    <section className="py-12 sm:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-1">
              Popular Right Now
            </h2>
            <p className="text-muted-foreground text-sm">
              Compare prices on trending routes
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            Trending
          </div>
        </div>

        {/* Routes Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {popularRoutes.map((route, index) => (
            <Link
              key={`${route.from.code}-${route.to.code}`}
              to={`/flights/results?origin=${route.from.code}&dest=${route.to.code}&depart=${departDate}&passengers=1&cabin=economy`}
              className="group"
            >
              <Card className={cn(
                "h-full border transition-all duration-300",
                "hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10 hover:-translate-y-1",
                route.trend === "hot" && "border-orange-500/30 bg-orange-500/5",
                route.trend === "trending" && "border-sky-500/30 bg-sky-500/5"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Airline Logo */}
                    <div className="w-10 h-10 rounded-xl bg-white border border-border/50 flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={getAirlineLogo(route.airline, 32)}
                        alt="Airline logo"
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    
                    {/* Route Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 font-bold text-sm">
                        <span>{route.from.code}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{route.to.code}</span>
                        
                        {/* Trend Badge */}
                        {route.trend === "hot" && (
                          <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-500 text-white">
                            HOT
                          </span>
                        )}
                        {route.trend === "trending" && (
                          <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-500 text-white">
                            TREND
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground truncate">
                        {route.from.city} → {route.to.city}
                      </p>
                      
                      {/* Micro CTA */}
                      <p className="text-xs text-sky-500 font-medium mt-1 group-hover:underline flex items-center gap-1">
                        Compare prices
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/flights">
            <Button variant="outline" className="rounded-xl gap-2">
              Compare prices
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}