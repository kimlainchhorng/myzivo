/**
 * KYC Hooks for driver and merchant verification
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { 
  KYCRole, 
  KYCStatus, 
  KYCSubmission, 
  KYCDocument,
  DriverPersonalInfo,
  MerchantBusinessInfo
} from "@/lib/kyc";
import { mapKYCSubmission } from "@/lib/kyc";
import type { Json } from "@/integrations/supabase/types";

// =============================================================================
// USER HOOKS
// =============================================================================

/**
 * Get current user's KYC submission for a specific role
 */
export function useKYCSubmission(role: KYCRole) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["kyc-submission", user?.id, role],
    queryFn: async (): Promise<KYCSubmission | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("kyc_submissions")
        .select("*")
        .eq("user_id", user.id)
        .eq("role", role)
        .maybeSingle();

      if (error) {
        console.error("Error fetching KYC submission:", error);
        throw error;
      }

      if (!data) return null;

      return mapKYCSubmission(data);
    },
    enabled: !!user?.id,
  });
}

/**
 * Create a new KYC submission (draft)
 */
export function useCreateKYCSubmission() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (role: KYCRole): Promise<KYCSubmission> => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("kyc_submissions")
        .insert({
          user_id: user.id,
          role,
          status: "draft",
          current_step: 1,
          completed_steps: [],
          personal_info: {},
          documents: [],
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating KYC submission:", error);
        throw error;
      }

      // Log event
      await logKYCEvent(data.id, user.id, "created", user.id, "user");

      return mapKYCSubmission(data);
    },
    onSuccess: (_, role) => {
      queryClient.invalidateQueries({ queryKey: ["kyc-submission", user?.id, role] });
      toast.success("Verification started");
    },
    onError: (error) => {
      toast.error("Failed to start verification: " + error.message);
    },
  });
}

/**
 * Update KYC submission (personal info, step progress)
 */
export function useUpdateKYCSubmission() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      submissionId,
      role,
      personalInfo,
      currentStep,
      completedSteps,
    }: {
      submissionId: string;
      role: KYCRole;
      personalInfo?: Partial<DriverPersonalInfo | MerchantBusinessInfo>;
      currentStep?: number;
      completedSteps?: number[];
    }): Promise<void> => {
      if (!user?.id) throw new Error("Not authenticated");

      const updateData: Record<string, unknown> = {};

      if (personalInfo) {
        // Merge with existing personal info
        const { data: existing } = await supabase
          .from("kyc_submissions")
          .select("personal_info")
          .eq("id", submissionId)
          .single();

        const existingInfo = (existing?.personal_info || {}) as Record<string, unknown>;
        updateData.personal_info = {
          ...existingInfo,
          ...personalInfo,
        };
      }

      if (currentStep !== undefined) {
        updateData.current_step = currentStep;
      }

      if (completedSteps !== undefined) {
        updateData.completed_steps = completedSteps;
      }

      const { error } = await supabase
        .from("kyc_submissions")
        .update(updateData)
        .eq("id", submissionId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating KYC submission:", error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["kyc-submission", user?.id, variables.role] });
    },
    onError: (error) => {
      toast.error("Failed to save: " + error.message);
    },
  });
}

/**
 * Upload a KYC document
 */
