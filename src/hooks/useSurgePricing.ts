import { useAvailableDriversCount } from "./useAvailableDrivers";

export interface SurgePricingInfo {
  multiplier: number;
  isActive: boolean;
  label: string;
  driverCount: number;
  isLoading: boolean;
}

/**
 * Hook to calculate surge pricing based on available driver count.
 * 
 * Surge rules:
 * - < 2 drivers online: 1.8x multiplier ("Very high demand")
 * - < 3 drivers online: 1.5x multiplier ("High demand")
 * - Otherwise: 1.0x (no surge)
 */
export function useSurgePricing(): SurgePricingInfo {
  const { count, isLoading, hasDrivers } = useAvailableDriversCount();

  // Surge rules based on driver availability
  let multiplier = 1.0;
  let label = "";

  if (count < 2) {
    multiplier = 1.8;
    label = "Very high demand";
  } else if (count < 3) {
    multiplier = 1.5;
    label = "High demand";
  }

  return {
    multiplier,
    isActive: multiplier > 1.0,
    label,
    driverCount: count,
    isLoading,
  };
}
