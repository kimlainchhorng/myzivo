/**
 * stripe-lodging-webhook
 * Listens to Stripe payment_intent + charge events and updates lodge_reservations.payment_status.
 */
import { createClient } from "../_shared/deps.ts";
import Stripe from "../_shared/stripe.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("method not allowed", { status: 405 });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!stripeKey || !webhookSecret) {
    return new Response(JSON.stringify({ error: "Stripe not configured" }), { status: 500 });
  }

  const stripe = new (Stripe as any)(stripeKey, { apiVersion: "2024-11-20.acacia" });
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: any;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (e: any) {
    console.error("[stripe-lodging-webhook] sig verify failed", e?.message);
    return new Response(`signature error: ${e.message}`, { status: 400 });
  }

  const admin = createClient(supabaseUrl, serviceKey);

  const updateByPI = async (paymentIntentId: string, payment_status: string, extra: Record<string, any> = {}) => {
    const { error } = await admin
      .from("lodge_reservations")
      .update({ payment_status, ...extra })
      .eq("stripe_payment_intent_id", paymentIntentId);
    if (error) console.error("[stripe-lodging-webhook] update failed", error);
  };

  try {
    switch (event.type) {
      case "payment_intent.amount_capturable_updated": {
        const pi = event.data.object;
        await updateByPI(pi.id, "authorized");
        break;
      }
      case "payment_intent.succeeded": {
        const pi = event.data.object;
        await updateByPI(pi.id, "captured");
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object;
        await updateByPI(pi.id, "failed");
        break;
      }
      case "payment_intent.canceled": {
        const pi = event.data.object;
        await updateByPI(pi.id, "unpaid");
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object;
        const piId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
        if (piId) await updateByPI(piId, "refunded");
        break;
      }
      case "checkout.session.completed": {
        const session = event.data.object;
        const piId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
        if (piId) {
          // ensure stripe_payment_intent_id is stored even if create-lodging-deposit didn't have it yet
          const { error } = await admin
            .from("lodge_reservations")
            .update({ stripe_payment_intent_id: piId })
            .eq("stripe_session_id", session.id)
            .is("stripe_payment_intent_id", null);
          if (error) console.error("[stripe-lodging-webhook] backfill PI failed", error);
        }
        break;
      }
      default:
        // ignore
        break;
    }
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("[stripe-lodging-webhook] error", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
