/**
 * Chargeback Evidence Collection System
 * 
 * Collects and stores evidence for chargeback defense
 */

import { getDeviceFingerprint } from './botDetection';
import { CHARGEBACK_EVIDENCE } from '@/config/fraudPrevention';

export interface BookingEvidence {
  orderId: string;
  userId?: string;
  collectedAt: string;
  
  // Required evidence
  termsAcceptedAt: string;
  fareRulesShown: boolean;
  ipAddress?: string;
  deviceFingerprint: string;
  userAgent: string;
  
  // Payment evidence
  paymentIntentId?: string;
  paymentMethod?: string;
  cardLast4?: string;
  cardCountry?: string;
  
  // Booking evidence
  confirmationNumber?: string;
  supplierReference?: string;
  confirmationEmailSent: boolean;
  confirmationEmailSentAt?: string;
  
  // Additional context
  sessionId: string;
  searchParams?: Record<string, unknown>;
  checkoutDurationMs?: number;
  interactionStats?: {
    mouseMovements: number;
    clicks: number;
    keyPresses: number;
  };
}

/**
 * Collect booking evidence for chargeback defense
 */
export function collectBookingEvidence(
  orderId: string,
  userId: string | undefined,
  sessionId: string,
  termsAcceptedAt: Date,
  fareRulesShown: boolean = true
): BookingEvidence {
  const now = new Date().toISOString();
  
  return {
    orderId,
    userId,
    collectedAt: now,
    
    // Required evidence
    termsAcceptedAt: termsAcceptedAt.toISOString(),
    fareRulesShown,
    deviceFingerprint: getDeviceFingerprint(),
    userAgent: navigator.userAgent,
    
    // Booking defaults
    confirmationEmailSent: false,
    sessionId,
  };
}

/**
 * Add payment evidence to booking record
 */
export function addPaymentEvidence(
  evidence: BookingEvidence,
  paymentData: {
    paymentIntentId: string;
    paymentMethod?: string;
    cardLast4?: string;
    cardCountry?: string;
  }
): BookingEvidence {
  return {
    ...evidence,
    paymentIntentId: paymentData.paymentIntentId,
    paymentMethod: paymentData.paymentMethod,
    cardLast4: paymentData.cardLast4,
    cardCountry: paymentData.cardCountry,
  };
}

/**
 * Add confirmation evidence to booking record
 */
export function addConfirmationEvidence(
  evidence: BookingEvidence,
  confirmationData: {
    confirmationNumber: string;
    supplierReference?: string;
    emailSent: boolean;
  }
): BookingEvidence {
  return {
    ...evidence,
    confirmationNumber: confirmationData.confirmationNumber,
    supplierReference: confirmationData.supplierReference,
    confirmationEmailSent: confirmationData.emailSent,
    confirmationEmailSentAt: confirmationData.emailSent ? new Date().toISOString() : undefined,
  };
}

/**
 * Serialize evidence for storage
 */
export function serializeEvidence(evidence: BookingEvidence): string {
  return JSON.stringify(evidence);
}

/**
 * Get evidence checklist status
 */
export function getEvidenceChecklist(evidence: BookingEvidence): {
  type: string;
  description: string;
  collected: boolean;
  required: boolean;
}[] {
  return CHARGEBACK_EVIDENCE.map(item => {
    let collected = false;
    
    switch (item.type) {
      case 'terms_acceptance':
        collected = !!evidence.termsAcceptedAt;
        break;
      case 'fare_rules_shown':
        collected = evidence.fareRulesShown;
        break;
      case 'payment_authorization':
        collected = !!evidence.paymentIntentId;
        break;
      case 'ticket_confirmation':
        collected = !!evidence.confirmationNumber;
        break;
      case 'ip_address':
        collected = !!evidence.ipAddress;
        break;
      case 'device_fingerprint':
        collected = !!evidence.deviceFingerprint;
        break;
      case 'confirmation_email':
        collected = evidence.confirmationEmailSent;
        break;
      case 'user_agent':
        collected = !!evidence.userAgent;
        break;
      case 'confirmation_page':
        collected = !!evidence.confirmationNumber;
        break;
      default:
        collected = false;
    }
    
    return {
      type: item.type,
      description: item.description,
      collected,
      required: item.required,
    };
  });
}

/**
 * Validate evidence is complete for chargeback defense
 */
export function validateEvidenceComplete(evidence: BookingEvidence): {
  complete: boolean;
  missingRequired: string[];
  missingOptional: string[];
} {
  const checklist = getEvidenceChecklist(evidence);
  
  const missingRequired = checklist
    .filter(item => item.required && !item.collected)
    .map(item => item.type);
    
  const missingOptional = checklist
    .filter(item => !item.required && !item.collected)
    .map(item => item.type);
  
  return {
    complete: missingRequired.length === 0,
    missingRequired,
    missingOptional,
  };
}
