/**
 * Recommendation Card Component
 * Compact card for displaying restaurant recommendations
 */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Star, Clock, RotateCcw } from "lucide-react";
import { Restaurant } from "@/lib/eatsApi";
import { useReorder } from "@/hooks/useReorder";
import { cn } from "@/lib/utils";

interface RecommendationCardProps {
  restaurant: Restaurant;
  variant?: "reorder" | "favorite" | "timing";
  orderCount?: number;
  topItems?: string[];
  timingLabel?: string;
  className?: string;
}

export function RecommendationCard({
  restaurant,
  variant = "reorder",
  orderCount,
  topItems,
  timingLabel,
  className,
}: RecommendationCardProps) {
  const navigate = useNavigate();
  const { reorder, isReordering } = useReorder();

  const handleClick = () => {
    navigate(`/eats/restaurant/${restaurant.id}`);
  };

  const handleReorder = (e: React.MouseEvent) => {
    e.stopPropagation();
    // For reorder, we'd need past order data - navigate to restaurant instead
    navigate(`/eats/restaurant/${restaurant.id}`);
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={cn(
        "flex-shrink-0 w-[260px] bg-zinc-900/80 border border-white/10 rounded-2xl overflow-hidden cursor-pointer touch-manipulation",
        className
      )}
    >
      {/* Cover Image */}
      <div className="relative h-24 overflow-hidden">
        {restaurant.cover_image_url ? (
          <img
            src={restaurant.cover_image_url}
            alt={restaurant.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-500/20 to-zinc-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Timing Badge */}
        {variant === "timing" && timingLabel && (
          <div className="absolute top-2 left-2 bg-orange-500/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
            <span className="text-[10px] font-bold text-white">{timingLabel}</span>
          </div>
        )}

        {/* Prep Time */}
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3 text-orange-400" />
          <span className="text-[10px] font-medium text-white">
            {restaurant.avg_prep_time || 25}-{(restaurant.avg_prep_time || 25) + 10} min
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm truncate text-white">{restaurant.name}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              {restaurant.rating && (
                <span className="flex items-center gap-0.5 text-orange-400">
                  <Star className="w-3 h-3 fill-orange-400" />
                  <span className="text-xs font-medium">{restaurant.rating}</span>
                </span>
              )}
              {restaurant.cuisine_type && (
                <>
                  <span className="w-1 h-1 bg-zinc-500 rounded-full" />
                  <span className="text-xs text-zinc-400 truncate">
                    {restaurant.cuisine_type}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Quick Action */}
          {variant === "reorder" && (
            <button
              onClick={handleReorder}
              disabled={isReordering}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Order Stats (for reorder variant) */}
        {variant === "reorder" && orderCount && (
          <div className="mt-2 text-xs text-zinc-500">
            Ordered {orderCount} time{orderCount > 1 ? "s" : ""}
            {topItems && topItems.length > 0 && (
              <span className="text-zinc-600"> · {topItems.slice(0, 2).join(", ")}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
