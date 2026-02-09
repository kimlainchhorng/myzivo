/**
 * Checkout Risk Assessment Hook
 * Specialized risk scoring for checkout flow with verification gating
 */

import { useMemo } from "react";
import { useRiskAssessment } from "@/hooks/useRiskAssessment";
import { RISK_THRESHOLDS } from "@/config/fraudPrevention";

export interface CheckoutRiskResult {
  /** Combined risk score (0-100) */
  score: number;
  /** Decision based on score */
  decision: 'approve' | 'review' | 'decline' | '3ds_required';
  /** Whether phone verification is required */
  requiresPhoneVerification: boolean;
  /** Whether payment verification (3DS) is required */
  requiresPaymentVerification: boolean;
  /** List of blocking conditions */
  blockers: string[];
  /** Whether user can proceed with checkout */
  canProceed: boolean;
  /** Risk signals detected */
  signals: string[];
}

interface CheckoutRiskOptions {
  /** Total order value in dollars */
  orderTotal: number;
  /** Whether this is user's first order */
  isFirstOrder: boolean;
  /** Whether user's phone is verified */
  phoneVerified: boolean;
  /** Whether user's email is verified */
  emailVerified?: boolean;
  /** Whether user account is new (< 24h) */
  isNewAccount?: boolean;
  /** Number of failed payment attempts */
  failedPaymentAttempts?: number;
}

/**
 * Hook to assess checkout risk and determine verification requirements
 */
export function useCheckoutRiskAssessment(options: CheckoutRiskOptions): CheckoutRiskResult {
  const {
    orderTotal,
    isFirstOrder,
    phoneVerified,
    emailVerified = true,
    isNewAccount = false,
    failedPaymentAttempts = 0,
  } = options;

  const baseRiskAssessment = useRiskAssessment({
    trackInteraction: true,
    initialSignals: [],
  });

  const result = useMemo(() => {
    const signals: string[] = [...baseRiskAssessment.signals];
    let score = baseRiskAssessment.getCurrentScore();

    // Add checkout-specific risk signals
    
    // High value + first order: +20 points
    if (orderTotal > 100 && isFirstOrder) {
      signals.push('high_value_first_order');
      score += 20;
    }

    // Phone not verified: +15 points
    if (!phoneVerified) {
      signals.push('phone_not_verified');
      score += 15;
    }

    // Email not verified: +10 points
    if (!emailVerified) {
      signals.push('email_not_verified');
      score += 10;
    }

    // New account: +10 points
    if (isNewAccount) {
      signals.push('new_account');
      score += 10;
    }

    // Failed payment attempts: +35 points for 3+
    if (failedPaymentAttempts >= 3) {
      signals.push('failed_payment_attempts');
      score += 35;
    } else if (failedPaymentAttempts >= 1) {
      score += failedPaymentAttempts * 10;
    }

    // Cap score at 100
    score = Math.min(score, 100);

    // Determine decision
    let decision: 'approve' | 'review' | 'decline' | '3ds_required';
    if (score >= RISK_THRESHOLDS.HIGH_RISK) {
      decision = 'decline';
    } else if (score >= RISK_THRESHOLDS.MEDIUM_RISK) {
      decision = 'review';
    } else if (score >= RISK_THRESHOLDS.REQUIRE_3DS) {
      decision = '3ds_required';
    } else {
      decision = 'approve';
    }

    // Determine verification requirements
    const requiresPhoneVerification = score >= RISK_THRESHOLDS.MEDIUM_RISK && !phoneVerified;
    const requiresPaymentVerification = score >= RISK_THRESHOLDS.REQUIRE_3DS;

    // Build blockers list
    const blockers: string[] = [];
    if (requiresPhoneVerification) {
      blockers.push('Phone verification required');
    }
    if (decision === 'decline') {
      blockers.push('Order cannot be processed');
    }

    // User can proceed if:
    // - Score is below medium risk threshold, OR
    // - Score is >= medium but phone is verified
    const canProceed = score < RISK_THRESHOLDS.MEDIUM_RISK || 
                       (score >= RISK_THRESHOLDS.MEDIUM_RISK && phoneVerified && decision !== 'decline');

    return {
      score,
      decision,
      requiresPhoneVerification,
      requiresPaymentVerification,
      blockers,
      canProceed,
      signals,
    };
  }, [
    orderTotal,
    isFirstOrder,
    phoneVerified,
    emailVerified,
    isNewAccount,
    failedPaymentAttempts,
    baseRiskAssessment.signals,
    baseRiskAssessment.getCurrentScore,
  ]);

  return result;
}

export default useCheckoutRiskAssessment;
