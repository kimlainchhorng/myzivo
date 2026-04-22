/**
 * create-lodging-deposit
 * Creates a Stripe Checkout Session to either authorise (hold) or charge a lodging deposit.
 * Writes Stripe IDs back to the lodge_reservations row using the service role.
 */
import { createClient } from "../_shared/deps.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import Stripe from "../_shared/stripe.ts";

interface Body {
  reservation_id: string;
  store_id: string;
  deposit_cents: number;
  mode?: "deposit" | "full";
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: "Stripe not configured" }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();

    const body = (await req.json()) as Body;
    if (!body?.reservation_id || !body?.store_id) {
      return new Response(JSON.stringify({ error: "reservation_id and store_id required" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const depositCents = Math.max(50, Math.round(Number(body.deposit_cents) || 0));
    const mode: "deposit" | "full" = body.mode === "full" ? "full" : "deposit";

    const admin = createClient(supabaseUrl, serviceKey);

    // Load reservation for description
    const { data: reservation, error: resErr } = await admin
      .from("lodge_reservations")
      .select("id, number, guest_name, guest_email, room_id, check_in, check_out, total_cents, payment_status, stripe_session_id")
      .eq("id", body.reservation_id)
      .maybeSingle();
    if (resErr) throw resErr;
    if (!reservation) {
      return new Response(JSON.stringify({ error: "Reservation not found" }), {
        status: 404,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    let customerId: string | undefined;
    const email = user?.email || (reservation as any).guest_email || undefined;
    if (email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") || "https://hizivo.com";
    const productName =
      mode === "deposit"
        ? `Refundable hold – Reservation ${(reservation as any).number}`
        : `Reservation ${(reservation as any).number}`;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productName,
              description:
                mode === "deposit"
                  ? "Authorised hold on your card. Captured only if damage or no-show occurs."
                  : "Full payment for your stay.",
            },
            unit_amount: depositCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_intent_data: {
        capture_method: mode === "deposit" ? "manual" : "automatic",
        metadata: {
          reservation_id: body.reservation_id,
          store_id: body.store_id,
          mode,
        },
      },
      success_url: `${origin}/grocery/shop?lodging_paid=1&ref=${(reservation as any).number}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/grocery/shop?lodging_paid=0&ref=${(reservation as any).number}`,
      metadata: {
        reservation_id: body.reservation_id,
        store_id: body.store_id,
        mode,
      },
    });

    // Persist Stripe IDs and bump payment_status (clears prior failure on retry)
    await admin
      .from("lodge_reservations")
      .update({
        stripe_session_id: session.id,
        stripe_payment_intent_id: (session.payment_intent as string) || null,
        deposit_cents: depositCents,
        payment_status: mode === "deposit" ? "authorized" : "pending",
        last_payment_error: null,
      })
      .eq("id", body.reservation_id);

    return new Response(JSON.stringify({ url: session.url, session_id: session.id }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[create-lodging-deposit] Error:", e);
    return new Response(JSON.stringify({ error: String((e as Error).message || e) }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
