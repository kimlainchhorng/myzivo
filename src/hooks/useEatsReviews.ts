/**
 * useEatsReviews Hook
 * CRUD operations for eats reviews and restaurant ratings
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EatsReview {
  id: string;
  order_id: string;
  user_id: string;
  restaurant_id: string;
  rating: number;
  food_rating: number | null;
  delivery_rating: number | null;
  comment: string | null;
  created_at: string;
}

export interface CreateReviewParams {
  orderId: string;
  restaurantId: string;
  rating: number;
  foodRating?: number;
  deliveryRating?: number;
  comment?: string;
}

// Check if order has been reviewed
export function useOrderReview(orderId: string | undefined) {
  return useQuery({
    queryKey: ["eats-review", orderId],
    queryFn: async () => {
      if (!orderId) return null;

      const { data, error } = await supabase
        .from("eats_reviews")
        .select("*")
        .eq("order_id", orderId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      return data as EatsReview | null;
    },
    enabled: !!orderId,
  });
}

// Create a new review
export function useCreateEatsReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateReviewParams) => {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;

      if (!userId) {
        throw new Error("Please log in to leave a review");
      }

      const { data, error } = await supabase
        .from("eats_reviews")
        .insert({
          order_id: params.orderId,
          user_id: userId,
          restaurant_id: params.restaurantId,
          rating: params.rating,
          food_rating: params.foodRating || null,
          delivery_rating: params.deliveryRating || null,
          comment: params.comment || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success("Thank you for your review!");
      queryClient.invalidateQueries({ queryKey: ["eats-review", variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ["restaurant-reviews", variables.restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["restaurant-rating", variables.restaurantId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit review");
    },
  });
}

// Get restaurant average rating from reviews
export function useRestaurantRating(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ["restaurant-rating", restaurantId],
    queryFn: async () => {
      if (!restaurantId) return null;

      const { data, error } = await supabase
        .from("eats_reviews")
        .select("rating")
        .eq("restaurant_id", restaurantId);

      if (error) throw error;

      if (!data || data.length === 0) {
        return { avgRating: null, totalReviews: 0 };
      }

      const avgRating = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
      return {
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: data.length,
      };
    },
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get all reviews for the current user, keyed by order_id
export function useMyOrderReviews() {
  return useQuery({
    queryKey: ["my-eats-reviews"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      if (!userId) return new Map<string, EatsReview>();

      const { data, error } = await supabase
        .from("eats_reviews")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;

      const map = new Map<string, EatsReview>();
      (data || []).forEach((r) => map.set(r.order_id, r as EatsReview));
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Get all reviews for a restaurant
export function useRestaurantReviews(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ["restaurant-reviews", restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];

      const { data, error } = await supabase
        .from("eats_reviews")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as EatsReview[];
    },
    enabled: !!restaurantId,
  });
}
