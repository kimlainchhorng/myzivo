/**
 * Create Eats Payment Intent
 * Creates a Stripe PaymentIntent for embedded checkout with Stripe Elements
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CreatePaymentIntentRequest {
  orderId?: string;
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
  total: number;
  deliveryAddress: string;
  promoCode?: string;
  specialInstructions?: string;
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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    // Create client for auth verification
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    // Create service role client for DB operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    const userId = userData.user.id;
    const userEmail = userData.user.email;

    const body: CreatePaymentIntentRequest = await req.json();
    console.log("[create-eats-payment-intent] Request:", body);

    // Validate total
    const total = Number(body.total);
    if (!Number.isFinite(total) || total <= 0) {
      throw new Error("Invalid total amount");
    }

    // Create order in pending_payment status
    const orderData = {
      customer_id: userId,
      restaurant_id: body.restaurantId,
      items: body.items,
      subtotal: body.subtotal,
      delivery_fee: body.deliveryFee,
      tax: body.tax,
      total_amount: body.total,
      delivery_address: body.deliveryAddress,
      delivery_lat: 0,
      delivery_lng: 0,
      special_instructions: body.specialInstructions || null,
      promo_code: body.promoCode || null,
      discount_amount: body.discountAmount || 0,
      status: "pending",
      payment_status: "pending",
      payment_type: "card",
    };

    const { data: order, error: orderError } = await supabase
      .from("food_orders")
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error("[create-eats-payment-intent] Order creation failed:", orderError);
      throw new Error("Failed to create order");
    }

    console.log("[create-eats-payment-intent] Order created:", order.id);

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check for existing Stripe customer
    let customerId: string | undefined;
    if (userEmail) {
      const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    // Create PaymentIntent (amount in cents)
    const amountCents = Math.round(total * 100);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      customer: customerId,
      automatic_payment_methods: { enabled: true },
      metadata: {
        type: "eats",
        order_id: order.id,
        restaurant_id: body.restaurantId,
        user_id: userId,
      },
    });

    console.log("[create-eats-payment-intent] PaymentIntent created:", paymentIntent.id);

    // Update order with payment intent ID
    await supabase
      .from("food_orders")
      .update({ 
        stripe_payment_id: paymentIntent.id,
      })
      .eq("id", order.id);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        orderId: order.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    console.error("[create-eats-payment-intent] Error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
