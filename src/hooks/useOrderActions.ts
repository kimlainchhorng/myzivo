/**
 * useOrderActions Hook
 * Provides actions for travel orders: resend confirmation, request cancellation
 */
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useOrderActions() {
  const queryClient = useQueryClient();
  const [isResending, setIsResending] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const resendConfirmation = useMutation({
    mutationFn: async (orderId: string) => {
      setIsResending(true);
      const { data, error } = await supabase.functions.invoke("resend-travel-confirmation", {
        body: { orderId },
      });

      if (error) {
        throw new Error(error.message || "Failed to resend confirmation");
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to resend confirmation");
      }

      return data;
    },
    onSuccess: (data) => {
      toast.success("Confirmation email sent", {
        description: `Email sent to ${data.recipient}`,
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to resend confirmation", {
        description: error.message,
      });
    },
    onSettled: () => {
      setIsResending(false);
    },
  });

  const requestCancellation = useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason: string }) => {
      setIsCancelling(true);
      const { data, error } = await supabase.functions.invoke("request-travel-cancellation", {
        body: { orderId, reason },
      });

      if (error) {
        throw new Error(error.message || "Failed to request cancellation");
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to request cancellation");
      }

      return data;
    },
    onSuccess: (data) => {
      toast.success("Cancellation requested", {
        description: data.message,
      });
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["my-trips"] });
      queryClient.invalidateQueries({ queryKey: ["trip-details"] });
      queryClient.invalidateQueries({ queryKey: ["travel-order"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to request cancellation", {
        description: error.message,
      });
    },
    onSettled: () => {
      setIsCancelling(false);
    },
  });

  return {
    resendConfirmation: resendConfirmation.mutate,
    requestCancellation: requestCancellation.mutate,
    isResending: isResending || resendConfirmation.isPending,
    isCancelling: isCancelling || requestCancellation.isPending,
  };
}
