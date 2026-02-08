/**
 * Cancel Membership
 * Cancels a ZIVO+ subscription at period end
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CANCEL-MEMBERSHIP] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.id) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Get user's active subscription
    const { data: subscription, error: subError } = await supabase
      .from("zivo_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing", "past_due"])
      .single();

    if (subError || !subscription) {
      throw new Error("No active subscription found");
    }
    logStep("Found subscription", { subscriptionId: subscription.id });

    if (!subscription.stripe_subscription_id) {
      throw new Error("No Stripe subscription ID found");
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Cancel subscription at period end (not immediately)
    const cancelledSub = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    logStep("Stripe subscription cancelled at period end", { 
      stripeSubId: cancelledSub.id,
      cancelAt: cancelledSub.cancel_at,
    });

    // Update our database
    const { error: updateError } = await supabase
      .from("zivo_subscriptions")
      .update({
        cancelled_at: new Date().toISOString(),
        // Status remains active until period end (webhook will update)
      })
      .eq("id", subscription.id);

    if (updateError) {
      console.error("Failed to update subscription record:", updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Subscription will be cancelled at the end of the billing period",
        cancel_at: cancelledSub.cancel_at ? new Date(cancelledSub.cancel_at * 1000).toISOString() : null,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
