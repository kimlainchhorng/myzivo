import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Eats Dispatch Worker
 * Runs periodically (via cron or manual trigger) to catch any unassigned ready orders
 * and attempt to dispatch them to available drivers.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("[eats-dispatch-worker] Starting dispatch sweep...");

    // Find unassigned ready orders created in the last 60 minutes
    const sixtyMinutesAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: unassignedOrders, error: ordersError } = await supabase
      .from("food_orders")
      .select("id, restaurant_id, created_at")
      .eq("status", "ready_for_pickup")
      .is("driver_id", null)
      .neq("needs_driver", false)
      .gte("created_at", sixtyMinutesAgo)
      .order("created_at", { ascending: true })
      .limit(20);

    if (ordersError) {
      console.error("[eats-dispatch-worker] Error fetching orders:", ordersError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch orders" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[eats-dispatch-worker] Found ${unassignedOrders?.length || 0} unassigned orders`);

    if (!unassignedOrders || unassignedOrders.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: "No unassigned orders found",
          processed: 0
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process each order
    const results: Array<{ order_id: string; success: boolean; message: string }> = [];

    for (const order of unassignedOrders) {
      try {
        console.log(`[eats-dispatch-worker] Dispatching order: ${order.id}`);
        
        // Call the auto-dispatch function
        const dispatchResponse = await fetch(`${supabaseUrl}/functions/v1/eats-auto-dispatch`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({ order_id: order.id })
        });

        const dispatchResult = await dispatchResponse.json();
        
        results.push({
          order_id: order.id,
          success: dispatchResult.success || false,
          message: dispatchResult.message || "Unknown result"
        });

        console.log(`[eats-dispatch-worker] Order ${order.id}: ${dispatchResult.message}`);
      } catch (dispatchError: any) {
        console.error(`[eats-dispatch-worker] Error dispatching order ${order.id}:`, dispatchError);
        results.push({
          order_id: order.id,
          success: false,
          message: dispatchError.message || "Dispatch failed"
        });
      }

      // Small delay between dispatches to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`[eats-dispatch-worker] Completed: ${successCount}/${results.length} successful`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.length} orders, ${successCount} assigned`,
        processed: results.length,
        assigned: successCount,
        results
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[eats-dispatch-worker] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