export function useUploadKYCDocument() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      submissionId,
      role,
      file,
      documentType,
    }: {
      submissionId: string;
      role: KYCRole;
      file: File;
      documentType: string;
    }): Promise<KYCDocument> => {
      if (!user?.id) throw new Error("Not authenticated");

      // Upload to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${documentType}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("kyc-documents")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading document:", uploadError);
        throw uploadError;
      }

      // Get existing documents
      const { data: existing } = await supabase
        .from("kyc_submissions")
        .select("documents")
        .eq("id", submissionId)
        .single();

      const existingDocs = (existing?.documents || []) as unknown as KYCDocument[];

      // Remove any existing doc of same type
      const filteredDocs = existingDocs.filter((d) => d.type !== documentType);

      // Add new document
      const newDoc: KYCDocument = {
        type: documentType,
        url: filePath,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        status: "pending",
      };

      const docsToSave = [...filteredDocs, newDoc] as unknown as Json;

      const { error: updateError } = await supabase
        .from("kyc_submissions")
        .update({ documents: docsToSave })
        .eq("id", submissionId)
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Error updating documents:", updateError);
        throw updateError;
      }

      // Log event
      await logKYCEvent(submissionId, user.id, "document_uploaded", user.id, "user", {
        document_type: documentType,
        file_name: file.name,
      });

      return newDoc;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["kyc-submission", user?.id, variables.role] });
      toast.success("Document uploaded");
    },
    onError: (error) => {
      toast.error("Failed to upload document: " + error.message);
    },
  });
}

/**
 * Remove a KYC document
 */
export function useRemoveKYCDocument() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      submissionId,
      role,
      documentType,
      filePath,
    }: {
      submissionId: string;
      role: KYCRole;
      documentType: string;
      filePath: string;
    }): Promise<void> => {
      if (!user?.id) throw new Error("Not authenticated");

      // Delete from storage
      await supabase.storage.from("kyc-documents").remove([filePath]);

      // Get existing documents
      const { data: existing } = await supabase
        .from("kyc_submissions")
        .select("documents")
        .eq("id", submissionId)
        .single();

      const existingDocs = (existing?.documents || []) as unknown as KYCDocument[];
      const filteredDocs = existingDocs.filter((d) => d.type !== documentType);

      const { error } = await supabase
        .from("kyc_submissions")
        .update({ documents: filteredDocs as unknown as Json })
        .eq("id", submissionId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error removing document:", error);
        throw error;
      }

      // Log event
      await logKYCEvent(submissionId, user.id, "document_removed", user.id, "user", {
        document_type: documentType,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["kyc-submission", user?.id, variables.role] });
      toast.success("Document removed");
    },
    onError: (error) => {
      toast.error("Failed to remove document: " + error.message);
    },
  });
}

/**
 * Submit KYC for review
 */
export function useSubmitKYC() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      submissionId,
      role,
    }: {
      submissionId: string;
      role: KYCRole;
    }): Promise<void> => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("kyc_submissions")
        .update({
          status: "submitted",
          submitted_at: new Date().toISOString(),
        })
        .eq("id", submissionId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error submitting KYC:", error);
        throw error;
      }

      // Log event
      await logKYCEvent(submissionId, user.id, "submitted", user.id, "user");

      // Update profiles.kyc_status
      await supabase
        .from("profiles")
        .update({ kyc_status: "submitted" })
        .eq("user_id", user.id);

      // Notify admin (fire and forget)
      supabase.functions.invoke("send-notification", {
        body: {
          type: "admin_alert",
          title: "New KYC Submission",
          body: `${role === "driver" ? "Driver" : "Merchant"} verification submitted`,
          action_url: `/admin/kyc/${user.id}`,
        },
      }).catch(console.error);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["kyc-submission", user?.id, variables.role] });
      toast.success("Verification submitted for review");
    },
    onError: (error) => {
      toast.error("Failed to submit: " + error.message);
    },
  });
}

// =============================================================================
// ADMIN HOOKS
// =============================================================================

interface KYCQueueFilters {
  status?: KYCStatus | "all";
  role?: KYCRole | "all";
  search?: string;
}

/**
 * Get KYC submission queue for admin
 */
