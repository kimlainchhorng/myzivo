/**
 * Enhanced Eats Reviews Hooks
 * Extended CRUD with category ratings, filtering, merchant replies, and analytics
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EnhancedReview {
  id: string;
  order_id: string;
  user_id: string;
  restaurant_id: string;
  rating: number;
  food_rating: number | null;
  delivery_rating: number | null;
  packaging_rating: number | null;
  accuracy_rating: number | null;
  comment: string | null;
  photo_url: string | null;
  tags: string[] | null;
  merchant_reply: string | null;
  merchant_reply_at: string | null;
  is_flagged: boolean;
  created_at: string | null;
}

export interface CreateEnhancedReviewParams {
  orderId: string;
  restaurantId: string;
  rating: number;
  foodRating?: number;
  deliveryRating?: number;
  packagingRating?: number;
  accuracyRating?: number;
  comment?: string;
  photoUrl?: string;
  tags?: string[];
}

export interface ReviewStats {
  avgRating: number | null;
  avgFood: number | null;
  avgDelivery: number | null;
  avgPackaging: number | null;
  avgAccuracy: number | null;
  totalReviews: number;
  distribution: Record<number, number>;
}

// Get filtered reviews for a restaurant
export function useFilteredRestaurantReviews(
  restaurantId: string | undefined,
  ratingFilter?: number | null
) {
  return useQuery({
    queryKey: ["restaurant-reviews-filtered", restaurantId, ratingFilter],
    queryFn: async () => {
      if (!restaurantId) return [];

      let query = supabase
        .from("eats_reviews")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("is_flagged", false)
        .order("created_at", { ascending: false })
        .limit(50);

      if (ratingFilter && ratingFilter >= 1 && ratingFilter <= 5) {
        query = query.eq("rating", ratingFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as EnhancedReview[];
    },
    enabled: !!restaurantId,
    staleTime: 2 * 60 * 1000,
  });
}

// Get review statistics for a restaurant
export function useReviewStats(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ["restaurant-review-stats", restaurantId],
    queryFn: async (): Promise<ReviewStats | null> => {
      if (!restaurantId) return null;

      const { data, error } = await supabase
        .from("eats_reviews")
        .select("rating, food_rating, delivery_rating, packaging_rating, accuracy_rating")
        .eq("restaurant_id", restaurantId)
        .eq("is_flagged", false);

      if (error) throw error;
      if (!data || data.length === 0) {
        return { avgRating: null, avgFood: null, avgDelivery: null, avgPackaging: null, avgAccuracy: null, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
      }

      const avg = (arr: (number | null)[]) => {
        const valid = arr.filter((v): v is number => v !== null);
        return valid.length > 0 ? Math.round((valid.reduce((s, v) => s + v, 0) / valid.length) * 10) / 10 : null;
      };

      const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      data.forEach((r) => { distribution[r.rating] = (distribution[r.rating] || 0) + 1; });

      return {
        avgRating: avg(data.map((r) => r.rating)),
        avgFood: avg(data.map((r) => r.food_rating)),
        avgDelivery: avg(data.map((r) => r.delivery_rating)),
        avgPackaging: avg(data.map((r) => r.packaging_rating)),
        avgAccuracy: avg(data.map((r) => r.accuracy_rating)),
        totalReviews: data.length,
        distribution,
      };
    },
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000,
  });
}

// Create enhanced review
export function useCreateEnhancedReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateEnhancedReviewParams) => {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;
      if (!userId) throw new Error("Please log in to leave a review");

      // Check for duplicate review
      const { data: existing } = await supabase
        .from("eats_reviews")
        .select("id")
        .eq("order_id", params.orderId)
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) throw new Error("You've already reviewed this order");

      // Verify order is completed
      const { data: order } = await supabase
        .from("food_orders")
        .select("status, customer_id")
        .eq("id", params.orderId)
        .single();

      if (!order) throw new Error("Order not found");
      if (order.status !== "delivered") throw new Error("You can only review delivered orders");
      if (order.customer_id !== userId) throw new Error("You can only review your own orders");

      const { data, error } = await supabase
        .from("eats_reviews")
        .insert({
          order_id: params.orderId,
          user_id: userId,
          restaurant_id: params.restaurantId,
          rating: params.rating,
          food_rating: params.foodRating || null,
          delivery_rating: params.deliveryRating || null,
          packaging_rating: params.packagingRating || null,
          accuracy_rating: params.accuracyRating || null,
          comment: params.comment || null,
          photo_url: params.photoUrl || null,
          tags: params.tags || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success("Thank you for your review!");
      queryClient.invalidateQueries({ queryKey: ["eats-review", variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ["restaurant-reviews-filtered", variables.restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["restaurant-review-stats", variables.restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["restaurant-rating", variables.restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["my-eats-reviews"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit review");
    },
  });
}

// Merchant reply to a review
export function useMerchantReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, reply, restaurantId }: { reviewId: string; reply: string; restaurantId: string }) => {
      const { error } = await supabase
        .from("eats_reviews")
        .update({
          merchant_reply: reply.trim(),
          merchant_reply_at: new Date().toISOString(),
        })
        .eq("id", reviewId);

      if (error) throw error;
      return { restaurantId };
    },
    onSuccess: (result) => {
      toast.success("Reply posted!");
      queryClient.invalidateQueries({ queryKey: ["restaurant-reviews-filtered", result.restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["merchant-reviews", result.restaurantId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to post reply");
    },
  });
}

// Merchant: get reviews for their restaurant with trend data
export function useMerchantReviews(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ["merchant-reviews", restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];

      const { data, error } = await supabase
        .from("eats_reviews")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data || []) as EnhancedReview[];
    },
    enabled: !!restaurantId,
    staleTime: 60 * 1000,
  });
}
