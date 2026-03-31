/**
 * Account Favorites Page
 * View and manage favorites across all service types
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Star, Utensils, BedDouble, MapPin, Plane, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import SEOHead from "@/components/SEOHead";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";
import type { FavoriteItemType } from "@/types/personalization";

type TabKey = "all" | "restaurant" | "hotel" | "destination" | "flight";

const tabs: { key: TabKey; label: string; icon: typeof Heart; itemType?: FavoriteItemType }[] = [
  { key: "all", label: "All", icon: Heart },
  { key: "restaurant", label: "Restaurants", icon: Utensils, itemType: "restaurant" },
  { key: "hotel", label: "Hotels", icon: BedDouble, itemType: "hotel" },
  { key: "destination", label: "Destinations", icon: MapPin, itemType: "destination" },
  { key: "flight", label: "Flights", icon: Plane, itemType: "flight" },
];

const typeStyles: Record<string, { color: string; bg: string; icon: typeof Heart }> = {
  restaurant: { color: "text-orange-500", bg: "bg-orange-500/10", icon: Utensils },
  hotel: { color: "text-amber-500", bg: "bg-amber-500/10", icon: BedDouble },
  destination: { color: "text-emerald-500", bg: "bg-emerald-500/10", icon: MapPin },
  flight: { color: "text-sky-500", bg: "bg-sky-500/10", icon: Plane },
};

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const filterType = tabs.find((t) => t.key === activeTab)?.itemType;
  const { favorites, isLoading, removeFavorite } = useFavorites(filterType);

  const getItemName = (fav: any) => fav.item_data?.name || fav.item_data?.title || fav.item_type;
  const getItemSubtitle = (fav: any) => {
    const d = fav.item_data;
    if (d?.cuisine_type) return d.cuisine_type;
    if (d?.location) return d.location;
    if (d?.city) return d.city;
    return fav.item_type;
  };
  const getItemImage = (fav: any) => fav.item_data?.cover_image_url || fav.item_data?.logo_url || fav.item_data?.image_url;
  const getItemLink = (fav: any) => {
    if (fav.item_type === "restaurant") return `/eats/restaurant/${fav.item_id}`;
    if (fav.item_type === "hotel") return `/hotel/${fav.item_id}`;
    return "#";
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Favorites — ZIVO" description="View and manage your favorite places" />

      {/* Header */}
      <div className="sticky top-0 safe-area-top z-50 bg-background/80 backdrop-blur-xl border-b">
        <div className="flex items-center justify-between px-6 py-4 max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">Favorites</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-2xl mx-auto px-6 pt-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            const count = tab.key === "all" ? favorites.length : favorites.filter((f) => f.item_type === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/30"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {count > 0 && (
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full", isActive ? "bg-primary-foreground/20" : "bg-muted")}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-6">
        {/* Loading */}
        {isLoading && (
          <div className="space-y-4 pt-2">
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
              Tap the heart icon on restaurants, hotels, or destinations to save them here
            </p>
            <div className="flex gap-2">
              <Button onClick={() => navigate("/eats")} size="sm" variant="outline" className="gap-1.5">
                <Utensils className="w-4 h-4" />
                Restaurants
              </Button>
              <Button onClick={() => navigate("/search?tab=hotels")} size="sm" variant="outline" className="gap-1.5">
                <BedDouble className="w-4 h-4" />
                Hotels
              </Button>
            </div>
          </div>
        )}

        {/* Favorites List */}
        {!isLoading && favorites.length > 0 && (
          <div className="space-y-3 pt-2">
            <AnimatePresence mode="popLayout">
              {favorites.map((fav, index) => {
                const style = typeStyles[fav.item_type] || typeStyles.restaurant;
                const TypeIcon = style.icon;
                const image = getItemImage(fav);

                return (
                  <motion.div
                    key={fav.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => navigate(getItemLink(fav))}
                    className="group relative rounded-2xl overflow-hidden border bg-card cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    {/* Cover */}
                    {image ? (
                      <img src={image} alt={getItemName(fav)} className="w-full h-28 object-cover" loading="lazy" />
                    ) : (
                      <div className={cn("w-full h-28 flex items-center justify-center", style.bg)}>
                        <TypeIcon className={cn("w-10 h-10", style.color)} />
                      </div>
                    )}

                    {/* Type badge */}
                    <div className={cn("absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-sm border", style.bg, "border-white/20")}>
                      <TypeIcon className={cn("w-3 h-3", style.color)} />
                      <span className={cn("text-[10px] font-bold capitalize", style.color)}>{fav.item_type}</span>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFavorite({ itemType: fav.item_type, itemId: fav.item_id });
                      }}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-destructive/20 backdrop-blur-md border border-destructive/30 flex items-center justify-center text-destructive hover:bg-destructive/30 transition-colors"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>

                    {/* Info */}
                    <div className="p-3.5">
                      <h3 className="font-bold text-sm">{getItemName(fav)}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{getItemSubtitle(fav)}</span>
                        {fav.item_data?.rating && (
                          <>
                            <span className="w-1 h-1 bg-muted-foreground/50 rounded-full" />
                            <span className="flex items-center gap-0.5 text-amber-600">
                              <Star className="w-3 h-3 fill-current" />
                              {fav.item_data.rating}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
