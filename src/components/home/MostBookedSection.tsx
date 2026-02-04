/**
 * MostBookedSection - Popular routes with booking counts
 */

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowRight, Plane, Users, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookedRoute {
  id: string;
  from: { city: string; code: string };
  to: { city: string; code: string };
  bookings: number;
  trend: "up" | "stable" | "down";
  avgPrice: number;
}

const mostBookedRoutes: BookedRoute[] = [
  {
    id: "1",
    from: { city: "New York", code: "JFK" },
    to: { city: "Miami", code: "MIA" },
    bookings: 2340,
    trend: "up",
    avgPrice: 189,
  },
  {
    id: "2",
    from: { city: "Los Angeles", code: "LAX" },
    to: { city: "Cancun", code: "CUN" },
    bookings: 1890,
    trend: "up",
    avgPrice: 249,
  },
  {
    id: "3",
    from: { city: "San Francisco", code: "SFO" },
    to: { city: "Tokyo", code: "NRT" },
    bookings: 1650,
    trend: "stable",
    avgPrice: 749,
  },
  {
    id: "4",
    from: { city: "Chicago", code: "ORD" },
    to: { city: "Las Vegas", code: "LAS" },
    bookings: 1520,
    trend: "up",
    avgPrice: 159,
  },
  {
    id: "5",
    from: { city: "New York", code: "JFK" },
    to: { city: "London", code: "LHR" },
    bookings: 1380,
    trend: "stable",
    avgPrice: 549,
  },
];

const getDefaultDepartDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toISOString().split('T')[0];
};

export function MostBookedSection() {
  const departDate = getDefaultDepartDate();

  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h2 className="text-xl sm:text-2xl font-bold">
                Most Booked This Week
              </h2>
            </div>
            <p className="text-muted-foreground text-sm">
              See what other travelers are booking right now
            </p>
          </div>
          <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live data
          </Badge>
        </div>

        {/* Routes List */}
        <div className="space-y-3 mb-8">
          {mostBookedRoutes.map((route, index) => (
            <motion.div
              key={route.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/flights/results?origin=${route.from.code}&dest=${route.to.code}&depart=${departDate}&passengers=1&cabin=economy`}
                className="group block"
              >
                <Card className="hover:border-emerald-500/50 hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                        index === 0 && "bg-amber-500/20 text-amber-500",
                        index === 1 && "bg-slate-400/20 text-slate-400",
                        index === 2 && "bg-orange-600/20 text-orange-600",
                        index > 2 && "bg-muted text-muted-foreground"
                      )}>
                        {index + 1}
                      </div>

                      {/* Route Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 font-semibold">
                          <Plane className="w-4 h-4 text-sky-500" />
                          <span>{route.from.code}</span>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          <span>{route.to.code}</span>
                          {route.trend === "up" && (
                            <Badge className="bg-emerald-500/20 text-emerald-500 text-[10px] gap-0.5">
                              <Flame className="w-2.5 h-2.5" />
                              Hot
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {route.from.city} → {route.to.city}
                        </p>
                      </div>

                      {/* Booking Count */}
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Users className="w-3.5 h-3.5" />
                          <span className="font-semibold text-foreground">
                            {route.bookings.toLocaleString()}
                          </span>
                          <span className="hidden sm:inline">bookings</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          from ${route.avgPrice}
                        </p>
                      </div>

                      {/* CTA */}
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/flights">
            <Button variant="outline" className="rounded-xl gap-2">
              Explore All Routes
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default MostBookedSection;
