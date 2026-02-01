/**
 * ZIVO Zone Pricing Hooks
 * Fetch and manage zone-based pricing for Rides and Eats
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  RideZone, 
  EatsZone, 
  DEFAULT_RIDE_ZONE, 
  DEFAULT_EATS_ZONE 
} from "@/lib/pricing";

// ==================== RIDE ZONES ====================

export const useRideZones = () => {
  return useQuery({
    queryKey: ["ride-zones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ride_zones")
        .select("*")
        .eq("is_active", true)
        .order("city_name");

      if (error) throw error;
      return data as RideZone[];
    },
  });
};

export const useRideZone = (zoneCode: string) => {
  return useQuery({
    queryKey: ["ride-zone", zoneCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ride_zones")
        .select("*")
        .eq("zone_code", zoneCode)
        .eq("is_active", true)
        .single();

      if (error) {
        // Return default if zone not found
        return DEFAULT_RIDE_ZONE;
      }
      return data as RideZone;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useUpdateRideZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (zone: Partial<RideZone> & { id: string }) => {
      const { id, ...updateData } = zone;
      const { error } = await supabase
        .from("ride_zones")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ride-zones"] });
      queryClient.invalidateQueries({ queryKey: ["ride-zone"] });
      toast.success("Ride zone updated");
    },
    onError: (error) => {
      toast.error("Failed to update zone: " + error.message);
    },
  });
};

export const useCreateRideZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (zone: Omit<RideZone, "id">) => {
      const { data, error } = await supabase
        .from("ride_zones")
        .insert(zone)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ride-zones"] });
      toast.success("Ride zone created");
    },
    onError: (error) => {
      toast.error("Failed to create zone: " + error.message);
    },
  });
};

export const useUpdateSurgeMultiplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ zoneCode, multiplier }: { zoneCode: string; multiplier: number }) => {
      const { error } = await supabase
        .from("ride_zones")
        .update({ surge_multiplier: multiplier })
        .eq("zone_code", zoneCode);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ride-zones"] });
      queryClient.invalidateQueries({ queryKey: ["ride-zone"] });
      toast.success("Surge multiplier updated");
    },
    onError: (error) => {
      toast.error("Failed to update surge: " + error.message);
    },
  });
};

// ==================== EATS ZONES ====================

export const useEatsZones = () => {
  return useQuery({
    queryKey: ["eats-zones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("eats_zones")
        .select("*")
        .eq("is_active", true)
        .order("city_name");

      if (error) throw error;
      return data as EatsZone[];
    },
  });
};

export const useEatsZone = (zoneCode: string) => {
  return useQuery({
    queryKey: ["eats-zone", zoneCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("eats_zones")
        .select("*")
        .eq("zone_code", zoneCode)
        .eq("is_active", true)
        .single();

      if (error) {
        return DEFAULT_EATS_ZONE;
      }
      return data as EatsZone;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateEatsZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (zone: Partial<EatsZone> & { id: string }) => {
      const { id, ...updateData } = zone;
      const { error } = await supabase
        .from("eats_zones")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eats-zones"] });
      queryClient.invalidateQueries({ queryKey: ["eats-zone"] });
      toast.success("Eats zone updated");
    },
    onError: (error) => {
      toast.error("Failed to update zone: " + error.message);
    },
  });
};

export const useCreateEatsZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (zone: Omit<EatsZone, "id">) => {
      const { data, error } = await supabase
        .from("eats_zones")
        .insert(zone)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eats-zones"] });
      toast.success("Eats zone created");
    },
    onError: (error) => {
      toast.error("Failed to create zone: " + error.message);
    },
  });
};
