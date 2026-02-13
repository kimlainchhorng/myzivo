/**
 * Create Travel Checkout Session
 * Creates a Stripe Checkout session for a travel order
 * Includes fraud assessment before proceeding
 */
import { serve, createClient } from "../_shared/deps.ts";
import Stripe from "../_shared/stripe.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

interface CheckoutRequest {
  orderId: string;
  successUrl?: string;
  cancelUrl?: string;
  deviceFingerprint?: string;
}

interface FraudAssessmentResult {
  success: boolean;
  assessmentId?: string;
  riskScore: number;
  riskLevel: string;
  decision: string;
  reasons: string[];
  shouldProceed: boolean;
  requiresReview: boolean;
  isBlocked: boolean;
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

    const body: CheckoutRequest = await req.json();
    const { orderId, successUrl, cancelUrl, deviceFingerprint } = body;

    if (!orderId) {
      throw new Error("Order ID is required");
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
      console.error("Error fetching order:", orderError);
      throw new Error("Order not found");
    }

    // Validate order status
    if (order.status !== "draft") {
      throw new Error(`Cannot checkout order with status: ${order.status}`);
    }

    const items = order.travel_order_items || [];
    if (items.length === 0) {
      throw new Error("Order has no items");
    }

    // ===== FRAUD ASSESSMENT =====
    // Get client IP from request headers
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || 
                     null;
    const userAgent = req.headers.get("user-agent") || null;

    // Determine booking details for fraud check
    const bookingDetails = {
      type: items[0]?.type || "hotel",
      nights: items[0]?.type === "hotel" && items[0]?.start_date && items[0]?.end_date
        ? Math.ceil((new Date(items[0].end_date).getTime() - new Date(items[0].start_date).getTime()) / (1000 * 60 * 60 * 24))
        : undefined,
      isLuxury: order.total > 500,
      isLastMinute: items[0]?.start_date
        ? (new Date(items[0].start_date).getTime() - Date.now()) < (48 * 60 * 60 * 1000)
        : false,
    };

    // Call fraud assessment
    const fraudResponse = await fetch(`${supabaseUrl}/functions/v1/assess-fraud`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        orderId: order.id,
        userId: order.user_id,
        orderTotal: order.total,
        currency: order.currency,
        ipAddress: clientIp,
        userAgent,
        deviceFingerprint,
        bookingDetails,
      }),
    });

    const fraudResult: FraudAssessmentResult = await fraudResponse.json();
    console.log("[CreateCheckout] Fraud assessment:", fraudResult);

    // Handle fraud decision
    if (fraudResult.isBlocked) {
      // Order was blocked by fraud system
      return new Response(
        JSON.stringify({
          success: false,
          blocked: true,
          message: "Your booking is under verification to ensure security. Please contact support if you believe this is an error.",
          supportEmail: "support@hizovo.com",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    if (fraudResult.requiresReview) {
      // Update order status to indicate manual review needed
      await supabase
        .from("travel_orders")
        .update({ status: "fraud_review" })
        .eq("id", order.id);

      // Log audit event
      await supabase.from("booking_audit_logs").insert({
        order_id: order.id,
        user_id: order.user_id,
        event: "fraud_review_required",
        meta: {
          risk_score: fraudResult.riskScore,
          risk_level: fraudResult.riskLevel,
          reasons: fraudResult.reasons,
        },
      });

      return new Response(
        JSON.stringify({
          success: false,
          review: true,
          message: "Your booking is under verification to ensure security. You will receive a confirmation email within 24 hours.",
          estimatedTime: "24 hours",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 202 }
      );
    }

    // ===== PROCEED WITH CHECKOUT =====
    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Build line items from order items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item: { title: string; price: number; quantity: number; type: string; start_date: string }) => ({
        price_data: {
          currency: order.currency.toLowerCase(),
          product_data: {
            name: item.title,
            description: `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} - ${item.start_date}`,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })
    );

    // Add service fee as separate line item
    if (order.fees > 0) {
      lineItems.push({
        price_data: {
          currency: order.currency.toLowerCase(),
          product_data: {
            name: "ZIVO Service Fee",
            description: "Platform service and booking fee",
          },
          unit_amount: Math.round(order.fees * 100),
        },
        quantity: 1,
      });
    }

    // Determine URLs
    const origin = req.headers.get("origin") || "https://hizovo.com";
    const finalSuccessUrl = successUrl || `${origin}/confirmation/${order.order_number}?session_id={CHECKOUT_SESSION_ID}`;
    const finalCancelUrl = cancelUrl || `${origin}/checkout?cancelled=true&order=${order.order_number}`;

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: order.holder_email,
      line_items: lineItems,
      metadata: {
        type: "travel",
        orderId: order.id,
        orderNumber: order.order_number,
        provider: "hotelbeds",
        itemCount: String(items.length),
        fraudAssessmentId: fraudResult.assessmentId || "",
        riskScore: String(fraudResult.riskScore),
      },
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
    });

    // Create payment record
    const { error: paymentError } = await supabase.from("travel_payments").insert({
      order_id: order.id,
      provider: "stripe",
      stripe_checkout_session_id: session.id,
      amount: order.total,
      currency: order.currency,
      status: "pending",
    });

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
    }

    // Update order with checkout session ID and status
    const { error: updateError } = await supabase
      .from("travel_orders")
      .update({
        stripe_checkout_session_id: session.id,
        status: "pending_payment",
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("Error updating order:", updateError);
    }

    // Log audit event
    await supabase.from("booking_audit_logs").insert({
      order_id: order.id,
      user_id: order.user_id,
      event: "payment_initiated",
      meta: {
        checkout_session_id: session.id,
        amount: order.total,
        currency: order.currency,
        fraud_assessment_id: fraudResult.assessmentId,
        risk_score: fraudResult.riskScore,
      },
    });

    console.log("[CreateCheckout] Session created:", session.id, "Order:", order.order_number);

    return new Response(
      JSON.stringify({
        success: true,
        url: session.url,
        sessionId: session.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    console.error("[CreateCheckout] Error:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