export function useKYCQueue(filters?: KYCQueueFilters) {
  return useQuery({
    queryKey: ["kyc-queue", filters],
    queryFn: async (): Promise<(KYCSubmission & { profile?: { full_name: string; email: string; avatar_url: string } })[]> => {
      let query = supabase
        .from("kyc_submissions")
        .select("*")
        .order("submitted_at", { ascending: false, nullsFirst: false });

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters?.role && filters.role !== "all") {
        query = query.eq("role", filters.role);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching KYC queue:", error);
        throw error;
      }

      // Fetch profiles separately
      const userIds = (data || []).map(d => d.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(
        (profiles || []).map(p => [p.user_id, p])
      );

      return (data || []).map((row) => {
        const profile = profileMap.get(row.user_id);
        return {
          ...mapKYCSubmission(row),
          profile: profile ? {
            full_name: profile.full_name || "",
            email: profile.email || "",
            avatar_url: profile.avatar_url || "",
          } : undefined,
        };
      });
    },
  });
}

/**
 * Get single KYC submission by user ID (for admin review)
 */
export function useKYCSubmissionByUserId(userId: string | undefined) {
  return useQuery({
    queryKey: ["kyc-submission-admin", userId],
    queryFn: async (): Promise<(KYCSubmission & { profile?: { full_name: string; email: string; avatar_url: string; phone: string } }) | null> => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("kyc_submissions")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching KYC submission:", error);
        throw error;
      }

      if (!data) return null;

      // Fetch profile separately
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, avatar_url, phone")
        .eq("user_id", userId)
        .maybeSingle();

      return {
        ...mapKYCSubmission(data),
        profile: profile ? {
          full_name: profile.full_name || "",
          email: profile.email || "",
          avatar_url: profile.avatar_url || "",
          phone: profile.phone || "",
        } : undefined,
      };
    },
    enabled: !!userId,
  });
}

/**
 * Get KYC events for a submission
 */
export function useKYCEvents(submissionId: string | undefined) {
  return useQuery({
    queryKey: ["kyc-events", submissionId],
    queryFn: async () => {
      if (!submissionId) return [];

      const { data, error } = await supabase
        .from("kyc_events")
        .select("*")
        .eq("submission_id", submissionId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching KYC events:", error);
        throw error;
      }

      // Fetch actor names separately
      const actorIds = [...new Set((data || []).map(e => e.actor_id).filter(Boolean))];
      const { data: actors } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", actorIds);

      const actorMap = new Map(
        (actors || []).map(a => [a.user_id, a.full_name])
      );

      return (data || []).map(event => ({
        ...event,
        actorName: event.actor_id ? actorMap.get(event.actor_id) || "Unknown" : null,
      }));
    },
    enabled: !!submissionId,
  });
}

/**
 * Approve KYC submission
 */
export function useApproveKYC() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      submissionId,
      userId,
      role,
      adminNotes,
    }: {
      submissionId: string;
      userId: string;
      role: KYCRole;
      adminNotes?: string;
    }): Promise<void> => {
      if (!user?.id) throw new Error("Not authenticated");

      // Update submission
      const { error: updateError } = await supabase
        .from("kyc_submissions")
        .update({
          status: "approved",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes || null,
          rejection_reason: null,
        })
        .eq("id", submissionId);

      if (updateError) {
        console.error("Error approving KYC:", updateError);
        throw updateError;
      }

      // Update profile
      await supabase
        .from("profiles")
        .update({
          kyc_status: "approved",
          kyc_verified_at: new Date().toISOString(),
          kyc_rejection_reason: null,
          payout_hold: false,
        })
        .eq("user_id", userId);

      // Update role-specific tables
      if (role === "driver") {
        await supabase
          .from("drivers")
          .update({
            can_go_online: true,
            documents_verified: true,
            status: "verified",
          })
          .eq("user_id", userId);
      } else if (role === "merchant") {
        await supabase
          .from("restaurants")
          .update({
            documents_verified: true,
            status: "active",
          })
          .eq("owner_id", userId);
      }

      // Log event
      await logKYCEvent(submissionId, userId, "approved", user.id, "admin");

      // Notify user
      await supabase.functions.invoke("send-notification", {
        body: {
          user_id: userId,
          title: "Verification Approved",
          body: role === "driver" 
            ? "Your account has been verified. You can now go online!"
            : "Your business has been verified. You can now activate ads and receive payouts!",
          priority: "critical",
          event_type: "kyc_approved",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc-queue"] });
      queryClient.invalidateQueries({ queryKey: ["kyc-submission-admin"] });
      toast.success("KYC approved successfully");
    },
    onError: (error) => {
      toast.error("Failed to approve: " + error.message);
    },
  });
}

