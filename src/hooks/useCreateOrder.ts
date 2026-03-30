/** Create order — inserts into food_orders via Supabase */
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface HolderInfo {
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  [key: string]: any;
}

export function useCreateOrder() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = useCallback(async (params: {
    restaurantId: string;
    items: any[];
    deliveryAddress: string;
    totalAmount: number;
    paymentType?: string;
    [key: string]: any;
  }): Promise<{ orderId: string } | null> => {
    if (!user) {
      setError("Please sign in to place an order");
      toast.error("Please sign in first");
      return null;
    }
    setIsLoading(true);
    setError(null);
    try {
      const trackingCode = `ZE-${Date.now().toString(36).toUpperCase().slice(-6)}`;
      const { data, error: insertError } = await supabase
        .from("food_orders")
        .insert({
          customer_id: user.id,
          restaurant_id: params.restaurantId,
          items: params.items,
          delivery_address: params.deliveryAddress,
          total_amount: params.totalAmount,
          payment_type: params.paymentType || "card",
          tracking_code: trackingCode,
          status: "pending",
          subtotal: params.totalAmount,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;
      toast.success("Order created!");
      return { orderId: data.id };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create order";
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return { createOrder, isLoading, error };
}
