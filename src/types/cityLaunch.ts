/**
 * City Launch Checklist Types
 * TypeScript types for the P2P marketplace city launch system
 */

import type { Database } from "@/integrations/supabase/types";

// Base types from database
export type LaunchCity = Database["public"]["Tables"]["p2p_launch_cities"]["Row"];
export type LaunchCityInsert = Database["public"]["Tables"]["p2p_launch_cities"]["Insert"];
export type LaunchCityUpdate = Database["public"]["Tables"]["p2p_launch_cities"]["Update"];

export type LaunchChecklist = Database["public"]["Tables"]["p2p_launch_checklists"]["Row"];
export type LaunchChecklistUpdate = Database["public"]["Tables"]["p2p_launch_checklists"]["Update"];

export type LaunchStatus = Database["public"]["Enums"]["p2p_launch_status"];

// Extended city type with checklist
export interface LaunchCityWithChecklist extends LaunchCity {
  checklist: LaunchChecklist | null;
}

// Supply stats for a city
export interface CitySupplyStats {
  approvedOwners: number;
  approvedVehicles: number;
  minOwners: number;
  minVehicles: number;
  ownersMet: boolean;
  vehiclesMet: boolean;
}

// Section completion status
export interface ChecklistSectionStatus {
  legal: { complete: number; total: number; isComplete: boolean };
  insurance: { complete: number; total: number; isComplete: boolean };
  payments: { complete: number; total: number; isComplete: boolean };
  supply: { isComplete: boolean };
  operations: { complete: number; total: number; isComplete: boolean };
  support: { complete: number; total: number; isComplete: boolean };
  allComplete: boolean;
  sectionsComplete: number;
  totalSections: number;
}

// Form data for creating a new city
export interface CreateCityFormData {
  name: string;
  state: string;
}

// Update checklist form data
export interface UpdateChecklistFormData {
  // Legal
  legal_renter_terms?: boolean;
  legal_owner_terms?: boolean;
  legal_insurance_disclosure?: boolean;
  legal_damage_policy?: boolean;
  legal_privacy_policy?: boolean;
  // Insurance
  insurance_provider_name?: string;
  insurance_coverage_type?: string;
  insurance_confirmation_ref?: string;
  insurance_active?: boolean;
  // Payments
  payments_stripe_active?: boolean;
  payments_connect_enabled?: boolean;
  payments_test_payment?: boolean;
  payments_test_payout?: boolean;
  // Operations
  ops_dispute_tested?: boolean;
  ops_damage_tested?: boolean;
  ops_cancellation_tested?: boolean;
  ops_payout_delay_tested?: boolean;
  // Support
  support_email?: string;
  support_emergency_procedure?: string;
  support_confirmed?: boolean;
  // Supply minimums
  min_approved_cars?: number;
  min_approved_owners?: number;
}

// US States for dropdown
export const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
  { code: "DC", name: "District of Columbia" },
] as const;
