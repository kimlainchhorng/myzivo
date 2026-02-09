/**
 * Recommended For You Section
 * Displays personalized restaurant recommendations on the Eats home screen
 */
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { RotateCcw, Heart, Clock, ChevronRight } from "lucide-react";
import { useEatsRecommendations } from "@/hooks/useEatsRecommendations";
import { RecommendationCard } from "./RecommendationCard";
import { TimingSuggestionBadge } from "./TimingSuggestionBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

export function RecommendedForYouSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    reorderSuggestions,
    favoriteSuggestions,
    timingSuggestions,
    currentMealPeriod,
    mealPeriodLabel,
    isLoading,
    hasRecommendations,
  } = useEatsRecommendations();

  // Don't render if no recommendations or not logged in
  if (!user) return null;

  // Loading state
  if (isLoading) {
    return (
      <div className="px-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-40 bg-zinc-800" />
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="flex-shrink-0 w-[260px] h-[160px] rounded-2xl bg-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  // Don't render if no recommendations
  if (!hasRecommendations) return null;

  return (
    <div className="mb-6">
      {/* Order Again Section */}
      {reorderSuggestions.length > 0 && (
        <div className="mb-6">
          <div className="px-6 flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                <RotateCcw className="w-4 h-4 text-orange-500" />
              </div>
              <h3 className="font-bold text-white">Order Again</h3>
            </div>
            <button
              onClick={() => navigate("/eats/orders")}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
            >
              See all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="pl-6 overflow-x-auto hide-scrollbar">
            <div className="flex gap-3 w-max pr-6">
              {reorderSuggestions.slice(0, 4).map((suggestion, idx) => (
                <motion.div
                  key={suggestion.restaurant.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <RecommendationCard
                    restaurant={suggestion.restaurant}
                    variant="reorder"
                    orderCount={suggestion.orderCount}
                    topItems={suggestion.topItems}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Favorites Section */}
      {favoriteSuggestions.length > 0 && (
        <div className="mb-6">
          <div className="px-6 flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                <Heart className="w-4 h-4 text-red-500" />
              </div>
              <h3 className="font-bold text-white">Your Favorites</h3>
            </div>
            <button
              onClick={() => navigate("/eats/favorites")}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
            >
              See all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="pl-6 overflow-x-auto hide-scrollbar">
            <div className="flex gap-3 w-max pr-6">
              {favoriteSuggestions.slice(0, 4).map((restaurant, idx) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <RecommendationCard restaurant={restaurant} variant="favorite" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timing Suggestions Section */}
      {timingSuggestions.length > 0 && (
        <div className="mb-2">
          <div className="px-6 flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                <Clock className="w-4 h-4 text-zinc-400" />
              </div>
              <h3 className="font-bold text-white">{mealPeriodLabel}</h3>
              <TimingSuggestionBadge period={currentMealPeriod} variant="compact" />
            </div>
          </div>
          <div className="pl-6 overflow-x-auto hide-scrollbar">
            <div className="flex gap-3 w-max pr-6">
              {timingSuggestions.slice(0, 4).map((suggestion, idx) => (
                <motion.div
                  key={suggestion.restaurant.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <RecommendationCard
                    restaurant={suggestion.restaurant}
                    variant="timing"
                    timingLabel={suggestion.label}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
