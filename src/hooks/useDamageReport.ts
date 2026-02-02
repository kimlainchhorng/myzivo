/**
 * Damage Report Hooks
 * Hooks for managing damage reports, evidence, and resolutions
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type {
  P2PDamageReport,
  P2PDamageEvidence,
  P2PInsuranceClaim,
  P2PDisputeResolution,
  DamageReportInput,
  DamageEvidenceInput,
  InsuranceClaimInput,
  ResolutionInput,
  DamageReportWithDetails,
  DamageReportStats,
  P2PDamageStatus,
} from "@/types/damage";

// Create a damage report
export function useCreateDamageReport() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DamageReportInput) => {
      if (!user) throw new Error("Not authenticated");

      const { data: report, error } = await supabase
        .from("p2p_damage_reports")
        .insert([{
          booking_id: data.booking_id,
          reported_by: user.id,
          reporter_role: data.reporter_role,
          description: data.description,
          date_noticed: data.date_noticed,
          estimated_repair_cost: data.estimated_repair_cost || null,
          status: "reported" as P2PDamageStatus,
          priority: "medium",
        }])
        .select()
        .single();

      if (error) throw error;

      // Update booking to link damage report and hold payout
      await supabase
        .from("p2p_bookings")
        .update({
          damage_report_id: report.id,
          payout_hold_reason: "damage_report_pending",
          payout_held_at: new Date().toISOString(),
        })
        .eq("id", data.booking_id);

      return report;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["damageReports"] });
      queryClient.invalidateQueries({ queryKey: ["userDamageReports"] });
      toast.success("Damage report submitted successfully");
    },
    onError: (error: Error) => {
      console.error("Damage report error:", error);
      toast.error(error.message || "Failed to submit damage report");
    },
  });
}

// Upload damage evidence
export function useUploadDamageEvidence() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      damageReportId,
      file,
      imageType,
      caption,
    }: {
      damageReportId: string;
      file: File;
      imageType: "damage" | "before" | "after";
      caption?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const fileName = `damage/${damageReportId}/${imageType}_${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("p2p-documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("p2p-documents")
        .getPublicUrl(fileName);

      // Create evidence record
      const { data: evidence, error } = await supabase
        .from("p2p_damage_evidence")
        .insert([{
          damage_report_id: damageReportId,
          image_url: urlData.publicUrl,
          image_type: imageType,
          uploaded_by: user.id,
          caption: caption || null,
        }])
        .select()
        .single();

      if (error) throw error;
      return evidence;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["damageEvidence", variables.damageReportId] });
      queryClient.invalidateQueries({ queryKey: ["damageReport", variables.damageReportId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload evidence");
    },
  });
}

// Get damage report by ID
export function useDamageReport(reportId: string | undefined) {
  return useQuery({
    queryKey: ["damageReport", reportId],
    queryFn: async (): Promise<DamageReportWithDetails | null> => {
      if (!reportId) return null;

      const { data, error } = await supabase
        .from("p2p_damage_reports")
        .select(`
          *,
          booking:p2p_bookings(
            id,
            pickup_date,
            return_date,
            total_amount,
            vehicle:p2p_vehicles(id, make, model, year, images),
            renter:profiles(id, email),
            owner:car_owner_profiles!p2p_bookings_owner_id_fkey(id, full_name, email)
          ),
          evidence:p2p_damage_evidence(*),
          insurance_claim:p2p_insurance_claims(*),
          resolution:p2p_dispute_resolutions(*)
        `)
        .eq("id", reportId)
        .single();

      if (error) throw error;
      return data as unknown as DamageReportWithDetails;
    },
    enabled: !!reportId,
  });
}

// Get damage reports for a booking
export function useBookingDamageReports(bookingId: string | undefined) {
  return useQuery({
    queryKey: ["bookingDamageReports", bookingId],
    queryFn: async (): Promise<P2PDamageReport[]> => {
      if (!bookingId) return [];

      const { data, error } = await supabase
        .from("p2p_damage_reports")
        .select("*")
        .eq("booking_id", bookingId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!bookingId,
  });
}

// Get user's damage reports
export function useUserDamageReports() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["userDamageReports", user?.id],
    queryFn: async (): Promise<DamageReportWithDetails[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("p2p_damage_reports")
        .select(`
          *,
          booking:p2p_bookings(
            id,
            pickup_date,
            return_date,
            vehicle:p2p_vehicles(id, make, model, year)
          )
        `)
        .eq("reported_by", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as DamageReportWithDetails[];
    },
    enabled: !!user,
  });
}

// Get damage evidence for a report
export function useDamageEvidence(reportId: string | undefined) {
  return useQuery({
    queryKey: ["damageEvidence", reportId],
    queryFn: async (): Promise<P2PDamageEvidence[]> => {
      if (!reportId) return [];

      const { data, error } = await supabase
        .from("p2p_damage_evidence")
        .select("*")
        .eq("damage_report_id", reportId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!reportId,
  });
}

// Admin: Get all damage reports
export function useAdminDamageReports(status?: P2PDamageStatus) {
  return useQuery({
    queryKey: ["adminDamageReports", status],
    queryFn: async (): Promise<DamageReportWithDetails[]> => {
      let query = supabase
        .from("p2p_damage_reports")
        .select(`
          *,
          booking:p2p_bookings(
            id,
            pickup_date,
            return_date,
            total_amount,
            vehicle:p2p_vehicles(id, make, model, year, images),
            renter:profiles(id, email),
            owner:car_owner_profiles!p2p_bookings_owner_id_fkey(id, full_name, email)
          ),
          evidence:p2p_damage_evidence(id),
          insurance_claim:p2p_insurance_claims(*),
          resolution:p2p_dispute_resolutions(*)
        `)
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as unknown as DamageReportWithDetails[];
    },
  });
}

// Admin: Update damage report status
export function useUpdateDamageStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportId,
      status,
      adminNotes,
      priority,
    }: {
      reportId: string;
      status: P2PDamageStatus;
      adminNotes?: string;
      priority?: string;
    }) => {
      const updateData: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (adminNotes !== undefined) updateData.admin_notes = adminNotes;
      if (priority) updateData.priority = priority;

      const { data, error } = await supabase
        .from("p2p_damage_reports")
        .update(updateData)
        .eq("id", reportId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDamageReports"] });
      queryClient.invalidateQueries({ queryKey: ["damageReport"] });
      toast.success("Damage report updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update damage report");
    },
  });
}

// Admin: Create insurance claim
export function useCreateInsuranceClaim() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InsuranceClaimInput) => {
      if (!user) throw new Error("Not authenticated");

      const { data: claim, error } = await supabase
        .from("p2p_insurance_claims")
        .insert([{
          damage_report_id: data.damage_report_id,
          insurance_provider: data.insurance_provider,
          claim_reference: data.claim_reference || null,
          coverage_decision: data.coverage_decision || "pending",
          coverage_amount: data.coverage_amount || null,
          notes: data.notes || null,
          created_by: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      // Update damage report status
      await supabase
        .from("p2p_damage_reports")
        .update({ status: "insurance_claim_submitted" as P2PDamageStatus })
        .eq("id", data.damage_report_id);

      return claim;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDamageReports"] });
      queryClient.invalidateQueries({ queryKey: ["damageReport"] });
      toast.success("Insurance claim created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create insurance claim");
    },
  });
}

// Admin: Resolve damage report
export function useResolveDamageReport() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ResolutionInput) => {
      if (!user) throw new Error("Not authenticated");

      // Create resolution record
      const { data: resolution, error } = await supabase
        .from("p2p_dispute_resolutions")
        .insert([{
          damage_report_id: data.damage_report_id,
          decision: data.decision,
          owner_payout_adjustment: data.owner_payout_adjustment || 0,
          renter_charge_amount: data.renter_charge_amount || 0,
          admin_notes: data.admin_notes || null,
          resolved_by: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      // Update damage report status based on decision
      let newStatus: P2PDamageStatus;
      switch (data.decision) {
        case "owner_paid":
          newStatus = "resolved_owner_paid";
          break;
        case "renter_charged":
          newStatus = "resolved_renter_charged";
          break;
        case "no_action":
        case "partial":
        default:
          newStatus = "closed_no_action";
      }

      await supabase
        .from("p2p_damage_reports")
        .update({ status: newStatus })
        .eq("id", data.damage_report_id);

      // Clear payout hold on the booking
      const { data: report } = await supabase
        .from("p2p_damage_reports")
        .select("booking_id")
        .eq("id", data.damage_report_id)
        .single();

      if (report?.booking_id) {
        await supabase
          .from("p2p_bookings")
          .update({
            payout_hold_reason: null,
            payout_held_at: null,
          })
          .eq("id", report.booking_id);
      }

      return resolution;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDamageReports"] });
      queryClient.invalidateQueries({ queryKey: ["damageReport"] });
      toast.success("Damage report resolved");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to resolve damage report");
    },
  });
}

// Admin: Get damage report stats
export function useDamageReportStats() {
  return useQuery({
    queryKey: ["damageReportStats"],
    queryFn: async (): Promise<DamageReportStats> => {
      const { data: reports, error } = await supabase
        .from("p2p_damage_reports")
        .select("id, status, created_at");

      if (error) throw error;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      return {
        total: reports?.length || 0,
        reported: reports?.filter(r => r.status === "reported").length || 0,
        underReview: reports?.filter(r => r.status === "under_review" || r.status === "info_requested").length || 0,
        insurancePending: reports?.filter(r => r.status === "insurance_claim_submitted").length || 0,
        resolvedThisMonth: reports?.filter(r => 
          (r.status === "resolved_owner_paid" || r.status === "resolved_renter_charged" || r.status === "closed_no_action") &&
          new Date(r.created_at) >= startOfMonth
        ).length || 0,
      };
    },
  });
}

// Get damage status badge styling
export function getDamageStatusBadge(status: P2PDamageStatus | string | null): {
  className: string;
  label: string;
} {
  switch (status) {
    case "reported":
      return {
        className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        label: "Reported",
      };
    case "under_review":
      return {
        className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        label: "Under Review",
      };
    case "info_requested":
      return {
        className: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        label: "Info Requested",
      };
    case "insurance_claim_submitted":
      return {
        className: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
        label: "Insurance Pending",
      };
    case "resolved_owner_paid":
      return {
        className: "bg-green-500/10 text-green-500 border-green-500/20",
        label: "Resolved - Owner Paid",
      };
    case "resolved_renter_charged":
      return {
        className: "bg-green-500/10 text-green-500 border-green-500/20",
        label: "Resolved - Renter Charged",
      };
    case "closed_no_action":
      return {
        className: "bg-muted text-muted-foreground border-muted",
        label: "Closed",
      };
    default:
      return {
        className: "bg-muted text-muted-foreground border-muted",
        label: status || "Unknown",
      };
  }
}
