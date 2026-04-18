// Creates a Stripe AccountSession client_secret for embedded onboarding.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");
    const { data: userData, error: uErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (uErr || !userData.user) throw new Error("Invalid auth");
    const user = userData.user;

    const { country = "US" } = await req.json().catch(() => ({}));
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Find or create connected account
    const { data: existing } = await supabase
      .from("stripe_connect_accounts")
      .select("*")
      .eq("payee_id", user.id)
      .eq("payee_type", "customer")
      .maybeSingle();

    let accountId = existing?.stripe_account_id;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country,
        email: user.email ?? undefined,
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true },
        },
        business_type: "individual",
        metadata: { user_id: user.id, source: "zivo_creator" },
      });
      accountId = account.id;
      await supabase.from("stripe_connect_accounts").insert({
        payee_id: user.id,
        payee_type: "customer",
        stripe_account_id: accountId,
        charges_enabled: account.charges_enabled,
        details_submitted: account.details_submitted,
        payouts_enabled: account.payouts_enabled,
      });
    }

    const session = await stripe.accountSessions.create({
      account: accountId,
      components: {
        account_onboarding: { enabled: true },
        payouts: { enabled: true },
        account_management: { enabled: true },
      },
    });

    return new Response(
      JSON.stringify({ client_secret: session.client_secret, account_id: accountId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Account session failed";
    console.error("[CONNECT-ACCOUNT-SESSION]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
