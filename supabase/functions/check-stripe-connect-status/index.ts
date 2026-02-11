/**
 * Check Stripe Connect Account Status
 * Verifies owner's Stripe Express account status and updates database
 */
import { serve, createClient, Stripe } from "../_shared/deps.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-STRIPE-CONNECT] ${step}${detailsStr}`);
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
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
    logStep("User authenticated", { userId });

    // Get owner profile
    const { data: ownerProfile, error: profileError } = await supabase
      .from("car_owner_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError || !ownerProfile) {
      throw new Error("Owner profile not found");
    }

    if (!ownerProfile.stripe_account_id) {
      return new Response(
        JSON.stringify({
          connected: false,
          charges_enabled: false,
          payouts_enabled: false,
          details_submitted: false,
          requirements: null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    logStep("Checking Stripe account", { accountId: ownerProfile.stripe_account_id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Retrieve account status from Stripe
    const account = await stripe.accounts.retrieve(ownerProfile.stripe_account_id);

    const chargesEnabled = account.charges_enabled || false;
    const payoutsEnabled = account.payouts_enabled || false;
    const detailsSubmitted = account.details_submitted || false;

    logStep("Account status retrieved", {
      chargesEnabled,
      payoutsEnabled,
      detailsSubmitted,
    });

    // Update owner profile with current status
    const { error: updateError } = await supabase
      .from("car_owner_profiles")
      .update({
        stripe_charges_enabled: chargesEnabled,
        stripe_payouts_enabled: payoutsEnabled,
        payout_enabled: payoutsEnabled && chargesEnabled,
        stripe_account_currency: account.default_currency || "usd",
        updated_at: new Date().toISOString(),
      })
      .eq("id", ownerProfile.id);

    if (updateError) {
      console.error("Failed to update profile status:", updateError);
    }

    return new Response(
      JSON.stringify({
        connected: true,
        account_id: ownerProfile.stripe_account_id,
        charges_enabled: chargesEnabled,
        payouts_enabled: payoutsEnabled,
        details_submitted: detailsSubmitted,
        requirements: account.requirements?.currently_due || [],
        disabled_reason: account.requirements?.disabled_reason || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    console.error("[CHECK-STRIPE-CONNECT] Error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
