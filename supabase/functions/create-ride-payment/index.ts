import { createClient } from "../_shared/deps.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import Stripe from "../_shared/stripe.ts";

// Creates a Stripe PaymentIntent (manual capture) for a ride request.
// Adds 3.5% card surcharge for KH market rides.
Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: "Stripe not configured" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { ride_request_id, market } = await req.json();
    if (!ride_request_id) {
      return new Response(JSON.stringify({ error: "ride_request_id required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: ride, error: rideErr } = await admin
      .from("ride_requests")
      .select("id, user_id, quoted_total, stripe_payment_intent_id")
      .eq("id", ride_request_id)
      .single();

    if (rideErr || !ride) {
      return new Response(JSON.stringify({ error: "Ride not found" }), { status: 404, headers: { ...cors, "Content-Type": "application/json" } });
    }
    if (ride.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const baseAmount = Math.round((ride.quoted_total ?? 0));
    if (baseAmount < 50) {
      return new Response(JSON.stringify({ error: "Amount too low" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    // 3.5% card surcharge for Cambodia market
    const surcharge = market === "KH" ? Math.round(baseAmount * 0.035) : 0;
    const totalAmount = baseAmount + surcharge;

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    let customerId: string | undefined;
    if (user.email) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      customerId = customers.data[0]?.id ?? (await stripe.customers.create({ email: user.email, metadata: { supabase_user_id: user.id } })).id;
    }

    const intent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: "usd",
      customer: customerId,
      capture_method: "manual",
      metadata: { ride_request_id, user_id: user.id, base: String(baseAmount), surcharge: String(surcharge) },
    });

    await admin
      .from("ride_requests")
      .update({
        stripe_payment_intent_id: intent.id,
        surcharge_amount_cents: surcharge,
        payment_status: "authorized",
      } as any)
      .eq("id", ride_request_id);

    return new Response(JSON.stringify({
      client_secret: intent.client_secret,
      payment_intent_id: intent.id,
      amount: totalAmount,
      surcharge,
    }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("[create-ride-payment]", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  }
});
