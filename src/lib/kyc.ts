/**
 * KYC (Know Your Customer) Types and Utilities
 * For driver and merchant verification workflows
 */

import { supabase } from "@/integrations/supabase/client";

// Types
export type KYCRole = "driver" | "merchant";

export type KYCStatus = 
  | "draft" 
  | "submitted" 
  | "under_review" 
  | "approved" 
  | "rejected" 
  | "needs_info";

export interface KYCDocument {
  type: string;
  url: string;
  fileName: string;
  uploadedAt: string;
  status: "pending" | "approved" | "rejected";
}

export interface DriverPersonalInfo {
  legalFirstName: string;
  legalLastName: string;
  dateOfBirth: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  ssnLast4?: string;
}

export interface MerchantBusinessInfo {
  legalBusinessName: string;
  businessType: "sole_proprietor" | "llc" | "corporation" | "partnership";
  ein?: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerDateOfBirth: string;
  businessAddressLine1: string;
  businessAddressLine2?: string;
  businessCity: string;
  businessState: string;
  businessZipCode: string;
}

export interface KYCSubmission {
  id: string;
  userId: string;
  role: KYCRole;
  status: KYCStatus;
  currentStep: number;
  completedSteps: number[];
  personalInfo: DriverPersonalInfo | MerchantBusinessInfo | Record<string, unknown>;
  documents: KYCDocument[];
  submittedAt: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  adminNotes: string | null;
  infoRequestedAt: string | null;
  infoRequestMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KYCStep {
  id: number;
  title: string;
  description: string;
  requiredFields: string[];
  requiredDocuments: string[];
}

export interface StatusBadgeConfig {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  icon: string;
  color: string;
}

// Step configurations
export const DRIVER_KYC_STEPS: KYCStep[] = [
  {
    id: 1,
    title: "Personal Information",
    description: "Your legal name, date of birth, and address",
    requiredFields: ["legalFirstName", "legalLastName", "dateOfBirth", "addressLine1", "city", "state", "zipCode"],
    requiredDocuments: [],
  },
  {
    id: 2,
    title: "Driver's License",
    description: "Front and back of your valid driver's license",
    requiredFields: [],
    requiredDocuments: ["license_front", "license_back"],
  },
  {
    id: 3,
    title: "Profile Photo",
    description: "A clear photo of your face (optional for now)",
    requiredFields: [],
    requiredDocuments: [],
  },
  {
    id: 4,
    title: "Vehicle & Insurance",
    description: "Vehicle information and insurance documents",
    requiredFields: [],
    requiredDocuments: [],
  },
  {
    id: 5,
    title: "Review & Submit",
    description: "Review your information and submit for verification",
    requiredFields: [],
    requiredDocuments: [],
  },
];

export const MERCHANT_KYC_STEPS: KYCStep[] = [
  {
    id: 1,
    title: "Business Information",
    description: "Legal business name, type, and EIN (optional)",
    requiredFields: ["legalBusinessName", "businessType", "ownerFirstName", "ownerLastName"],
    requiredDocuments: [],
  },
  {
    id: 2,
    title: "Owner Verification",
    description: "Owner's name, date of birth, and ID document",
    requiredFields: ["ownerDateOfBirth"],
    requiredDocuments: ["owner_id"],
  },
  {
    id: 3,
    title: "Business Documents",
    description: "Business license (optional)",
    requiredFields: [],
    requiredDocuments: [],
  },
  {
    id: 4,
    title: "Payout Readiness",
    description: "Connect your Stripe account for payouts",
    requiredFields: [],
    requiredDocuments: [],
  },
  {
    id: 5,
    title: "Review & Submit",
    description: "Review your information and submit for verification",
    requiredFields: [],
    requiredDocuments: [],
  },
];

// Helper functions
export function getKYCSteps(role: KYCRole): KYCStep[] {
  return role === "driver" ? DRIVER_KYC_STEPS : MERCHANT_KYC_STEPS;
}

export function getTotalSteps(role: KYCRole): number {
  return getKYCSteps(role).length;
}

export function getStatusBadgeConfig(status: KYCStatus): StatusBadgeConfig {
  const configs: Record<KYCStatus, StatusBadgeConfig> = {
    draft: {
      label: "Draft",
      variant: "secondary",
      icon: "Edit",
      color: "text-muted-foreground",
    },
    submitted: {
      label: "Pending Review",
      variant: "outline",
      icon: "Clock",
      color: "text-amber-500",
    },
    under_review: {
      label: "Under Review",
      variant: "outline",
      icon: "Eye",
      color: "text-blue-500",
    },
    approved: {
      label: "Approved",
      variant: "default",
      icon: "CheckCircle",
      color: "text-green-500",
    },
    rejected: {
      label: "Rejected",
      variant: "destructive",
      icon: "XCircle",
      color: "text-destructive",
    },
    needs_info: {
      label: "More Info Needed",
      variant: "outline",
      icon: "AlertTriangle",
      color: "text-orange-500",
    },
  };
  return configs[status];
}

export function isStepComplete(
  step: KYCStep,
  personalInfo: Record<string, unknown>,
  documents: KYCDocument[]
): boolean {
  // Check required fields
  const fieldsComplete = step.requiredFields.every(
    (field) => personalInfo[field] && String(personalInfo[field]).trim() !== ""
  );

  // Check required documents
  const docsComplete = step.requiredDocuments.every((docType) =>
    documents.some((doc) => doc.type === docType)
  );

  return fieldsComplete && docsComplete;
}

export async function getDocumentSignedUrl(filePath: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from("kyc-documents")
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
      console.error("Error getting signed URL:", error);
      return null;
    }

    return data.signedUrl;
  } catch (e) {
    console.error("Exception getting signed URL:", e);
    return null;
  }
}

export function formatDocumentType(type: string): string {
  const labels: Record<string, string> = {
    license_front: "Driver's License (Front)",
    license_back: "Driver's License (Back)",
    selfie: "Profile Photo",
    insurance: "Insurance Document",
    vehicle_registration: "Vehicle Registration",
    owner_id: "Owner ID",
    business_license: "Business License",
    ein_letter: "EIN Confirmation Letter",
  };
  return labels[type] || type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export function maskSSN(ssn: string): string {
  if (!ssn) return "";
  return `***-**-${ssn.slice(-4)}`;
}

export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Map database row to frontend type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapKYCSubmission(row: any): KYCSubmission {
  // Handle personal_info from various sources
  let personalInfo: Record<string, unknown> = {};
  if (row.personal_info && typeof row.personal_info === 'object' && !Array.isArray(row.personal_info)) {
    personalInfo = row.personal_info as Record<string, unknown>;
  } else if (row.data_json && typeof row.data_json === 'object' && !Array.isArray(row.data_json)) {
    personalInfo = row.data_json as Record<string, unknown>;
  }

  // Handle documents from various sources
  let documents: KYCDocument[] = [];
  if (Array.isArray(row.documents)) {
    documents = row.documents as KYCDocument[];
  } else if (Array.isArray(row.document_urls_json)) {
    documents = row.document_urls_json as KYCDocument[];
  }

  return {
    id: row.id,
    userId: row.user_id,
    role: row.role as KYCRole,
    status: row.status as KYCStatus,
    currentStep: row.current_step ?? 1,
    completedSteps: row.completed_steps ?? [],
    personalInfo,
    documents,
    submittedAt: row.submitted_at,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    rejectionReason: row.rejection_reason,
    adminNotes: row.admin_notes,
    infoRequestedAt: row.info_requested_at,
    infoRequestMessage: row.info_request_message,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}
