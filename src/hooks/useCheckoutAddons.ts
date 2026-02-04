/**
 * useCheckoutAddons Hook
 * Manages add-on selections during checkout
 */

import { useState, useCallback, useMemo } from "react";
import { UpsellProduct } from "@/config/checkoutUpsells";

export interface SelectedAddon {
  product: UpsellProduct;
  quantity: number;
}

export interface CheckoutAddonsState {
  selectedAddons: Map<string, SelectedAddon>;
  insurancePlanId: string | null;
}

export function useCheckoutAddons(basePrice: number = 0) {
  const [selectedAddons, setSelectedAddons] = useState<Map<string, SelectedAddon>>(new Map());
  const [insurancePlanId, setInsurancePlanId] = useState<string | null>(null);
  const [insurancePrice, setInsurancePrice] = useState<number>(0);

  const toggleAddon = useCallback((product: UpsellProduct, quantity: number = 1) => {
    setSelectedAddons((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(product.id)) {
        newMap.delete(product.id);
      } else {
        newMap.set(product.id, { product, quantity });
      }
      return newMap;
    });
  }, []);

  const updateAddonQuantity = useCallback((productId: string, quantity: number) => {
    setSelectedAddons((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(productId);
      if (existing) {
        if (quantity <= 0) {
          newMap.delete(productId);
        } else {
          newMap.set(productId, { ...existing, quantity });
        }
      }
      return newMap;
    });
  }, []);

  const selectInsurance = useCallback((planId: string, price: number) => {
    setInsurancePlanId(planId);
    setInsurancePrice(price);
  }, []);

  const clearAddons = useCallback(() => {
    setSelectedAddons(new Map());
    setInsurancePlanId(null);
    setInsurancePrice(0);
  }, []);

  const isAddonSelected = useCallback(
    (productId: string) => selectedAddons.has(productId),
    [selectedAddons]
  );

  const addonsTotal = useMemo(() => {
    let total = 0;
    selectedAddons.forEach(({ product, quantity }) => {
      total += product.price * quantity;
    });
    return total;
  }, [selectedAddons]);

  const grandTotal = useMemo(() => {
    return basePrice + addonsTotal + insurancePrice;
  }, [basePrice, addonsTotal, insurancePrice]);

  const selectedAddonsList = useMemo(() => {
    return Array.from(selectedAddons.values());
  }, [selectedAddons]);

  // Format for Stripe line items
  const getStripeLineItems = useCallback(() => {
    const items: Array<{ name: string; amount: number; quantity: number }> = [];
    
    selectedAddons.forEach(({ product, quantity }) => {
      items.push({
        name: product.name,
        amount: product.price * 100, // Convert to cents
        quantity,
      });
    });

    if (insurancePlanId && insurancePrice > 0) {
      items.push({
        name: `Travel Insurance - ${insurancePlanId}`,
        amount: insurancePrice * 100,
        quantity: 1,
      });
    }

    return items;
  }, [selectedAddons, insurancePlanId, insurancePrice]);

  return {
    // State
    selectedAddons: selectedAddonsList,
    insurancePlanId,
    insurancePrice,
    addonsTotal,
    grandTotal,
    
    // Actions
    toggleAddon,
    updateAddonQuantity,
    selectInsurance,
    clearAddons,
    isAddonSelected,
    getStripeLineItems,
  };
}
