import { createClient } from "../_shared/deps.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import Stripe from "../_shared/stripe.ts";

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!stripeKey) {
      return new Response(JSON.stringify({ error: "Stripe not configured" }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Authenticate caller
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const { job_id, charge_cancel_fee = false, cancel_fee_cents = 0, cancel_reason = "" } = await req.json();
    if (!job_id) {
      return new Response(JSON.stringify({ error: "job_id required" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    const { data: job, error: jobErr } = await admin
      .from("jobs")
      .select("id, customer_id, stripe_payment_intent_id, status")
      .eq("id", job_id)
      .single();

    if (jobErr || !job) {
      return new Response(JSON.stringify({ error: "Job not found" }), {
        status: 404,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    if (job.customer_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const piId = (job as any).stripe_payment_intent_id;
    if (!piId) {
      // No payment to cancel — just mark cancelled
      await admin.from("jobs").update({ status: "cancelled" } as any).eq("id", job_id);
      return new Response(JSON.stringify({ ok: true, action: "no_payment" }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    if (charge_cancel_fee && cancel_fee_cents > 0) {
      // Capture only the cancellation fee amount, releasing the rest
      const captured = await stripe.paymentIntents.capture(piId, {
        amount_to_capture: Math.round(cancel_fee_cents),
      });
      console.log(`[cancel-job-payment] Captured cancel fee ${cancel_fee_cents}c on PI ${piId}, status=${captured.status}`);

      await admin.from("jobs").update({
        status: "cancelled",
        cancel_reason,
        cancel_fee_cents: Math.round(cancel_fee_cents),
      } as any).eq("id", job_id);

      return new Response(
        JSON.stringify({ ok: true, action: "cancel_fee_charged", amount: cancel_fee_cents }),
        { headers: { ...cors, "Content-Type": "application/json" } }
      );
    } else {
      // Full void — cancel the PaymentIntent entirely
      const cancelled = await stripe.paymentIntents.cancel(piId, {
        cancellation_reason: "requested_by_customer",
      });
      console.log(`[cancel-job-payment] Cancelled PI ${piId}, status=${cancelled.status}`);

      await admin.from("jobs").update({
        status: "cancelled",
        cancel_reason,
      } as any).eq("id", job_id);

      return new Response(
        JSON.stringify({ ok: true, action: "voided" }),
        { headers: { ...cors, "Content-Type": "application/json" } }
      );
    }
  } catch (e) {
    console.error("[cancel-job-payment] Error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
