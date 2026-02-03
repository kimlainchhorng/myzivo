/**
 * Car Rental Settings Hook
 * Global settings for owner-listed vs affiliate mode
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CarRentalSettings {
  id: string;
  mode: "owner_listed" | "affiliate" | "hybrid";
  default_commission_percent: number;
  min_vehicle_year: number;
  instant_book_enabled: boolean;
  require_owner_verification: boolean;
  require_renter_verification: boolean;
  insurance_required: boolean;
  is_active: boolean;
  updated_at: string;
  updated_by: string | null;
}

// Fetch car rental settings
export function useCarRentalSettings() {
  return useQuery({
    queryKey: ["carRentalSettings"],
    queryFn: async (): Promise<CarRentalSettings | null> => {
      const { data, error } = await supabase
        .from("car_rental_settings")
        .select("*")
        .single();

      if (error) {
        console.error("Failed to fetch car rental settings:", error);
        return null;
      }
      return data as CarRentalSettings;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

// Check if car rental is in owner-listed mode
export function useIsOwnerListedMode() {
  const { data: settings } = useCarRentalSettings();
  return settings?.mode === "owner_listed" || settings?.mode === "hybrid";
}

// Admin: Update car rental settings
export function useUpdateCarRentalSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<CarRentalSettings>) => {
      const { data, error } = await supabase
        .from("car_rental_settings")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carRentalSettings"] });
      toast.success("Car rental settings updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update settings");
    },
  });
}
