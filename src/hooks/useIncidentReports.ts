/**
 * Incident Reports Hook
 * Create and fetch incident reports for safety/fraud/harassment issues
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type IncidentCategory = "safety" | "harassment" | "fraud" | "theft" | "accident" | "other";
export type IncidentSeverity = "low" | "medium" | "high" | "urgent";
export type ReporterRole = "customer" | "driver" | "merchant";

export interface IncidentReport {
  id: string;
  order_id: string | null;
  reporter_user_id: string;
  reported_user_id: string | null;
  reporter_role: ReporterRole;
  category: IncidentCategory;
  severity: IncidentSeverity;
  description: string;
  attachment_url: string | null;
  status: string;
  created_at: string;
  resolved_at: string | null;
  resolution_notes: string | null;
}

export interface CreateIncidentParams {
  orderId: string;
  reportedUserId?: string;
  reporterRole: ReporterRole;
  category: IncidentCategory;
  severity: IncidentSeverity;
  description: string;
  attachmentUrl?: string;
}

export function useIncidentReports() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Create a new incident report
  const createReport = useMutation({
    mutationFn: async (params: CreateIncidentParams) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("incident_reports")
        .insert({
          order_id: params.orderId,
          reporter_user_id: user.id,
          reported_user_id: params.reportedUserId || null,
          reporter_role: params.reporterRole,
          category: params.category,
          severity: params.severity,
          description: params.description,
          attachment_url: params.attachmentUrl || null,
          status: "open",
        })
        .select()
        .single();

      if (error) throw error;

      // Log order event
      await supabase.from("order_events").insert({
        order_id: params.orderId,
        type: "incident_reported",
        data: {
          incident_id: data.id,
          category: params.category,
          severity: params.severity,
          reporter_role: params.reporterRole,
        },
      });

      return data;
    },
    onSuccess: () => {
      toast.success("Report submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["my-incident-reports"] });
    },
    onError: (error) => {
      toast.error(`Failed to submit report: ${error.message}`);
    },
  });

  // Fetch my incident reports
  const myReports = useQuery({
    queryKey: ["my-incident-reports", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("incident_reports")
        .select("*")
        .eq("reporter_user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as IncidentReport[];
    },
    enabled: !!user?.id,
  });

  // Fetch reports by order ID
  const useReportsByOrder = (orderId: string | undefined) => {
    return useQuery({
      queryKey: ["incident-reports-order", orderId],
      queryFn: async () => {
        if (!orderId) return [];

        const { data, error } = await supabase
          .from("incident_reports")
          .select("*")
          .eq("order_id", orderId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data as IncidentReport[];
      },
      enabled: !!orderId,
    });
  };

  return {
    createReport,
    myReports,
    useReportsByOrder,
  };
}
