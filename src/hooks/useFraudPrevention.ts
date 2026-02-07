/**
 * Fraud Prevention Hook
 * Risk events, scores, blocked entities management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { toast } from "sonner";

export interface RiskEvent {
  id: string;
  created_at: string;
  tenant_id: string | null;
  user_id: string | null;
  driver_id: string | null;
  order_id: string | null;
  event_type: string;
  severity: string | number;
  score: number;
  details: Record<string, any>;
  device_fingerprint: string | null;
  ip_address: string | null;
}

export interface RiskScore {
  id: string;
  created_at: string;
  tenant_id: string | null;
  user_id: string;
  total_score: number;
  risk_level: string;
  last_evaluated: string;
  score_breakdown: Record<string, number>;
}

export interface BlockedEntity {
  id: string;
  created_at: string;
  tenant_id: string | null;
  entity_type: string;
  entity_value: string;
  reason: string | null;
  blocked_by: string | null;
  expires_at: string | null;
  is_active: boolean;
}

export interface RiskyOrder {
  id: string;
  created_at: string;
  status: string;
  customer_id: string | null;
  risk_level: string | null;
  risk_score: number | null;
  risk_signals: string[] | null;
  requires_review: boolean | null;
  review_status: string | null;
  subtotal_cents: number | null;
  restaurant?: { name: string } | null;
}

export function useFraudPrevention() {
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();
  const tenantId = currentTenant?.id;

  // Risk events (last 7 days)
  const riskEventsQuery = useQuery({
    queryKey: ["risk-events", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("risk_events")
        .select("*")
        .eq("tenant_id", tenantId!)
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []) as unknown as RiskEvent[];
    },
    enabled: !!tenantId,
  });

  // Risky users (high/blocked)
  const riskyUsersQuery = useQuery({
    queryKey: ["risky-users", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("risk_scores")
        .select("*")
        .eq("tenant_id", tenantId!)
        .in("risk_level", ["high", "blocked"])
        .order("total_score", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as RiskScore[];
    },
    enabled: !!tenantId,
  });

  // Blocked entities
  const blockedEntitiesQuery = useQuery({
    queryKey: ["blocked-entities", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blocked_entities")
        .select("*")
        .eq("tenant_id", tenantId!)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as BlockedEntity[];
    },
    enabled: !!tenantId,
  });

  // Orders requiring review
  const ordersForReviewQuery = useQuery({
    queryKey: ["orders-for-review", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("food_orders")
        .select("id, created_at, status, customer_id, risk_level, risk_score, risk_signals, requires_review, review_status, subtotal_cents, restaurant:restaurants(name)")
        .eq("tenant_id", tenantId!)
        .eq("requires_review", true)
        .eq("review_status", "pending")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as unknown as RiskyOrder[];
    },
    enabled: !!tenantId,
  });

  // KPIs
  const kpisQuery = useQuery({
    queryKey: ["safety-kpis", tenantId],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [eventsToday, highRiskOrders, blockedCount] = await Promise.all([
        supabase
          .from("risk_events")
          .select("id", { count: "exact", head: true })
          .eq("tenant_id", tenantId!)
          .gte("created_at", today.toISOString()),
        supabase
          .from("food_orders")
          .select("id", { count: "exact", head: true })
          .eq("tenant_id", tenantId!)
          .eq("risk_level", "high")
          .gte("created_at", today.toISOString()),
        supabase
          .from("blocked_entities")
          .select("id", { count: "exact", head: true })
          .eq("tenant_id", tenantId!)
          .eq("is_active", true),
      ]);

      return {
        riskEventsToday: eventsToday.count || 0,
        highRiskOrdersToday: highRiskOrders.count || 0,
        blockedEntities: blockedCount.count || 0,
        pendingReviews: ordersForReviewQuery.data?.length || 0,
      };
    },
    enabled: !!tenantId,
  });

  // Block entity mutation
  const blockEntityMutation = useMutation({
    mutationFn: async (params: { entityType: string; entityValue: string; reason?: string }) => {
      const { data, error } = await supabase.rpc("block_entity" as any, {
        p_tenant_id: tenantId,
        p_entity_type: params.entityType,
        p_entity_value: params.entityValue,
        p_reason: params.reason || null,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Entity blocked successfully");
      queryClient.invalidateQueries({ queryKey: ["blocked-entities"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to block entity: " + error.message);
    },
  });

  // Unblock entity mutation
  const unblockEntityMutation = useMutation({
    mutationFn: async (params: { entityType: string; entityValue: string }) => {
      const { data, error } = await supabase.rpc("unblock_entity" as any, {
        p_tenant_id: tenantId,
        p_entity_type: params.entityType,
        p_entity_value: params.entityValue,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Entity unblocked");
      queryClient.invalidateQueries({ queryKey: ["blocked-entities"] });
    },
  });

  // Review order mutation
  const reviewOrderMutation = useMutation({
    mutationFn: async (params: { orderId: string; decision: "approved" | "rejected" }) => {
      const { data, error } = await supabase.rpc("review_order" as any, {
        p_order_id: params.orderId,
        p_decision: params.decision,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success(`Order ${variables.decision}`);
      queryClient.invalidateQueries({ queryKey: ["orders-for-review"] });
    },
  });

  // Reset user score mutation
  const resetUserScoreMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.rpc("reset_user_risk_score" as any, {
        p_user_id: userId,
        p_tenant_id: tenantId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("User risk score reset");
      queryClient.invalidateQueries({ queryKey: ["risky-users"] });
      queryClient.invalidateQueries({ queryKey: ["blocked-entities"] });
    },
  });

  return {
    riskEvents: riskEventsQuery.data || [],
    riskyUsers: riskyUsersQuery.data || [],
    blockedEntities: blockedEntitiesQuery.data || [],
    ordersForReview: ordersForReviewQuery.data || [],
    kpis: kpisQuery.data,
    isLoading: riskEventsQuery.isLoading || riskyUsersQuery.isLoading,
    blockEntity: blockEntityMutation.mutate,
    unblockEntity: unblockEntityMutation.mutate,
    reviewOrder: reviewOrderMutation.mutate,
    resetUserScore: resetUserScoreMutation.mutate,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ["risk-events"] });
      queryClient.invalidateQueries({ queryKey: ["risky-users"] });
      queryClient.invalidateQueries({ queryKey: ["blocked-entities"] });
      queryClient.invalidateQueries({ queryKey: ["orders-for-review"] });
      queryClient.invalidateQueries({ queryKey: ["safety-kpis"] });
    },
  };
}
