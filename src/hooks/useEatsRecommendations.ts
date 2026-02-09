/**
 * Smart Recommendations Hook for ZIVO Eats
 * Calculates personalized restaurant recommendations based on:
 * - Previous orders (frequency + recency)
 * - Favorite restaurants
 * - Time-based popularity (meal time matching)
 */
import { useMemo } from "react";
import { useRestaurants } from "./useEatsOrders";
import { useEatsFavorites } from "./useEatsFavorites";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { eatsApi, Restaurant } from "@/lib/eatsApi";

// Time periods for meal matching
type MealPeriod = "breakfast" | "lunch" | "dinner" | "late_night";

// Cuisine mappings per meal period
const MEAL_CUISINE_MAP: Record<MealPeriod, string[]> = {
  breakfast: ["coffee", "bakery", "brunch", "breakfast", "cafe"],
  lunch: ["fast food", "healthy", "asian", "american", "mexican", "sandwich", "salad"],
  dinner: ["italian", "fine dining", "steakhouse", "indian", "thai", "japanese", "chinese"],
  late_night: ["fast food", "pizza", "mexican", "burger", "wings"],
};

// Get current meal period based on hour
function getCurrentMealPeriod(): MealPeriod {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 15) return "lunch";
  if (hour >= 17 && hour < 21) return "dinner";
  return "late_night";
}

// Get display label for meal period
function getMealPeriodLabel(period: MealPeriod): string {
  switch (period) {
    case "breakfast":
      return "Great for breakfast";
    case "lunch":
      return "Popular for lunch";
    case "dinner":
      return "Popular tonight";
    case "late_night":
      return "Late night craving?";
  }
}

// Check if cuisine matches meal period
function cuisineMatchesMealPeriod(cuisineType: string | null, period: MealPeriod): boolean {
  if (!cuisineType) return false;
  const lowerCuisine = cuisineType.toLowerCase();
  return MEAL_CUISINE_MAP[period].some((c) => lowerCuisine.includes(c));
}

export interface ReorderSuggestion {
  restaurant: Restaurant;
  orderCount: number;
  lastOrderedAt: Date;
  topItems: string[];
  score: number;
}

export interface TimingSuggestion {
  restaurant: Restaurant;
  timing: MealPeriod;
  label: string;
}

export interface EatsRecommendations {
  reorderSuggestions: ReorderSuggestion[];
  favoriteSuggestions: Restaurant[];
  timingSuggestions: TimingSuggestion[];
  currentMealPeriod: MealPeriod;
  mealPeriodLabel: string;
  isLoading: boolean;
  hasRecommendations: boolean;
}

export function useEatsRecommendations(): EatsRecommendations {
  const { user } = useAuth();
  const { data: restaurants = [], isLoading: restaurantsLoading } = useRestaurants();
  const { favorites, isLoading: favoritesLoading } = useEatsFavorites();

  // Fetch user's orders (last 10)
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["my-eats-orders-recommendations", user?.id],
    queryFn: () => eatsApi.getMyOrders(),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const recommendations = useMemo(() => {
    const currentPeriod = getCurrentMealPeriod();
    const periodLabel = getMealPeriodLabel(currentPeriod);

    // === 1. Reorder Suggestions (from order history) ===
    const recentOrders = orders.slice(0, 10);
    const restaurantOrderStats = new Map<
      string,
      { count: number; lastOrdered: Date; items: string[] }
    >();

    recentOrders.forEach((order) => {
      const rid = order.restaurant_id;
      const existing = restaurantOrderStats.get(rid);
      const orderDate = new Date(order.created_at);
      const itemNames = (order.items as Array<{ name: string }>)?.map((i) => i.name) || [];

      if (existing) {
        existing.count += 1;
        if (orderDate > existing.lastOrdered) {
          existing.lastOrdered = orderDate;
        }
        // Add unique items
        itemNames.forEach((name) => {
          if (!existing.items.includes(name)) {
            existing.items.push(name);
          }
        });
      } else {
        restaurantOrderStats.set(rid, {
          count: 1,
          lastOrdered: orderDate,
          items: itemNames.slice(0, 3),
        });
      }
    });

    // Calculate scores and build suggestions
    const now = new Date();
    const reorderSuggestions: ReorderSuggestion[] = [];

    restaurantOrderStats.forEach((stats, restaurantId) => {
      const restaurant = restaurants.find((r) => r.id === restaurantId);
      if (!restaurant) return;

      // Frequency score: 10 points per order
      const frequencyScore = stats.count * 10;

      // Recency bonus
      const daysSinceOrder = Math.floor(
        (now.getTime() - stats.lastOrdered.getTime()) / (1000 * 60 * 60 * 24)
      );
      let recencyBonus = 0;
      if (daysSinceOrder <= 7) recencyBonus = 5;
      else if (daysSinceOrder <= 30) recencyBonus = 2;

      // Time matching bonus
      const timeBonus = cuisineMatchesMealPeriod(restaurant.cuisine_type, currentPeriod) ? 10 : 0;

      const score = frequencyScore + recencyBonus + timeBonus;

      reorderSuggestions.push({
        restaurant,
        orderCount: stats.count,
        lastOrderedAt: stats.lastOrdered,
        topItems: stats.items.slice(0, 2),
        score,
      });
    });

    // Sort by score and limit to top 5
    reorderSuggestions.sort((a, b) => b.score - a.score);
    const topReorderSuggestions = reorderSuggestions.slice(0, 5);

    // === 2. Favorite Suggestions ===
    const favoriteSuggestions: Restaurant[] = favorites
      .slice(0, 5)
      .map((fav) => {
        // Try to find full restaurant data
        const fullRestaurant = restaurants.find((r) => r.id === fav.item_id);
        if (fullRestaurant) return fullRestaurant;

        // Fallback to favorite data
        return {
          id: fav.item_id,
          name: fav.item_data.name,
          description: null,
          cuisine_type: fav.item_data.cuisine_type,
          address: null,
          phone: null,
          email: null,
          logo_url: fav.item_data.logo_url,
          cover_image_url: fav.item_data.cover_image_url || null,
          rating: fav.item_data.rating,
          avg_prep_time: null,
          is_open: true,
          status: "active",
        } as Restaurant;
      })
      .filter(Boolean);

    // === 3. Timing Suggestions ===
    // Find restaurants matching current meal period
    const timingSuggestions: TimingSuggestion[] = restaurants
      .filter((r) => cuisineMatchesMealPeriod(r.cuisine_type, currentPeriod))
      .filter((r) => r.is_open !== false) // Exclude explicitly closed
      .slice(0, 5)
      .map((restaurant) => ({
        restaurant,
        timing: currentPeriod,
        label: periodLabel,
      }));

    // Check if we have any recommendations
    const hasRecommendations =
      topReorderSuggestions.length > 0 ||
      favoriteSuggestions.length > 0 ||
      timingSuggestions.length > 0;

    return {
      reorderSuggestions: topReorderSuggestions,
      favoriteSuggestions,
      timingSuggestions,
      currentMealPeriod: currentPeriod,
      mealPeriodLabel: periodLabel,
      hasRecommendations,
    };
  }, [orders, restaurants, favorites]);

  return {
    ...recommendations,
    isLoading: restaurantsLoading || favoritesLoading || ordersLoading,
  };
}
