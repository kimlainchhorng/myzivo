/**
 * Personalized Homepage Content
 * Different content for logged-in users vs guests
 */

import { Link } from "react-router-dom";
import {
  Plane,
  TrendingUp,
  Bell,
  Sparkles,
  ChevronRight,
  Clock,
  MapPin,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useUserBehavior } from "@/hooks/useUserBehavior";
import { GUEST_HOMEPAGE_CONTENT, LOGGED_IN_SECTIONS } from "@/config/aiPersonalization";
import { cn } from "@/lib/utils";

interface PersonalizedHomepageProps {
  className?: string;
}

// Guest Content: Trending & Popular
function GuestContent() {
  const { trendingDestinations, popularRoutes, bestValueDeals } = GUEST_HOMEPAGE_CONTENT;

  return (
    <div className="space-y-8">
      {/* Trending Destinations */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Trending Destinations</h3>
          </div>
          <Link to="/flights" className="text-sm text-primary hover:underline flex items-center gap-1">
            See all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {trendingDestinations.map((dest) => (
            <Link
              key={dest.code}
              to={`/flights?destination=${dest.code}`}
              className="group"
            >
              <Card className="hover:border-primary/50 transition-all duration-200">
                <CardContent className="p-3 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-200">
                    <Plane className="w-5 h-5 text-primary" />
                  </div>
                  <p className="font-medium text-sm">{dest.name}</p>
                  <p className="text-xs text-muted-foreground">{dest.country}</p>
                  <p className="text-sm font-semibold text-primary mt-1">
                    from ${dest.avgPrice}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Routes */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Popular Routes</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {popularRoutes.map((route) => (
            <Link
              key={`${route.origin}-${route.destination}`}
              to={`/flights?origin=${route.origin}&destination=${route.destination}`}
            >
              <Button variant="outline" className="gap-2">
                <span className="font-medium">{route.origin}</span>
                <Plane className="w-4 h-4" />
                <span className="font-medium">{route.destination}</span>
              </Button>
            </Link>
          ))}
        </div>
      </section>

      {/* Best Value Deals */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-emerald-500" />
          <h3 className="font-semibold text-lg">Best Value Deals Today</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {bestValueDeals.map((deal) => (
            <Card key={deal.destination} className="border-emerald-500/20 bg-emerald-500/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">{deal.destination}</p>
                  <Badge className="bg-emerald-500/20 text-emerald-600">
                    {deal.savingsPercent}% off
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-emerald-600">
                  ${deal.avgPrice}
                </p>
                <p className="text-xs text-muted-foreground">avg. round-trip</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

// Logged-in User Content: Personalized
function LoggedInContent() {
  const { profile, getRecommendations, hasHistory } = useUserBehavior();
  const recommendations = getRecommendations();

  if (!hasHistory) {
    return <GuestContent />;
  }

  return (
    <div className="space-y-8">
      {/* Recent Searches */}
      {recommendations.topRoutes.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Continue Searching</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendations.topRoutes.map((route) => {
              const [origin, dest] = route.split("-");
              return (
                <Link
                  key={route}
                  to={`/flights?origin=${origin}&destination=${dest}`}
                >
                  <Button variant="outline" className="gap-2 border-primary/30 hover:bg-primary/5">
                    <span className="font-medium">{origin}</span>
                    <Plane className="w-4 h-4 text-primary" />
                    <span className="font-medium">{dest}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Price Alerts Summary */}
      <section>
        <Card className="border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-semibold">Your Price Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    We notify you only when it matters
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/profile/price-alerts">
                  Manage <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Recommended Destinations */}
      {recommendations.recentDestinations.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-violet-500" />
            <h3 className="font-semibold text-lg">Recommended for You</h3>
            <Badge className="bg-violet-500/20 text-violet-500 text-xs">AI</Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {recommendations.recentDestinations.slice(0, 5).map((dest) => (
              <Link
                key={dest}
                to={`/flights?destination=${dest}`}
                className="group"
              >
                <Card className="hover:border-violet-500/50 transition-colors">
                  <CardContent className="p-3 text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-violet-500/10 flex items-center justify-center">
                      <Plane className="w-5 h-5 text-violet-500" />
                    </div>
                    <p className="font-medium text-sm">{dest}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on your searches
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Budget-based deals */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-emerald-500" />
          <h3 className="font-semibold text-lg">
            {recommendations.budgetTier === "budget"
              ? "Budget-Friendly Deals"
              : recommendations.budgetTier === "luxury"
              ? "Premium Experiences"
              : "Great Value Deals"}
          </h3>
        </div>
        <GuestContent />
      </section>
    </div>
  );
}

export function PersonalizedHomepage({ className }: PersonalizedHomepageProps) {
  const { user } = useAuth();

  return (
    <div className={cn("py-8", className)}>
      {user ? <LoggedInContent /> : <GuestContent />}
    </div>
  );
}

export default PersonalizedHomepage;
