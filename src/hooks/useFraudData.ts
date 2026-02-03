/**
 * useFraudData Hook
 * Fetches and manages fraud assessment data for admin dashboard
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FraudAssessment {
  id: string;
  order_id: string | null;
  user_id: string | null;
  session_id: string | null;
  risk_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
  decision: "allow" | "review" | "block";
  reasons: string[];
  signals: Record<string, unknown>;
  ip_address: string | null;
  geo_country: string | null;
  card_country: string | null;
  is_vpn: boolean;
  stripe_risk_level: string | null;
  manual_override: boolean;
  override_by: string | null;
  override_at: string | null;
  override_reason: string | null;
  created_at: string;
  // Joined data
  order?: {
    order_number: string;
    total: number;
    holder_email: string;
    status: string;
  };
}

export interface FraudStats {
  totalAssessments: number;
  blockedCount: number;
  reviewCount: number;
  allowedCount: number;
  avgRiskScore: number;
  criticalAlerts: number;
  highAlerts: number;
}

export function useFraudAssessments(filters?: {
  riskLevel?: string;
  decision?: string;
  dateRange?: { start: Date; end: Date };
  limit?: number;
}) {
  return useQuery({
    queryKey: ["fraud-assessments", filters],
    queryFn: async (): Promise<FraudAssessment[]> => {
      let query = supabase
        .from("fraud_assessments")
        .select(`
          *,
          order:travel_orders(order_number, total, holder_email, status)
        `)
        .order("created_at", { ascending: false })
        .limit(filters?.limit || 100);

      if (filters?.riskLevel && filters.riskLevel !== "all") {
        query = query.eq("risk_level", filters.riskLevel as "low" | "medium" | "high" | "critical");
      }
      if (filters?.decision && filters.decision !== "all") {
        query = query.eq("decision", filters.decision as "allow" | "review" | "block");
      }
      if (filters?.dateRange) {
        query = query
          .gte("created_at", filters.dateRange.start.toISOString())
          .lte("created_at", filters.dateRange.end.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching fraud assessments:", error);
        throw error;
      }

      return (data || []).map((item) => ({
        ...item,
        order: Array.isArray(item.order) ? item.order[0] : item.order,
      })) as FraudAssessment[];
    },
  });
}

export function useFraudStats() {
  return useQuery({
    queryKey: ["fraud-stats"],
    queryFn: async (): Promise<FraudStats> => {
      const { data, error } = await supabase
        .from("fraud_assessments")
        .select("risk_score, risk_level, decision");

      if (error) {
        console.error("Error fetching fraud stats:", error);
        throw error;
      }

      const assessments = data || [];
      const totalAssessments = assessments.length;
      const blockedCount = assessments.filter((a) => a.decision === "block").length;
      const reviewCount = assessments.filter((a) => a.decision === "review").length;
      const allowedCount = assessments.filter((a) => a.decision === "allow").length;
      const avgRiskScore = totalAssessments > 0
        ? Math.round(assessments.reduce((sum, a) => sum + (a.risk_score || 0), 0) / totalAssessments)
        : 0;
      const criticalAlerts = assessments.filter((a) => a.risk_level === "critical").length;
      const highAlerts = assessments.filter((a) => a.risk_level === "high").length;

      return {
        totalAssessments,
        blockedCount,
        reviewCount,
        allowedCount,
        avgRiskScore,
        criticalAlerts,
        highAlerts,
      };
    },
  });
}

export function useOverrideFraudDecision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      assessmentId,
      newDecision,
      reason,
      orderId,
    }: {
      assessmentId: string;
      newDecision: "allow" | "review" | "block";
      reason: string;
      orderId?: string | null;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("fraud_assessments")
        .update({
          decision: newDecision,
          manual_override: true,
          override_by: user?.id,
          override_at: new Date().toISOString(),
          override_reason: reason,
        })
        .eq("id", assessmentId);

      if (error) throw error;

      // Update order status based on new decision
      if (orderId) {
        let newOrderStatus = "pending_payment";
        if (newDecision === "block") {
          newOrderStatus = "fraud_blocked";
        } else if (newDecision === "review") {
          newOrderStatus = "fraud_review";
        }

        await supabase
          .from("travel_orders")
          .update({ status: newOrderStatus })
          .eq("id", orderId);

        // Log audit event
        await supabase.from("booking_audit_logs").insert({
          order_id: orderId,
          user_id: user?.id,
          event: "fraud_override",
          meta: {
            assessment_id: assessmentId,
            new_decision: newDecision,
            reason,
          },
        });
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fraud-assessments"] });
      queryClient.invalidateQueries({ queryKey: ["fraud-stats"] });
    },
  });
}

export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      reason,
    }: {
      userId: string;
      reason: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();

      // Update or create fraud profile
      const { data: existingProfile } = await supabase
        .from("user_fraud_profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingProfile) {
        await supabase
          .from("user_fraud_profiles")
          .update({
            is_blocked: true,
            blocked_at: new Date().toISOString(),
            blocked_reason: reason,
            notes: `Manually blocked by admin: ${reason}`,
          })
          .eq("id", existingProfile.id);
      } else {
        await supabase.from("user_fraud_profiles").insert({
          user_id: userId,
          is_blocked: true,
          blocked_at: new Date().toISOString(),
          blocked_reason: reason,
          notes: `Manually blocked by admin: ${reason}`,
        });
      }

      // Log audit event
      await supabase.from("audit_logs").insert({
        action: "user_blocked",
        entity_type: "user",
        entity_id: userId,
        user_id: user?.id,
        new_values: { blocked: true, reason },
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fraud-assessments"] });
    },
  });
}

export function useFraudRules() {
  return useQuery({
    queryKey: ["fraud-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fraud_rules")
        .select("*")
        .order("weight", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useFraudThresholds() {
  return useQuery({
    queryKey: ["fraud-thresholds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fraud_thresholds")
        .select("*")
        .order("min_score", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}
