/**
 * Favorite Heart Button for Restaurants
 * Toggles favorite status with animation
 */
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useEatsFavorites } from "@/hooks/useEatsFavorites";
import { Restaurant } from "@/lib/eatsApi";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  restaurant: Restaurant;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function FavoriteButton({
  restaurant,
  className,
  size = "md",
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const { isFavorited, toggleFavorite, isToggling } = useEatsFavorites();

  const isFav = isFavorited(restaurant.id);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      // Could redirect to login or show toast
      return;
    }

    toggleFavorite(restaurant);
  };

  if (!user) return null;

  return (
    <motion.button
      onClick={handleClick}
      disabled={isToggling}
      whileTap={{ scale: 0.9 }}
      className={cn(
        "rounded-full flex items-center justify-center backdrop-blur-md border transition-all",
        isFav
          ? "bg-red-500/20 border-red-500/30 text-red-500"
          : "bg-white/10 border-white/10 text-white/70 hover:text-white hover:bg-white/20",
        sizeClasses[size],
        className
      )}
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
    >
      <motion.div
        initial={false}
        animate={isFav ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={cn(iconSizes[size], isFav && "fill-red-500")}
        />
      </motion.div>
    </motion.button>
  );
}
