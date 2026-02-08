import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FraudCheckResult {
  triggered: boolean;
  signals: string[];
  actions: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id, event_type, order_id } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "user_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result: FraudCheckResult = {
      triggered: false,
      signals: [],
      actions: [],
    };

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Check 1: Refund count in last 30 days (threshold: 5)
    if (event_type === "refund") {
      const { count: refundCount } = await supabase
        .from("food_orders")
        .select("*", { count: "exact", head: true })
        .eq("customer_id", user_id)
        .eq("payment_status", "refunded")
        .gte("created_at", thirtyDaysAgo.toISOString());

      if ((refundCount || 0) >= 5) {
        result.triggered = true;
        result.signals.push(`high_refund_rate: ${refundCount} refunds in 30 days`);

        // Log risk event
        await supabase.from("risk_events").insert({
          event_type: "high_refund_rate",
          severity: 3,
          score: 25,
          user_id,
          details: { refund_count: refundCount, period_days: 30, order_id },
        });

        // If >= 10 refunds, apply payout hold or block
        if ((refundCount || 0) >= 10) {
          result.actions.push("payout_hold_applied");
          await supabase
            .from("profiles")
            .update({ payout_hold: true })
            .eq("user_id", user_id);

          // Update fraud profile
          await supabase
            .from("user_fraud_profiles")
            .upsert({
              user_id,
              refund_count: refundCount,
              is_blocked: true,
              last_flagged_at: now.toISOString(),
            }, { onConflict: "user_id" });
        }
      }
    }

    // Check 2: Cancellation count in last 7 days (threshold: 3)
    if (event_type === "cancellation") {
      const { count: cancelCount } = await supabase
        .from("food_orders")
        .select("*", { count: "exact", head: true })
        .eq("customer_id", user_id)
        .eq("status", "cancelled")
        .gte("created_at", sevenDaysAgo.toISOString());

      if ((cancelCount || 0) >= 3) {
        result.triggered = true;
        result.signals.push(`high_cancel_rate: ${cancelCount} cancellations in 7 days`);

        await supabase.from("risk_events").insert({
          event_type: "high_cancel_rate",
          severity: 2,
          score: 15,
          user_id,
          details: { cancel_count: cancelCount, period_days: 7, order_id },
        });

        // If >= 5 cancellations, flag user
        if ((cancelCount || 0) >= 5) {
          result.actions.push("user_flagged");
          
          await supabase
            .from("user_limits")
            .upsert({
              user_id,
              is_blocked: true,
              block_reason: "Excessive order cancellations",
              updated_at: now.toISOString(),
            }, { onConflict: "user_id" });
        }
      }
    }

    // Check 3: Wrong PIN attempts (already handled in DB function, but can add extra checks)
    if (event_type === "wrong_pin") {
      // Check if driver has multiple wrong PIN incidents
      const { count: pinIncidents } = await supabase
        .from("risk_events")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user_id)
        .eq("event_type", "wrong_pin_limit")
        .gte("created_at", sevenDaysAgo.toISOString());

      if ((pinIncidents || 0) >= 2) {
        result.triggered = true;
        result.signals.push(`repeated_pin_failures: ${pinIncidents} incidents in 7 days`);

        // Suspend driver
        await supabase
          .from("drivers")
          .update({ 
            is_suspended: true, 
            restricted_reason: "Multiple delivery PIN failures - possible fraud",
            updated_at: now.toISOString(),
          })
          .eq("user_id", user_id);

        result.actions.push("driver_suspended");
      }
    }

    // Check 4: Velocity check - too many orders in short time
    if (event_type === "order_placed") {
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      const { count: recentOrders } = await supabase
        .from("food_orders")
        .select("*", { count: "exact", head: true })
        .eq("customer_id", user_id)
        .gte("created_at", oneHourAgo.toISOString());

      if ((recentOrders || 0) >= 10) {
        result.triggered = true;
        result.signals.push(`velocity_spike: ${recentOrders} orders in 1 hour`);

        await supabase.from("risk_events").insert({
          event_type: "order_velocity_spike",
          severity: 4,
          score: 40,
          user_id,
          details: { order_count: recentOrders, period_minutes: 60 },
        });

        // Block further orders
        await supabase
          .from("user_limits")
          .upsert({
            user_id,
            daily_order_limit: 0,
            is_blocked: true,
            block_reason: "Unusual order velocity - possible fraud",
            updated_at: now.toISOString(),
          }, { onConflict: "user_id" });

        result.actions.push("user_blocked");
      }
    }

    console.log(`[check-fraud-signals] User: ${user_id}, Event: ${event_type}, Result:`, result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[check-fraud-signals] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
