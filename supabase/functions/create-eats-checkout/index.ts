/**
 * Create Eats Checkout Session
 * Creates a Stripe Checkout session for food orders
 */
import { serve, createClient } from "../_shared/deps.ts";
import Stripe from "../_shared/stripe.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface EatsCheckoutRequest {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address: string;
  delivery_lat?: number;
  delivery_lng?: number;
  restaurant_id: string;
  restaurant_name: string;
  items: CartItem[];
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total: number;
  special_instructions?: string;
  is_express?: boolean;
  express_fee?: number;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: EatsCheckoutRequest = await req.json();
    const {
      customer_name,
      customer_phone,
      customer_email,
      delivery_address,
      delivery_lat,
      delivery_lng,
      restaurant_id,
      restaurant_name,
      items,
      subtotal,
      delivery_fee,
      tax,
      total,
      special_instructions,
      is_express,
      express_fee,
    } = body;

    // Check if eats service is in maintenance
    const { data: serviceStatus } = await supabase
      .from("service_health_status")
      .select("status, is_paused")
      .eq("service_name", "eats")
      .maybeSingle();

    if (serviceStatus?.status === "maintenance" || serviceStatus?.status === "outage" || serviceStatus?.is_paused) {
      return new Response(
        JSON.stringify({ 
          error: "Service temporarily unavailable",
          maintenance: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 503 }
      );
    }

    // Validate required fields
    if (!customer_name || !customer_phone || !delivery_address || !restaurant_id || !items?.length) {
      throw new Error("Missing required fields");
    }

    // Generate a temporary customer ID (for guest orders)
    const tempCustomerId = crypto.randomUUID();

    // Create food order in pending state
    const { data: foodOrder, error: orderError } = await supabase
      .from("food_orders")
      .insert({
        customer_id: tempCustomerId,
        customer_name,
        customer_phone,
        customer_email: customer_email || null,
        delivery_address,
        delivery_lat: delivery_lat || 0,
        delivery_lng: delivery_lng || 0,
        restaurant_id,
        items: items,
        subtotal,
        delivery_fee: delivery_fee || 0,
        tax: tax || 0,
        total_amount: total,
        special_instructions: special_instructions || null,
        is_express: is_express || false,
        express_fee: express_fee || 0,
        status: "pending",
        payment_status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating food order:", orderError);
      throw new Error("Failed to create food order");
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Build line items for Stripe
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Add delivery fee
    if (delivery_fee > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Delivery Fee" },
          unit_amount: Math.round(delivery_fee * 100),
        },
        quantity: 1,
      });
    }

    // Add tax
    if (tax > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Tax" },
          unit_amount: Math.round(tax * 100),
        },
        quantity: 1,
      });
    }

    // Add express fee
    if (is_express && express_fee && express_fee > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Express Delivery" },
          unit_amount: Math.round(express_fee * 100),
        },
        quantity: 1,
      });
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customer_email || undefined,
      line_items: lineItems,
      metadata: {
        type: "eats",
        order_id: foodOrder.id,
        restaurant_id,
        restaurant_name,
        customer_name,
        customer_phone,
      },
      success_url: `${req.headers.get("origin")}/eats/success?session_id={CHECKOUT_SESSION_ID}&order_id=${foodOrder.id}`,
      cancel_url: `${req.headers.get("origin")}/eats?cancelled=true`,
    });

    // Update order with session ID
    await supabase
      .from("food_orders")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", foodOrder.id);

    return new Response(
      JSON.stringify({ 
        url: session.url,
        session_id: session.id,
        order_id: foodOrder.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
