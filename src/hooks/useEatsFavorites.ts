/**
 * ZIVO Eats Restaurant Favorites Hook
 * Manages favorite restaurants for the current user
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eatsApi, RestaurantFavorite, Restaurant } from "@/lib/eatsApi";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const QUERY_KEY = "eats-favorites";

export function useEatsFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all favorites
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: [QUERY_KEY, user?.id],
    queryFn: () => eatsApi.getFavorites(),
    enabled: !!user?.id,
  });

  // Add to favorites
  const addFavorite = useMutation({
    mutationFn: async (restaurant: Restaurant) => {
      await eatsApi.addFavorite(restaurant.id, {
        name: restaurant.name,
        logo_url: restaurant.logo_url,
        cuisine_type: restaurant.cuisine_type,
        rating: restaurant.rating,
        cover_image_url: restaurant.cover_image_url,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Added to favorites");
    },
    onError: (error) => {
      console.error("Failed to add favorite:", error);
      toast.error("Failed to add favorite");
    },
  });

  // Remove from favorites
  const removeFavorite = useMutation({
    mutationFn: async (restaurantId: string) => {
      await eatsApi.removeFavorite(restaurantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Removed from favorites");
    },
    onError: (error) => {
      console.error("Failed to remove favorite:", error);
      toast.error("Failed to remove favorite");
    },
  });

  // Toggle favorite
  const toggleFavorite = useMutation({
    mutationFn: async (restaurant: Restaurant) => {
      const isFav = await eatsApi.isFavorite(restaurant.id);
      if (isFav) {
        await eatsApi.removeFavorite(restaurant.id);
        return { action: "removed" as const };
      } else {
        await eatsApi.addFavorite(restaurant.id, {
          name: restaurant.name,
          logo_url: restaurant.logo_url,
          cuisine_type: restaurant.cuisine_type,
          rating: restaurant.rating,
          cover_image_url: restaurant.cover_image_url,
        });
        return { action: "added" as const };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success(
        result.action === "added" ? "Added to favorites" : "Removed from favorites"
      );
    },
    onError: (error) => {
      console.error("Failed to toggle favorite:", error);
      toast.error("Failed to update favorite");
    },
  });

  // Check if restaurant is favorited
  const isFavorited = (restaurantId: string): boolean => {
    return favorites.some((f) => f.item_id === restaurantId);
  };

  return {
    favorites,
    isLoading,
    addFavorite: addFavorite.mutate,
    removeFavorite: removeFavorite.mutate,
    toggleFavorite: toggleFavorite.mutate,
    isToggling: toggleFavorite.isPending,
    isFavorited,
  };
}
