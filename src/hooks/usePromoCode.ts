import { useState, useCallback, useMemo } from "react";
import { 
  validatePromoCode, 
  calculateDiscount, 
  PromoCode 
} from "@/lib/promoCodeService";
import { toast } from "sonner";

export interface UsePromoCodeReturn {
  promoCode: PromoCode | null;
  isValidating: boolean;
  error: string | null;
  discountAmount: number;
  finalPrice: number;
  applyPromoCode: (code: string) => Promise<boolean>;
  removePromoCode: () => void;
}

export function usePromoCode(originalPrice: number): UsePromoCodeReturn {
  const [promoCode, setPromoCode] = useState<PromoCode | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { discountAmount, finalPrice } = useMemo(() => {
    if (promoCode) {
      return calculateDiscount(originalPrice, promoCode);
    }
    return { discountAmount: 0, finalPrice: originalPrice };
  }, [originalPrice, promoCode]);

  const applyPromoCode = useCallback(async (code: string): Promise<boolean> => {
    if (!code.trim()) {
      setError("Please enter a promo code");
      return false;
    }

    setIsValidating(true);
    setError(null);

    const result = await validatePromoCode(code);
    setIsValidating(false);

    if (!result.valid) {
      setError(result.error || "Invalid promo code");
      toast.error(result.error || "Invalid promo code");
      return false;
    }

    setPromoCode(result.promoCode!);
    toast.success("Promo applied successfully");
    return true;
  }, []);

  const removePromoCode = useCallback(() => {
    setPromoCode(null);
    setError(null);
  }, []);

  return {
    promoCode,
    isValidating,
    error,
    discountAmount,
    finalPrice,
    applyPromoCode,
    removePromoCode,
  };
}
