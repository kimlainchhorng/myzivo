/**
 * ZIVO AI Optimization Hooks
 * Smart ranking, pricing, fraud detection, and insights
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  UserBehaviorSignal,
  AIPricingSuggestion,
  AIRecommendation,
  AIFraudAlert,
  UserCLVScore,
  AIPartnerInsight,
  AIInsightsSummary,
  AIModelMetrics,
  ServiceType,
  BehaviorSignalType,
  FraudAlertStatus,
  SuggestionStatus,
} from "@/types/ai";

// ============================================
// BEHAVIOR TRACKING
// ============================================

export function useTrackBehavior() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      serviceType,
      signalType,
      entityId,
      metadata = {},
    }: {
      serviceType: ServiceType;
      signalType: BehaviorSignalType;
      entityId?: string;
      metadata?: Record<string, unknown>;
    }) => {
      const sessionId = sessionStorage.getItem("zivo_session_id") || crypto.randomUUID();
      if (!sessionStorage.getItem("zivo_session_id")) {
        sessionStorage.setItem("zivo_session_id", sessionId);
      }

      const insertData = {
        user_id: user?.id || null,
        session_id: sessionId,
        service_type: serviceType,
        signal_type: signalType,
        entity_id: entityId || null,
        metadata,
      };

      const { error } = await supabase.from("user_behavior_signals").insert(insertData as any);

      if (error) throw error;
    },
  });
}

// ============================================
// SMART RECOMMENDATIONS
// ============================================

export function useAIRecommendations(sourceService?: ServiceType) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["ai-recommendations", user?.id, sourceService],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from("ai_recommendations")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_shown", false)
        .gt("expires_at", new Date().toISOString())
        .order("relevance_score", { ascending: false })
        .limit(5);

      if (sourceService) {
        query = query.eq("source_service", sourceService);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as AIRecommendation[];
    },
    enabled: !!user,
  });
}

export function useMarkRecommendationShown() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recommendationId: string) => {
      const { error } = await supabase
        .from("ai_recommendations")
        .update({ is_shown: true, shown_at: new Date().toISOString() })
        .eq("id", recommendationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-recommendations"] });
    },
  });
}

export function useMarkRecommendationClicked() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recommendationId: string) => {
      const { error } = await supabase
        .from("ai_recommendations")
        .update({ is_clicked: true, clicked_at: new Date().toISOString() })
        .eq("id", recommendationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-recommendations"] });
    },
  });
}

// ============================================
// PRICING SUGGESTIONS (for partners)
// ============================================

export function usePricingSuggestions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["pricing-suggestions", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("ai_pricing_suggestions")
        .select("*")
        .eq("target_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AIPricingSuggestion[];
    },
    enabled: !!user,
  });
}

export function useRespondToPricingSuggestion() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "accepted" | "rejected";
    }) => {
      const { error } = await supabase
        .from("ai_pricing_suggestions")
        .update({ status, responded_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["pricing-suggestions"] });
      toast({
        title: status === "accepted" ? "Suggestion applied" : "Suggestion dismissed",
      });
    },
  });
}

// ============================================
// PARTNER INSIGHTS
// ============================================

export function usePartnerInsights() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["partner-insights", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("ai_partner_insights")
        .select("*")
        .eq("partner_id", user.id)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as AIPartnerInsight[];
    },
    enabled: !!user,
  });
}

export function useMarkInsightRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (insightId: string) => {
      const { error } = await supabase
        .from("ai_partner_insights")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", insightId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-insights"] });
    },
  });
}

// ============================================
// USER CLV
// ============================================

export function useUserCLV() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-clv", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_clv_scores")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data as UserCLVScore | null;
    },
    enabled: !!user,
  });
}

// ============================================
// ADMIN: FRAUD ALERTS
// ============================================

export function useFraudAlerts(status?: FraudAlertStatus) {
  return useQuery({
    queryKey: ["fraud-alerts", status],
    queryFn: async () => {
      let query = supabase
        .from("ai_fraud_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as AIFraudAlert[];
    },
  });
}

export function useUpdateFraudAlert() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      review_notes,
      action_taken,
    }: {
      id: string;
      status: FraudAlertStatus;
      review_notes?: string;
      action_taken?: string;
    }) => {
      const { error } = await supabase
        .from("ai_fraud_alerts")
        .update({
          status,
          review_notes,
          action_taken,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fraud-alerts"] });
      toast({ title: "Alert updated" });
    },
  });
}

// ============================================
// ADMIN: AI INSIGHTS SUMMARY
// ============================================

export function useAIInsightsSummary() {
  return useQuery({
    queryKey: ["ai-insights-summary"],
    queryFn: async () => {
      const [fraudRes, pricingRes, recsRes, clvRes] = await Promise.all([
        supabase.from("ai_fraud_alerts").select("id, status, severity"),
        supabase.from("ai_pricing_suggestions").select("id, status"),
        supabase.from("ai_recommendations").select("id, is_shown, is_clicked"),
        supabase.from("user_clv_scores").select("clv_score, churn_risk"),
      ]);

      const fraudAlerts = fraudRes.data || [];
      const pricingSuggestions = pricingRes.data || [];
      const recommendations = recsRes.data || [];
      const clvScores = clvRes.data || [];

      const shownRecs = recommendations.filter((r: any) => r.is_shown);
      const clickedRecs = recommendations.filter((r: any) => r.is_clicked);

      const summary: AIInsightsSummary = {
        totalFraudAlerts: fraudAlerts.length,
        pendingFraudAlerts: fraudAlerts.filter((a: any) => a.status === "pending").length,
        criticalAlerts: fraudAlerts.filter((a: any) => a.severity === "critical").length,
        pricingSuggestions: pricingSuggestions.length,
        acceptedSuggestions: pricingSuggestions.filter((s: any) => s.status === "accepted").length,
        conversionLift: 0, // Calculated from model metrics
        totalRecommendations: recommendations.length,
        recommendationClickRate: shownRecs.length > 0 
          ? (clickedRecs.length / shownRecs.length) * 100 
          : 0,
        avgCLVScore: clvScores.length > 0
          ? clvScores.reduce((sum: number, c: any) => sum + parseFloat(c.clv_score), 0) / clvScores.length
          : 0,
        churnRiskUsers: clvScores.filter((c: any) => parseFloat(c.churn_risk) > 0.7).length,
      };

      return summary;
    },
  });
}

// ============================================
// ADMIN: MODEL METRICS
// ============================================

export function useAIModelMetrics() {
  return useQuery({
    queryKey: ["ai-model-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_model_metrics")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as AIModelMetrics[];
    },
  });
}

// ============================================
// ADMIN: ALL PRICING SUGGESTIONS
// ============================================

export function useAllPricingSuggestions(status?: SuggestionStatus) {
  return useQuery({
    queryKey: ["all-pricing-suggestions", status],
    queryFn: async () => {
      let query = supabase
        .from("ai_pricing_suggestions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AIPricingSuggestion[];
    },
  });
}

// ============================================
// ADMIN: ALL CLV SCORES
// ============================================

export function useAllCLVScores(tier?: string) {
  return useQuery({
    queryKey: ["all-clv-scores", tier],
    queryFn: async () => {
      let query = supabase
        .from("user_clv_scores")
        .select("*")
        .order("clv_score", { ascending: false })
        .limit(100);

      if (tier) {
        query = query.eq("clv_tier", tier);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as UserCLVScore[];
    },
  });
}
