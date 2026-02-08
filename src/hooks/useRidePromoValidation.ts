/**
 * Ride Promo Validation Hook
 * Validates promo codes specifically for rides using validate_ride_promo RPC
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ValidatedRidePromo {
  valid: boolean;
  promo_id?: string;
  code?: string;
  discount_type?: 'percent' | 'fixed';
  discount_value?: number;
  discount_amount?: number;
  final_total?: number;
  description?: string;
  error?: string;
}

interface UseRidePromoValidationOptions {
  pickupCity?: string;
}

export function useRidePromoValidation(options: UseRidePromoValidationOptions = {}) {
  const { user } = useAuth();
  const [isValidating, setIsValidating] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<ValidatedRidePromo | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const validateCode = useCallback(async (
    code: string,
    fareAmount: number,
    pickupCity?: string
  ): Promise<ValidatedRidePromo> => {
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      return { valid: false, error: 'Please enter a promo code' };
    }

    setIsValidating(true);
    setPromoError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('validate_ride_promo', {
        p_code: trimmedCode.toUpperCase(),
        p_user_id: user?.id || null,
        p_pickup_city: pickupCity || options.pickupCity || null,
        p_fare_amount: fareAmount,
      });

      if (rpcError) {
        console.error('Promo validation RPC error:', rpcError);
        setPromoError('Failed to validate promo code');
        return { valid: false, error: 'Failed to validate promo code' };
      }

      // Parse the JSONB response
      const result = (typeof data === 'object' && data !== null ? data : { valid: false }) as unknown as ValidatedRidePromo;

      if (result.valid) {
        setAppliedPromo(result);
        toast.success(result.description || `Promo code applied: ${trimmedCode.toUpperCase()}`);
      } else {
        setPromoError(result.error || 'Invalid promo code');
        toast.error(result.error || 'Invalid promo code');
      }

      return result;
    } catch (err) {
      console.error('Promo validation error:', err);
      setPromoError('Failed to validate promo code');
      return { valid: false, error: 'Failed to validate promo code' };
    } finally {
      setIsValidating(false);
    }
  }, [user?.id, options.pickupCity]);

  const removePromo = useCallback(() => {
    setAppliedPromo(null);
    setPromoError(null);
  }, []);

  /**
   * Calculate final total with promo applied
   * Returns the discounted total or original if no promo
   */
  const calculateFinalTotal = useCallback((originalTotal: number): {
    discountAmount: number;
    finalTotal: number;
  } => {
    if (!appliedPromo?.valid || !appliedPromo.discount_amount) {
      return {
        discountAmount: 0,
        finalTotal: originalTotal,
      };
    }

    const discountAmount = Math.min(appliedPromo.discount_amount, originalTotal);
    const finalTotal = Math.max(0, originalTotal - discountAmount);

    return {
      discountAmount,
      finalTotal,
    };
  }, [appliedPromo]);

  return {
    isValidating,
    appliedPromo,
    promoError,
    validateCode,
    removePromo,
    calculateFinalTotal,
  };
}
