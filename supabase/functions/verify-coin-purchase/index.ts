import { serve } from "../_shared/deps.ts";
import { createClient } from "../_shared/deps.ts";
import Stripe from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    if (!sessionId) throw new Error("Missing session_id");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.metadata?.user_id !== user.id) {
      throw new Error("Session does not belong to this user");
    }

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ status: session.payment_status, credited: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const coins = parseInt(session.metadata?.coins || "0", 10);
    const packageId = session.metadata?.package_id || "unknown";
    if (!coins || coins <= 0) throw new Error("Invalid coin amount in session");

    const { data: balance, error: rpcErr } = await supabaseAdmin.rpc("credit_coin_purchase", {
      _user_id: user.id,
      _session_id: sessionId,
      _package_id: packageId,
      _coins: coins,
      _amount_cents: session.amount_total ?? 0,
      _currency: session.currency ?? "usd",
    });

    if (rpcErr) throw new Error(rpcErr.message);

    return new Response(JSON.stringify({ status: "paid", credited: true, coins, balance }), {
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
