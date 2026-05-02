/**
 * stripe-lodging-webhook
 * Listens to Stripe payment_intent + charge events and updates lodge_reservations.payment_status.
 * Also stamps `stripe_last_event_at` + `stripe_last_event_type` on every handled event so the
 * UI can surface a live "Updated 12s ago · payment_intent.succeeded" caption.
 *
 * Persists every event to `lodging_stripe_webhook_events` with a unique constraint on
 * `stripe_event_id` so duplicates (Stripe redelivery) are idempotently dropped.
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

  // Pull common identifiers off the event for the log row
  const obj = event.data?.object || {};
  const piIdRaw =
    obj.id && obj.object === "payment_intent" ? obj.id :
    typeof obj.payment_intent === "string" ? obj.payment_intent :
    obj.payment_intent?.id || null;
  const sessionIdRaw = obj.object === "checkout.session" ? obj.id : null;

  // Try to resolve reservation_id ahead of insert (best-effort; non-blocking)
  let resolvedReservationId: string | null = null;
  if (piIdRaw) {
    const { data } = await admin
      .from("lodge_reservations")
      .select("id")
      .eq("stripe_payment_intent_id", piIdRaw)
      .maybeSingle();
    resolvedReservationId = (data as any)?.id || null;
  }
  if (!resolvedReservationId && sessionIdRaw) {
    const { data } = await admin
      .from("lodge_reservations")
      .select("id")
      .eq("stripe_session_id", sessionIdRaw)
      .maybeSingle();
    resolvedReservationId = (data as any)?.id || null;
  }

  // Trim payload so we don't blow past row size limits
  const trimmedPayload = {
    id: event.id,
    type: event.type,
    created: event.created,
    api_version: event.api_version,
    livemode: event.livemode,
    data: { object: { ...obj, customer: undefined } },
  };

  // Idempotent insert. Conflict means we've seen this event before — short-circuit.
  const { data: inserted, error: insertErr } = await admin
    .from("lodging_stripe_webhook_events")
    .upsert(
      {
        stripe_event_id: event.id,
        event_type: eventType,
        event_created_at: event.created ? new Date(event.created * 1000).toISOString() : null,
        reservation_id: resolvedReservationId,
        stripe_payment_intent_id: piIdRaw,
        stripe_session_id: sessionIdRaw,
        processing_status: "received",
        payload: trimmedPayload,
      },
      { onConflict: "stripe_event_id", ignoreDuplicates: true },
    )
    .select("id")
    .maybeSingle();

  if (insertErr) {
    console.error("[stripe-lodging-webhook] event log insert failed", insertErr);
  }

  // If insert returned nothing, it was a duplicate — skip side effects.
  if (!inserted) {
    return new Response(
      JSON.stringify({ received: true, dedup: true }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  const logRowId = inserted.id;

  const updateByPI = async (
    paymentIntentId: string,
    payment_status: string,
    extra: Record<string, any> = {},
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

  let processingStatus: "applied" | "skipped" | "error" = "skipped";
  let processingError: string | null = null;

  try {
    switch (eventType) {
      case "payment_intent.amount_capturable_updated": {
        const pi = event.data.object;
        await updateByPI(pi.id, "authorized", { last_payment_error: null });
        processingStatus = "applied";
        break;
      }
      case "payment_intent.processing": {
        const pi = event.data.object;
        await updateByPI(pi.id, "processing");
        processingStatus = "applied";
        break;
      }
      case "payment_intent.succeeded": {
        const pi = event.data.object;
        await updateByPI(pi.id, "captured", { last_payment_error: null });
        processingStatus = "applied";
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object;
        const errMsg =
          pi?.last_payment_error?.message ||
          pi?.last_payment_error?.code ||
          "Stripe reported a payment failure";
        await updateByPI(pi.id, "failed", { last_payment_error: errMsg });
        processingStatus = "applied";
        break;
      }
      case "payment_intent.canceled": {
        const pi = event.data.object;
        await updateByPI(pi.id, "unpaid");
        processingStatus = "applied";
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
          processingStatus = "applied";
        }
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object;
        const piId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
        if (piId) {
          await updateByPI(piId, "refunded");
          processingStatus = "applied";
        }
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
          processingStatus = "applied";
        }
        break;
      }
      default:
        processingStatus = "skipped";
        break;
    }
  } catch (e: any) {
    processingStatus = "error";
    processingError = String(e?.message || e);
    console.error("[stripe-lodging-webhook] handler error", e);
  }

  // Stamp the log row with the final processing status
  await admin
    .from("lodging_stripe_webhook_events")
    .update({
      processing_status: processingStatus,
      error_message: processingError,
      reservation_id: resolvedReservationId,
    })
    .eq("id", logRowId);

  return new Response(JSON.stringify({ received: true, status: processingStatus }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
