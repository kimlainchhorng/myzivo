import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Pricing = {
  id: string;
  vehicle_type: string;
  base_fare: number;
  per_km_rate: number;
  per_minute_rate: number;
  minimum_fare: number;
  surge_multiplier: number;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
};

export const usePricing = () => {
  return useQuery({
    queryKey: ["pricing"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing")
        .select("*")
        .order("vehicle_type");

      if (error) throw error;
      return data as Pricing[];
    },
  });
};

export const useUpdatePricing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      base_fare, 
      per_km_rate, 
      per_minute_rate, 
      minimum_fare, 
      surge_multiplier,
      is_active 
    }: Partial<Pricing> & { id: string }) => {
      const updateData: Partial<Pricing> = {};
      if (base_fare !== undefined) updateData.base_fare = base_fare;
      if (per_km_rate !== undefined) updateData.per_km_rate = per_km_rate;
      if (per_minute_rate !== undefined) updateData.per_minute_rate = per_minute_rate;
      if (minimum_fare !== undefined) updateData.minimum_fare = minimum_fare;
      if (surge_multiplier !== undefined) updateData.surge_multiplier = surge_multiplier;
      if (is_active !== undefined) updateData.is_active = is_active;

      const { error } = await supabase
        .from("pricing")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing"] });
      toast.success("Pricing updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update pricing: " + error.message);
    },
  });
};

export const useApplyGlobalSurge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (surgeMultiplier: number) => {
      const { error } = await supabase
        .from("pricing")
        .update({ surge_multiplier: surgeMultiplier })
        .gte("id", "00000000-0000-0000-0000-000000000000"); // Update all rows

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing"] });
      toast.success("Global surge applied successfully");
    },
    onError: (error) => {
      toast.error("Failed to apply global surge: " + error.message);
    },
  });
};

export const useCreatePricing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pricing: Omit<Pricing, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("pricing")
        .insert(pricing)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing"] });
      toast.success("Pricing tier created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create pricing tier: " + error.message);
    },
  });
};
