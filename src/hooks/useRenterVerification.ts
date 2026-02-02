/**
 * Renter Verification Hooks
 * Hooks for managing renter verification flow
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type {
  RenterProfile,
  RenterDocument,
  RenterProfileInput,
  RenterDocumentType,
  RenterVerificationStatus,
  AdminRenterListItem,
} from "@/types/renter";

// Fetch current user's renter profile
export function useRenterProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["renterProfile", user?.id],
    queryFn: async (): Promise<RenterProfile | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("renter_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as RenterProfile | null;
    },
    enabled: !!user,
  });
}

// Check if user is verified renter
export function useIsRenterVerified() {
  const { data: profile, isLoading } = useRenterProfile();

  return {
    isVerified: profile?.verification_status === "approved" && 
      new Date(profile.license_expiration) > new Date(),
    isLoading,
    profile,
    needsVerification: !profile || profile.verification_status !== "approved",
    isExpired: profile?.license_expiration && new Date(profile.license_expiration) < new Date(),
    isPending: profile?.verification_status === "pending",
    isRejected: profile?.verification_status === "rejected",
    isSuspended: profile?.verification_status === "suspended",
  };
}

// Create renter profile
export function useCreateRenterProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RenterProfileInput) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("renter_profiles")
        .insert({
          user_id: user.id,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;
      return data as RenterProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renterProfile"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create profile");
    },
  });
}

// Update renter profile
export function useUpdateRenterProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Partial<RenterProfileInput>) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("renter_profiles")
        .update(input)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data as RenterProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renterProfile"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
}

// Fetch renter's documents
export function useRenterDocuments(renterId?: string) {
  return useQuery({
    queryKey: ["renterDocuments", renterId],
    queryFn: async (): Promise<RenterDocument[]> => {
      if (!renterId) return [];

      const { data, error } = await supabase
        .from("renter_documents")
        .select("*")
        .eq("renter_id", renterId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as RenterDocument[];
    },
    enabled: !!renterId,
  });
}

// Upload renter document
export function useUploadRenterDocument() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      renterId,
      documentType,
      file,
    }: {
      renterId: string;
      documentType: RenterDocumentType;
      file: File;
    }) => {
      if (!user) throw new Error("Must be logged in");

      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/renter/${documentType}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("p2p-documents")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("p2p-documents")
        .getPublicUrl(fileName);

      // Insert document record (upsert to handle re-upload)
      const { data, error } = await supabase
        .from("renter_documents")
        .upsert(
          {
            renter_id: renterId,
            document_type: documentType,
            file_name: file.name,
            file_url: urlData.publicUrl,
            file_size: file.size,
            mime_type: file.type,
            status: "pending",
          },
          {
            onConflict: "renter_id,document_type",
          }
        )
        .select()
        .single();

      if (error) throw error;
      return data as RenterDocument;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["renterDocuments"] });
      toast.success("Document uploaded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload document");
    },
  });
}

// ==================== ADMIN HOOKS ====================

// Fetch all renters for admin
export function useAdminRenters(status?: RenterVerificationStatus) {
  return useQuery({
    queryKey: ["adminRenters", status],
    queryFn: async (): Promise<AdminRenterListItem[]> => {
      let query = supabase
        .from("renter_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("verification_status", status);
      }

      const { data: profiles, error } = await query;
      if (error) throw error;

      // Get document counts for each renter
      const { data: documents } = await supabase
        .from("renter_documents")
        .select("renter_id, status");

      const docCounts = new Map<string, { total: number; approved: number }>();
      documents?.forEach((doc) => {
        const current = docCounts.get(doc.renter_id) || { total: 0, approved: 0 };
        current.total++;
        if (doc.status === "approved") current.approved++;
        docCounts.set(doc.renter_id, current);
      });

      // Note: We can't use auth.admin.listUsers() from client - just show user_id suffix
      return (profiles || []).map((p) => ({
        ...p,
        email: `user-${p.user_id.substring(0, 8)}@zivo`,
        documentsCount: docCounts.get(p.id)?.total || 0,
        approvedDocumentsCount: docCounts.get(p.id)?.approved || 0,
      })) as AdminRenterListItem[];
    },
  });
}

// Admin: Get renter documents
export function useAdminRenterDocuments(renterId: string) {
  return useQuery({
    queryKey: ["adminRenterDocuments", renterId],
    queryFn: async (): Promise<RenterDocument[]> => {
      if (!renterId) return [];

      const { data, error } = await supabase
        .from("renter_documents")
        .select("*")
        .eq("renter_id", renterId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as RenterDocument[];
    },
    enabled: !!renterId,
  });
}

// Admin: Update renter verification status
export function useUpdateRenterStatus() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      renterId,
      status,
      rejectionReason,
    }: {
      renterId: string;
      status: RenterVerificationStatus;
      rejectionReason?: string;
    }) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("renter_profiles")
        .update({
          verification_status: status,
          rejection_reason: rejectionReason || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq("id", renterId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminRenters"] });
      toast.success(
        variables.status === "approved"
          ? "Renter approved successfully"
          : variables.status === "rejected"
          ? "Renter rejected"
          : "Renter status updated"
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update status");
    },
  });
}

// Admin: Update document status
export function useUpdateRenterDocumentStatus() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentId,
      status,
      notes,
    }: {
      documentId: string;
      status: "approved" | "rejected";
      notes?: string;
    }) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("renter_documents")
        .update({
          status,
          notes: notes || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq("id", documentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRenterDocuments"] });
      toast.success("Document status updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update document");
    },
  });
}

// Admin: Get renter stats
export function useAdminRenterStats() {
  return useQuery({
    queryKey: ["adminRenterStats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("renter_profiles")
        .select("verification_status");

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        suspended: 0,
      };

      data?.forEach((r) => {
        if (r.verification_status === "pending") stats.pending++;
        else if (r.verification_status === "approved") stats.approved++;
        else if (r.verification_status === "rejected") stats.rejected++;
        else if (r.verification_status === "suspended") stats.suspended++;
      });

      return stats;
    },
  });
}
