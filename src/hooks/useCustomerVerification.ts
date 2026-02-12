import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type VerificationStatus = "not_started" | "pending" | "verified" | "rejected";

export interface CustomerVerification {
  id: string;
  user_id: string;
  id_document_url: string | null;
  selfie_url: string | null;
  status: string;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useCustomerVerification() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["customer-verification", user?.id];

  const { data: verification, isLoading } = useQuery({
    queryKey,
    queryFn: async (): Promise<CustomerVerification | null> => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("customer_identity_verifications")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) {
        console.error("Error fetching verification:", error);
        return null;
      }
      return data as CustomerVerification | null;
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  const status: VerificationStatus = !verification
    ? "not_started"
    : (verification.status as VerificationStatus);

  // Realtime subscription for verification status changes
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`verification-status-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "customer_identity_verifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newStatus = (payload.new as any)?.status;
          const rejectionReason = (payload.new as any)?.rejection_reason;

          if (newStatus === "verified") {
            toast.success("Your identity is now verified! Trust score updated.", {
              duration: 5000,
            });
          } else if (newStatus === "rejected") {
            toast.warning(`Verification rejected: ${rejectionReason || "Please try again."}`, {
              duration: 8000,
            });
          }

          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient, queryKey]);

  const uploadMutation = useMutation({
    mutationFn: async ({ type, file }: { type: "id" | "selfie"; file: File }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${type}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("identity-documents")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const urlField = type === "id" ? "id_document_url" : "selfie_url";

      // Upsert the verification row
      const { error: upsertError } = await supabase
        .from("customer_identity_verifications")
        .upsert(
          {
            user_id: user.id,
            [urlField]: path,
            // Reset to pending if previously rejected
            ...(verification?.status === "rejected" ? { status: "pending", rejection_reason: null } : {}),
          },
          { onConflict: "user_id" }
        );
      if (upsertError) throw upsertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Document uploaded successfully");
    },
    onError: (err: Error) => {
      toast.error("Upload failed: " + err.message);
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("customer_identity_verifications")
        .update({ status: "pending" })
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Verification submitted — you'll be notified when reviewed");
    },
    onError: (err: Error) => {
      toast.error("Submission failed: " + err.message);
    },
  });

  // Helper to get a signed URL for private documents
  const getSignedUrl = async (path: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from("identity-documents")
      .createSignedUrl(path, 3600);
    if (error) return null;
    return data.signedUrl;
  };

  return {
    verification,
    status,
    isLoading,
    uploadDocument: (type: "id" | "selfie", file: File) =>
      uploadMutation.mutateAsync({ type, file }),
    isUploading: uploadMutation.isPending,
    submitVerification: () => submitMutation.mutateAsync(),
    isSubmitting: submitMutation.isPending,
    getSignedUrl,
  };
}
