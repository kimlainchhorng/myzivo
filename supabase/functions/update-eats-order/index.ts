/**
 * update-eats-order Edge Function
 * Secure backend validation for order edits within grace window
 * Handles item updates, note changes, and cancellations
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Grace period in seconds (2.5 minutes)
const GRACE_PERIOD_SECONDS = 150;

// Tax rate (configurable)
const TAX_RATE = 0.0825; // 8.25%

interface OrderItem {
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  imageUrl?: string;
}

interface RequestBody {
  action: "update_items" | "update_note" | "cancel";
  orderId: string;
  items?: OrderItem[];
  note?: string;
  cancellation_reason?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization", reason: "invalid" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's token for RLS
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Service client for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized", reason: "invalid" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify customer role
    const { data: isCustomer } = await supabaseAdmin.rpc("has_role", {
      _user_id: user.id,
      _role: "customer",
    });

    if (!isCustomer) {
      return new Response(
        JSON.stringify({ success: false, error: "Customer role required", reason: "invalid" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body: RequestBody = await req.json();
    const { action, orderId, items, note, cancellation_reason } = body;

    if (!orderId || !action) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing orderId or action", reason: "invalid" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("food_orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ success: false, error: "Order not found", reason: "invalid" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify ownership
    if (order.customer_id !== user.id) {
      return new Response(
        JSON.stringify({ success: false, error: "Not your order", reason: "invalid" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if order is in editable status
    const editableStatuses = ["placed", "pending"];
    if (!editableStatuses.includes(order.status)) {
      return new Response(
        JSON.stringify({ success: false, error: "Order already confirmed", reason: "confirmed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check grace window
    const placedAt = new Date(order.placed_at || order.created_at).getTime();
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - placedAt) / 1000);

    if (elapsedSeconds > GRACE_PERIOD_SECONDS) {
      return new Response(
        JSON.stringify({ success: false, error: "Edit window expired", reason: "expired" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle different actions
    let updateData: Record<string, any> = {};
    let eventType = "";
    let eventData: Record<string, any> = {};

    if (action === "update_items") {
      if (!items || !Array.isArray(items) || items.length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: "Order must have at least one item", reason: "min_items" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Calculate new totals
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = subtotal * TAX_RATE;
      const deliveryFee = order.delivery_fee || 0;
      const serviceFee = order.service_fee || 0;
      const discountAmount = order.discount_amount || 0;
      const tipAmount = order.tip_amount || 0;
      const total = subtotal + tax + deliveryFee + serviceFee + tipAmount - discountAmount;

      updateData = {
        items,
        subtotal: Math.round(subtotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        total_amount: Math.round(total * 100) / 100,
        updated_at: new Date().toISOString(),
      };

      eventType = "order_edited";
      eventData = {
        action: "items_updated",
        previous_items: order.items,
        new_items: items,
        previous_subtotal: order.subtotal,
        new_subtotal: updateData.subtotal,
      };
    } else if (action === "update_note") {
      updateData = {
        special_instructions: note || null,
        updated_at: new Date().toISOString(),
      };

      eventType = "order_edited";
      eventData = {
        action: "note_updated",
        previous_note: order.special_instructions,
        new_note: note || null,
      };
    } else if (action === "cancel") {
      updateData = {
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      eventType = "order_cancelled_by_customer";
      eventData = {
        reason: cancellation_reason || "customer_request",
        cancelled_within_grace_window: true,
        elapsed_seconds: elapsedSeconds,
      };
    } else {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid action", reason: "invalid" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update the order
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from("food_orders")
      .update(updateData)
      .eq("id", orderId)
      .select()
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to update order", reason: "invalid" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the event for audit trail
    await supabaseAdmin.from("order_events").insert({
      order_id: orderId,
      type: eventType,
      actor_id: user.id,
      actor_role: "customer",
      data: eventData,
    });

    return new Response(
      JSON.stringify({ success: true, order: updatedOrder }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error", reason: "invalid" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
