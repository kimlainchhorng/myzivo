/**
 * Create Stripe Connect Account Link
 * Creates or updates a Stripe Express account for car owners
 * Returns an onboarding URL for the owner to complete
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-STRIPE-CONNECT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Unauthorized");

    const userId = userData.user.id;
    const userEmail = userData.user.email;
    logStep("User authenticated", { userId });

    // Get owner profile
    const { data: ownerProfile, error: profileError } = await supabase
      .from("car_owner_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError || !ownerProfile) {
      throw new Error("Owner profile not found. Please complete owner registration first.");
    }
    logStep("Owner profile found", { ownerId: ownerProfile.id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const origin = req.headers.get("origin") || "https://myzivo.lovable.app";

    let accountId = ownerProfile.stripe_account_id;

    // Create or retrieve Stripe Express account
    if (!accountId) {
      logStep("Creating new Stripe Express account");

      const account = await stripe.accounts.create({
        type: "express",
        country: "US",
        email: ownerProfile.email || userEmail,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
        metadata: {
          owner_id: ownerProfile.id,
          user_id: userId,
        },
      });

      accountId = account.id;
      logStep("Stripe account created", { accountId });

      // Save account ID to profile
      const { error: updateError } = await supabase
        .from("car_owner_profiles")
        .update({
          stripe_account_id: accountId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ownerProfile.id);

      if (updateError) {
        console.error("Failed to save Stripe account ID:", updateError);
      }
    } else {
      logStep("Using existing Stripe account", { accountId });
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/owner/stripe-connect/refresh`,
      return_url: `${origin}/owner/stripe-connect/return`,
      type: "account_onboarding",
    });

    logStep("Account link created", { url: accountLink.url });

    return new Response(
      JSON.stringify({
        success: true,
        url: accountLink.url,
        account_id: accountId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    console.error("[CREATE-STRIPE-CONNECT] Error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
