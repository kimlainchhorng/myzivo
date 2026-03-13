import { createClient } from "../_shared/deps.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import Stripe from "../_shared/stripe.ts";

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: "Stripe not configured" }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Optionally authenticate
    const authHeader = req.headers.get("authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();

    const { items, delivery_address, customer_name, customer_phone, tip, store } = await req.json();

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ error: "No items provided" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    if (!delivery_address || !customer_name) {
      return new Response(JSON.stringify({ error: "Delivery address and name required" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const DELIVERY_BASE = 299; // cents
    const DELIVERY_PER_MILE = 60; // cents
    const DELIVERY_PER_MIN = 10; // cents
    const DELIVERY_MIN = 399; // cents
    const DELIVERY_MAX = 1499; // cents
    const SERVICE_FEE_PCT = 5; // percentage
    const SERVICE_FEE_MIN = 250; // cents = $2.50
    const SERVICE_FEE_MAX = 1000; // cents = $10.00
    const tipCents = Math.round((tip || 0) * 100);
    const tipCents = Math.round((tip || 0) * 100);

    // Estimate distance (~3 miles, ~30 min as fallback)
    const estMiles = 3;
    const estMinutes = 30;
    const rawDelivery = DELIVERY_BASE + estMiles * DELIVERY_PER_MILE + estMinutes * DELIVERY_PER_MIN;
    const deliveryFeeCents = Math.min(DELIVERY_MAX, Math.max(DELIVERY_MIN, rawDelivery));

    // Calculate subtotal in cents
    const subtotalCents = items.reduce(
      (sum: number, item: any) => sum + Math.round(item.price * 100) * item.quantity,
      0
    );

    // Service fee: 5% of subtotal with min $2.50 and max $10.00
    const rawServiceFee = Math.round(subtotalCents * SERVICE_FEE_PCT / 100);
    const serviceFeeCents = Math.min(SERVICE_FEE_MAX, Math.max(SERVICE_FEE_MIN, rawServiceFee));

    const totalCents = subtotalCents + markupCents + deliveryFeeCents + serviceFeeCents + tipCents;

    // Save order to DB first
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: order, error: orderErr } = await admin
      .from("shopping_orders")
      .insert({
        user_id: user?.id || null,
        store: store || "Unknown",
        order_type: "shopping_delivery",
        status: "pending_payment",
        items: items,
        total_amount: (subtotalCents + markupCents) / 100,
        delivery_fee: deliveryFeeCents / 100,
        delivery_address,
        customer_name,
        customer_phone: customer_phone || null,
        customer_email: user?.email || null,
        placed_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (orderErr) {
      console.error("[create-grocery-checkout] DB error:", orderErr);
      throw new Error("Failed to create order");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Build line items for Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          ...(item.image ? { images: [item.image] } : {}),
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Add platform fee (markup)
    if (markupCents > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: `Platform Fee (${markupPct}%)` },
          unit_amount: markupCents,
        },
        quantity: 1,
      });
    }

    // Add delivery fee
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Delivery Fee" },
        unit_amount: deliveryFeeCents,
      },
      quantity: 1,
    });

    // Add service fee (percentage-based with min/max)
    if (serviceFeeCents > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: `Service Fee (${SERVICE_FEE_PCT}%)` },
          unit_amount: serviceFeeCents,
        },
        quantity: 1,
      });
    }

    // Add tip if any
    if (tipCents > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Driver Tip" },
          unit_amount: tipCents,
        },
        quantity: 1,
      });
    }

    // Find or create Stripe customer
    let customerId: string | undefined;
    if (user?.email) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    const origin = req.headers.get("origin") || "https://hizivo.com";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : (user?.email || undefined),
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/grocery/order-confirmed?order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/grocery`,
      metadata: {
        order_id: order.id,
        store: store || "Unknown",
      },
    });

    console.log(`[create-grocery-checkout] Session ${session.id} for order ${order.id}, total ${totalCents}c`);

    return new Response(
      JSON.stringify({ url: session.url, order_id: order.id }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[create-grocery-checkout] Error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
