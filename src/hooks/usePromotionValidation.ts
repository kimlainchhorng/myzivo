/** Promotion validation stub */
import { useState, useCallback } from "react";

interface AppliedPromo {
  code: string;
  description: string;
  valid: boolean;
  discount_amount?: number;
}

export function usePromotionValidation(..._args: any[]) {
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [discount, setDiscount] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateCode = useCallback(async (..._args: any[]) => {
    setIsValidating(false);
    setError("Promotions not available");
    return { valid: false, error: "Promotions not available", code: "", description: "" } as AppliedPromo;
  }, []);

  const removePromo = useCallback(() => {
    setAppliedPromo(null);
    setDiscount(0);
    setError(null);
  }, []);

  return { 
    appliedPromo, 
    promoCode: appliedPromo?.code || null, 
    discount, 
    isValidating, 
    error,
    validateCode, 
    validatePromo: validateCode, 
    removePromo,
    clearPromo: removePromo,
  };
}
