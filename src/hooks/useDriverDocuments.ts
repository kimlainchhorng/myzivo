import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type DocumentStatus = "pending" | "approved" | "rejected";

export type DriverDocument = {
  id: string;
  driver_id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  status: string;
  notes: string | null;
  reviewed_at: string | null;
  uploaded_at: string;
};

export type DriverDocumentWithDriver = DriverDocument & {
  driver: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  } | null;
};

export const useDriverDocuments = (driverId?: string) => {
  return useQuery({
    queryKey: ["driver-documents", driverId],
    queryFn: async () => {
      let query = supabase
        .from("driver_documents")
        .select(`
          *,
          driver:drivers(id, full_name, email, avatar_url)
        `)
        .order("uploaded_at", { ascending: false });

      if (driverId) {
        query = query.eq("driver_id", driverId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as DriverDocumentWithDriver[];
    },
  });
};

export const usePendingDocuments = () => {
  return useQuery({
    queryKey: ["driver-documents", "pending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("driver_documents")
        .select(`
          *,
          driver:drivers(id, full_name, email, avatar_url)
        `)
        .eq("status", "pending")
        .order("uploaded_at", { ascending: true });

      if (error) throw error;
      return data as DriverDocumentWithDriver[];
    },
  });
};

export const useUpdateDocumentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: DocumentStatus;
      notes?: string;
    }) => {
      const { error } = await supabase
        .from("driver_documents")
        .update({
          status,
          notes: notes || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver-documents"] });
      toast.success("Document status updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update document: " + error.message);
    },
  });
};

export const getDocumentUrl = async (filePath: string): Promise<string | null> => {
  const { data, error } = await supabase.storage
    .from("driver-documents")
    .createSignedUrl(filePath, 3600); // 1 hour expiry

  if (error) {
    console.error("Error getting signed URL:", error);
    return null;
  }

  return data.signedUrl;
};

export const getDocumentTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    license: "Driver's License",
    insurance: "Insurance Certificate",
    registration: "Vehicle Registration",
    profile_photo: "Profile Photo",
  };
  return labels[type] || type;
};
