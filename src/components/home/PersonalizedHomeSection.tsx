/**
 * Personalized Home Section
 * For logged-in users with search history
 */

import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Plane,
  Bell,
  TrendingDown,
  Clock,
  Sparkles,
  MapPin,
} from "lucide-react";
import { usePersonalization } from "@/hooks/usePersonalization";
import { cn } from "@/lib/utils";

const PersonalizedHomeSection = () => {
  const { getPersonalizedContent, context } = usePersonalization();
  const content = getPersonalizedContent;

  if (!context.isLoggedIn || !content) {
    return null;
  }

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge className="mb-2 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-3 h-3 mr-1" />
              For You
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold">Your Travel Dashboard</h2>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/profile" className="gap-2">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Recent Searches */}
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Recent Searches</h3>
              </div>
              {content.recentRoutes.length > 0 ? (
                <div className="space-y-3">
                  {content.recentRoutes.slice(0, 3).map((route) => {
                    const [origin, destination] = route.split('-');
                    return (
                      <Link
                        key={route}
                        to={`/flights?from=${origin}&to=${destination}`}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all duration-200 group active:scale-[0.98] touch-manipulation"
                      >
                        <Plane className="w-4 h-4 text-sky-500" />
                        <span className="flex-1 font-medium">
                          {origin} → {destination}
                        </span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No recent searches yet. Start exploring!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Price Alerts Summary */}
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Price Alerts</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <span className="text-sm text-muted-foreground">Active Alerts</span>
                  <span className="text-xl font-bold">{context.priceAlertsSummary.active}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm">Price Drops</span>
                  </div>
                  <span className="text-xl font-bold text-emerald-500">
                    {context.priceAlertsSummary.recentDrops}
                  </span>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/saved-searches">Manage Alerts</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Destinations */}
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Recommended</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {content.recommendedDestinations.slice(0, 6).map((destination) => (
                  <Link
                    key={destination}
                    to={`/flights?to=${destination}`}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium",
                      "bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200"
                    )}
                  >
                    {destination}
                  </Link>
                ))}
              </div>
              <Button variant="link" className="mt-4 px-0" asChild>
                <Link to="/deals" className="gap-1">
                  Explore deals <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Budget Preference Indicator */}
        {content.budgetTier && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Your travel style:{' '}
              <span className="font-medium text-foreground capitalize">
                {content.budgetTier === 'budget' ? '💰 Budget-Friendly' :
                  content.budgetTier === 'luxury' ? '✨ Luxury' : '🎯 Mid-Range'}
              </span>
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default PersonalizedHomeSection;
