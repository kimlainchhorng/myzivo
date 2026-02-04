/**
 * Risk Assessment Hook
 * Client-side risk scoring for booking flows
 */

import { useState, useCallback, useEffect } from "react";
import { detectBot, getDeviceFingerprint, InteractionTracker } from "@/lib/security/botDetection";
import { 
  calculateRiskScore, 
  getRiskDecision, 
  RISK_THRESHOLDS 
} from "@/config/fraudPrevention";

export interface RiskAssessmentResult {
  score: number;
  decision: 'approve' | 'review' | 'decline' | '3ds_required';
  signals: string[];
  requiresManualReview: boolean;
  requires3DS: boolean;
  deviceFingerprint: string;
  botScore: number;
}

interface UseRiskAssessmentOptions {
  /** Enable interaction tracking */
  trackInteraction?: boolean;
  /** Initial risk signals */
  initialSignals?: string[];
}

export function useRiskAssessment(options: UseRiskAssessmentOptions = {}) {
  const { trackInteraction = true, initialSignals = [] } = options;
  
  const [signals, setSignals] = useState<string[]>(initialSignals);
  const [interactionTracker] = useState(() => 
    trackInteraction ? new InteractionTracker() : null
  );
  const [assessment, setAssessment] = useState<RiskAssessmentResult | null>(null);

  // Add a risk signal
  const addSignal = useCallback((signalId: string) => {
    setSignals(prev => {
      if (prev.includes(signalId)) return prev;
      return [...prev, signalId];
    });
  }, []);

  // Remove a risk signal
  const removeSignal = useCallback((signalId: string) => {
    setSignals(prev => prev.filter(s => s !== signalId));
  }, []);

  // Check for bot behavior
  const checkBotBehavior = useCallback(() => {
    const botResult = detectBot();
    
    if (botResult.isBot) {
      addSignal('bot_detected');
    }
    
    // Check interaction patterns
    if (interactionTracker) {
      const interactionScore = interactionTracker.getInteractionScore();
      if (interactionScore > 20) {
        addSignal('no_mouse_movement');
      }
    }
    
    return botResult;
  }, [addSignal, interactionTracker]);

  // Perform full risk assessment
  const assess = useCallback((): RiskAssessmentResult => {
    // Check bot behavior first
    const botResult = checkBotBehavior();
    
    // Calculate score from all signals
    const score = calculateRiskScore(signals);
    const decision = getRiskDecision(score);
    
    const result: RiskAssessmentResult = {
      score,
      decision,
      signals: [...signals],
      requiresManualReview: score >= RISK_THRESHOLDS.MEDIUM_RISK && score < RISK_THRESHOLDS.HIGH_RISK,
      requires3DS: score >= RISK_THRESHOLDS.REQUIRE_3DS,
      deviceFingerprint: getDeviceFingerprint(),
      botScore: botResult.score,
    };
    
    setAssessment(result);
    return result;
  }, [signals, checkBotBehavior]);

  // Check specific conditions and add signals
  const checkConditions = useCallback((conditions: {
    isNewAccount?: boolean;
    emailVerified?: boolean;
    bookingValue?: number;
    cardCountry?: string;
    ipCountry?: string;
    failedPaymentAttempts?: number;
    isPrepaidCard?: boolean;
    isFirstBooking?: boolean;
  }) => {
    const {
      isNewAccount,
      emailVerified,
      bookingValue,
      cardCountry,
      ipCountry,
      failedPaymentAttempts,
      isPrepaidCard,
      isFirstBooking,
    } = conditions;

    if (isNewAccount) {
      addSignal('new_account');
    }

    if (emailVerified === false) {
      addSignal('unverified_email');
    }

    if (bookingValue && bookingValue > 2000 && isFirstBooking) {
      addSignal('high_value_first_booking');
    }

    if (cardCountry && ipCountry && cardCountry !== ipCountry) {
      addSignal('card_country_mismatch');
    }

    if (failedPaymentAttempts && failedPaymentAttempts >= 3) {
      addSignal('failed_payment_attempts');
    }

    if (isPrepaidCard) {
      addSignal('prepaid_card');
    }
  }, [addSignal]);

  // Get current score without finalizing
  const getCurrentScore = useCallback(() => {
    return calculateRiskScore(signals);
  }, [signals]);

  // Reset assessment
  const reset = useCallback(() => {
    setSignals(initialSignals);
    setAssessment(null);
  }, [initialSignals]);

  return {
    signals,
    assessment,
    addSignal,
    removeSignal,
    checkConditions,
    assess,
    getCurrentScore,
    reset,
    interactionStats: interactionTracker?.getStats(),
  };
}

export default useRiskAssessment;
