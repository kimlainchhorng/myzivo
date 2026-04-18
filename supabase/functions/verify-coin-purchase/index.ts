import { serve } from "../_shared/deps.ts";
import { createClient } from "../_shared/deps.ts";
import Stripe from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser(token);
    if (userErr || !userData.user) throw new Error("Not authenticated");
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const sessionId = String(body?.session_id || "");
    const paymentIntentId = String(body?.payment_intent_id || "");
    if (!sessionId && !paymentIntentId) throw new Error("Missing payment reference");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });

    let paymentStatus = "pending";
    let paymentRef = sessionId;
    let coins = 0;
    let packageId = "unknown";
    let amountCents = 0;
    let currency = "usd";

    if (paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.metadata?.user_id !== user.id) {
        throw new Error("Payment does not belong to this user");
      }

      paymentStatus = paymentIntent.status;
      paymentRef = paymentIntent.id;
      if (paymentIntent.status !== "succeeded") {
        return new Response(JSON.stringify({ status: paymentIntent.status, credited: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      coins = parseInt(paymentIntent.metadata?.coins || "0", 10);
      packageId = paymentIntent.metadata?.package_id || "unknown";
      amountCents = paymentIntent.amount_received || paymentIntent.amount || 0;
      currency = paymentIntent.currency ?? "usd";
    } else {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.metadata?.user_id !== user.id) {
        throw new Error("Session does not belong to this user");
      }

      paymentStatus = session.payment_status || "pending";
      paymentRef = session.id;
      if (session.payment_status !== "paid") {
        return new Response(JSON.stringify({ status: session.payment_status, credited: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      coins = parseInt(session.metadata?.coins || "0", 10);
      packageId = session.metadata?.package_id || "unknown";
      amountCents = session.amount_total ?? 0;
      currency = session.currency ?? "usd";
    }

    if (!coins || coins <= 0) throw new Error("Invalid coin amount in payment");

    const { data: balance, error: rpcErr } = await supabaseAdmin.rpc("credit_coin_purchase", {
      _user_id: user.id,
      _session_id: paymentRef,
      _package_id: packageId,
      _coins: coins,
      _amount_cents: amountCents,
      _currency: currency,
    });

    if (rpcErr) throw new Error(rpcErr.message);

    return new Response(JSON.stringify({ status: paymentStatus, credited: true, coins, balance }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "Unknown error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});