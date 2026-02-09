/**
 * useLearnedPrepTime Hook
 * Fetches restaurant's learned average prep time from historical data
 * Falls back to restaurant default when insufficient data
 */
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PrepConfidence = "high" | "medium" | "low";

export interface LearnedPrepTimeResult {
  avgPrepMinutes: number | null;
  isLearned: boolean; // true = from actual data, false = from default
  sampleSize: number; // number of orders used to calculate
  confidence: PrepConfidence; // based on sample size
  source: "sla_metrics" | "order_timestamps" | "restaurant_default" | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Get confidence level based on sample size
 */
function getConfidence(sampleSize: number): PrepConfidence {
  if (sampleSize >= 20) return "high";
  if (sampleSize >= 5) return "medium";
  return "low";
}

export function useLearnedPrepTime(
  restaurantId: string | undefined
): LearnedPrepTimeResult {
  const [result, setResult] = useState<LearnedPrepTimeResult>({
    avgPrepMinutes: null,
    isLearned: false,
    sampleSize: 0,
    confidence: "low",
    source: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!restaurantId) {
      setResult((prev) => ({ ...prev, loading: false }));
      return;
    }

    let cancelled = false;

    async function fetchLearnedPrepTime() {
      try {
        // Call the database function
        const { data, error } = await supabase.rpc(
          "get_restaurant_avg_prep_time",
          { p_restaurant_id: restaurantId }
        );

        if (cancelled) return;

        if (error) throw error;

        if (data && data.length > 0) {
          const row = data[0];
          const source = row.source as
            | "sla_metrics"
            | "order_timestamps"
            | "restaurant_default";
          const sampleSize = row.sample_size || 0;

          setResult({
            avgPrepMinutes: row.avg_prep_minutes
              ? Number(row.avg_prep_minutes)
              : null,
            isLearned: source !== "restaurant_default",
            sampleSize,
            confidence: getConfidence(sampleSize),
            source,
            loading: false,
            error: null,
          });
        } else {
          // No data returned, use default
          setResult({
            avgPrepMinutes: 25,
            isLearned: false,
            sampleSize: 0,
            confidence: "low",
            source: "restaurant_default",
            loading: false,
            error: null,
          });
        }
      } catch (e) {
        if (cancelled) return;
        setResult((prev) => ({
          ...prev,
          loading: false,
          error: e as Error,
        }));
      }
    }

    fetchLearnedPrepTime();

    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  return result;
}
