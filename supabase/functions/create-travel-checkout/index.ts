/**
 * Create Travel Checkout Session
 * Creates a Stripe Checkout session for a travel order
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  orderId: string;
  successUrl?: string;
  cancelUrl?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: CheckoutRequest = await req.json();
    const { orderId, successUrl, cancelUrl } = body;

    if (!orderId) {
      throw new Error("Order ID is required");
    }

    // Fetch order with items
    const { data: order, error: orderError } = await supabase
      .from("travel_orders")
      .select(`
        *,
        travel_order_items (*)
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Error fetching order:", orderError);
      throw new Error("Order not found");
    }

    // Validate order status
    if (order.status !== "draft") {
      throw new Error(`Cannot checkout order with status: ${order.status}`);
    }

    const items = order.travel_order_items || [];
    if (items.length === 0) {
      throw new Error("Order has no items");
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Build line items from order items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item: { title: string; price: number; quantity: number; type: string; start_date: string }) => ({
        price_data: {
          currency: order.currency.toLowerCase(),
          product_data: {
            name: item.title,
            description: `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} - ${item.start_date}`,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })
    );

    // Add service fee as separate line item
    if (order.fees > 0) {
      lineItems.push({
        price_data: {
          currency: order.currency.toLowerCase(),
          product_data: {
            name: "ZIVO Service Fee",
            description: "Platform service and booking fee",
          },
          unit_amount: Math.round(order.fees * 100),
        },
        quantity: 1,
      });
    }

    // Determine URLs
    const origin = req.headers.get("origin") || "https://hizovo.com";
    const finalSuccessUrl = successUrl || `${origin}/confirmation/${order.order_number}?session_id={CHECKOUT_SESSION_ID}`;
    const finalCancelUrl = cancelUrl || `${origin}/checkout?cancelled=true&order=${order.order_number}`;

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: order.holder_email,
      line_items: lineItems,
      metadata: {
        type: "travel",
        orderId: order.id,
        orderNumber: order.order_number,
        provider: "hotelbeds",
        itemCount: String(items.length),
      },
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
    });

    // Create payment record
    const { error: paymentError } = await supabase.from("travel_payments").insert({
      order_id: order.id,
      provider: "stripe",
      stripe_checkout_session_id: session.id,
      amount: order.total,
      currency: order.currency,
      status: "pending",
    });

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
    }

    // Update order with checkout session ID and status
    const { error: updateError } = await supabase
      .from("travel_orders")
      .update({
        stripe_checkout_session_id: session.id,
        status: "pending_payment",
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("Error updating order:", updateError);
    }

    // Log audit event
    await supabase.from("booking_audit_logs").insert({
      order_id: order.id,
      user_id: order.user_id,
      event: "payment_initiated",
      meta: {
        checkout_session_id: session.id,
        amount: order.total,
        currency: order.currency,
      },
    });

    console.log("[CreateCheckout] Session created:", session.id, "Order:", order.order_number);

    return new Response(
      JSON.stringify({
        success: true,
        url: session.url,
        sessionId: session.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    console.error("[CreateCheckout] Error:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
