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

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;
    const userEmail = userData.user.email!;

    const {
      ride_request_id,
      amount_cents,
      ride_type,
      city,
      wallet_credit_cents = 0,
      payment_method_id,
      promo_code,
      discount_cents = 0,
    } = await req.json();

    if (!ride_request_id || amount_cents === undefined) {
      return new Response(JSON.stringify({ error: "Invalid request: ride_request_id and amount_cents required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If promo gives 100% discount, skip Stripe entirely
    if (amount_cents <= 0 || (discount_cents > 0 && amount_cents <= 0)) {
      await supabase
        .from("ride_requests")
        .update({
          payment_status: "authorized",
          promo_code: promo_code || null,
          discount_cents: discount_cents || 0,
        })
        .eq("id", ride_request_id)
        .eq("user_id", userId);

      console.log(`[ride-payment] FREE ride ${ride_request_id} — promo ${promo_code}, no Stripe charge`);
      return new Response(JSON.stringify({
        ok: true,
        client_secret: null,
        payment_intent_id: null,
        customer_id: null,
        amount_cents: 0,
        status: "requires_capture",
        auto_confirmed: true,
        free_ride: true,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up card_fee_pct from city_pricing (only applies to card payments)
    let cardFeePct = 0;
    const isCardPayment = !!payment_method_id; // card payment when a payment method is provided
    if (isCardPayment && city && ride_type) {
      const serviceAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      const { data: pricingRows } = await serviceAdmin
        .from("city_pricing")
        .select("card_fee_pct")
        .eq("is_active", true)
        .ilike("city", city)
        .eq("ride_type", ride_type)
        .limit(1);

      if (pricingRows && pricingRows.length > 0 && pricingRows[0].card_fee_pct > 0) {
        cardFeePct = pricingRows[0].card_fee_pct;
      }
    }

    // Apply card fee surcharge
    let chargeAmountCents = amount_cents;
    let cardFeeCents = 0;
    if (cardFeePct > 0) {
      cardFeeCents = Math.round(amount_cents * cardFeePct / 100);
      chargeAmountCents = amount_cents + cardFeeCents;
    }

    if (chargeAmountCents < 50) {
      return new Response(JSON.stringify({ error: "Amount too low (min 50 cents)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const netAmount = Math.max(50, chargeAmountCents - (wallet_credit_cents || 0));

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

    const piParams: any = {
      amount: netAmount,
      currency: "usd",
      customer: customerId,
      capture_method: "manual",
      metadata: {
        zivo_user_id: userId,
        ride_request_id,
        ride_type: ride_type || "economy",
        wallet_credit_cents: String(wallet_credit_cents),
        original_amount_cents: String(amount_cents + (discount_cents || 0)),
        promo_code: promo_code || "",
        discount_cents: String(discount_cents || 0),
        card_fee_pct: String(cardFeePct),
        card_fee_cents: String(cardFeeCents),
      },
      description: `ZIVO Ride - ${ride_type || "economy"}${promo_code ? ` (promo: ${promo_code})` : ""}${cardFeePct > 0 ? ` (+${cardFeePct}% card fee)` : ""}`,
    };

    // If saved payment method provided, auto-confirm off-session
    if (payment_method_id) {
      piParams.payment_method = payment_method_id;
      piParams.confirm = true;
      piParams.off_session = true;
    } else {
      // Only allow card — no Link, no wallets, no Cash App
      piParams.payment_method_types = ["card"];
    }

    const paymentIntent = await stripe.paymentIntents.create(piParams);

    // Update ride_request with payment intent ID
    const paymentStatus = paymentIntent.status === "requires_capture" ? "authorized" : "pending";
    await supabase
      .from("ride_requests")
      .update({
        payment_intent_id: paymentIntent.id,
        payment_status: paymentStatus,
      })
      .eq("id", ride_request_id)
      .eq("user_id", userId);

    console.log(`[ride-payment] Created PI ${paymentIntent.id} for ride ${ride_request_id} ($${(netAmount / 100).toFixed(2)}) status=${paymentIntent.status} cardFee=${cardFeePct}%`);

    return new Response(JSON.stringify({
      ok: true,
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      customer_id: customerId,
      amount_cents: netAmount,
      card_fee_pct: cardFeePct,
      card_fee_cents: cardFeeCents,
      status: paymentIntent.status,
      auto_confirmed: !!payment_method_id,
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