/**
 * Reject KYC submission
 */
export function useRejectKYC() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      submissionId,
      userId,
      role,
      rejectionReason,
      adminNotes,
    }: {
      submissionId: string;
      userId: string;
      role: KYCRole;
      rejectionReason: string;
      adminNotes?: string;
    }): Promise<void> => {
      if (!user?.id) throw new Error("Not authenticated");
      if (!rejectionReason.trim()) throw new Error("Rejection reason is required");

      // Update submission
      const { error: updateError } = await supabase
        .from("kyc_submissions")
        .update({
          status: "rejected",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
          admin_notes: adminNotes || null,
        })
        .eq("id", submissionId);

      if (updateError) {
        console.error("Error rejecting KYC:", updateError);
        throw updateError;
      }

      // Update profile
      await supabase
        .from("profiles")
        .update({
          kyc_status: "rejected",
          kyc_rejection_reason: rejectionReason,
        })
        .eq("user_id", userId);

      // Log event
      await logKYCEvent(submissionId, userId, "rejected", user.id, "admin", {
        reason: rejectionReason,
      });

      // Notify user
      await supabase.functions.invoke("send-notification", {
        body: {
          user_id: userId,
          title: "Verification Update",
          body: `Your verification was not approved: ${rejectionReason}`,
          priority: "critical",
          event_type: "kyc_rejected",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc-queue"] });
      queryClient.invalidateQueries({ queryKey: ["kyc-submission-admin"] });
      toast.success("KYC rejected");
    },
    onError: (error) => {
      toast.error("Failed to reject: " + error.message);
    },
  });
}

/**
 * Request more information
 */
export function useRequestMoreInfo() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      submissionId,
      userId,
      message,
    }: {
      submissionId: string;
      userId: string;
      message: string;
    }): Promise<void> => {
      if (!user?.id) throw new Error("Not authenticated");
      if (!message.trim()) throw new Error("Message is required");

      // Update submission
      const { error: updateError } = await supabase
        .from("kyc_submissions")
        .update({
          status: "needs_info",
          info_requested_at: new Date().toISOString(),
          info_request_message: message,
        })
        .eq("id", submissionId);

      if (updateError) {
        console.error("Error requesting info:", updateError);
        throw updateError;
      }

      // Update profile
      await supabase
        .from("profiles")
        .update({ kyc_status: "needs_review" })
        .eq("user_id", userId);

      // Log event
      await logKYCEvent(submissionId, userId, "info_requested", user.id, "admin", {
        message,
      });

      // Notify user
      await supabase.functions.invoke("send-notification", {
        body: {
          user_id: userId,
          title: "More Information Needed",
          body: message,
          priority: "high",
          event_type: "kyc_info_requested",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc-queue"] });
      queryClient.invalidateQueries({ queryKey: ["kyc-submission-admin"] });
      toast.success("Information request sent");
    },
    onError: (error) => {
      toast.error("Failed to send request: " + error.message);
    },
  });
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function logKYCEvent(
  submissionId: string,
  userId: string,
  eventType: string,
  actorId: string,
  actorRole: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await supabase.from("kyc_events").insert({
      submission_id: submissionId,
      user_id: userId,
      event_type: eventType,
      actor_id: actorId,
      actor_role: actorRole,
      metadata: (metadata || {}) as Json,
    });
  } catch (e) {
    console.error("Failed to log KYC event:", e);
  }
}
