/**
 * useOrderRating Hook
 * Handles fetching order details for rating and submitting ratings
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface OrderForRating {
  order_id: string;
  restaurant_name: string | null;
  driver_name: string | null;
  driver_id: string | null;
  restaurant_id: string | null;
  delivered_at: string | null;
  already_rated: boolean;
}

export interface SubmitRatingParams {
  trackingCode: string;
  driverRating: number;
  merchantRating: number;
  comment?: string;
  tags?: string[];
  contactBack?: boolean;
}

export const useOrderForRating = (trackingCode: string | undefined) => {
  return useQuery({
    queryKey: ["order-for-rating", trackingCode],
    queryFn: async (): Promise<OrderForRating | null> => {
      if (!trackingCode) return null;

      const { data, error } = await supabase.rpc("get_delivered_order_for_rating", {
        p_tracking_code: trackingCode,
      });

      if (error) {
        console.error("Error fetching order for rating:", error);
        throw error;
      }

      // RPC returns an array, we want the first row
      const result = Array.isArray(data) ? data[0] : data;
      return result || null;
    },
    enabled: !!trackingCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSubmitRating = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SubmitRatingParams) => {
      const { data, error } = await supabase.rpc("submit_order_rating", {
        p_tracking_code: params.trackingCode,
        p_driver_rating: params.driverRating,
        p_merchant_rating: params.merchantRating,
        p_comment: params.comment || null,
        p_tags: params.tags || null,
        p_contact_back: params.contactBack || false,
      });

      if (error) throw error;

      // The RPC returns a JSONB object
      const result = data as { success: boolean; error?: string };
      if (!result.success) {
        throw new Error(result.error || "Failed to submit rating");
      }

      return result;
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Thank you!",
        description: "Your feedback helps us improve our service.",
      });
      // Invalidate the order for rating query to reflect the rated state
      queryClient.invalidateQueries({
        queryKey: ["order-for-rating", variables.trackingCode],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit rating",
        variant: "destructive",
      });
    },
  });
};
