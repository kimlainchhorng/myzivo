/**
 * P2P Vehicle Hooks
 * Hooks for vehicle management in the P2P car rental marketplace
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCarOwnerProfile } from "./useCarOwner";
import type { P2PVehicle, P2PVehicleInsert, P2PVehicleUpdate } from "@/types/p2p";
import { toast } from "sonner";

// Fetch owner's vehicles
export function useOwnerVehicles() {
  const { data: profile } = useCarOwnerProfile();
  
  return useQuery({
    queryKey: ["ownerVehicles", profile?.id],
    queryFn: async (): Promise<P2PVehicle[]> => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from("p2p_vehicles")
        .select("*")
        .eq("owner_id", profile.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });
}

// Fetch single vehicle by ID
export function useVehicle(vehicleId: string | undefined) {
  return useQuery({
    queryKey: ["p2pVehicle", vehicleId],
    queryFn: async (): Promise<P2PVehicle | null> => {
      if (!vehicleId) return null;
      
      const { data, error } = await supabase
        .from("p2p_vehicles")
        .select("*")
        .eq("id", vehicleId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!vehicleId,
  });
}

// Create new vehicle
export function useCreateVehicle() {
  const { data: profile } = useCarOwnerProfile();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<P2PVehicleInsert, "owner_id">) => {
      if (!profile?.id) throw new Error("Owner profile not found");
      
      const { data: vehicle, error } = await supabase
        .from("p2p_vehicles")
        .insert({
          ...data,
          owner_id: profile.id,
          approval_status: "pending",
        })
        .select()
        .single();
      
      if (error) throw error;
      return vehicle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ownerVehicles"] });
      toast.success("Vehicle submitted for approval!");
    },
    onError: (error: Error) => {
      console.error("Failed to create vehicle:", error);
      toast.error(error.message || "Failed to add vehicle");
    },
  });
}

// Update existing vehicle
export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: P2PVehicleUpdate & { id: string }) => {
      const { data: vehicle, error } = await supabase
        .from("p2p_vehicles")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return vehicle;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ownerVehicles"] });
      queryClient.invalidateQueries({ queryKey: ["p2pVehicle", variables.id] });
      toast.success("Vehicle updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update vehicle");
    },
  });
}

// Delete vehicle
export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (vehicleId: string) => {
      const { error } = await supabase
        .from("p2p_vehicles")
        .delete()
        .eq("id", vehicleId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ownerVehicles"] });
      toast.success("Vehicle deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete vehicle");
    },
  });
}

// Upload vehicle image
export function useUploadVehicleImage() {
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ file, vehicleId }: { file: File; vehicleId?: string }) => {
      if (!user) throw new Error("Must be logged in");
      
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${vehicleId || "new"}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("p2p-vehicle-images")
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage
        .from("p2p-vehicle-images")
        .getPublicUrl(fileName);
      
      return urlData.publicUrl;
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload image");
    },
  });
}

// Vehicle availability hooks
export function useVehicleAvailability(vehicleId: string | undefined, month?: Date) {
  const startDate = month ? new Date(month.getFullYear(), month.getMonth(), 1) : new Date();
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
  
  return useQuery({
    queryKey: ["vehicleAvailability", vehicleId, startDate.toISOString()],
    queryFn: async () => {
      if (!vehicleId) return [];
      
      const { data, error } = await supabase
        .from("vehicle_availability")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .gte("date", startDate.toISOString().split("T")[0])
        .lte("date", endDate.toISOString().split("T")[0]);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!vehicleId,
  });
}

export function useUpdateVehicleAvailability() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      vehicleId, 
      dates, 
      isAvailable 
    }: { 
      vehicleId: string; 
      dates: string[]; 
      isAvailable: boolean;
    }) => {
      // Upsert availability records for each date
      const records = dates.map(date => ({
        vehicle_id: vehicleId,
        date,
        is_available: isAvailable,
      }));
      
      const { error } = await supabase
        .from("vehicle_availability")
        .upsert(records, { onConflict: "vehicle_id,date" });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicleAvailability"] });
      toast.success("Availability updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update availability");
    },
  });
}

// Admin hooks for vehicle management
export function useAdminVehicles(filters?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: ["adminP2PVehicles", filters],
    queryFn: async () => {
      let query = supabase
        .from("p2p_vehicles")
        .select(`
          *,
          owner:car_owner_profiles!p2p_vehicles_owner_id_fkey(
            id, full_name, email, phone
          )
        `)
        .order("created_at", { ascending: false });
      
      if (filters?.status && filters.status !== "all") {
        query = query.eq("approval_status", filters.status as "pending" | "approved" | "rejected" | "suspended");
      }
      
      if (filters?.search) {
        query = query.or(`make.ilike.%${filters.search}%,model.ilike.%${filters.search}%,vin.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useUpdateVehicleStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      vehicleId, 
      status 
    }: { 
      vehicleId: string; 
      status: "pending" | "approved" | "rejected" | "suspended";
    }) => {
      const { data, error } = await supabase
        .from("p2p_vehicles")
        .update({ approval_status: status as "pending" | "approved" | "rejected" | "suspended" })
        .eq("id", vehicleId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminP2PVehicles"] });
      toast.success("Vehicle status updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update status");
    },
  });
}
