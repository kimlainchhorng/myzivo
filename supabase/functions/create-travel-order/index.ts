/**
 * Create Travel Order
 * Creates a new order with items for hotel/activity/transfer bookings
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  type: "hotel" | "activity" | "transfer";
  title: string;
  startDate: string;
  endDate?: string;
  adults: number;
  children?: number;
  quantity?: number;
  price: number;
  meta: Record<string, unknown>;
}

interface CreateOrderRequest {
  items: OrderItem[];
  holder: {
    name: string;
    email: string;
    phone?: string;
  };
  currency?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header (optional for guest checkout)
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id ?? null;
    }

    const body: CreateOrderRequest = await req.json();
    const { items, holder, currency = "USD" } = body;

    // Validate required fields
    if (!items || items.length === 0) {
      throw new Error("At least one item is required");
    }
    if (!holder?.name || !holder?.email) {
      throw new Error("Holder name and email are required");
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => {
      const qty = item.quantity || 1;
      return sum + (item.price * qty);
    }, 0);
    
    // ZIVO service fee (5%)
    const fees = Math.round(subtotal * 0.05 * 100) / 100;
    // Tax placeholder (could be calculated based on destination)
    const taxes = 0;
    const total = Math.round((subtotal + fees + taxes) * 100) / 100;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("travel_orders")
      .insert({
        user_id: userId,
        currency,
        subtotal,
        taxes,
        fees,
        total,
        status: "draft",
        provider: "hotelbeds",
        holder_name: holder.name,
        holder_email: holder.email,
        holder_phone: holder.phone || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      throw new Error("Failed to create order");
    }

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      type: item.type,
      provider: "hotelbeds",
      title: item.title,
      start_date: item.startDate,
      end_date: item.endDate || null,
      adults: item.adults,
      children: item.children || 0,
      quantity: item.quantity || 1,
      price: item.price,
      meta: item.meta,
      status: "reserved",
    }));

    const { error: itemsError } = await supabase
      .from("travel_order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      // Rollback order
      await supabase.from("travel_orders").delete().eq("id", order.id);
      throw new Error("Failed to create order items");
    }

    // Log audit event
    await supabase.from("booking_audit_logs").insert({
      order_id: order.id,
      user_id: userId,
      event: "order_created",
      meta: {
        item_count: items.length,
        total,
        currency,
        item_types: items.map((i) => i.type),
      },
    });

    console.log("[CreateOrder] Order created:", order.order_number);

    return new Response(
      JSON.stringify({
        success: true,
        orderId: order.id,
        orderNumber: order.order_number,
        total: order.total,
        currency: order.currency,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    console.error("[CreateOrder] Error:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
