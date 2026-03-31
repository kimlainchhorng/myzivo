/**
 * auto-cancel-stale-orders
 * Cancels grocery orders stuck at "pending_payment" for more than 1 hour.
 * Designed to be called via pg_cron every 10 minutes.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    // Find stale pending_payment orders older than 1 hour
    const { data: staleOrders, error: fetchError } = await supabaseAdmin
      .from("shopping_orders")
      .select("id, store, user_id")
      .eq("status", "pending_payment")
      .lt("placed_at", oneHourAgo)
      .limit(100);

    if (fetchError) {
      console.error("Error fetching stale orders:", fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!staleOrders || staleOrders.length === 0) {
      return new Response(
        JSON.stringify({ cancelled: 0, message: "No stale orders found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const ids = staleOrders.map((o: any) => o.id);

    // Bulk cancel
    const { error: updateError } = await supabaseAdmin
      .from("shopping_orders")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
      } as any)
      .in("id", ids);

    if (updateError) {
      console.error("Error cancelling orders:", updateError);
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Auto-cancelled ${ids.length} stale pending_payment orders`);

    return new Response(
      JSON.stringify({
        cancelled: ids.length,
        order_ids: ids,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("auto-cancel-stale-orders error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
