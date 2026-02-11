/**
 * ZIVO Eats — Call Session Management
 * Get or create a masked call session for an order
 */
import { serve, createClient } from "../_shared/deps.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Active order statuses that allow calling
const ACTIVE_STATUSES = ["confirmed", "preparing", "ready_for_pickup", "out_for_delivery"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const proxyNumberPool = Deno.env.get("TWILIO_PROXY_NUMBER_POOL") || "";

    // Parse request
    const { order_id } = await req.json();
    if (!order_id) {
      return new Response(JSON.stringify({ error: "order_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get auth user
    const authHeader = req.headers.get("Authorization")!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch order with restaurant info
    const { data: order, error: orderError } = await supabaseClient
      .from("food_orders")
      .select(`
        id,
        status,
        user_id,
        driver_id,
        restaurant_id,
        customer_phone,
        restaurants:restaurant_id (
          owner_id,
          phone
        )
      `)
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if order is active
    if (!ACTIVE_STATUSES.includes(order.status)) {
      return new Response(JSON.stringify({ error: "Order is not active for calls" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const restaurant = order.restaurants as any;
    const customerUserId = order.user_id;
    const driverUserId = order.driver_id;
    const merchantUserId = restaurant?.owner_id;

    // Verify user is a participant
    const isCustomer = user.id === customerUserId;
    const isDriver = user.id === driverUserId;
    const isMerchant = user.id === merchantUserId;

    if (!isCustomer && !isDriver && !isMerchant) {
      return new Response(JSON.stringify({ error: "Not authorized for this order" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check for existing active session
    const { data: existingSession } = await supabaseClient
      .from("call_sessions")
      .select("*")
      .eq("order_id", order_id)
      .eq("status", "active")
      .single();

    if (existingSession) {
      // Return existing session
      return new Response(JSON.stringify({
        session_id: existingSession.id,
        proxy_number: existingSession.twilio_proxy_number,
        expires_at: existingSession.expires_at,
        participants: {
          customer: { has_phone: !!existingSession.customer_phone },
          driver: { has_phone: !!existingSession.driver_phone },
          merchant: { has_phone: !!existingSession.merchant_phone },
        },
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get phone numbers
    let customerPhone = order.customer_phone;
    let driverPhone = null;
    let merchantPhone = restaurant?.phone;

    // Fetch customer phone from profile if not on order
    if (!customerPhone && customerUserId) {
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("phone")
        .eq("id", customerUserId)
        .single();
      customerPhone = profile?.phone;
    }

    // Fetch driver phone if assigned
    if (driverUserId) {
      const { data: driver } = await supabaseClient
        .from("drivers")
        .select("phone")
        .eq("user_id", driverUserId)
        .single();
      driverPhone = driver?.phone;
    }

    // Pick a proxy number from pool (round-robin based on order count)
    const proxyNumbers = proxyNumberPool.split(",").map(n => n.trim()).filter(Boolean);
    if (proxyNumbers.length === 0) {
      return new Response(JSON.stringify({ error: "No proxy numbers configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Count active sessions to distribute load
    const { count } = await supabaseClient
      .from("call_sessions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    const proxyIndex = (count || 0) % proxyNumbers.length;
    const selectedProxy = proxyNumbers[proxyIndex];

    // Create new session
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours

    const { data: newSession, error: insertError } = await supabaseClient
      .from("call_sessions")
      .insert({
        order_id,
        customer_user_id: customerUserId,
        driver_user_id: driverUserId,
        merchant_user_id: merchantUserId,
        customer_phone: customerPhone,
        driver_phone: driverPhone,
        merchant_phone: merchantPhone,
        twilio_proxy_number: selectedProxy,
        status: "active",
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to create session:", insertError);
      return new Response(JSON.stringify({ error: "Failed to create session" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      session_id: newSession.id,
      proxy_number: newSession.twilio_proxy_number,
      expires_at: newSession.expires_at,
      participants: {
        customer: { has_phone: !!customerPhone },
        driver: { has_phone: !!driverPhone },
        merchant: { has_phone: !!merchantPhone },
      },
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Call session error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
