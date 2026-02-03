/**
 * Stripe Webhook Handler - OTA-Grade Payment Processing
 * Handles: checkout.session.completed, payment_intent.succeeded/failed, 
 * charge.refunded, charge.dispute.created
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

// Audit logging helper
async function logPaymentAudit(
  supabase: any,
  data: {
    bookingId?: string;
    stripeEventType: string;
    stripeEventId?: string;
    stripePaymentIntentId?: string;
    duffelAction?: string;
    amount?: number;
    currency?: string;
    status: string;
    errorMessage?: string;
    metadata?: Record<string, any>;
  }
) {
  try {
    await supabase.from('flight_payment_audit_log').insert({
      booking_id: data.bookingId || null,
      stripe_event_type: data.stripeEventType,
      stripe_event_id: data.stripeEventId,
      stripe_payment_intent_id: data.stripePaymentIntentId,
      duffel_action: data.duffelAction,
      amount: data.amount,
      currency: data.currency || 'USD',
      status: data.status,
      error_message: data.errorMessage,
      metadata: data.metadata || {},
    });
  } catch (err) {
    console.error('[Audit] Failed to log payment event:', err);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : "Unknown error";
        console.error("Webhook signature verification failed:", errMessage);
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    } else {
      // For development without webhook secret
      event = JSON.parse(body);
    }

    console.log("[Webhook] Processing event:", event.type, "ID:", event.id);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};
        const paymentIntentId = typeof session.payment_intent === 'string' 
          ? session.payment_intent 
          : session.payment_intent?.id;

        console.log("[Webhook] Checkout completed:", session.id, "Type:", metadata.type);

        if (metadata.type === "ride") {
          // Update ride request
          const { error } = await supabase
            .from("ride_requests")
            .update({
              status: "paid",
              payment_status: "paid",
              stripe_payment_intent_id: paymentIntentId,
            })
            .eq("stripe_checkout_session_id", session.id);

          if (error) {
            console.error("Error updating ride request:", error);
          } else {
            console.log("Ride request updated to paid:", metadata.ride_request_id);
          }
        } else if (metadata.type === "eats") {
          // Update food order
          const { error } = await supabase
            .from("food_orders")
            .update({
              status: "pending",
              payment_status: "paid",
              stripe_payment_id: paymentIntentId,
              placed_at: new Date().toISOString(),
            })
            .eq("stripe_checkout_session_id", session.id);

          if (error) {
            console.error("Error updating food order:", error);
          } else {
            console.log("Food order updated to paid:", metadata.order_id);
          }
        } else if (metadata.type === "p2p") {
          // Update P2P booking
          const { error } = await supabase
            .from("p2p_bookings")
            .update({
              status: "confirmed",
              payment_status: "captured",
              stripe_payment_intent_id: paymentIntentId,
            })
            .eq("stripe_checkout_session_id", session.id);

          if (error) {
            console.error("Error updating P2P booking:", error);
          } else {
            console.log("P2P booking updated to captured:", metadata.booking_id);
          }
        } else if (metadata.type === "flight") {
          // Log payment audit
          await logPaymentAudit(supabase, {
            bookingId: metadata.booking_id,
            stripeEventType: event.type,
            stripeEventId: event.id,
            stripePaymentIntentId: paymentIntentId,
            status: 'success',
            amount: session.amount_total ? session.amount_total / 100 : undefined,
            currency: session.currency?.toUpperCase(),
            metadata: { checkout_session_id: session.id },
          });

          // Update flight booking with explicit payment confirmation
          const { data: updatedBooking, error: updateError } = await supabase
            .from("flight_bookings")
            .update({
              payment_status: "paid",
              stripe_payment_intent_id: paymentIntentId,
              ticketing_status: "processing",
            })
            .eq("stripe_checkout_session_id", session.id)
            .select()
            .single();

          if (updateError) {
            console.error("[Webhook] Error updating flight booking:", updateError);
            
            await logPaymentAudit(supabase, {
              bookingId: metadata.booking_id,
              stripeEventType: event.type,
              stripeEventId: event.id,
              status: 'error',
              errorMessage: updateError.message,
            });

            await supabase.from('flight_admin_alerts').insert({
              booking_id: metadata.booking_id,
              alert_type: 'payment_failed',
              message: `Failed to update booking after payment: ${updateError.message}`,
              severity: 'critical',
            });
            break;
          }

          console.log("[Webhook] Flight booking paid:", metadata.booking_id);
          
          // Trigger ticketing with explicit error handling
          try {
            const ticketResponse = await fetch(`${supabaseUrl}/functions/v1/issue-flight-ticket`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({ bookingId: metadata.booking_id }),
            });
            
            if (!ticketResponse.ok) {
              const ticketError = await ticketResponse.json();
              console.error("[Webhook] Ticketing trigger failed:", ticketError);
              
              await logPaymentAudit(supabase, {
                bookingId: metadata.booking_id,
                stripeEventType: 'ticketing_triggered',
                stripeEventId: event.id,
                duffelAction: 'create_order_failed',
                status: 'error',
                errorMessage: ticketError.error || 'Ticketing failed',
              });
            } else {
              console.log("[Webhook] Ticketing triggered successfully for:", metadata.booking_id);
              
              await logPaymentAudit(supabase, {
                bookingId: metadata.booking_id,
                stripeEventType: 'ticketing_triggered',
                stripeEventId: event.id,
                duffelAction: 'create_order',
                status: 'success',
              });
            }
          } catch (ticketErr) {
            console.error("[Webhook] Error triggering ticketing:", ticketErr);
            await supabase.from('flight_admin_alerts').insert({
              booking_id: metadata.booking_id,
              alert_type: 'ticketing_failed',
              message: `Failed to trigger ticketing after payment: ${ticketErr instanceof Error ? ticketErr.message : 'Unknown error'}`,
              severity: 'critical',
            });
          }
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("[Webhook] Payment succeeded:", paymentIntent.id);
        
        // Update any orders with this payment intent ID
        await supabase
          .from("ride_requests")
          .update({ payment_status: "paid" })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        await supabase
          .from("food_orders")
          .update({ payment_status: "paid" })
          .eq("stripe_payment_id", paymentIntent.id);

        // Log for flight payments
        if (paymentIntent.metadata?.type === 'flight') {
          await logPaymentAudit(supabase, {
            bookingId: paymentIntent.metadata.booking_id,
            stripeEventType: event.type,
            stripeEventId: event.id,
            stripePaymentIntentId: paymentIntent.id,
            status: 'success',
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency.toUpperCase(),
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("[Webhook] Payment failed:", paymentIntent.id);

        // Update any orders with this payment intent ID
        await supabase
          .from("ride_requests")
          .update({ payment_status: "failed", status: "cancelled" })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        await supabase
          .from("food_orders")
          .update({ payment_status: "failed", status: "cancelled" })
          .eq("stripe_payment_id", paymentIntent.id);

        // Handle flight payment failures
        if (paymentIntent.metadata?.type === 'flight') {
          await supabase
            .from("flight_bookings")
            .update({ 
              payment_status: "failed",
              ticketing_status: "cancelled",
            })
            .eq("stripe_payment_intent_id", paymentIntent.id);

          await logPaymentAudit(supabase, {
            bookingId: paymentIntent.metadata.booking_id,
            stripeEventType: event.type,
            stripeEventId: event.id,
            stripePaymentIntentId: paymentIntent.id,
            status: 'failed',
            errorMessage: paymentIntent.last_payment_error?.message || 'Payment failed',
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency.toUpperCase(),
          });

          await supabase.from('flight_admin_alerts').insert({
            booking_id: paymentIntent.metadata.booking_id,
            alert_type: 'payment_failed',
            message: `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`,
            severity: 'high',
          });
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = typeof charge.payment_intent === 'string' 
          ? charge.payment_intent 
          : charge.payment_intent?.id;
        const refundAmount = charge.amount_refunded / 100;

        console.log("[Webhook] Charge refunded:", charge.id, "Amount:", refundAmount, "PI:", paymentIntentId);

        if (paymentIntentId) {
          // Update ride requests
          await supabase
            .from("ride_requests")
            .update({ 
              refund_status: "refunded",
              refunded_at: new Date().toISOString(),
            })
            .eq("stripe_payment_intent_id", paymentIntentId);

          // Update food orders
          await supabase
            .from("food_orders")
            .update({ 
              refund_status: "refunded",
              refunded_at: new Date().toISOString(),
            })
            .eq("stripe_payment_id", paymentIntentId);

          // Update P2P bookings
          await supabase
            .from("p2p_bookings")
            .update({ 
              refund_status: "refunded",
              payment_status: "refunded",
              refunded_at: new Date().toISOString(),
            })
            .eq("stripe_payment_intent_id", paymentIntentId);

          // Update flight bookings
          const { data: flightBooking } = await supabase
            .from("flight_bookings")
            .update({ 
              refund_status: "refunded",
              payment_status: "refunded",
              refund_amount: refundAmount,
              refund_processed_at: new Date().toISOString(),
            })
            .eq("stripe_payment_intent_id", paymentIntentId)
            .select('id')
            .single();

          if (flightBooking) {
            await logPaymentAudit(supabase, {
              bookingId: flightBooking.id,
              stripeEventType: event.type,
              stripeEventId: event.id,
              stripePaymentIntentId: paymentIntentId,
              status: 'success',
              amount: refundAmount,
              currency: charge.currency.toUpperCase(),
              metadata: { refund_id: charge.refunds?.data?.[0]?.id },
            });
          }
        }
        break;
      }

      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge?.id;
        
        console.log("[Webhook] DISPUTE CREATED:", dispute.id, "Reason:", dispute.reason, "Amount:", dispute.amount / 100);

        // Get the charge to find the payment intent
        if (chargeId) {
          const charge = await stripe.charges.retrieve(chargeId);
          const paymentIntentId = typeof charge.payment_intent === 'string' 
            ? charge.payment_intent 
            : charge.payment_intent?.id;

          if (paymentIntentId) {
            // Update flight bookings with dispute info
            const { data: flightBooking } = await supabase
              .from("flight_bookings")
              .update({ 
                dispute_status: dispute.status,
                dispute_id: dispute.id,
                dispute_created_at: new Date().toISOString(),
              })
              .eq("stripe_payment_intent_id", paymentIntentId)
              .select('id, booking_reference')
              .single();

            if (flightBooking) {
              // Create CRITICAL admin alert
              await supabase.from('flight_admin_alerts').insert({
                booking_id: flightBooking.id,
                alert_type: 'dispute_created',
                message: `🚨 CHARGEBACK DISPUTE: Booking ${flightBooking.booking_reference}. Reason: ${dispute.reason}. Amount: $${dispute.amount / 100}. Respond within deadline!`,
                severity: 'critical',
              });

              await logPaymentAudit(supabase, {
                bookingId: flightBooking.id,
                stripeEventType: event.type,
                stripeEventId: event.id,
                stripePaymentIntentId: paymentIntentId,
                status: 'dispute_opened',
                amount: dispute.amount / 100,
                currency: dispute.currency.toUpperCase(),
                metadata: { 
                  dispute_id: dispute.id,
                  reason: dispute.reason,
                  evidence_due_by: dispute.evidence_details?.due_by,
                },
              });
            }

            // Also check P2P bookings
            await supabase
              .from("p2p_bookings")
              .update({ 
                dispute_status: dispute.status,
              })
              .eq("stripe_payment_intent_id", paymentIntentId);
          }
        }
        break;
      }

      case "charge.dispute.closed": {
        const dispute = event.data.object as Stripe.Dispute;
        const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge?.id;
        
        console.log("[Webhook] Dispute closed:", dispute.id, "Status:", dispute.status);

        if (chargeId) {
          const charge = await stripe.charges.retrieve(chargeId);
          const paymentIntentId = typeof charge.payment_intent === 'string' 
            ? charge.payment_intent 
            : charge.payment_intent?.id;

          if (paymentIntentId) {
            const { data: flightBooking } = await supabase
              .from("flight_bookings")
              .update({ 
                dispute_status: dispute.status,
              })
              .eq("stripe_payment_intent_id", paymentIntentId)
              .select('id, booking_reference')
              .single();

            if (flightBooking) {
              const isWon = dispute.status === 'won';
              await supabase.from('flight_admin_alerts').insert({
                booking_id: flightBooking.id,
                alert_type: 'dispute_closed',
                message: isWon 
                  ? `✅ Dispute WON for booking ${flightBooking.booking_reference}` 
                  : `❌ Dispute LOST for booking ${flightBooking.booking_reference}. Amount: $${dispute.amount / 100}`,
                severity: isWon ? 'low' : 'high',
              });

              await logPaymentAudit(supabase, {
                bookingId: flightBooking.id,
                stripeEventType: event.type,
                stripeEventId: event.id,
                stripePaymentIntentId: paymentIntentId,
                status: dispute.status,
                amount: dispute.amount / 100,
                metadata: { dispute_id: dispute.id },
              });
            }
          }
        }
        break;
      }

      default:
        console.log("[Webhook] Unhandled event type:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("[Webhook] Error:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
