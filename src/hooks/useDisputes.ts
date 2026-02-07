/**
 * Disputes Hooks
 * CRUD operations and real-time subscriptions for order disputes
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OrderDispute {
  id: string;
  created_at: string;
  updated_at: string;
  order_id: string;
  created_by: string | null;
  created_role: string;
  reason: string;
  description: string | null;
  status: string;
  priority: string;
  requested_refund_amount: number;
  approved_refund_amount: number;
  resolution_notes: string | null;
  assigned_admin_id: string | null;
  payout_hold: boolean;
  resolved_at: string | null;
  // Joined data
  order?: {
    id: string;
    total_amount: number;
    customer_id: string;
    restaurant_id: string;
    status: string;
    payment_status: string | null;
    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
  };
}

export interface RefundRequest {
  id: string;
  created_at: string;
  dispute_id: string | null;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  stripe_refund_id: string | null;
  stripe_error: string | null;
  refund_reason: string;
  created_by: string | null;
  processed_at: string | null;
}

export interface DisputeAuditLog {
  id: string;
  created_at: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
}

// Fetch all disputes with filters
export function useDisputes(filters?: {
  status?: string;
  priority?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["disputes", filters],
    queryFn: async () => {
      let query = supabase
        .from("order_disputes")
        .select(`
          *,
          order:food_orders!order_id (
            id, total_amount, customer_id, restaurant_id, status, 
            payment_status, customer_name, customer_email, customer_phone
          )
        `)
        .order("created_at", { ascending: false });

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters?.priority && filters.priority !== "all") {
        query = query.eq("priority", filters.priority);
      }

      if (filters?.search) {
        query = query.or(
          `id.ilike.%${filters.search}%,order_id.ilike.%${filters.search}%,reason.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as OrderDispute[];
    },
  });
}

// Fetch single dispute by ID
export function useDispute(id: string | undefined) {
  return useQuery({
    queryKey: ["dispute", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("order_disputes")
        .select(`
          *,
          order:food_orders!order_id (
            id, total_amount, customer_id, restaurant_id, status, 
            payment_status, customer_name, customer_email, customer_phone,
            subtotal, delivery_fee, tip_amount, platform_fee,
            refund_status, refund_amount
          )
        `)
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as OrderDispute;
    },
    enabled: !!id,
  });
}

// Fetch refund requests for a dispute
export function useRefundRequests(disputeId: string | undefined) {
  return useQuery({
    queryKey: ["refund-requests", disputeId],
    queryFn: async () => {
      if (!disputeId) return [];
      const { data, error } = await supabase
        .from("refund_requests")
        .select("*")
        .eq("dispute_id", disputeId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as RefundRequest[];
    },
    enabled: !!disputeId,
  });
}

// Fetch audit logs for a dispute
export function useDisputeAuditLogs(disputeId: string | undefined) {
  return useQuery({
    queryKey: ["dispute-audit-logs", disputeId],
    queryFn: async () => {
      if (!disputeId) return [];
      const { data, error } = await supabase
        .from("dispute_audit_logs")
        .select("*")
        .eq("entity_id", disputeId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DisputeAuditLog[];
    },
    enabled: !!disputeId,
  });
}

// Create a new dispute
export function useCreateDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      order_id: string;
      reason: string;
      description?: string;
      requested_refund_amount?: number;
      created_role?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("order_disputes")
        .insert({
          order_id: input.order_id,
          reason: input.reason,
          description: input.description || null,
          requested_refund_amount: input.requested_refund_amount || 0,
          created_by: user?.id,
          created_role: input.created_role || "admin",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
      toast.success("Dispute created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create dispute: ${error.message}`);
    },
  });
}

// Update dispute
export function useUpdateDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      status?: string;
      priority?: string;
      assigned_admin_id?: string | null;
      approved_refund_amount?: number;
      resolution_notes?: string;
      payout_hold?: boolean;
    }) => {
      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from("order_disputes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
      queryClient.invalidateQueries({ queryKey: ["dispute", data.id] });
      toast.success("Dispute updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update dispute: ${error.message}`);
    },
  });
}

// Assign dispute to current admin
export function useAssignDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (disputeId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("order_disputes")
        .update({ 
          assigned_admin_id: user.id,
          status: "under_review" 
        })
        .eq("id", disputeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
      queryClient.invalidateQueries({ queryKey: ["dispute", data.id] });
      toast.success("Dispute assigned to you");
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign dispute: ${error.message}`);
    },
  });
}

// Process refund via edge function
export function useProcessDisputeRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      dispute_id: string;
      amount: number;
      reason?: "duplicate" | "fraudulent" | "requested_by_customer";
    }) => {
      const { data, error } = await supabase.functions.invoke(
        "process-dispute-refund",
        { body: input }
      );

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
      queryClient.invalidateQueries({ queryKey: ["dispute", variables.dispute_id] });
      queryClient.invalidateQueries({ queryKey: ["refund-requests", variables.dispute_id] });
      toast.success("Refund processed successfully");
    },
    onError: (error: Error) => {
      toast.error(`Refund failed: ${error.message}`);
    },
  });
}

// Real-time subscription for disputes list
export function useDisputesRealtime(onUpdate?: () => void) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("disputes-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_disputes" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["disputes"] });
          onUpdate?.();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, onUpdate]);
}

// Count disputes by status
export function useDisputeCounts() {
  return useQuery({
    queryKey: ["dispute-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_disputes")
        .select("status");
      
      if (error) throw error;

      const counts = {
        all: data.length,
        open: 0,
        under_review: 0,
        resolved: 0,
        rejected: 0,
        escalated: 0,
      };

      data.forEach((d) => {
        const status = d.status as keyof typeof counts;
        if (status in counts) {
          counts[status]++;
        }
      });

      return counts;
    },
  });
}
