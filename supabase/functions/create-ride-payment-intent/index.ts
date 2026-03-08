import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "../_shared/deps.ts";
import Stripe from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    const userEmail = claimsData.claims.email as string;

    // Parse body
    const {
      ride_request_id,
      amount_cents,
      ride_type,
      wallet_credit_cents = 0,
    } = await req.json();

    if (!ride_request_id || !amount_cents || amount_cents < 50) {
      return new Response(JSON.stringify({ error: "Invalid request: ride_request_id and amount_cents (>=50) required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const netAmount = Math.max(50, amount_cents - (wallet_credit_cents || 0));

    // Init Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: "Stripe not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Find or create Stripe customer
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { zivo_user_id: userId },
      });
      customerId = customer.id;
    }

    // Create PaymentIntent with manual capture (pre-authorization)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: netAmount,
      currency: "usd",
      customer: customerId,
      capture_method: "manual", // Pre-authorize, capture later
      automatic_payment_methods: { enabled: true },
      metadata: {
        zivo_user_id: userId,
        ride_request_id,
        ride_type: ride_type || "economy",
        wallet_credit_cents: String(wallet_credit_cents),
        original_amount_cents: String(amount_cents),
      },
      description: `ZIVO Ride - ${ride_type || "economy"}`,
    });

    // Update ride_request with payment intent ID
    await supabase
      .from("ride_requests")
      .update({
        payment_intent_id: paymentIntent.id,
        payment_status: "authorized",
      })
      .eq("id", ride_request_id)
      .eq("user_id", userId);

    console.log(`[ride-payment] Created PI ${paymentIntent.id} for ride ${ride_request_id} ($${(netAmount / 100).toFixed(2)})`);

    return new Response(JSON.stringify({
      ok: true,
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      customer_id: customerId,
      amount_cents: netAmount,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[ride-payment] Error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
