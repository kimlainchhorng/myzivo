/**
 * P2P Review Hooks
 * Hooks for managing reviews between renters and owners
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { P2PReview, P2PReviewType } from "@/types/p2p";

interface CreateReviewData {
  bookingId: string;
  reviewType: P2PReviewType;
  rating: number;
  title?: string;
  comment?: string;
  cleanliness?: number;
  communication?: number;
  accuracy?: number;
  value?: number;
  condition?: number;
  vehicleId?: string;
  revieweeId?: string;
}

// Create a new review
export function useCreateReview() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReviewData) => {
      if (!user) throw new Error("Not authenticated");

      const { data: review, error } = await supabase
        .from("p2p_reviews")
        .insert({
          booking_id: data.bookingId,
          review_type: data.reviewType,
          reviewer_id: user.id,
          reviewee_id: data.revieweeId,
          vehicle_id: data.vehicleId,
          rating: data.rating,
          title: data.title,
          comment: data.comment,
          cleanliness: data.cleanliness,
          communication: data.communication,
          accuracy: data.accuracy,
          value: data.value,
          condition: data.condition,
          is_public: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Update vehicle or owner rating if applicable
      if (data.reviewType === "renter_to_vehicle" && data.vehicleId) {
        await updateVehicleRating(data.vehicleId);
      } else if (data.reviewType === "renter_to_owner" && data.revieweeId) {
        await updateOwnerRating(data.revieweeId);
      }

      return review;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bookingReview", variables.bookingId] });
      queryClient.invalidateQueries({ queryKey: ["vehicleReviews", variables.vehicleId] });
      queryClient.invalidateQueries({ queryKey: ["ownerReviews", variables.revieweeId] });
      queryClient.invalidateQueries({ queryKey: ["bookingDetail", variables.bookingId] });
      toast.success("Review submitted successfully!");
    },
    onError: (error: Error) => {
      console.error("Review error:", error);
      toast.error(error.message || "Failed to submit review");
    },
  });
}

// Update vehicle rating based on all reviews
async function updateVehicleRating(vehicleId: string) {
  const { data: reviews } = await supabase
    .from("p2p_reviews")
    .select("rating")
    .eq("vehicle_id", vehicleId)
    .eq("review_type", "renter_to_vehicle");

  if (reviews && reviews.length > 0) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await supabase
      .from("p2p_vehicles")
      .update({ rating: avgRating, review_count: reviews.length })
      .eq("id", vehicleId);
  }
}

// Update owner rating based on all reviews
async function updateOwnerRating(ownerId: string) {
  const { data: reviews } = await supabase
    .from("p2p_reviews")
    .select("rating")
    .eq("reviewee_id", ownerId)
    .eq("review_type", "renter_to_owner");

  if (reviews && reviews.length > 0) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await supabase
      .from("car_owner_profiles")
      .update({ rating: avgRating })
      .eq("user_id", ownerId);
  }
}

// Check if user has already reviewed a booking
export function useBookingReview(bookingId: string | undefined, reviewType: P2PReviewType) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["bookingReview", bookingId, reviewType, user?.id],
    queryFn: async (): Promise<P2PReview | null> => {
      if (!bookingId || !user) return null;

      const { data, error } = await supabase
        .from("p2p_reviews")
        .select("*")
        .eq("booking_id", bookingId)
        .eq("reviewer_id", user.id)
        .eq("review_type", reviewType)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!bookingId && !!user,
  });
}

// Get reviews for a vehicle
export function useVehicleReviews(vehicleId: string | undefined) {
  return useQuery({
    queryKey: ["vehicleReviews", vehicleId],
    queryFn: async (): Promise<P2PReview[]> => {
      if (!vehicleId) return [];

      const { data, error } = await supabase
        .from("p2p_reviews")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .eq("review_type", "renter_to_vehicle")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!vehicleId,
  });
}

// Get reviews for an owner
export function useOwnerReviews(ownerId: string | undefined) {
  return useQuery({
    queryKey: ["ownerReviews", ownerId],
    queryFn: async (): Promise<P2PReview[]> => {
      if (!ownerId) return [];

      const { data, error } = await supabase
        .from("p2p_reviews")
        .select("*")
        .eq("reviewee_id", ownerId)
        .eq("review_type", "renter_to_owner")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!ownerId,
  });
}

// Owner respond to a review
export function useRespondToReview() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, response }: { reviewId: string; response: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("p2p_reviews")
        .update({
          owner_response: response,
          owner_responded_at: new Date().toISOString(),
        })
        .eq("id", reviewId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicleReviews"] });
      queryClient.invalidateQueries({ queryKey: ["ownerReviews"] });
      toast.success("Response submitted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit response");
    },
  });
}

// Star rating component helper
export function getStarRating(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  return "★".repeat(fullStars) + (hasHalf ? "½" : "") + "☆".repeat(5 - fullStars - (hasHalf ? 1 : 0));
}
