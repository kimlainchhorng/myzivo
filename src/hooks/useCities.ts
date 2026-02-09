/**
 * useCities Hook
 * Fetch available cities and handle city-related operations
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface City {
  id: string;
  name: string;
  zoneCode: string;
}

// Fetch all active cities from eats_zones
export function useActiveCities() {
  return useQuery({
    queryKey: ["active-cities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("eats_zones")
        .select("id, city_name, zone_code")
        .eq("is_active", true)
        .neq("zone_code", "DEFAULT")
        .order("city_name");

      if (error) throw error;

      return data.map(z => ({
        id: z.id,
        name: z.city_name,
        zoneCode: z.zone_code,
      })) as City[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour - cities don't change often
  });
}

// Save city preference to user profile
export function useSaveCityToProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      cityId, 
      cityName 
    }: { 
      userId: string; 
      cityId: string; 
      cityName: string;
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          selected_city_id: cityId,
          selected_city_name: cityName,
        })
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

// Get zone pricing for a specific city
export function useCityZonePricing(zoneCode: string | null) {
  return useQuery({
    queryKey: ["zone-pricing", zoneCode],
    queryFn: async () => {
      if (!zoneCode) return null;

      const { data, error } = await supabase
        .from("eats_zones")
        .select("*")
        .eq("zone_code", zoneCode)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!zoneCode,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
