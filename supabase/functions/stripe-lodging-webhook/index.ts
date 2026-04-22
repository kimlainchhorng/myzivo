/**
 * stripe-lodging-webhook
 * Listens to Stripe payment_intent + charge events and updates lodge_reservations.payment_status.
 * Also stamps `stripe_last_event_at` + `stripe_last_event_type` on every handled event so the
 * UI can surface a live "Updated 12s ago · payment_intent.succeeded" caption.
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
  const eventType = event.type as string;
  const eventStamp = new Date().toISOString();

  const updateByPI = async (
    paymentIntentId: string,
    payment_status: string,
    extra: Record<string, any> = {}
  ) => {
    const { error } = await admin
      .from("lodge_reservations")
      .update({
        payment_status,
        stripe_last_event_at: eventStamp,
        stripe_last_event_type: eventType,
        ...extra,
      })
      .eq("stripe_payment_intent_id", paymentIntentId);
    if (error) console.error("[stripe-lodging-webhook] update failed", error);
  };

  try {
    switch (eventType) {
      case "payment_intent.amount_capturable_updated": {
        const pi = event.data.object;
        await updateByPI(pi.id, "authorized", { last_payment_error: null });
        break;
      }
      case "payment_intent.processing": {
        const pi = event.data.object;
        await updateByPI(pi.id, "processing");
        break;
      }
      case "payment_intent.succeeded": {
        const pi = event.data.object;
        await updateByPI(pi.id, "captured", { last_payment_error: null });
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object;
        const errMsg =
          pi?.last_payment_error?.message ||
          pi?.last_payment_error?.code ||
          "Stripe reported a payment failure";
        await updateByPI(pi.id, "failed", { last_payment_error: errMsg });
        break;
      }
      case "payment_intent.canceled": {
        const pi = event.data.object;
        await updateByPI(pi.id, "unpaid");
        break;
      }
      case "charge.refund.updated": {
        const refund = event.data.object;
        const piId = typeof refund.payment_intent === "string" ? refund.payment_intent : refund.payment_intent?.id;
        if (piId) {
          if (refund.status === "pending") {
            await updateByPI(piId, "refund_pending");
          } else if (refund.status === "succeeded") {
            await updateByPI(piId, "refunded");
          } else if (refund.status === "failed" || refund.status === "canceled") {
            await updateByPI(piId, "captured", { last_payment_error: `Refund ${refund.status}` });
          }
        }
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
          const { error } = await admin
            .from("lodge_reservations")
            .update({
              stripe_payment_intent_id: piId,
              stripe_last_event_at: eventStamp,
              stripe_last_event_type: eventType,
            })
            .eq("stripe_session_id", session.id)
            .is("stripe_payment_intent_id", null);
          if (error) console.error("[stripe-lodging-webhook] backfill PI failed", error);
        }
        break;
      }
      default:
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
