/**
 * Cart Validation Hook
 * Checks cart items against current menu availability before checkout
 */
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EATS_TABLES } from "@/lib/eatsTables";
import type { CartItem } from "@/contexts/CartContext";

interface UnavailableItem {
  id: string;
  name: string;
}

interface CartValidationResult {
  isValid: boolean;
  unavailableItems: UnavailableItem[];
  availableItems: CartItem[];
  isValidating: boolean;
  error: string | null;
}

export function useCartValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [unavailableItems, setUnavailableItems] = useState<UnavailableItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const validateCart = useCallback(
    async (items: CartItem[]): Promise<CartValidationResult> => {
      if (items.length === 0) {
        return {
          isValid: true,
          unavailableItems: [],
          availableItems: [],
          isValidating: false,
          error: null,
        };
      }

      setIsValidating(true);
      setError(null);

      try {
        // Get the restaurant ID from the first cart item
        const restaurantId = items[0].restaurantId;
        const itemIds = items.map((item) => item.id);

        // Fetch current availability for all items in cart
        const { data: menuItems, error: fetchError } = await supabase
          .from(EATS_TABLES.menuItems)
          .select("id, name, is_available")
          .eq("restaurant_id", restaurantId)
          .in("id", itemIds);

        if (fetchError) {
          throw fetchError;
        }

        // Create a map of item availability
        const availabilityMap = new Map(
          menuItems?.map((item) => [item.id, item]) || []
        );

        // Identify unavailable items
        const unavailable: UnavailableItem[] = [];
        const available: CartItem[] = [];

        for (const cartItem of items) {
          const menuItem = availabilityMap.get(cartItem.id);
          
          // Item is unavailable if:
          // 1. It doesn't exist in the database anymore
          // 2. is_available is explicitly false
          if (!menuItem || menuItem.is_available === false) {
            unavailable.push({
              id: cartItem.id,
              name: cartItem.name,
            });
          } else {
            available.push(cartItem);
          }
        }

        setUnavailableItems(unavailable);
        setIsValidating(false);

        return {
          isValid: unavailable.length === 0,
          unavailableItems: unavailable,
          availableItems: available,
          isValidating: false,
          error: null,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to validate cart";
        setError(errorMessage);
        setIsValidating(false);

        return {
          isValid: false,
          unavailableItems: [],
          availableItems: items,
          isValidating: false,
          error: errorMessage,
        };
      }
    },
    []
  );

  const clearValidation = useCallback(() => {
    setUnavailableItems([]);
    setError(null);
  }, []);

  return {
    validateCart,
    clearValidation,
    unavailableItems,
    isValidating,
    error,
  };
}
