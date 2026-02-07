import { supabase } from "@/integrations/supabase/client";

export interface PromoCode {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  max_uses: number | null;
  uses: number;
  expires_at: string | null;
  is_active: boolean;
}

export interface ValidatePromoResult {
  valid: boolean;
  promoCode?: PromoCode;
  error?: string;
}

export async function validatePromoCode(code: string): Promise<ValidatePromoResult> {
  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return { valid: false, error: "Invalid promo code" };
  }

  // Check expiration
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false, error: "This promo code has expired" };
  }

  // Check max uses
  if (data.max_uses !== null && data.uses >= data.max_uses) {
    return { valid: false, error: "This promo code has reached its limit" };
  }

  return { 
    valid: true, 
    promoCode: {
      id: data.id,
      code: data.code,
      discount_type: data.discount_type as "percent" | "fixed",
      discount_value: Number(data.discount_value),
      max_uses: data.max_uses,
      uses: data.uses,
      expires_at: data.expires_at,
      is_active: data.is_active,
    }
  };
}

export async function incrementPromoCodeUse(promoId: string): Promise<boolean> {
  // Use the RPC function for atomic increment
  const { error } = await supabase.rpc("increment_promo_uses", { 
    promo_id: promoId 
  });
  
  return !error;
}

export function calculateDiscount(
  originalPrice: number,
  promoCode: PromoCode
): { discountAmount: number; finalPrice: number } {
  let discountAmount = 0;

  if (promoCode.discount_type === "percent") {
    discountAmount = (originalPrice * promoCode.discount_value) / 100;
  } else {
    discountAmount = promoCode.discount_value;
  }

  // Ensure discount doesn't exceed original price
  discountAmount = Math.min(discountAmount, originalPrice);
  
  return {
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalPrice: Math.round((originalPrice - discountAmount) * 100) / 100,
  };
}
