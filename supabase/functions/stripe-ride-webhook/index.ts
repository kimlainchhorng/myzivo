import { createClient } from "../_shared/deps.ts";
import Stripe from "../_shared/stripe.ts";

// Stripe webhook for ride PaymentIntent events.
// verify_jwt=false; signature is verified via STRIPE_WEBHOOK_SECRET.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "stripe-signature, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: any;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig!, webhookSecret);
  } catch (err) {
    console.error("[stripe-ride-webhook] sig verify failed", err);
    return new Response(`Webhook Error: ${err}`, { status: 400 });
  }

  const admin = createClient(supabaseUrl, serviceKey);
  const pi = event.data?.object;
  const rideId = pi?.metadata?.ride_request_id;

  try {
    if (!rideId) {
      return new Response(JSON.stringify({ received: true, skipped: true }), { headers: { "Content-Type": "application/json" } });
    }

    switch (event.type) {
      case "payment_intent.succeeded":
        await admin.from("ride_requests").update({
          payment_status: "captured",
          captured_amount_cents: pi.amount_received ?? pi.amount,
        } as any).eq("id", rideId);
        break;
      case "payment_intent.payment_failed":
        await admin.from("ride_requests").update({ payment_status: "failed" } as any).eq("id", rideId);
        break;
      case "payment_intent.canceled":
        await admin.from("ride_requests").update({ payment_status: "canceled" } as any).eq("id", rideId);
        break;
      case "payment_intent.amount_capturable_updated":
        await admin.from("ride_requests").update({ payment_status: "authorized" } as any).eq("id", rideId);
        break;
    }

    console.log(`[stripe-ride-webhook] ${event.type} → ride ${rideId}`);
    return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error("[stripe-ride-webhook]", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
