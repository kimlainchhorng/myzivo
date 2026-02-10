/**
 * useEatsPayment Hook
 * Handles creating payment intents and processing payments for Eats orders
 */
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CreatePaymentIntentParams {
  restaurantId: string;
  items: Array<{
    menu_item_id: string;
    name: string;
    quantity: number;
    price: number;
    notes?: string;
  }>;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  tax: number;
  discountAmount: number;
  tipAmount?: number;
  total: number;
  deliveryAddress: string;
  promoCode?: string;
  specialInstructions?: string;
}

interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
  orderId: string;
}

export function useEatsPayment() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentIntent = async (
    params: CreatePaymentIntentParams
  ): Promise<PaymentIntentResult | null> => {
    setIsCreating(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "create-eats-payment-intent",
        { body: params }
      );

      if (fnError) {
        throw new Error(fnError.message || "Failed to create payment intent");
      }

      if (!data?.clientSecret) {
        throw new Error("Invalid payment response");
      }

      return {
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId,
        orderId: data.orderId,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment setup failed";
      setError(message);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const confirmPaymentSuccess = async (orderId: string) => {
    try {
      const { error: updateError } = await supabase
        .from("food_orders")
        .update({
          status: "pending", // Ready for restaurant to accept
          payment_status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (updateError) {
        console.error("Failed to update order status:", updateError);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Payment confirmation failed:", err);
      return false;
    }
  };

  const createCashOrder = async (
    params: Omit<CreatePaymentIntentParams, "serviceFee">
  ): Promise<{ orderId: string } | null> => {
    setIsCreating(true);
    setError(null);

    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;

      if (!userId) {
        throw new Error("Please log in to place an order");
      }

      const { data: order, error: orderError } = await supabase
        .from("food_orders")
        .insert({
          customer_id: userId,
          restaurant_id: params.restaurantId,
          items: params.items,
          subtotal: params.subtotal,
          delivery_fee: params.deliveryFee,
          tax: params.tax,
          total_amount: params.total,
          delivery_address: params.deliveryAddress,
          delivery_lat: 0,
          delivery_lng: 0,
          special_instructions: params.specialInstructions || null,
          promo_code: params.promoCode || null,
          discount_amount: params.discountAmount || 0,
          status: "pending" as const,
          payment_status: "pending" as const,
          payment_type: "cash",
        })
        .select()
        .single();

      if (orderError) {
        throw new Error("Failed to create order");
      }

      return { orderId: order.id };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Order creation failed";
      setError(message);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createPaymentIntent,
    confirmPaymentSuccess,
    createCashOrder,
    isCreating,
    error,
    clearError: () => setError(null),
  };
}
