/**
 * useCreateOrder Hook
 * Creates a new travel order from cart items
 */
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { TravelCartItem } from "@/contexts/TravelCartContext";

export interface HolderInfo {
  name: string;
  email: string;
  phone?: string;
}

export interface CreateOrderResult {
  orderId: string;
  orderNumber: string;
  total: number;
  currency: string;
}

export function useCreateOrder() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = useCallback(
    async (items: TravelCartItem[], holder: HolderInfo): Promise<CreateOrderResult | null> => {
      setIsLoading(true);
      setError(null);

      try {
        // Transform cart items to order items
        const orderItems = items.map((item) => ({
          type: item.type,
          title: item.title,
          startDate: item.startDate,
          endDate: item.endDate,
          adults: item.adults,
          children: item.children,
          quantity: item.quantity,
          price: item.price,
          meta: item.meta,
        }));

        const { data, error: invokeError } = await supabase.functions.invoke(
          "create-travel-order",
          {
            body: {
              items: orderItems,
              holder,
              currency: items[0]?.currency || "USD",
            },
          }
        );

        if (invokeError) throw invokeError;
        if (!data?.success) throw new Error(data?.error || "Failed to create order");

        return {
          orderId: data.orderId,
          orderNumber: data.orderNumber,
          total: data.total,
          currency: data.currency,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create order";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { createOrder, isLoading, error };
}
