/**
 * SLA Evaluator Edge Function
 * Scheduled function to monitor and update SLA status for active orders
 * Runs every 2-5 minutes via pg_cron
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("[SLA Evaluator] Starting SLA status evaluation...");

    // Call the evaluate_sla_status RPC
    const { data: updates, error: evalError } = await supabase.rpc("evaluate_sla_status");
    
    if (evalError) {
      console.error("[SLA Evaluator] Error evaluating SLA status:", evalError);
      throw evalError;
    }

    const statusUpdates = updates || [];
    console.log(`[SLA Evaluator] Found ${statusUpdates.length} orders with status changes`);

    // Process at-risk and breached orders
    for (const update of statusUpdates) {
      console.log(`[SLA Evaluator] Order ${update.order_id}: ${update.new_status} - ${update.reason}`);

      // For breached orders with no driver, attempt auto-assignment
      if (update.new_status === "breached" && update.reason === "no_driver_assigned") {
        console.log(`[SLA Evaluator] Attempting auto-assign for breached order ${update.order_id}`);
        
        // Get order details for auto-assignment
        const { data: order } = await supabase
          .from("food_orders")
          .select("id, tenant_id, restaurant_id, delivery_lat, delivery_lng, zone_code")
          .eq("id", update.order_id)
          .single();

        if (order && order.delivery_lat && order.delivery_lng) {
          // Call auto_assign with boost priority
          const { error: assignError } = await supabase.rpc("auto_assign_order_v2", {
            p_order_id: order.id,
            p_boost_priority: true,
          });

          if (assignError) {
            console.warn(`[SLA Evaluator] Auto-assign failed for ${order.id}:`, assignError.message);
          } else {
            console.log(`[SLA Evaluator] Auto-assign triggered for ${order.id}`);
          }
        }
      }

      // Log to audit for critical status changes
      if (update.new_status === "breached") {
        const { data: order } = await supabase
          .from("food_orders")
          .select("tenant_id")
          .eq("id", update.order_id)
          .single();

        if (order?.tenant_id) {
          await supabase.rpc("log_tenant_audit", {
            p_tenant_id: order.tenant_id,
            p_action: "sla_breached",
            p_entity_type: "order",
            p_entity_id: update.order_id,
            p_summary: `SLA breached: ${update.reason}`,
            p_severity: "warning",
            p_metadata: { reason: update.reason },
          });
        }
      }
    }

    // Get summary stats for logging
    const atRiskCount = statusUpdates.filter((u: any) => u.new_status === "at_risk").length;
    const breachedCount = statusUpdates.filter((u: any) => u.new_status === "breached").length;

    return new Response(
      JSON.stringify({
        success: true,
        processed: statusUpdates.length,
        at_risk: atRiskCount,
        breached: breachedCount,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[SLA Evaluator] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
