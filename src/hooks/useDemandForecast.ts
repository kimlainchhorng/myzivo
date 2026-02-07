/**
 * useDemandForecast Hook
 * Fetches demand forecasts, snapshots, and reposition recommendations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { toast } from "sonner";

export interface ZoneForecast {
  id: string;
  zone_code: string;
  forecast_for: string;
  predicted_orders: number;
  predicted_drivers_needed: number;
  current_drivers_online: number;
  confidence: number;
  surge_predicted: boolean;
  forecast_type: string;
  created_at: string;
}

export interface DemandSnapshot {
  id: string;
  zone_code: string;
  hour_of_day: number;
  day_of_week: number;
  snapshot_time: string;
  orders_count: number;
  drivers_online: number;
  avg_delivery_minutes: number | null;
  avg_assign_seconds: number | null;
  surge_multiplier: number;
  created_at: string;
}

export interface RepositionRecommendation {
  id: string;
  driver_id: string;
  current_zone_code: string | null;
  suggested_zone_code: string;
  reason: string;
  priority: number;
  expires_at: string;
  acknowledged_at: string | null;
  accepted: boolean | null;
  created_at: string;
  driver?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export interface AtRiskZone {
  zone_code: string;
  predicted_orders: number;
  predicted_drivers_needed: number;
  current_drivers_online: number;
  shortage: number;
  confidence: number;
  surge_predicted: boolean;
}

export interface HeatmapData {
  zones: string[];
  hours: number[];
  data: Array<{
    zone_code: string;
    hour: number;
    orders_count: number;
  }>;
}

// Fetch upcoming forecasts
export function useDemandForecasts(hoursAhead: number = 3) {
  const { currentTenant } = useTenant();

  return useQuery({
    queryKey: ["demand-forecasts", currentTenant?.id, hoursAhead],
    queryFn: async () => {
      const now = new Date();
      const futureTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

      let query = (supabase as any)
        .from("demand_forecasts")
        .select("*")
        .gte("forecast_for", now.toISOString())
        .lte("forecast_for", futureTime.toISOString())
        .order("forecast_for", { ascending: true });

      if (currentTenant?.id) {
        query = query.eq("tenant_id", currentTenant.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ZoneForecast[];
    },
    enabled: true,
    refetchInterval: 60000, // Refresh every minute
  });
}

// Fetch historical demand snapshots
export function useDemandSnapshots(hoursBack: number = 24) {
  const { currentTenant } = useTenant();

  return useQuery({
    queryKey: ["demand-snapshots", currentTenant?.id, hoursBack],
    queryFn: async () => {
      const startTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

      let query = (supabase as any)
        .from("demand_snapshots")
        .select("*")
        .gte("snapshot_time", startTime.toISOString())
        .order("snapshot_time", { ascending: false });

      if (currentTenant?.id) {
        query = query.eq("tenant_id", currentTenant.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as DemandSnapshot[];
    },
    enabled: true,
  });
}

// Fetch active reposition recommendations
export function useRepositionRecommendations() {
  const { currentTenant } = useTenant();

  return useQuery({
    queryKey: ["reposition-recommendations", currentTenant?.id],
    queryFn: async () => {
      let query = (supabase as any)
        .from("driver_reposition_recommendations")
        .select(`
          *,
          driver:drivers(id, full_name, avatar_url)
        `)
        .gt("expires_at", new Date().toISOString())
        .is("acknowledged_at", null)
        .order("priority", { ascending: true })
        .order("created_at", { ascending: false });

      if (currentTenant?.id) {
        query = query.eq("tenant_id", currentTenant.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as RepositionRecommendation[];
    },
    enabled: true,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// Get at-risk zones (shortage of drivers)
export function useAtRiskZones() {
  const { data: forecasts, isLoading } = useDemandForecasts(2);

  const atRiskZones: AtRiskZone[] = (forecasts || [])
    .filter((f) => f.predicted_drivers_needed > f.current_drivers_online)
    .map((f) => ({
      zone_code: f.zone_code,
      predicted_orders: f.predicted_orders,
      predicted_drivers_needed: f.predicted_drivers_needed,
      current_drivers_online: f.current_drivers_online,
      shortage: f.predicted_drivers_needed - f.current_drivers_online,
      confidence: f.confidence,
      surge_predicted: f.surge_predicted,
    }))
    .sort((a, b) => b.shortage - a.shortage);

  return { data: atRiskZones, isLoading };
}

// Generate heatmap data from snapshots
export function useDemandHeatmap(daysBack: number = 7) {
  const { currentTenant } = useTenant();

  return useQuery({
    queryKey: ["demand-heatmap", currentTenant?.id, daysBack],
    queryFn: async () => {
      const startTime = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

      let query = (supabase as any)
        .from("demand_snapshots")
        .select("zone_code, hour_of_day, orders_count")
        .gte("created_at", startTime.toISOString());

      if (currentTenant?.id) {
        query = query.eq("tenant_id", currentTenant.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      const snapshots = data as Array<{ zone_code: string; hour_of_day: number; orders_count: number }>;

      // Aggregate by zone and hour
      const aggregated = new Map<string, number>();
      for (const snapshot of snapshots || []) {
        const key = `${snapshot.zone_code}-${snapshot.hour_of_day}`;
        const current = aggregated.get(key) || 0;
        aggregated.set(key, current + (snapshot.orders_count || 0));
      }

      // Get unique zones and hours
      const zones = [...new Set((snapshots || []).map((d) => d.zone_code))];
      const hours = Array.from({ length: 24 }, (_, i) => i);

      return {
        zones,
        hours,
        data: Array.from(aggregated.entries()).map(([key, count]) => {
          const [zone, hour] = key.split("-");
          return {
            zone_code: zone,
            hour: parseInt(hour),
            orders_count: count,
          };
        }),
      };
    },
    enabled: true,
  });
}

// Acknowledge a reposition recommendation
export function useAcknowledgeReposition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recommendationId,
      accepted,
    }: {
      recommendationId: string;
      accepted: boolean;
    }) => {
      const { data, error } = await (supabase as any).rpc("acknowledge_reposition", {
        p_recommendation_id: recommendationId,
        p_accepted: accepted,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reposition-recommendations"] });
      toast.success("Recommendation acknowledged");
    },
    onError: (error: any) => {
      toast.error(`Failed to acknowledge: ${error.message}`);
    },
  });
}

// Dismiss/delete a recommendation
export function useDismissRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recommendationId: string) => {
      const { error } = await (supabase as any)
        .from("driver_reposition_recommendations")
        .delete()
        .eq("id", recommendationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reposition-recommendations"] });
      toast.success("Recommendation dismissed");
    },
    onError: (error: any) => {
      toast.error(`Failed to dismiss: ${error.message}`);
    },
  });
}

// Trigger manual forecast generation
export function useTriggerForecast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await (supabase as any).rpc("generate_all_forecasts");
      if (error) throw error;
      return data;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["demand-forecasts"] });
      toast.success(`Generated forecasts for ${count} zones`);
    },
    onError: (error: any) => {
      toast.error(`Failed to generate forecasts: ${error.message}`);
    },
  });
}

// Get demand KPIs
export function useDemandKPIs() {
  const { data: forecasts } = useDemandForecasts(2);
  const { data: recommendations } = useRepositionRecommendations();
  const { data: atRiskZones } = useAtRiskZones();

  const surgePredictedCount = (forecasts || []).filter((f) => f.surge_predicted).length;
  const totalPredictedOrders = (forecasts || []).reduce((sum, f) => sum + f.predicted_orders, 0);
  const avgConfidence =
    (forecasts || []).length > 0
      ? (forecasts || []).reduce((sum, f) => sum + f.confidence, 0) / (forecasts || []).length
      : 0;

  return {
    zonesAtRisk: (atRiskZones || []).length,
    surgePredicted: surgePredictedCount,
    pendingRepositions: (recommendations || []).length,
    totalPredictedOrders,
    avgConfidence: Math.round(avgConfidence * 100),
  };
}
