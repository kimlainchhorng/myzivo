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

// Maximum surge multiplier cap (admin abuse prevention)
export const MAX_SURGE_MULTIPLIER = 2.5;

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
 * Fetch global surge multiplier from surge_multipliers table
 * 
 * @param supabase - Supabase client instance
 * @returns Capped multiplier from database (max 2.5x)
 */
export async function fetchGlobalSurgeMultiplier(
  supabase: SupabaseClient
): Promise<number> {
  try {
    const { data, error } = await supabase
      .from("surge_multipliers")
      .select("multiplier")
      .eq("zone", "GLOBAL")
      .single();

    if (error || !data) {
      console.warn("[fetchGlobalSurgeMultiplier] No GLOBAL surge found, defaulting to 1.0");
      return 1.0;
    }

    const multiplier = Number(data.multiplier) || 1.0;
    return Math.min(multiplier, MAX_SURGE_MULTIPLIER);
  } catch (err) {
    console.warn("[fetchGlobalSurgeMultiplier] Error:", err);
    return 1.0;
  }
}

/**
 * Derive surge level from multiplier value
 */
export function getSurgeLevelFromMultiplier(multiplier: number): SurgeLevel {
  if (multiplier <= 1.0) return "Low";
  if (multiplier <= 1.5) return "Medium";
  return "High";
}
