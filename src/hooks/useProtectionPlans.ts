/**
 * Protection Plans Hooks
 * Manage insurance protection plans, claims, and coverage
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProtectionPlan {
  id: string;
  tier: "basic" | "standard" | "premium";
  name: string;
  description: string | null;
  daily_rate: number;
  deductible: number;
  liability_coverage: number;
  collision_coverage: number;
  comprehensive_coverage: number;
  coverage_includes: string[];
  coverage_excludes: string[];
  insurance_partner: string;
  policy_document_url: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface InsuranceClaim {
  id: string;
  damage_report_id: string | null;
  booking_id: string;
  claim_number: string | null;
  status: "submitted" | "under_review" | "approved" | "denied" | "paid_out" | "closed";
  protection_tier: string | null;
  deductible_amount: number | null;
  total_damage_amount: number | null;
  covered_amount: number | null;
  renter_responsibility: number | null;
  owner_payout: number | null;
  insurance_partner: string | null;
  partner_claim_ref: string | null;
  partner_decision: string | null;
  partner_notes: string | null;
  admin_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  decision_at: string | null;
  paid_out_at: string | null;
  closed_at: string | null;
  created_at: string;
}

export interface ClaimDocument {
  id: string;
  claim_id: string;
  document_type: "damage_photo" | "repair_estimate" | "repair_invoice" | "police_report" | "insurance_policy" | "other";
  file_url: string;
  file_name: string | null;
  description: string | null;
  uploaded_at: string;
}

// Fetch all active protection plans
export function useProtectionPlans() {
  return useQuery({
    queryKey: ["protectionPlans"],
    queryFn: async (): Promise<ProtectionPlan[]> => {
      const { data, error } = await supabase
        .from("p2p_protection_plans")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;
      return (data || []).map((plan) => ({
        ...plan,
        coverage_includes: Array.isArray(plan.coverage_includes) 
          ? plan.coverage_includes 
          : [],
        coverage_excludes: Array.isArray(plan.coverage_excludes) 
          ? plan.coverage_excludes 
          : [],
      })) as ProtectionPlan[];
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 mins
  });
}

// Get a single protection plan by tier
export function useProtectionPlan(tier: string | undefined) {
  const { data: plans } = useProtectionPlans();
  return plans?.find((p) => p.tier === tier) || null;
}

// Calculate protection cost for a booking
export function calculateProtectionCost(
  plan: ProtectionPlan | null,
  totalDays: number
): { dailyRate: number; total: number; deductible: number } {
  if (!plan) {
    return { dailyRate: 0, total: 0, deductible: 2500 };
  }
  return {
    dailyRate: plan.daily_rate,
    total: plan.daily_rate * totalDays,
    deductible: plan.deductible,
  };
}

// Admin: Fetch all insurance claims
export function useInsuranceClaims(statusFilter?: string) {
  return useQuery({
    queryKey: ["insuranceClaims", statusFilter],
    queryFn: async (): Promise<InsuranceClaim[]> => {
      let query = supabase
        .from("p2p_enhanced_claims")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as InsuranceClaim[];
    },
  });
}

// Admin: Get claim with details
export function useClaimDetails(claimId: string | undefined) {
  return useQuery({
    queryKey: ["claimDetails", claimId],
    queryFn: async () => {
      if (!claimId) return null;

      // Fetch claim
      const { data: claim, error: claimError } = await supabase
        .from("p2p_enhanced_claims")
        .select("*")
        .eq("id", claimId)
        .single();

      if (claimError) throw claimError;

      // Fetch documents
      const { data: documents } = await supabase
        .from("p2p_claim_documents")
        .select("*")
        .eq("claim_id", claimId)
        .order("uploaded_at");

      // Fetch booking details
      const { data: booking } = await supabase
        .from("p2p_bookings")
        .select(`
          id,
          pickup_date,
          return_date,
          total_amount,
          protection_tier,
          protection_total,
          vehicle:p2p_vehicles(id, make, model, year),
          renter:renter_id(email)
        `)
        .eq("id", claim.booking_id)
        .single();

      return {
        claim: claim as InsuranceClaim,
        documents: (documents || []) as ClaimDocument[],
        booking,
      };
    },
    enabled: !!claimId,
  });
}

// Admin: Update claim status
export function useUpdateClaimStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      claimId,
      status,
      updates,
    }: {
      claimId: string;
      status: InsuranceClaim["status"];
      updates?: Partial<InsuranceClaim>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const updateData: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
        ...updates,
      };

      // Set timeline fields based on status
      if (status === "under_review") {
        updateData.reviewed_at = new Date().toISOString();
        updateData.reviewed_by = user?.id;
      } else if (status === "approved" || status === "denied") {
        updateData.decision_at = new Date().toISOString();
      } else if (status === "paid_out") {
        updateData.paid_out_at = new Date().toISOString();
      } else if (status === "closed") {
        updateData.closed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("p2p_enhanced_claims")
        .update(updateData)
        .eq("id", claimId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insuranceClaims"] });
      queryClient.invalidateQueries({ queryKey: ["claimDetails"] });
      toast.success("Claim updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update claim");
    },
  });
}

// Create insurance claim from damage report
export function useCreateInsuranceClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      damageReportId,
      bookingId,
      totalDamageAmount,
      protectionTier,
      deductibleAmount,
    }: {
      damageReportId: string;
      bookingId: string;
      totalDamageAmount: number;
      protectionTier: string;
      deductibleAmount: number;
    }) => {
      // Calculate coverage
      const renterResponsibility = Math.min(totalDamageAmount, deductibleAmount);
      const coveredAmount = Math.max(0, totalDamageAmount - renterResponsibility);
      const ownerPayout = totalDamageAmount;

      // Generate claim number
      const claimNumber = `CLM-${Date.now().toString(36).toUpperCase()}`;

      const { data, error } = await supabase
        .from("p2p_enhanced_claims")
        .insert([{
          damage_report_id: damageReportId,
          booking_id: bookingId,
          claim_number: claimNumber,
          status: "submitted",
          protection_tier: protectionTier,
          deductible_amount: deductibleAmount,
          total_damage_amount: totalDamageAmount,
          covered_amount: coveredAmount,
          renter_responsibility: renterResponsibility,
          owner_payout: ownerPayout,
          insurance_partner: "ZIVO Insurance Partners",
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insuranceClaims"] });
      toast.success("Insurance claim created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create claim");
    },
  });
}

// Upload claim document
export function useUploadClaimDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      claimId,
      documentType,
      fileUrl,
      fileName,
      description,
    }: {
      claimId: string;
      documentType: ClaimDocument["document_type"];
      fileUrl: string;
      fileName?: string;
      description?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("p2p_claim_documents")
        .insert([{
          claim_id: claimId,
          document_type: documentType,
          file_url: fileUrl,
          file_name: fileName,
          description,
          uploaded_by: user?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claimDetails"] });
      toast.success("Document uploaded");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload document");
    },
  });
}

// Claims statistics for admin dashboard
export function useClaimsStats() {
  return useQuery({
    queryKey: ["claimsStats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("p2p_enhanced_claims")
        .select("status, total_damage_amount, covered_amount, renter_responsibility");

      if (error) throw error;

      const claims = data || [];
      
      return {
        total: claims.length,
        submitted: claims.filter((c) => c.status === "submitted").length,
        underReview: claims.filter((c) => c.status === "under_review").length,
        approved: claims.filter((c) => c.status === "approved").length,
        denied: claims.filter((c) => c.status === "denied").length,
        paidOut: claims.filter((c) => c.status === "paid_out").length,
        totalDamageAmount: claims.reduce((sum, c) => sum + (c.total_damage_amount || 0), 0),
        totalCovered: claims.reduce((sum, c) => sum + (c.covered_amount || 0), 0),
        totalRenterPaid: claims.reduce((sum, c) => sum + (c.renter_responsibility || 0), 0),
      };
    },
  });
}
