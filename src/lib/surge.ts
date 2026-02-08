/**
 * Surge Pricing Calculation Module
 * 
 * Implements demand-based surge pricing:
 * - ratio < 1.0: 1.0x (Low)
 * - ratio 1.0–1.5: 1.1x (Medium)
 * - ratio 1.5–2.0: 1.25x (Medium)
 * - ratio 2.0–3.0: 1.5x (High)
 * - ratio > 3.0 or no drivers: 2.0x (High)
 * 
 * Where ratio = requestedCount / max(1, availableDrivers)
 */

import { SupabaseClient } from "@supabase/supabase-js";

export type SurgeLevel = "Low" | "Medium" | "High";

export interface SurgeResult {
  multiplier: number;
  level: SurgeLevel;
  finalPrice: number;
}

export interface DemandMetrics {
  requestedCount: number;
  availableDrivers: number;
}

/**
 * Calculate surge pricing based on demand vs supply ratio
 */
export function calculateSurge({
  requestedCount,
  availableDrivers,
  basePrice,
}: {
  requestedCount: number;
  availableDrivers: number;
  basePrice: number;
}): SurgeResult {
  let multiplier = 1.0;
  let level: SurgeLevel = "Low";

  if (availableDrivers <= 0) {
    multiplier = 2.0;
    level = "High";
  } else {
    const ratio = requestedCount / Math.max(1, availableDrivers);

    if (ratio > 3.0) {
      multiplier = 2.0;
      level = "High";
    } else if (ratio >= 2.0) {
      multiplier = 1.5;
      level = "High";
    } else if (ratio >= 1.5) {
      multiplier = 1.25;
      level = "Medium";
    } else if (ratio >= 1.0) {
      multiplier = 1.1;
      level = "Medium";
    }
    // ratio < 1.0 remains at 1.0x, "Low"
  }

  return {
    multiplier,
    level,
    finalPrice: Math.round(basePrice * multiplier * 100) / 100,
  };
}

/**
 * Fetch live demand metrics from Supabase
 * 
 * @param supabase - Supabase client instance
 * @param windowMinutes - Time window for counting active rides (default: 5 min)
 * @returns Demand metrics with requestedCount and availableDrivers
 */
export async function getDemandMetrics(
  supabase: SupabaseClient,
  windowMinutes: number = 5
): Promise<DemandMetrics> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);
  const driverActiveThreshold = new Date(now.getTime() - 2 * 60 * 1000);

  // Count rides in 'requested', 'accepted', or 'en_route' status from last N minutes
  const { count: requestedCount, error: ridesError } = await supabase
    .from("trips")
    .select("*", { count: "exact", head: true })
    .in("status", ["requested", "accepted", "en_route"])
    .gte("created_at", windowStart.toISOString());

  if (ridesError) {
    console.warn("[getDemandMetrics] Failed to fetch rides count:", ridesError);
  }

  // Count online drivers that were updated within last 2 min (actively pinging)
  const { count: availableDrivers, error: driversError } = await supabase
    .from("drivers")
    .select("*", { count: "exact", head: true })
    .eq("is_online", true)
    .eq("status", "verified")
    .gte("updated_at", driverActiveThreshold.toISOString());

  if (driversError) {
    console.warn("[getDemandMetrics] Failed to fetch drivers count:", driversError);
  }

  return {
    requestedCount: requestedCount || 0,
    availableDrivers: availableDrivers || 0,
  };
}
