/**
 * Unified Promotion Validation Hook
 * Uses the validate_promo_code RPC as single source of truth
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ValidatedPromo {
  valid: boolean;
  promotion_id?: string;
  code?: string;
  discount_type?: string;
  discount_amount?: number;
  final_total?: number;
  description?: string;
  error?: string;
}

interface UsePromotionValidationOptions {
  serviceType?: string;
  restaurantId?: string;
}

export function usePromotionValidation(options: UsePromotionValidationOptions = {}) {
  const { user } = useAuth();
  const [isValidating, setIsValidating] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<ValidatedPromo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateCode = useCallback(async (
    code: string,
    orderAmount: number,
    restaurantId?: string
  ): Promise<ValidatedPromo> => {
    if (!code.trim()) {
      return { valid: false, error: 'Please enter a promo code' };
    }

    setIsValidating(true);
    setError(null);

    try {
      // Use the validate_promo_code RPC with correct parameter names
      const { data, error: rpcError } = await supabase.rpc('validate_promo_code', {
        p_code: code.toUpperCase(),
        p_order_total: orderAmount,
        p_product_type: options.serviceType || 'eats',
        p_user_id: user?.id || ''
      });

      if (rpcError) {
        console.error('Promo validation error:', rpcError);
        setError('Failed to validate promo code');
        return { valid: false, error: 'Failed to validate promo code' };
      }

      const result = (typeof data === 'object' && data !== null ? data : { valid: false }) as unknown as ValidatedPromo;
      
      if (result.valid) {
        setAppliedPromo(result);
        toast.success(`Promo code applied: ${result.description || code}`);
      } else {
        setError(result.error || 'Invalid promo code');
        toast.error(result.error || 'Invalid promo code');
      }

      return result;
    } catch (err) {
      console.error('Promo validation error:', err);
      setError('Failed to validate promo code');
      return { valid: false, error: 'Failed to validate promo code' };
    } finally {
      setIsValidating(false);
    }
  }, [user?.id, options.restaurantId, options.serviceType]);

  const removePromo = useCallback(() => {
    setAppliedPromo(null);
    setError(null);
  }, []);

  const calculateFinalTotal = useCallback((subtotal: number, deliveryFee: number): {
    discountAmount: number;
    finalTotal: number;
    isFreeDel: boolean;
  } => {
    if (!appliedPromo?.valid) {
      return {
        discountAmount: 0,
        finalTotal: subtotal + deliveryFee,
        isFreeDel: false
      };
    }

    const isFreeDel = appliedPromo.discount_type === 'free_delivery';
    let discountAmount = appliedPromo.discount_amount || 0;
    
    // For free delivery, set delivery fee to 0
    if (isFreeDel) {
      discountAmount = deliveryFee;
    }

    return {
      discountAmount,
      finalTotal: subtotal + (isFreeDel ? 0 : deliveryFee) - (isFreeDel ? 0 : discountAmount),
      isFreeDel
    };
  }, [appliedPromo]);

  return {
    isValidating,
    appliedPromo,
    error,
    validateCode,
    removePromo,
    calculateFinalTotal
  };
}
