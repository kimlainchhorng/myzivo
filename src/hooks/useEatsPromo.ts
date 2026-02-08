/**
 * Eats Promo Code Hook
 * Validates and applies promo codes for food orders
 */
import { useState } from "react";
import { 
  validatePromoCode, 
  calculateDiscount, 
  type PromoCode, 
  type ValidatePromoResult 
} from "@/lib/promoCodeService";

export interface EatsPromoState {
  promoCode: PromoCode | null;
  discountAmount: number;
  isValidating: boolean;
  error: string | null;
}

export function useEatsPromo() {
  const [state, setState] = useState<EatsPromoState>({
    promoCode: null,
    discountAmount: 0,
    isValidating: false,
    error: null,
  });

  const applyPromo = async (code: string, subtotal: number): Promise<boolean> => {
    if (!code.trim()) {
      setState((prev) => ({ ...prev, error: "Please enter a promo code" }));
      return false;
    }

    setState((prev) => ({ ...prev, isValidating: true, error: null }));

    try {
      const result: ValidatePromoResult = await validatePromoCode(code);

      if (!result.valid || !result.promoCode) {
        setState({
          promoCode: null,
          discountAmount: 0,
          isValidating: false,
          error: result.error || "Invalid promo code",
        });
        return false;
      }

      // Check minimum fare if applicable (min_fare may not exist on all promo codes)
      const minFare = (result.promoCode as any).min_fare;
      if (minFare && subtotal < minFare) {
        setState({
          promoCode: null,
          discountAmount: 0,
          isValidating: false,
          error: `Minimum order of $${minFare.toFixed(2)} required`,
        });
        return false;
      }

      // Calculate discount
      const { discountAmount } = calculateDiscount(subtotal, result.promoCode);

      setState({
        promoCode: result.promoCode,
        discountAmount,
        isValidating: false,
        error: null,
      });

      return true;
    } catch (e) {
      setState({
        promoCode: null,
        discountAmount: 0,
        isValidating: false,
        error: "Failed to validate promo code",
      });
      return false;
    }
  };

  const clearPromo = () => {
    setState({
      promoCode: null,
      discountAmount: 0,
      isValidating: false,
      error: null,
    });
  };

  const recalculateDiscount = (newSubtotal: number) => {
    if (state.promoCode) {
      const { discountAmount } = calculateDiscount(newSubtotal, state.promoCode);
      setState((prev) => ({ ...prev, discountAmount }));
    }
  };

  return {
    ...state,
    applyPromo,
    clearPromo,
    recalculateDiscount,
  };
}
