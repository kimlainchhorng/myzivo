// Verifies a Stripe Checkout session and credits the ads wallet.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } }
    );
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const body = await req.json();
    const sessionId = String(body?.session_id || "");
    if (!sessionId) {
      return new Response(JSON.stringify({ error: "session_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-11-20.acacia" as any });
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["payment_intent"] });
    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ status: session.payment_status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const storeId = session.metadata?.store_id;
    const amountCents = Number(session.metadata?.amount_cents || session.amount_total || 0);
    if (!storeId || !amountCents) throw new Error("Missing store/amount metadata");

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Idempotency: skip if ledger already records this session
    const { data: existing } = await admin
      .from("ads_wallet_ledger")
      .select("id")
      .eq("ref_id", session.id)
      .maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ status: "already_credited" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Capture payment method for future off-session use
    let paymentMethodId: string | null = null;
    const pi = session.payment_intent as Stripe.PaymentIntent;
    if (pi && typeof pi !== "string") {
      paymentMethodId = (pi.payment_method as string) || null;
    }

    const { data: wallet } = await admin
      .from("ads_studio_wallet")
      .select("balance_cents")
      .eq("store_id", storeId)
      .maybeSingle();
    const newBalance = (wallet?.balance_cents ?? 0) + amountCents;

    const upd: Record<string, unknown> = { balance_cents: newBalance, last_recharge_at: new Date().toISOString() };
    if (paymentMethodId) upd.stripe_payment_method_id = paymentMethodId;
    await admin.from("ads_studio_wallet").upsert(
      { store_id: storeId, ...upd },
      { onConflict: "store_id" }
    );

    await admin.from("ads_wallet_ledger").insert({
      store_id: storeId,
      entry_type: "topup",
      amount_cents: amountCents,
      balance_after_cents: newBalance,
      ref_id: session.id,
      ref_type: "stripe_checkout_session",
      description: `Stripe top-up $${(amountCents / 100).toFixed(2)}`,
    });

    return new Response(JSON.stringify({ status: "credited", balance_cents: newBalance }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
