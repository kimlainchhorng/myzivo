/**
 * useEatsOrder — Handles placing a food order, payment, and driver dispatch
 */
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createFoodOrder, type EatsCartItem } from "./useEatsData";
import { useEatsNotifications } from "./useEatsNotifications";

export interface PlaceOrderParams {
  restaurantId: string;
  items: EatsCartItem[];
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  tipAmount: number;
  totalAmount: number;
  paymentType: "cash" | "card" | "wallet";
  specialInstructions?: string;
  isExpress?: boolean;
  expressFee?: number;
  promoCode?: string;
  discountAmount?: number;
  restaurantName?: string;
  pickupLat?: number;
  pickupLng?: number;
}

export function useEatsOrder() {
  const [placing, setPlacing] = useState(false);
  const { notify } = useEatsNotifications();

  const placeOrder = async (params: PlaceOrderParams): Promise<{
    orderId: string;
    trackingCode: string;
  } | null> => {
    setPlacing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to place an order");
        return null;
      }

      // 1. Create food order in DB
      const result = await createFoodOrder({
        customerId: user.id,
        restaurantId: params.restaurantId,
        items: params.items,
        deliveryAddress: params.deliveryAddress,
        deliveryLat: params.deliveryLat,
        deliveryLng: params.deliveryLng,
        subtotal: params.subtotal,
        deliveryFee: params.deliveryFee,
        serviceFee: params.serviceFee,
        tipAmount: params.tipAmount,
        totalAmount: params.totalAmount,
        paymentType: params.paymentType,
        specialInstructions: params.specialInstructions,
        isExpress: params.isExpress,
        expressFee: params.expressFee,
        promoCode: params.promoCode,
        discountAmount: params.discountAmount,
      });

      const orderId = result.order.id;
      const trackingCode = result.trackingCode;

      // 2. Handle payment
      if (params.paymentType === "card") {
        const totalCents = Math.round(params.totalAmount * 100);
        const { data, error } = await supabase.functions.invoke("create-eats-payment", {
          body: { order_id: orderId, amount_cents: totalCents },
        });
        if (error || !data?.ok) {
          // Mark order payment failed but don't block - they can retry
          console.error("[EatsOrder] Payment intent error:", error || data?.error);
          toast.error("Card payment setup failed. You can retry from order details.");
        } else {
          // Update payment status to processing
          await supabase
            .from("food_orders")
            .update({ payment_status: "processing" } as any)
            .eq("id", orderId);
        }
      } else if (params.paymentType === "cash") {
        await supabase
          .from("food_orders")
          .update({ payment_status: "cash_on_delivery" } as any)
          .eq("id", orderId);
      }

      // 3. Dispatch delivery driver via jobs table
      try {
        const { error: jobError } = await supabase.from("jobs").insert({
          customer_id: user.id,
          job_type: "food_delivery" as any,
          status: "requested" as any,
          pickup_address: params.restaurantName || "Restaurant",
          pickup_lat: params.pickupLat || 0,
          pickup_lng: params.pickupLng || 0,
          dropoff_address: params.deliveryAddress,
          dropoff_lat: params.deliveryLat,
          dropoff_lng: params.deliveryLng,
          notes: `Food order: ${orderId}`,
          price_total: params.totalAmount,
          requested_at: new Date().toISOString(),
        } as any);

        if (jobError) {
          console.error("[EatsOrder] Job creation error:", jobError);
        } else {
          // Trigger dispatch
          const { data: jobData } = await supabase
            .from("jobs")
            .select("id")
            .eq("customer_id", user.id)
            .eq("job_type", "food_delivery" as any)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (jobData?.id) {
            await supabase.functions.invoke("dispatch-start", {
              body: { job_id: jobData.id, offer_ttl_seconds: 30, radius_meters: 15000 },
            });
          }
        }
      } catch (dispatchErr) {
        console.error("[EatsOrder] Dispatch error:", dispatchErr);
      }

      // 4. Notify
      notify("order_placed", {
        orderId: trackingCode,
        restaurantName: params.restaurantName,
      });

      toast.success("Order placed successfully!");
      return { orderId, trackingCode };
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
      return null;
    } finally {
      setPlacing(false);
    }
  };

  return { placeOrder, placing };
}
