/**
 * Account Favorites Page
 * View and manage favorite restaurants
 */
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Star, Clock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import SEOHead from "@/components/SEOHead";
import { useEatsFavorites } from "@/hooks/useEatsFavorites";

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { favorites, isLoading, removeFavorite } = useEatsFavorites();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Favorite Restaurants — ZIVO"
        description="Your favorite restaurants for quick ordering"
      />

      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b">
        <div className="flex items-center justify-between px-6 py-4 max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">Favorite Restaurants</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6">
        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl overflow-hidden border bg-card">
                <Skeleton className="h-32 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && favorites.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-bold mb-2">No favorites yet</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Tap the heart on restaurants to add them here
            </p>
            <Button onClick={() => navigate("/eats/restaurants")}>
              Browse Restaurants
            </Button>
          </div>
        )}

        {/* Favorites List */}
        {!isLoading && favorites.length > 0 && (
          <div className="space-y-4">
            {favorites.map((fav, index) => (
              <motion.div
                key={fav.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/eats/restaurant/${fav.item_id}`)}
                className="group relative rounded-2xl overflow-hidden border bg-card cursor-pointer active:scale-[0.98] transition-transform"
              >
                {/* Cover Image */}
                {fav.item_data.cover_image_url ? (
                  <img
                    src={fav.item_data.cover_image_url}
                    alt={fav.item_data.name}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-muted" />
                )}

                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavorite(fav.item_id);
                  }}
                  className="absolute top-3 right-3 w-10 h-10 rounded-full bg-destructive/20 backdrop-blur-md border border-destructive/30 flex items-center justify-center text-destructive"
                >
                  <Heart className="w-5 h-5 fill-current" />
                </button>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg">{fav.item_data.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <span>{fav.item_data.cuisine_type || "Restaurant"}</span>
                    {fav.item_data.rating && (
                      <>
                        <span className="w-1 h-1 bg-muted-foreground/50 rounded-full" />
                        <span className="flex items-center gap-1 text-amber-600">
                          <Star className="w-3 h-3 fill-current" />
                          {fav.item_data.rating}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
