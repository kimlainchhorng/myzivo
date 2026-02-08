/**
 * Track Ad Event Edge Function
 * Handles impression and click tracking with CPC billing
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrackEventRequest {
  adId: string;
  eventType: "impression" | "click";
  userId?: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { adId, eventType, userId }: TrackEventRequest = await req.json();

    if (!adId || !eventType) {
      return new Response(
        JSON.stringify({ error: "adId and eventType are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get ad details
    const { data: ad, error: adError } = await supabase
      .from("restaurant_ads")
      .select("*, restaurants(id, name)")
      .eq("id", adId)
      .single();

    if (adError || !ad) {
      return new Response(
        JSON.stringify({ error: "Ad not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if ad is active
    if (ad.status !== "active") {
      return new Response(
        JSON.stringify({ error: "Ad is not active", status: ad.status }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (eventType === "impression") {
      // Debounce: check if impression already recorded in last hour
      if (userId) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { data: existingImpression } = await supabase
          .from("ad_impressions")
          .select("id")
          .eq("ad_id", adId)
          .eq("user_id", userId)
          .gte("created_at", oneHourAgo)
          .limit(1);

        if (existingImpression && existingImpression.length > 0) {
          return new Response(
            JSON.stringify({ success: true, deduplicated: true }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Record impression
      await supabase.from("ad_impressions").insert({
        ad_id: adId,
        restaurant_id: ad.restaurant_id,
        user_id: userId || null,
      });

      // Update ad impressions count
      await supabase
        .from("restaurant_ads")
        .update({ impressions: (ad.impressions || 0) + 1 })
        .eq("id", adId);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (eventType === "click") {
      // Record click
      const { data: click, error: clickError } = await supabase
        .from("ad_clicks")
        .insert({
          ad_id: adId,
          restaurant_id: ad.restaurant_id,
          user_id: userId || null,
        })
        .select()
        .single();

      if (clickError) {
        throw clickError;
      }

      // Calculate charge amount in cents
      const costPerClick = Number(ad.cost_per_click) || 0.25;
      const chargeAmountCents = Math.round(costPerClick * 100);

      // Get current merchant balance
      const { data: balance } = await supabase
        .from("merchant_balances")
        .select("pending")
        .eq("restaurant_id", ad.restaurant_id)
        .single();

      const currentBalanceCents = Math.round((Number(balance?.pending) || 0) * 100);
      const hasSufficientBalance = currentBalanceCents >= chargeAmountCents;

      if (hasSufficientBalance) {
        // Deduct from merchant balance
        const newBalance = (Number(balance?.pending) || 0) - costPerClick;
        await supabase
          .from("merchant_balances")
          .update({ pending: newBalance })
          .eq("restaurant_id", ad.restaurant_id);

        // Record billing event
        await supabase.from("ad_billing_events").insert({
          ad_id: adId,
          restaurant_id: ad.restaurant_id,
          event_type: "click_charge",
          amount_cents: chargeAmountCents,
          balance_after_cents: Math.round(newBalance * 100),
          click_id: click.id,
        });
      }

      // Update ad stats
      const newSpent = Number(ad.spent || 0) + (hasSufficientBalance ? costPerClick : 0);
      await supabase
        .from("restaurant_ads")
        .update({
          clicks: (ad.clicks || 0) + 1,
          spent: newSpent,
        })
        .eq("id", adId);

      // Check daily budget
      const today = new Date().toISOString().split("T")[0];
      const { data: todayBilling } = await supabase
        .from("ad_billing_events")
        .select("amount_cents")
        .eq("ad_id", adId)
        .eq("event_type", "click_charge")
        .gte("created_at", today)
        .lt("created_at", today + "T23:59:59.999Z");

      const todaySpentCents = (todayBilling || []).reduce((sum, e) => sum + e.amount_cents, 0);
      const dailyBudgetCents = Math.round((Number(ad.daily_budget) || 0) * 100);

      if (todaySpentCents >= dailyBudgetCents) {
        // Pause ad due to daily budget exhaustion
        await supabase
          .from("restaurant_ads")
          .update({ status: "exhausted" })
          .eq("id", adId);

        // Record budget depleted event
        await supabase.from("ad_billing_events").insert({
          ad_id: adId,
          restaurant_id: ad.restaurant_id,
          event_type: "budget_depleted",
          amount_cents: 0,
          balance_after_cents: Math.round((Number(balance?.pending) || 0 - costPerClick) * 100),
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          clickId: click.id,
          charged: hasSufficientBalance,
          chargeAmount: hasSufficientBalance ? costPerClick : 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid event type" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error tracking ad event:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
