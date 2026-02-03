/**
 * Process Travel Cancellation (Admin Only)
 * Reviews and approves/rejects cancellation requests
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProcessRequest {
  orderId: string;
  action: "approve" | "reject";
  adminNotes?: string;
  refundAmount?: number; // Optional partial refund
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get admin user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Invalid authentication");
    }

    // Verify admin role using has_role function
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!isAdmin) {
      throw new Error("Admin access required");
    }

    const body: ProcessRequest = await req.json();
    const { orderId, action, adminNotes, refundAmount } = body;

    if (!orderId || !action) {
      throw new Error("Order ID and action are required");
    }

    if (!["approve", "reject"].includes(action)) {
      throw new Error("Action must be 'approve' or 'reject'");
    }

    // Fetch order with items and payment
    const { data: order, error: orderError } = await supabase
      .from("travel_orders")
      .select(`
        *,
        travel_order_items (*),
        travel_payments (*)
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    if (order.cancellation_status !== "requested" && order.cancellation_status !== "under_review") {
      throw new Error(`Order cancellation status is '${order.cancellation_status}', expected 'requested' or 'under_review'`);
    }

    const now = new Date().toISOString();

    if (action === "reject") {
      // Reject the cancellation
      await supabase
        .from("travel_orders")
        .update({
          cancellation_status: "rejected",
          updated_at: now,
        })
        .eq("id", orderId);

      // Log email
      await supabase.from("travel_email_logs").insert({
        order_id: orderId,
        to_email: order.holder_email,
        template: "cancellation_update",
        status: "queued",
      });

      // Audit log
      await supabase.from("booking_audit_logs").insert({
        order_id: orderId,
        user_id: user.id,
        event: "cancellation_rejected",
        meta: {
          admin_id: user.id,
          admin_notes: adminNotes,
          order_number: order.order_number,
        },
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Cancellation request rejected",
          orderNumber: order.order_number,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Action is "approve" - process cancellation and refund
    let refundResult = null;
    const payment = order.travel_payments?.[0];

    // Process Stripe refund if payment exists
    if (payment && payment.status === "succeeded" && stripeSecretKey) {
      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: "2023-10-16",
      });

      try {
        // Get the payment intent from checkout session
        const session = await stripe.checkout.sessions.retrieve(
          payment.stripe_checkout_session_id
        );

        if (session.payment_intent) {
          const refundAmountCents = refundAmount
            ? Math.round(refundAmount * 100)
            : Math.round(order.total * 100);

          refundResult = await stripe.refunds.create({
            payment_intent: session.payment_intent as string,
            amount: refundAmountCents,
            reason: "requested_by_customer",
          });

          console.log("[ProcessCancellation] Refund created:", refundResult.id);

          // Update payment status
          await supabase
            .from("travel_payments")
            .update({ status: "refunded" })
            .eq("id", payment.id);
        }
      } catch (stripeError) {
        console.error("[ProcessCancellation] Stripe refund error:", stripeError);
        // Continue with cancellation even if refund fails - log the error
        await supabase.from("booking_audit_logs").insert({
          order_id: orderId,
          user_id: user.id,
          event: "refund_failed",
          meta: {
            error: stripeError instanceof Error ? stripeError.message : "Unknown error",
            payment_id: payment.id,
          },
        });
      }
    }

    // Update order status
    await supabase
      .from("travel_orders")
      .update({
        status: "cancelled",
        cancellation_status: "processed",
        cancelled_at: now,
        cancelled_by: user.id,
        updated_at: now,
      })
      .eq("id", orderId);

    // Update all order items to cancelled
    await supabase
      .from("travel_order_items")
      .update({ supplier_status: "cancelled" })
      .eq("order_id", orderId);

    // Log email
    await supabase.from("travel_email_logs").insert({
      order_id: orderId,
      to_email: order.holder_email,
      template: refundResult ? "refund_processed" : "cancellation_update",
      status: "queued",
    });

    // Audit log
    await supabase.from("booking_audit_logs").insert({
      order_id: orderId,
      user_id: user.id,
      event: "cancellation_approved",
      meta: {
        admin_id: user.id,
        admin_notes: adminNotes,
        order_number: order.order_number,
        refund_id: refundResult?.id,
        refund_amount: refundAmount || order.total,
      },
    });

    console.log("[ProcessCancellation] Cancellation processed for order:", order.order_number);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Cancellation approved and processed",
        orderNumber: order.order_number,
        refundId: refundResult?.id,
        refundAmount: refundAmount || order.total,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    console.error("[ProcessCancellation] Error:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
