/**
 * Zone Pricing Admin Hooks
 * CRUD operations for managing zone pricing rates
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PricingZone {
  id: string;
  name: string;
  state: string;
  country: string;
  min_lat: number;
  max_lat: number;
  min_lng: number;
  max_lng: number;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
}

export interface ZonePricingRate {
  id: string;
  zone_id: string;
  ride_type: string;
  base_fare: number;
  per_mile: number;
  per_minute: number;
  booking_fee: number;
  minimum_fare: number;
  multiplier: number;
  created_at?: string;
  updated_at?: string;
}

export type CreateZonePricingRate = Omit<ZonePricingRate, "id" | "created_at" | "updated_at">;
export type UpdateZonePricingRate = Partial<Omit<ZonePricingRate, "id" | "zone_id" | "created_at" | "updated_at">> & { id: string };

/**
 * Fetch all pricing zones for the dropdown
 */
export function useAllZones() {
  return useQuery({
    queryKey: ["pricing-zones-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_zones")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as PricingZone[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch all rates for a specific zone
 */
export function useZoneRates(zoneId: string | null) {
  return useQuery({
    queryKey: ["zone-pricing-rates-admin", zoneId],
    queryFn: async () => {
      if (!zoneId) return [];

      const { data, error } = await supabase
        .from("zone_pricing_rates")
        .select("*")
        .eq("zone_id", zoneId)
        .order("ride_type");

      if (error) throw error;
      return data as ZonePricingRate[];
    },
    enabled: !!zoneId,
    staleTime: 30 * 1000, // Shorter cache for admin
  });
}

/**
 * Update an existing rate
 */
export function useUpdateZoneRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rate: UpdateZonePricingRate) => {
      const { id, ...updateData } = rate;
      
      const { data, error } = await supabase
        .from("zone_pricing_rates")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["zone-pricing-rates-admin"] });
      queryClient.invalidateQueries({ queryKey: ["zone-pricing-rates"] });
      queryClient.invalidateQueries({ queryKey: ["zone-pricing-rates-map"] });
      toast.success(`Rate for ${data.ride_type} updated`);
    },
    onError: (error) => {
      console.error("Failed to update rate:", error);
      toast.error("Failed to update rate");
    },
  });
}

/**
 * Create a new rate
 */
export function useCreateZoneRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rate: CreateZonePricingRate) => {
      const { data, error } = await supabase
        .from("zone_pricing_rates")
        .insert(rate)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["zone-pricing-rates-admin"] });
      queryClient.invalidateQueries({ queryKey: ["zone-pricing-rates"] });
      queryClient.invalidateQueries({ queryKey: ["zone-pricing-rates-map"] });
      toast.success(`Rate for ${data.ride_type} created`);
    },
    onError: (error: any) => {
      console.error("Failed to create rate:", error);
      if (error?.code === "23505") {
        toast.error("This ride type already exists in this zone");
      } else {
        toast.error("Failed to create rate");
      }
    },
  });
}

/**
 * Delete a rate
 */
export function useDeleteZoneRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("zone_pricing_rates")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zone-pricing-rates-admin"] });
      queryClient.invalidateQueries({ queryKey: ["zone-pricing-rates"] });
      queryClient.invalidateQueries({ queryKey: ["zone-pricing-rates-map"] });
      toast.success("Rate deleted");
    },
    onError: (error) => {
      console.error("Failed to delete rate:", error);
      toast.error("Failed to delete rate");
    },
  });
}

/**
 * Calculate fare preview
 */
export function calculateFarePreview(
  rate: Pick<ZonePricingRate, "base_fare" | "per_mile" | "per_minute" | "booking_fee" | "minimum_fare" | "multiplier">,
  miles: number = 10,
  minutes: number = 25
): number {
  const subtotal = rate.base_fare + (miles * rate.per_mile) + (minutes * rate.per_minute) + rate.booking_fee;
  const beforeMultiplier = Math.max(subtotal, rate.minimum_fare);
  return Math.round(beforeMultiplier * rate.multiplier * 100) / 100;
}
