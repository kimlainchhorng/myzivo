/**
 * create-user-wallet-topup
 * ------------------------
 * Authenticated user → Stripe Checkout Session for wallet topup.
 * Body: { amount_cents: number, currency?: string, success_url?: string, cancel_url?: string }
 * Returns: { url, session_id }
 *
 * Settlement happens on the redirect-back via verify-user-wallet-topup,
 * which calls the `credit_user_wallet_topup` RPC (idempotent on
 * stripe session id).
 */
import { createClient } from "../_shared/deps.ts";
import Stripe from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MIN_TOPUP_CENTS = 500;     // $5
const MAX_TOPUP_CENTS = 50_000_00; // $50,000

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: u } = await userClient.auth.getUser();
    if (!u.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const amountCents = Math.round(Number(body?.amount_cents ?? 0));
    const currency = String(body?.currency ?? "USD").toUpperCase();
    const successUrl = String(body?.success_url ?? `${new URL(req.url).origin}/wallet?topup=success`);
    const cancelUrl = String(body?.cancel_url ?? `${new URL(req.url).origin}/wallet?topup=cancel`);

    if (!Number.isFinite(amountCents) || amountCents < MIN_TOPUP_CENTS || amountCents > MAX_TOPUP_CENTS) {
      return new Response(JSON.stringify({
        error: "invalid_amount",
        message: `Amount must be between $${MIN_TOPUP_CENTS / 100} and $${MAX_TOPUP_CENTS / 100}`,
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2025-08-27.basil" });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: u.user.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: { name: "ZIVO Wallet topup" },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "user_wallet_topup",
        user_id: u.user.id,
        amount_cents: String(amountCents),
        currency,
      },
      success_url: `${successUrl}${successUrl.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
    });

    return new Response(JSON.stringify({ url: session.url, session_id: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[create-user-wallet-topup]", e);
    return new Response(JSON.stringify({ error: String((e as any)?.message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
