/**
 * useRatePassenger Hook
 * Mutation for driver rating a passenger on a completed trip
 */

import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RatePassengerPayload {
  tripId: string;
  rating: number;
  feedback?: string;
}

export const useRatePassenger = () => {
  return useMutation({
    mutationFn: async (payload: RatePassengerPayload) => {
      // Verify the trip is completed and driver matches
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: trip, error: fetchError } = await supabase
        .from("trips")
        .select("status, driver_id, rider_rating")
        .eq("id", payload.tripId)
        .single();

      if (fetchError) throw fetchError;
      if (!trip) throw new Error("Trip not found");
      if (trip.status !== "completed") throw new Error("Trip not completed");
      if (trip.rider_rating) throw new Error("Already rated");

      // Update with passenger rating
      const { error } = await supabase
        .from("trips")
        .update({
          rider_rating: payload.rating,
          rider_feedback: payload.feedback || null,
          updated_at: new Date().toISOString(),
        } as any)
        .eq("id", payload.tripId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Passenger rated!");
    },
    onError: (error) => {
      console.error("Failed to rate passenger:", error);
      toast.error(error.message || "Failed to save rating");
    },
  });
};
