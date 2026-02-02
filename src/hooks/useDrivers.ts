import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type DriverStatus = "pending" | "verified" | "rejected" | "suspended";

export type Driver = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  license_number: string;
  vehicle_type: string;
  vehicle_model: string | null;
  vehicle_plate: string;
  avatar_url: string | null;
  status: DriverStatus | null;
  rating: number | null;
  total_trips: number | null;
  documents_verified: boolean | null;
  current_lat: number | null;
  current_lng: number | null;
  is_online: boolean | null;
  created_at: string;
  updated_at: string;
};

export interface UseDriversOptions {
  regionId?: string | null;
}

export const useDrivers = (options?: UseDriversOptions) => {
  return useQuery({
    queryKey: ["drivers", options?.regionId],
    queryFn: async () => {
      let query = supabase
        .from("drivers")
        .select("*, regions(id, name, city, state)")
        .order("created_at", { ascending: false });

      // Filter by region if specified
      if (options?.regionId) {
        query = query.eq("region_id", options.regionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as (Driver & { regions?: { id: string; name: string; city: string; state: string } | null })[];
    },
  });
};

export const useUpdateDriverStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, documents_verified }: { id: string; status: DriverStatus; documents_verified?: boolean }) => {
      const updateData: { status: DriverStatus; documents_verified?: boolean } = { status };
      if (documents_verified !== undefined) {
        updateData.documents_verified = documents_verified;
      }

      const { error } = await supabase
        .from("drivers")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Driver status updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update driver status: " + error.message);
    },
  });
};

export const useCreateDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (driver: Omit<Driver, "id" | "created_at" | "updated_at" | "rating" | "total_trips">) => {
      const { data, error } = await supabase
        .from("drivers")
        .insert(driver)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Driver created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create driver: " + error.message);
    },
  });
};

export const useDeleteDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("drivers")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Driver deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete driver: " + error.message);
    },
  });
};
