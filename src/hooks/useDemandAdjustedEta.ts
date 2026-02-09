/**
 * useDemandAdjustedEta Hook
 * Fetches the nearest demand forecast for a restaurant's zone and computes
 * a demandMultiplier (1.0–1.3) to inflate prep-time estimates during surges.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DemandAdjustedEtaResult {
  demandMultiplier: number;
  isLoading: boolean;
}

/**
 * @param regionId - The restaurant's region_id used to match demand_forecasts.zone_code
 */
export function useDemandAdjustedEta(regionId: string | undefined | null): DemandAdjustedEtaResult {
  const { data, isLoading } = useQuery({
    queryKey: ["demand-forecast-eta", regionId],
    enabled: !!regionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    queryFn: async () => {
      const now = new Date().toISOString();

      const { data: rows, error } = await supabase
        .from("demand_forecasts")
        .select("predicted_orders, predicted_drivers_needed, surge_predicted, confidence")
        .eq("zone_code", regionId!)
        .gte("forecast_for", now)
        .order("forecast_for", { ascending: true })
        .limit(1);

      if (error) throw error;
      if (!rows || rows.length === 0) return { demandMultiplier: 1.0 };

      const row = rows[0];
      const predictedOrders = row.predicted_orders ?? 0;
      const predictedDrivers = Math.max(row.predicted_drivers_needed ?? 1, 1);
      const surgePredicted = row.surge_predicted ?? false;
      const confidence = Math.max(0, Math.min(row.confidence ?? 0, 1));

      const ratio = predictedOrders / predictedDrivers;

      let rawMultiplier: number;
      if (ratio > 3) {
        rawMultiplier = 1.3;
      } else if (ratio > 2) {
        rawMultiplier = 1.15;
      } else if (surgePredicted) {
        rawMultiplier = 1.1;
      } else {
        rawMultiplier = 1.0;
      }

      // Dampen by forecast confidence
      const demandMultiplier = 1 + (rawMultiplier - 1) * confidence;

      return { demandMultiplier };
    },
  });

  return {
    demandMultiplier: data?.demandMultiplier ?? 1.0,
    isLoading,
  };
}
