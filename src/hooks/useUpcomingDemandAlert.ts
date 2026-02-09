/**
 * useUpcomingDemandAlert Hook
 * 
 * Customer-facing forecast hook that checks demand_forecasts for upcoming
 * high demand or low driver coverage in a given zone.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UpcomingDemandAlert {
  isHighDemandPredicted: boolean;
  predictedIn: number | null;
  alertMessage: string | null;
  demandMultiplier: number;
  isLowCoverage: boolean;
  coverageMessage: string | null;
  isLoading: boolean;
}

export function useUpcomingDemandAlert(zoneCode?: string | null): UpcomingDemandAlert {
  const { data, isLoading } = useQuery({
    queryKey: ["upcoming-demand-alert", zoneCode ?? "all"],
    staleTime: 3 * 60 * 1000,
    refetchInterval: 3 * 60 * 1000,
    queryFn: async () => {
      const now = new Date();
      const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

      let query = supabase
        .from("demand_forecasts")
        .select("predicted_orders, predicted_drivers_needed, current_drivers_online, surge_predicted, confidence, forecast_for")
        .gte("forecast_for", now.toISOString())
        .lte("forecast_for", twoHoursLater.toISOString())
        .order("forecast_for", { ascending: true });

      if (zoneCode) {
        query = query.eq("zone_code", zoneCode);
      }

      const { data: rows, error } = await query.limit(5);
      if (error) throw error;
      if (!rows || rows.length === 0) {
        return {
          isHighDemandPredicted: false,
          predictedIn: null,
          alertMessage: null,
          demandMultiplier: 1.0,
          isLowCoverage: false,
          coverageMessage: null,
        };
      }

      // Check for surge prediction
      const surgeRow = rows.find(r => r.surge_predicted === true);
      const isHighDemandPredicted = !!surgeRow;

      let predictedIn: number | null = null;
      if (surgeRow?.forecast_for) {
        const forecastTime = new Date(surgeRow.forecast_for).getTime();
        predictedIn = Math.max(0, Math.round((forecastTime - now.getTime()) / 60000));
      }

      // Calculate demand multiplier from the nearest forecast
      const nearest = rows[0];
      const predictedOrders = nearest.predicted_orders ?? 0;
      const predictedDrivers = Math.max(nearest.predicted_drivers_needed ?? 1, 1);
      const confidence = Math.max(0, Math.min(nearest.confidence ?? 0, 1));
      const ratio = predictedOrders / predictedDrivers;

      let rawMultiplier: number;
      if (ratio > 3) rawMultiplier = 1.3;
      else if (ratio > 2) rawMultiplier = 1.15;
      else if (isHighDemandPredicted) rawMultiplier = 1.1;
      else rawMultiplier = 1.0;

      const demandMultiplier = 1 + (rawMultiplier - 1) * confidence;

      // Check for low coverage
      const driversOnline = nearest.current_drivers_online ?? 0;
      const driversNeeded = nearest.predicted_drivers_needed ?? 1;
      const isLowCoverage = driversOnline < driversNeeded * 0.5;

      return {
        isHighDemandPredicted,
        predictedIn,
        alertMessage: isHighDemandPredicted
          ? "High demand expected soon — order early for fastest delivery."
          : null,
        demandMultiplier,
        isLowCoverage,
        coverageMessage: isLowCoverage
          ? "Limited delivery drivers in this area right now."
          : null,
      };
    },
  });

  return {
    isHighDemandPredicted: data?.isHighDemandPredicted ?? false,
    predictedIn: data?.predictedIn ?? null,
    alertMessage: data?.alertMessage ?? null,
    demandMultiplier: data?.demandMultiplier ?? 1.0,
    isLowCoverage: data?.isLowCoverage ?? false,
    coverageMessage: data?.coverageMessage ?? null,
    isLoading,
  };
}
