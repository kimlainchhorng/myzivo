/** Promo code service stub */
export interface PromoCode {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrder?: number;
}

export async function validatePromoCode(_code: string): Promise<{ valid: boolean; error?: string; promoCode?: PromoCode }> {
  return { valid: false, error: "Promo codes are not available at this time." };
}

export function calculateDiscount(price: number, promo: PromoCode) {
  const discount = promo.type === "percentage" ? price * (promo.value / 100) : promo.value;
  return { discountAmount: discount, finalPrice: price - discount };
}
