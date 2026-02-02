/**
 * Damage & Dispute Types
 * TypeScript types for the damage reporting and dispute resolution system
 */

import type { Database } from "@/integrations/supabase/types";

// Database row types
export type P2PDamageReport = Database["public"]["Tables"]["p2p_damage_reports"]["Row"];
export type P2PDamageReportInsert = Database["public"]["Tables"]["p2p_damage_reports"]["Insert"];
export type P2PDamageEvidence = Database["public"]["Tables"]["p2p_damage_evidence"]["Row"];
export type P2PDamageEvidenceInsert = Database["public"]["Tables"]["p2p_damage_evidence"]["Insert"];
export type P2PInsuranceClaim = Database["public"]["Tables"]["p2p_insurance_claims"]["Row"];
export type P2PInsuranceClaimInsert = Database["public"]["Tables"]["p2p_insurance_claims"]["Insert"];
export type P2PDisputeResolution = Database["public"]["Tables"]["p2p_dispute_resolutions"]["Row"];
export type P2PDisputeResolutionInsert = Database["public"]["Tables"]["p2p_dispute_resolutions"]["Insert"];

// Enum types
export type P2PDamageStatus = Database["public"]["Enums"]["p2p_damage_status"];

// Form input types
export interface DamageReportInput {
  booking_id: string;
  reporter_role: "renter" | "owner";
  description: string;
  date_noticed: string;
  estimated_repair_cost?: number;
}

export interface DamageEvidenceInput {
  damage_report_id: string;
  image_type: "damage" | "before" | "after";
  caption?: string;
}

export interface InsuranceClaimInput {
  damage_report_id: string;
  insurance_provider: string;
  claim_reference?: string;
  coverage_decision?: "pending" | "approved" | "denied" | "partial";
  coverage_amount?: number;
  notes?: string;
}

export interface ResolutionInput {
  damage_report_id: string;
  decision: "owner_paid" | "renter_charged" | "no_action" | "partial";
  owner_payout_adjustment?: number;
  renter_charge_amount?: number;
  admin_notes?: string;
}

// Extended types with relations
export interface DamageReportWithDetails extends P2PDamageReport {
  booking?: {
    id: string;
    pickup_date: string;
    return_date: string;
    total_amount: number;
    vehicle?: {
      id: string;
      make: string;
      model: string;
      year: number;
      images?: unknown;
    };
    renter?: {
      id: string;
      email: string;
    };
    owner?: {
      id: string;
      full_name: string;
      email?: string;
    };
  };
  evidence?: P2PDamageEvidence[];
  insurance_claim?: P2PInsuranceClaim;
  resolution?: P2PDisputeResolution;
}

// Admin stats
export interface DamageReportStats {
  total: number;
  reported: number;
  underReview: number;
  insurancePending: number;
  resolvedThisMonth: number;
}

// Status badge styling helper
export interface StatusBadgeStyle {
  className: string;
  label: string;
}
