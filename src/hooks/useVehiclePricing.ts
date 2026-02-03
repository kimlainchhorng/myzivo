/**
 * Vehicle Pricing Hooks
 * Dynamic pricing calculation and management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { differenceInDays, isWeekend, eachDayOfInterval, format } from "date-fns";

export interface SeasonalPricing {
  id: string;
  vehicle_id: string;
  name: string;
  start_date: string;
  end_date: string;
  daily_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PricingBreakdown {
  baseDays: number;
  weekendDays: number;
  baseRate: number;
  weekendRate: number;
  baseSubtotal: number;
  weekendSubtotal: number;
  seasonalSubtotal: number;
  seasonalDays: number;
  subtotal: number;
  discountType: "weekly" | "monthly" | null;
  discountPercent: number;
  discountAmount: number;
  cleaningFee: number;
  serviceFee: number;
  totalBeforeDeposit: number;
  depositAmount: number;
  grandTotal: number;
  isLongTerm: boolean;
}

export interface VehiclePricingConfig {
  base_daily_rate: number;
  weekend_rate: number | null;
  weekly_discount_percent: number;
  monthly_discount_percent: number;
  min_rental_days: number;
  max_rental_days: number;
  cleaning_fee: number;
  extra_mileage_fee: number;
  late_return_fee_per_hour: number;
  included_miles_per_day: number;
  deposit_amount: number;
}

// Fetch vehicle's seasonal pricing
export function useVehicleSeasonalPricing(vehicleId: string | undefined) {
  return useQuery({
    queryKey: ["vehicleSeasonalPricing", vehicleId],
    queryFn: async (): Promise<SeasonalPricing[]> => {
      if (!vehicleId) return [];

      const { data, error } = await supabase
        .from("vehicle_seasonal_pricing")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .eq("is_active", true)
        .order("start_date");

      if (error) throw error;
      return data || [];
    },
    enabled: !!vehicleId,
  });
}

// Create seasonal pricing
export function useCreateSeasonalPricing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pricing: Omit<SeasonalPricing, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("vehicle_seasonal_pricing")
        .insert(pricing)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vehicleSeasonalPricing", variables.vehicle_id] });
      toast.success("Seasonal pricing created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create seasonal pricing");
    },
  });
}

// Update seasonal pricing
export function useUpdateSeasonalPricing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SeasonalPricing> & { id: string }) => {
      const { data, error } = await supabase
        .from("vehicle_seasonal_pricing")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicleSeasonalPricing"] });
      toast.success("Seasonal pricing updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update seasonal pricing");
    },
  });
}

// Delete seasonal pricing
export function useDeleteSeasonalPricing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("vehicle_seasonal_pricing")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicleSeasonalPricing"] });
      toast.success("Seasonal pricing deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete seasonal pricing");
    },
  });
}

// Calculate pricing for a date range
export function calculatePricing(
  startDate: Date,
  endDate: Date,
  config: VehiclePricingConfig,
  seasonalPricing: SeasonalPricing[] = [],
  serviceFeePercent: number = 10
): PricingBreakdown {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const totalDays = days.length;

  let baseRate = config.base_daily_rate;
  let weekendRate = config.weekend_rate || baseRate;
  
  let baseDays = 0;
  let weekendDays = 0;
  let seasonalDays = 0;
  let seasonalSubtotal = 0;

  // Calculate day-by-day pricing
  days.forEach(day => {
    const dateStr = format(day, "yyyy-MM-dd");
    
    // Check for seasonal pricing
    const seasonal = seasonalPricing.find(sp => 
      dateStr >= sp.start_date && dateStr <= sp.end_date
    );

    if (seasonal) {
      seasonalDays++;
      seasonalSubtotal += seasonal.daily_rate;
    } else if (isWeekend(day)) {
      weekendDays++;
    } else {
      baseDays++;
    }
  });

  const baseSubtotal = baseDays * baseRate;
  const weekendSubtotal = weekendDays * weekendRate;
  let subtotal = baseSubtotal + weekendSubtotal + seasonalSubtotal;

  // Calculate discounts
  let discountType: "weekly" | "monthly" | null = null;
  let discountPercent = 0;
  
  if (totalDays >= 30 && config.monthly_discount_percent > 0) {
    discountType = "monthly";
    discountPercent = config.monthly_discount_percent;
  } else if (totalDays >= 7 && config.weekly_discount_percent > 0) {
    discountType = "weekly";
    discountPercent = config.weekly_discount_percent;
  }

  const discountAmount = Math.round((subtotal * discountPercent) / 100 * 100) / 100;
  subtotal -= discountAmount;

  const cleaningFee = config.cleaning_fee || 0;
  const serviceFee = Math.round((subtotal * serviceFeePercent) / 100 * 100) / 100;
  const totalBeforeDeposit = subtotal + cleaningFee + serviceFee;
  const depositAmount = config.deposit_amount || 0;
  const grandTotal = totalBeforeDeposit + depositAmount;

  return {
    baseDays,
    weekendDays,
    baseRate,
    weekendRate,
    baseSubtotal,
    weekendSubtotal,
    seasonalSubtotal,
    seasonalDays,
    subtotal: baseSubtotal + weekendSubtotal + seasonalSubtotal,
    discountType,
    discountPercent,
    discountAmount,
    cleaningFee,
    serviceFee,
    totalBeforeDeposit,
    depositAmount,
    grandTotal,
    isLongTerm: totalDays >= 7,
  };
}

// Hook to calculate pricing with data fetching
export function useCalculatePricing(
  vehicleId: string | undefined,
  startDate: Date | null,
  endDate: Date | null
) {
  const { data: seasonalPricing = [] } = useVehicleSeasonalPricing(vehicleId);

  return useQuery({
    queryKey: ["pricingCalculation", vehicleId, startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async (): Promise<PricingBreakdown | null> => {
      if (!vehicleId || !startDate || !endDate) return null;

      // Fetch vehicle pricing config
      const { data: vehicle, error } = await supabase
        .from("p2p_vehicles")
        .select(`
          base_daily_rate, daily_rate, weekend_rate,
          weekly_discount_percent, monthly_discount_percent,
          min_rental_days, max_rental_days,
          cleaning_fee, extra_mileage_fee,
          late_return_fee_per_hour, included_miles_per_day,
          deposit_amount
        `)
        .eq("id", vehicleId)
        .single();

      if (error) throw error;

      const config: VehiclePricingConfig = {
        base_daily_rate: vehicle.base_daily_rate || vehicle.daily_rate || 0,
        weekend_rate: vehicle.weekend_rate,
        weekly_discount_percent: vehicle.weekly_discount_percent || 0,
        monthly_discount_percent: vehicle.monthly_discount_percent || 0,
        min_rental_days: vehicle.min_rental_days || 1,
        max_rental_days: vehicle.max_rental_days || 90,
        cleaning_fee: vehicle.cleaning_fee || 0,
        extra_mileage_fee: vehicle.extra_mileage_fee || 0,
        late_return_fee_per_hour: vehicle.late_return_fee_per_hour || 25,
        included_miles_per_day: vehicle.included_miles_per_day || 200,
        deposit_amount: vehicle.deposit_amount || 300,
      };

      return calculatePricing(startDate, endDate, config, seasonalPricing);
    },
    enabled: !!vehicleId && !!startDate && !!endDate,
  });
}
