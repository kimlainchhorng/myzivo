import { createClient } from "../_shared/deps.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import Stripe from "../_shared/stripe.ts";

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: "Stripe not configured" }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const { order_id, payment_intent_id } = await req.json();

    if (!order_id || !payment_intent_id) {
      return new Response(JSON.stringify({ error: "order_id and payment_intent_id are required" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if ((paymentIntent.metadata?.order_id || "") !== order_id) {
      return new Response(JSON.stringify({ error: "Payment intent does not match order" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    if (!["succeeded", "processing", "requires_capture"].includes(paymentIntent.status)) {
      return new Response(JSON.stringify({ error: `Payment not completed (status: ${paymentIntent.status})` }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error: updateError } = await admin
      .from("shopping_orders")
      .update({ status: "pending", updated_at: new Date().toISOString() } as any)
      .eq("id", order_id);

    if (updateError) {
      console.error("[confirm-grocery-payment] Failed to update order:", updateError);
      throw new Error("Failed to finalize order");
    }

    console.log(`[confirm-grocery-payment] Order ${order_id} confirmed via PI ${payment_intent_id}`);

    return new Response(
      JSON.stringify({ ok: true, status: paymentIntent.status, order_id }),
      { headers: { ...cors, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[confirm-grocery-payment] Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
