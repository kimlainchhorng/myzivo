/**
 * Request Travel Cancellation
 * Allows users to request cancellation of their travel order
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CancellationRequest {
  orderId: string;
  reason: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Invalid authentication");
    }

    const body: CancellationRequest = await req.json();
    const { orderId, reason } = body;

    if (!orderId) {
      throw new Error("Order ID is required");
    }

    if (!reason || reason.trim().length < 10) {
      throw new Error("Please provide a reason for cancellation (at least 10 characters)");
    }

    // Fetch order with items
    const { data: order, error: orderError } = await supabase
      .from("travel_orders")
      .select(`
        *,
        travel_order_items (*)
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    // Verify ownership
    if (order.user_id !== user.id) {
      throw new Error("Unauthorized - order does not belong to user");
    }

    // Check order is eligible for cancellation
    if (order.status === "cancelled" || order.status === "refunded") {
      throw new Error("This order has already been cancelled or refunded");
    }

    if (order.cancellation_status !== "none") {
      throw new Error(`Cancellation already ${order.cancellation_status}`);
    }

    // Update order cancellation status
    const { error: updateError } = await supabase
      .from("travel_orders")
      .update({
        cancellation_status: "requested",
        cancellation_reason: reason.trim(),
        cancellation_requested_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("[CancellationRequest] Update error:", updateError);
      throw new Error("Failed to update order status");
    }

    // Log to email_logs
    await supabase.from("travel_email_logs").insert({
      order_id: orderId,
      to_email: order.holder_email,
      template: "cancellation_request",
      status: "queued",
    });

    // Log audit event
    await supabase.from("booking_audit_logs").insert({
      order_id: orderId,
      user_id: user.id,
      event: "cancellation_requested",
      meta: {
        reason: reason.trim(),
        order_number: order.order_number,
        order_status: order.status,
        items_count: order.travel_order_items?.length || 0,
      },
    });

    console.log("[CancellationRequest] Cancellation requested for order:", order.order_number);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Cancellation request submitted. Our team will review it within 24-48 hours.",
        orderNumber: order.order_number,
        status: "requested",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    console.error("[CancellationRequest] Error:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
