/**
 * Guest Home Section
 * For non-logged-in users
 */

import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  TrendingUp,
  Plane,
  Sparkles,
  Tag,
} from "lucide-react";
import { usePersonalization } from "@/hooks/usePersonalization";
import { cn } from "@/lib/utils";

const GuestHomeSection = () => {
  const { getGuestContent, isLoggedIn } = usePersonalization();

  // Don't show for logged-in users
  if (isLoggedIn) {
    return null;
  }

  const { trendingDestinations, popularRoutes, bestValueDestinations } = getGuestContent;

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-10">
          <Badge className="mb-3 bg-amber-500/10 text-amber-600 border-amber-500/20">
            <TrendingUp className="w-3 h-3 mr-1" />
            Trending Now
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Popular Travel Destinations
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover where travelers are heading this season
          </p>
        </div>

        {/* Trending Destinations Chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {trendingDestinations.slice(0, 8).map((destination) => (
            <Link
              key={destination}
              to={`/flights?to=${destination}`}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium",
                "bg-card border border-border hover:border-primary/50 hover:bg-primary/5",
                "transition-all duration-200"
              )}
            >
              {destination}
            </Link>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Popular Routes */}
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Plane className="w-5 h-5 text-sky-500" />
                <h3 className="font-semibold">Popular Routes This Week</h3>
              </div>
              <div className="space-y-3">
                {popularRoutes.slice(0, 4).map((route, index) => (
                  <Link
                    key={route.label}
                    to={`/flights?from=${route.origin}&to=${route.destination}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                  >
                    <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-500 text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="flex-1">{route.label}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Best Value Destinations */}
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-emerald-500" />
                <h3 className="font-semibold">Best Value Destinations</h3>
              </div>
              <div className="space-y-3">
                {bestValueDestinations.map((dest) => (
                  <Link
                    key={dest.name}
                    to={`/flights?to=${dest.name}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                  >
                    <span>{dest.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">from</span>
                      <span className="font-bold">${dest.avgPrice}</span>
                      <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px]">
                        Save {dest.savings}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sign Up CTA */}
        <div className="mt-10 text-center">
          <Card className="inline-block bg-gradient-to-r from-primary/10 to-sky-500/10 border-primary/20">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
              <Sparkles className="w-8 h-8 text-primary" />
              <div className="text-left">
                <h4 className="font-semibold">Get personalized deals</h4>
                <p className="text-sm text-muted-foreground">
                  Sign up to receive recommendations based on your travel style
                </p>
              </div>
              <Button asChild>
                <Link to="/signup" className="gap-2">
                  Sign Up Free <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default GuestHomeSection;
