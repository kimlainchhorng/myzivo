/**
 * Top Picks Section
 * Two horizontal carousels: Top Rated and Most Popular This Week
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Restaurant } from "@/lib/eatsApi";
import { EATS_TABLES } from "@/lib/eatsTables";
import { RecommendationCard } from "./RecommendationCard";
import { Star, TrendingUp } from "lucide-react";

interface TopPicksSectionProps {
  city?: string;
}

export function TopPicksSection({ city }: TopPicksSectionProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["eats-top-picks", city],
    queryFn: async () => {
      // Top Rated
      let topRatedQuery = supabase
        .from(EATS_TABLES.restaurants)
        .select("*")
        .eq("status", "active")
        .gte("rating", 4.0)
        .order("rating", { ascending: false })
        .limit(6);

      // Most Popular
      let popularQuery = supabase
        .from(EATS_TABLES.restaurants)
        .select("*")
        .eq("status", "active")
        .gt("total_orders", 0)
        .order("total_orders", { ascending: false })
        .limit(6);

      if (city) {
        topRatedQuery = topRatedQuery.ilike("address", `%${city}%`);
        popularQuery = popularQuery.ilike("address", `%${city}%`);
      }

      const [topRatedResult, popularResult] = await Promise.all([
        topRatedQuery,
        popularQuery,
      ]);

      return {
        topRated: (topRatedResult.data || []) as Restaurant[],
        popular: (popularResult.data || []) as Restaurant[],
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading || !data) return null;

  const showTopRated = data.topRated.length >= 2;
  const showPopular = data.popular.length >= 2;

  if (!showTopRated && !showPopular) return null;

  return (
    <div className="space-y-6 mb-8">
      {/* Top Rated */}
      {showTopRated && (
        <div>
          <div className="px-6 flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
            <h3 className="text-base font-bold text-white">Top Rated Restaurants</h3>
          </div>
          <div className="pl-6 overflow-x-auto hide-scrollbar">
            <div className="flex gap-3 w-max pr-6">
              {data.topRated.map((restaurant, i) => (
                <RecommendationCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  variant="topPick"
                  rank={i + 1}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Most Popular */}
      {showPopular && (
        <div>
          <div className="px-6 flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-orange-400" />
            <h3 className="text-base font-bold text-white">Most Popular This Week</h3>
          </div>
          <div className="pl-6 overflow-x-auto hide-scrollbar">
            <div className="flex gap-3 w-max pr-6">
              {data.popular.map((restaurant, i) => (
                <RecommendationCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  variant="topPick"
                  rank={i + 1}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
