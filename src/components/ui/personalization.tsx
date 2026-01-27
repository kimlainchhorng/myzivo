import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Clock, Star, TrendingUp, Bookmark, ChevronRight, Sparkles } from "lucide-react";
import { PremiumCard } from "./premium-card";

// Recently Viewed Item
interface RecentItem {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  emoji?: string;
  timestamp?: Date;
  type: "restaurant" | "hotel" | "flight" | "car" | "ride";
}

interface RecentlyViewedProps {
  items: RecentItem[];
  onItemClick?: (item: RecentItem) => void;
  maxItems?: number;
}

export const RecentlyViewed: React.FC<RecentlyViewedProps> = ({
  items,
  onItemClick,
  maxItems = 6,
}) => {
  if (items.length === 0) return null;

  const typeColors = {
    restaurant: "text-eats bg-eats/10",
    hotel: "text-amber-400 bg-amber-500/10",
    flight: "text-sky-400 bg-sky-500/10",
    car: "text-primary bg-primary/10",
    ride: "text-rides bg-rides/10",
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold">Recently Viewed</h4>
        </div>
        {items.length > maxItems && (
          <button className="text-xs text-primary hover:underline">
            See all
          </button>
        )}
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {items.slice(0, maxItems).map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onItemClick?.(item)}
            className="flex-shrink-0 w-32 glass-card p-3 rounded-xl border border-white/10 hover:border-white/20 transition-all text-left group"
          >
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-2",
              typeColors[item.type]
            )}>
              {item.emoji || "📍"}
            </div>
            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
              {item.title}
            </p>
            {item.subtitle && (
              <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// Favorites List
interface FavoriteItem {
  id: string;
  title: string;
  subtitle?: string;
  rating?: number;
  image?: string;
  emoji?: string;
  type: "restaurant" | "hotel" | "flight" | "car" | "location";
}

interface FavoritesListProps {
  items: FavoriteItem[];
  onItemClick?: (item: FavoriteItem) => void;
  onRemove?: (id: string) => void;
  emptyMessage?: string;
}

export const FavoritesList: React.FC<FavoritesListProps> = ({
  items,
  onItemClick,
  onRemove,
  emptyMessage = "No favorites yet",
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center gap-3 p-3 glass-card rounded-xl border border-white/10 hover:border-white/20 transition-all group"
        >
          <button
            onClick={() => onItemClick?.(item)}
            className="flex items-center gap-3 flex-1 min-w-0 text-left"
          >
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl shrink-0">
              {item.emoji || "❤️"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate group-hover:text-primary transition-colors">
                {item.title}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {item.subtitle && <span className="truncate">{item.subtitle}</span>}
                {item.rating && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {item.rating}
                  </span>
                )}
              </div>
            </div>
          </button>
          {onRemove && (
            <button
              onClick={() => onRemove(item.id)}
              className="p-2 rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
            >
              <Heart className="w-4 h-4 fill-red-500 text-red-500" />
            </button>
          )}
        </motion.div>
      ))}
    </div>
  );
};

// Recommendation Card
interface RecommendationProps {
  title: string;
  subtitle?: string;
  image?: string;
  emoji?: string;
  reason?: string;
  rating?: number;
  price?: string;
  onClick?: () => void;
  color?: "rides" | "eats" | "sky" | "amber" | "primary";
  badge?: string;
}

export const RecommendationCard: React.FC<RecommendationProps> = ({
  title,
  subtitle,
  emoji,
  reason,
  rating,
  price,
  onClick,
  color = "primary",
  badge,
}) => {
  const colorClasses = {
    rides: "from-rides/20 to-rides/5 border-rides/30",
    eats: "from-eats/20 to-eats/5 border-eats/30",
    sky: "from-sky-500/20 to-sky-500/5 border-sky-400/30",
    amber: "from-amber-500/20 to-amber-500/5 border-amber-400/30",
    primary: "from-primary/20 to-primary/5 border-primary/30",
  };

  const iconColors = {
    rides: "text-rides",
    eats: "text-eats",
    sky: "text-sky-400",
    amber: "text-amber-400",
    primary: "text-primary",
  };

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "relative w-full p-4 rounded-2xl bg-gradient-to-br border text-left group overflow-hidden",
        colorClasses[color]
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Sparkle accent */}
      <div className="absolute top-3 right-3">
        <Sparkles className={cn("w-4 h-4", iconColors[color])} />
      </div>

      {badge && (
        <span className="absolute top-3 left-3 px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-eats to-orange-500 text-white rounded-full">
          {badge}
        </span>
      )}

      <div className="flex items-start gap-3 mt-2">
        <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-3xl shrink-0">
          {emoji || "✨"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
            {title}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
          {reason && (
            <p className={cn("text-xs mt-1 flex items-center gap-1", iconColors[color])}>
              <TrendingUp className="w-3 h-3" />
              {reason}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center gap-3">
          {rating && (
            <span className="flex items-center gap-1 text-sm">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {rating}
            </span>
          )}
          {price && (
            <span className="text-sm font-semibold">{price}</span>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.button>
  );
};

// Quick Repeat Order
interface QuickRepeatProps {
  orders: {
    id: string;
    title: string;
    items?: string[];
    price: string;
    emoji?: string;
    lastOrdered?: string;
  }[];
  onReorder?: (id: string) => void;
}

export const QuickRepeatOrders: React.FC<QuickRepeatProps> = ({
  orders,
  onReorder,
}) => {
  if (orders.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Bookmark className="w-4 h-4 text-eats" />
        <h4 className="text-sm font-semibold">Order Again</h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {orders.map((order, index) => (
          <motion.button
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onReorder?.(order.id)}
            className="flex items-center gap-3 p-3 glass-card rounded-xl border border-white/10 hover:border-eats/50 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-lg bg-eats/10 flex items-center justify-center text-2xl shrink-0">
              {order.emoji || "🍽️"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate group-hover:text-eats transition-colors">
                {order.title}
              </p>
              {order.items && (
                <p className="text-xs text-muted-foreground truncate">
                  {order.items.join(", ")}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-semibold text-eats">{order.price}</span>
                {order.lastOrdered && (
                  <span className="text-xs text-muted-foreground">• {order.lastOrdered}</span>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// Saved Preferences
interface SavedPreference {
  id: string;
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface SavedPreferencesProps {
  preferences: SavedPreference[];
  onEdit?: (id: string) => void;
}

export const SavedPreferences: React.FC<SavedPreferencesProps> = ({
  preferences,
  onEdit,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {preferences.map((pref) => (
        <button
          key={pref.id}
          onClick={() => onEdit?.(pref.id)}
          className="p-3 glass-card rounded-xl border border-white/10 hover:border-white/20 transition-all text-left group"
        >
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            {pref.icon}
            <span className="text-xs">{pref.label}</span>
          </div>
          <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
            {pref.value}
          </p>
        </button>
      ))}
    </div>
  );
};
