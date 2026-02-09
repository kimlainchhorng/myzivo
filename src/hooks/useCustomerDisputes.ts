/**
 * Customer Disputes Hook
 * Fetch and create disputes for the logged-in customer
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type CustomerDisputeReason = "missing_items" | "wrong_items" | "order_late" | "other";

export interface CreateCustomerDisputeParams {
  orderId: string;
  reason: CustomerDisputeReason;
  description: string;
}

export function useMyDisputes() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-disputes", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("order_disputes")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useCreateCustomerDispute() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateCustomerDisputeParams) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("order_disputes")
        .insert({
          order_id: params.orderId,
          reason: params.reason,
          description: params.description,
          created_by: user.id,
          created_role: "customer",
          status: "open",
          priority: "normal",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-disputes"] });
    },
    onError: (error) => {
      toast.error(`Failed to submit dispute: ${error.message}`);
    },
  });
}
