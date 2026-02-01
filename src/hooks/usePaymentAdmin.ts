/**
 * Admin Payment Hooks
 * For processing refunds and viewing payment status
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProcessRefundInput {
  type: "ride" | "eats";
  id: string;
  reason?: string;
}

export function useProcessRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ type, id, reason }: ProcessRefundInput) => {
      const { data, error } = await supabase.functions.invoke("process-refund", {
        body: { type, id, reason },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      if (variables.type === "ride") {
        queryClient.invalidateQueries({ queryKey: ["ride-requests"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["food-orders"] });
      }
      toast.success("Refund processed successfully");
    },
    onError: (error: Error) => {
      console.error("Refund error:", error);
      toast.error(`Refund failed: ${error.message}`);
    },
  });
}

// Payment status badge helper
export function getPaymentStatusBadge(status: string | null): {
  className: string;
  label: string;
} {
  switch (status) {
    case "paid":
      return {
        className: "bg-green-500/10 text-green-500 border-green-500/20",
        label: "Paid",
      };
    case "pending":
      return {
        className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        label: "Pending",
      };
    case "refunded":
      return {
        className: "bg-violet-500/10 text-violet-500 border-violet-500/20",
        label: "Refunded",
      };
    case "failed":
      return {
        className: "bg-red-500/10 text-red-500 border-red-500/20",
        label: "Failed",
      };
    default:
      return {
        className: "bg-muted text-muted-foreground border-muted",
        label: "Unpaid",
      };
  }
}

// Refund status badge helper
export function getRefundStatusBadge(status: string | null): {
  className: string;
  label: string;
} | null {
  switch (status) {
    case "requested":
      return {
        className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        label: "Refund Requested",
      };
    case "refunded":
      return {
        className: "bg-violet-500/10 text-violet-500 border-violet-500/20",
        label: "Refunded",
      };
    default:
      return null;
  }
}
