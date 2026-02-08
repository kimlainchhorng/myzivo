/**
 * AWARD ORDER POINTS
 * Edge function to award loyalty points when an order is completed
 * Can be called manually or via database trigger
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { order_id } = await req.json();

    if (!order_id) {
      return new Response(
        JSON.stringify({ success: false, error: "order_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call the database function to award points
    const { data, error } = await supabase.rpc("award_order_points", {
      p_order_id: order_id,
    });

    if (error) {
      console.error("Error awarding points:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Points awarded successfully:", data);

    // If tier upgrade happened, send notification
    if (data?.success && data?.new_tier) {
      const { data: loyaltyData } = await supabase
        .from("loyalty_points")
        .select("user_id, tier")
        .eq("user_id", data.user_id)
        .single();

      // Check if tier actually upgraded (compare previous)
      // For now, just log the successful award
    }

    return new Response(
      JSON.stringify(data || { success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
