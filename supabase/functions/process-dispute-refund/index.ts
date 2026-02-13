/**
 * Process Dispute Refund Edge Function
 * Handles partial or full refunds via Stripe for order disputes
 */
import { serve, createClient } from "../_shared/deps.ts";
import Stripe from "../_shared/stripe.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!stripeSecretKey) {
      throw new Error("Stripe secret key not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-08-27.basil" });

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Verify user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check admin role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roles) {
      throw new Error("Admin access required");
    }

    // Parse request body
    const { dispute_id, amount, reason = "requested_by_customer" } = await req.json();

    if (!dispute_id || !amount || amount <= 0) {
      throw new Error("Invalid request: dispute_id and positive amount required");
    }

    // Get dispute with order details
    const { data: dispute, error: disputeError } = await supabase
      .from("order_disputes")
      .select(`
        *,
        order:food_orders!order_id (
          id, total_amount, stripe_payment_intent_id, payment_status,
          refund_amount, refund_status
        )
      `)
      .eq("id", dispute_id)
      .single();

    if (disputeError || !dispute) {
      throw new Error("Dispute not found");
    }

    const order = dispute.order as {
      id: string;
      total_amount: number;
      stripe_payment_intent_id: string | null;
      payment_status: string | null;
      refund_amount: number | null;
      refund_status: string | null;
    };

    if (!order.stripe_payment_intent_id) {
      throw new Error("No Stripe payment intent found for this order");
    }

    // Calculate available refund amount
    const previouslyRefunded = order.refund_amount || 0;
    const availableForRefund = order.total_amount - previouslyRefunded;

    if (amount > availableForRefund) {
      throw new Error(`Refund amount exceeds available balance. Max: $${availableForRefund.toFixed(2)}`);
    }

    // Create refund request record
    const { data: refundRequest, error: refundInsertError } = await supabase
      .from("refund_requests")
      .insert({
        dispute_id,
        order_id: order.id,
        amount,
        status: "processing",
        refund_reason: reason,
        created_by: user.id,
      })
      .select()
      .single();

    if (refundInsertError) {
      throw new Error(`Failed to create refund request: ${refundInsertError.message}`);
    }

    try {
      // Process refund via Stripe
      const amountInCents = Math.round(amount * 100);
      
      const refund = await stripe.refunds.create({
        payment_intent: order.stripe_payment_intent_id,
        amount: amountInCents,
        reason: reason as "duplicate" | "fraudulent" | "requested_by_customer",
      });

      // Update refund request as successful
      await supabase
        .from("refund_requests")
        .update({
          status: "refunded",
          stripe_refund_id: refund.id,
          processed_at: new Date().toISOString(),
        })
        .eq("id", refundRequest.id);

      // Update food_orders with refund info
      const newRefundTotal = previouslyRefunded + amount;
      const isFullRefund = newRefundTotal >= order.total_amount;

      await supabase
        .from("food_orders")
        .update({
          refund_amount: newRefundTotal,
          refund_status: isFullRefund ? "refunded" : "partial_refund",
          refunded_at: new Date().toISOString(),
          payment_status: isFullRefund ? "refunded" : order.payment_status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      // Update dispute with approved amount
      const newApprovedAmount = (dispute.approved_refund_amount || 0) + amount;
      await supabase
        .from("order_disputes")
        .update({
          approved_refund_amount: newApprovedAmount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", dispute_id);

      // Log to audit
      await supabase.from("dispute_audit_logs").insert({
        actor_id: user.id,
        action: "refund_processed",
        entity_type: "refund",
        entity_id: refundRequest.id,
        new_values: {
          amount,
          stripe_refund_id: refund.id,
          reason,
        },
        metadata: {
          dispute_id,
          order_id: order.id,
        },
      });

      return new Response(
        JSON.stringify({
          success: true,
          refund_id: refund.id,
          amount,
          status: "refunded",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (stripeError: unknown) {
      // Update refund request as failed
      const errorMessage = stripeError instanceof Error ? stripeError.message : "Unknown Stripe error";
      
      await supabase
        .from("refund_requests")
        .update({
          status: "failed",
          stripe_error: errorMessage,
          processed_at: new Date().toISOString(),
        })
        .eq("id", refundRequest.id);

      // Log failure to audit
      await supabase.from("dispute_audit_logs").insert({
        actor_id: user.id,
        action: "refund_failed",
        entity_type: "refund",
        entity_id: refundRequest.id,
        new_values: {
          amount,
          error: errorMessage,
        },
        metadata: {
          dispute_id,
          order_id: order.id,
        },
      });

      throw new Error(`Stripe refund failed: ${errorMessage}`);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("process-dispute-refund error:", message);
    
    return new Response(
      JSON.stringify({ error: message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
