/**
 * Car Owner Hooks
 * Hooks for owner-side P2P car rental operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { 
  CarOwnerProfile, 
  CarOwnerProfileInsert, 
  CarOwnerProfileUpdate,
  CarOwnerDocument,
  CarOwnerDocumentInsert,
  OwnerStats,
  CarOwnerDocumentType
} from "@/types/p2p";
import { toast } from "sonner";

// Fetch current user's owner profile
export function useCarOwnerProfile() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["carOwnerProfile", user?.id],
    queryFn: async (): Promise<CarOwnerProfile | null> => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("car_owner_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

// Create owner profile (application)
export function useCreateOwnerProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<CarOwnerProfileInsert, "user_id">) => {
      if (!user) throw new Error("Must be logged in");
      
      const { data: profile, error } = await supabase
        .from("car_owner_profiles")
        .insert({
          ...data,
          user_id: user.id,
          status: "pending",
        })
        .select()
        .single();
      
      if (error) throw error;
      return profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carOwnerProfile"] });
      toast.success("Application submitted successfully!");
    },
    onError: (error: Error) => {
      console.error("Failed to create owner profile:", error);
      toast.error(error.message || "Failed to submit application");
    },
  });
}

// Update owner profile
export function useUpdateOwnerProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: CarOwnerProfileUpdate & { id: string }) => {
      if (!user) throw new Error("Must be logged in");
      
      const { data: profile, error } = await supabase
        .from("car_owner_profiles")
        .update(data)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();
      
      if (error) throw error;
      return profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carOwnerProfile"] });
      toast.success("Profile updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
}

// Fetch owner's documents
export function useOwnerDocuments(ownerId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["ownerDocuments", ownerId || user?.id],
    queryFn: async (): Promise<CarOwnerDocument[]> => {
      if (!ownerId && !user) return [];
      
      let query = supabase
        .from("car_owner_documents")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (ownerId) {
        query = query.eq("owner_id", ownerId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!(ownerId || user),
  });
}

// Upload document to storage and create record
export function useUploadOwnerDocument() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      ownerId, 
      documentType, 
      file 
    }: { 
      ownerId: string; 
      documentType: CarOwnerDocumentType; 
      file: File 
    }) => {
      if (!user) throw new Error("Must be logged in");
      
      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${documentType}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("p2p-documents")
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from("p2p-documents")
        .getPublicUrl(filePath);
      
      // Create document record
      const { data: doc, error: docError } = await supabase
        .from("car_owner_documents")
        .insert({
          owner_id: ownerId,
          document_type: documentType,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_size: file.size,
          mime_type: file.type,
          status: "pending",
        })
        .select()
        .single();
      
      if (docError) throw docError;
      return doc;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ownerDocuments"] });
      toast.success("Document uploaded successfully");
    },
    onError: (error: Error) => {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload document");
    },
  });
}

// Fetch owner stats for dashboard
export function useOwnerStats(ownerId?: string) {
  const { user } = useAuth();
  const { data: profile } = useCarOwnerProfile();
  const effectiveOwnerId = ownerId || profile?.id;
  
  return useQuery({
    queryKey: ["ownerStats", effectiveOwnerId],
    queryFn: async (): Promise<OwnerStats> => {
      if (!effectiveOwnerId) {
        return {
          totalVehicles: 0,
          activeBookings: 0,
          totalTrips: 0,
          totalEarnings: 0,
          pendingPayouts: 0,
          averageRating: null,
        };
      }
      
      // Get vehicle count
      const { count: vehiclesCount } = await supabase
        .from("p2p_vehicles")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", effectiveOwnerId);
      
      // Get active bookings
      const { count: activeBookingsCount } = await supabase
        .from("p2p_bookings")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", effectiveOwnerId)
        .in("status", ["confirmed", "active"]);
      
      // Get completed trips and earnings
      const { data: completedBookings } = await supabase
        .from("p2p_bookings")
        .select("owner_payout")
        .eq("owner_id", effectiveOwnerId)
        .eq("status", "completed");
      
      const totalTrips = completedBookings?.length || 0;
      const totalEarnings = completedBookings?.reduce((sum, b) => sum + (b.owner_payout || 0), 0) || 0;
      
      // Get pending payouts
      const { data: pendingPayouts } = await supabase
        .from("p2p_payouts")
        .select("amount")
        .eq("owner_id", effectiveOwnerId)
        .eq("status", "pending");
      
      const pendingPayoutsTotal = pendingPayouts?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      
      // Get average rating from profile
      const { data: ownerProfile } = await supabase
        .from("car_owner_profiles")
        .select("rating")
        .eq("id", effectiveOwnerId)
        .single();
      
      return {
        totalVehicles: vehiclesCount || 0,
        activeBookings: activeBookingsCount || 0,
        totalTrips,
        totalEarnings,
        pendingPayouts: pendingPayoutsTotal,
        averageRating: ownerProfile?.rating || null,
      };
    },
    enabled: !!effectiveOwnerId,
  });
}
