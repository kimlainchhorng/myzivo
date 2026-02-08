/**
 * ZIVO Eats Favorites Page
 * User's favorite restaurants
 */
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Star, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEatsFavorites } from "@/hooks/useEatsFavorites";
import { EatsBottomNav } from "@/components/eats/EatsBottomNav";
import { FavoriteButton } from "@/components/eats/FavoriteButton";
import SEOHead from "@/components/SEOHead";

export default function EatsFavorites() {
  const navigate = useNavigate();
  const { favorites, isLoading, removeFavorite } = useEatsFavorites();

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      <SEOHead
        title="Favorites — ZIVO Eats"
        description="Your favorite restaurants"
      />

      {/* Header */}
      <div className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate("/eats")}
            className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">Favorites</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-white/5 bg-zinc-900">
              <Skeleton className="h-32 w-full bg-zinc-800" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-2/3 bg-zinc-800" />
                <Skeleton className="h-4 w-1/2 bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && favorites.length === 0 && (
        <div className="flex flex-col items-center justify-center px-6 py-20">
          <div className="w-20 h-20 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-zinc-600" />
          </div>
          <h2 className="text-lg font-bold mb-2">No favorites yet</h2>
          <p className="text-sm text-zinc-500 text-center mb-6">
            Tap the heart on restaurants to add them here
          </p>
          <Button
            onClick={() => navigate("/eats")}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Browse Restaurants
          </Button>
        </div>
      )}

      {/* Favorites List */}
      {!isLoading && favorites.length > 0 && (
        <div className="p-6 space-y-4">
          {favorites.map((fav, index) => (
            <motion.div
              key={fav.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/eats/restaurant/${fav.item_id}`)}
              className="group relative rounded-2xl overflow-hidden border border-white/5 bg-zinc-900 cursor-pointer touch-manipulation active:scale-[0.98] transition-transform"
            >
              {/* Cover Image */}
              {fav.item_data.cover_image_url ? (
                <img
                  src={fav.item_data.cover_image_url}
                  alt={fav.item_data.name}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="w-full h-32 bg-gradient-to-br from-orange-500/20 to-zinc-800" />
              )}

              {/* Favorite Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(fav.item_id);
                }}
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/30 flex items-center justify-center text-red-500"
              >
                <Heart className="w-5 h-5 fill-red-500" />
              </button>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{fav.item_data.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-zinc-400 mt-1">
                      <span>{fav.item_data.cuisine_type || "Restaurant"}</span>
                      {fav.item_data.rating && (
                        <>
                          <span className="w-1 h-1 bg-zinc-500 rounded-full" />
                          <span className="flex items-center gap-1 text-orange-400">
                            <Star className="w-3 h-3 fill-orange-400" />
                            {fav.item_data.rating}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <EatsBottomNav />
    </div>
  );
}
