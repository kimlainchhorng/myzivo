/**
 * Admin P2P Hooks
 * Hooks for admin-side P2P car rental management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { 
  CarOwnerProfile, 
  CarOwnerDocument,
  CarOwnerStatus,
  DocumentReviewStatus,
  AdminOwnerListItem
} from "@/types/p2p";
import { toast } from "sonner";

// Fetch all car owners (admin only)
export function useCarOwners(status?: CarOwnerStatus) {
  const { isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ["adminCarOwners", status],
    queryFn: async (): Promise<AdminOwnerListItem[]> => {
      let query = supabase
        .from("car_owner_profiles")
        .select(`
          *,
          car_owner_documents(id, status)
        `)
        .order("created_at", { ascending: false });
      
      if (status) {
        query = query.eq("status", status);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform to include document counts
      return (data || []).map(owner => {
        const docs = owner.car_owner_documents || [];
        return {
          ...owner,
          car_owner_documents: undefined,
          documentsCount: docs.length,
          approvedDocumentsCount: docs.filter((d: any) => d.status === "approved").length,
        } as AdminOwnerListItem;
      });
    },
    enabled: isAdmin,
  });
}

// Fetch owner stats for admin dashboard
export function useAdminOwnerStats() {
  const { isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ["adminOwnerStats"],
    queryFn: async () => {
      const { count: total } = await supabase
        .from("car_owner_profiles")
        .select("*", { count: "exact", head: true });
      
      const { count: pending } = await supabase
        .from("car_owner_profiles")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      
      const { count: verified } = await supabase
        .from("car_owner_profiles")
        .select("*", { count: "exact", head: true })
        .eq("status", "verified");
      
      const { count: suspended } = await supabase
        .from("car_owner_profiles")
        .select("*", { count: "exact", head: true })
        .eq("status", "suspended");
      
      return {
        total: total || 0,
        pending: pending || 0,
        verified: verified || 0,
        suspended: suspended || 0,
      };
    },
    enabled: isAdmin,
  });
}

// Update owner status (admin only)
export function useUpdateOwnerStatus() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      ownerId, 
      status,
      adminNotes,
    }: { 
      ownerId: string; 
      status: CarOwnerStatus;
      adminNotes?: string;
    }) => {
      const { data, error } = await supabase
        .from("car_owner_profiles")
        .update({ 
          status,
          admin_review_notes: adminNotes,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", ownerId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["adminCarOwners"] });
      queryClient.invalidateQueries({ queryKey: ["adminOwnerStats"] });
      toast.success(`Owner ${status === "verified" ? "approved" : status} successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update owner status");
    },
  });
}

// Fetch owner documents (admin only)
export function useAdminOwnerDocuments(ownerId: string) {
  const { isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ["adminOwnerDocuments", ownerId],
    queryFn: async (): Promise<CarOwnerDocument[]> => {
      const { data, error } = await supabase
        .from("car_owner_documents")
        .select("*")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin && !!ownerId,
  });
}

// Update document status (admin only)
export function useUpdateDocumentStatus() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      documentId, 
      status,
      notes 
    }: { 
      documentId: string; 
      status: DocumentReviewStatus;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("car_owner_documents")
        .update({ 
          status,
          notes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq("id", documentId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["adminOwnerDocuments"] });
      queryClient.invalidateQueries({ queryKey: ["ownerDocuments"] });
      toast.success(`Document ${status} successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update document status");
    },
  });
}

// Check if all documents are approved for an owner
export function useCheckDocumentsVerified(ownerId: string) {
  const { isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ["documentsVerified", ownerId],
    queryFn: async (): Promise<boolean> => {
      const { data: docs, error } = await supabase
        .from("car_owner_documents")
        .select("status")
        .eq("owner_id", ownerId);
      
      if (error) throw error;
      
      if (!docs || docs.length === 0) return false;
      
      // Check if all documents are approved
      return docs.every(doc => doc.status === "approved");
    },
    enabled: isAdmin && !!ownerId,
  });
}

// Update owner documents_verified flag
export function useUpdateDocumentsVerified() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      ownerId, 
      verified 
    }: { 
      ownerId: string; 
      verified: boolean;
    }) => {
      const { data, error } = await supabase
        .from("car_owner_profiles")
        .update({ 
          documents_verified: verified,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ownerId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCarOwners"] });
    },
  });
}
