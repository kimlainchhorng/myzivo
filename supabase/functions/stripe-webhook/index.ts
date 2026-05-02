/**
 * Stripe Webhook Handler - OTA-Grade Payment Processing
 * Handles: checkout.session.completed, payment_intent.succeeded/failed, 
 * charge.refunded, charge.dispute.created
 */
import { serve, createClient } from "../_shared/deps.ts";
import Stripe from "../_shared/stripe.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

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

async function upsertPurchaseRecord(
  supabase: any,
  input: {
    userId?: string | null;
    transactionId: string;
    sourceType: string;
    amountCents: number;
    currency: string;
    status?: string;
    metadata?: Record<string, any>;
  }
) {
  const payload = {
    user_id: input.userId || null,
    transaction_id: input.transactionId,
    source_type: input.sourceType,
    amount_cents: input.amountCents,
    currency: (input.currency || 'USD').toUpperCase(),
    status: input.status || 'completed',
    metadata: input.metadata || {},
  };

  const { error } = await supabase
    .from('purchase_records')
    .upsert(payload, { onConflict: 'transaction_id' });

  if (error) {
    console.error('[Webhook] Failed to upsert purchase record:', error);
  }
}

async function upsertShopPulse(
  supabase: any,
  storeId: string,
  transactionId: string,
) {
  if (!storeId) return;

  const nowIso = new Date().toISOString();
  const { error } = await supabase
    .from('shop_live_pulse')
    .upsert(
      {
        store_id: storeId,
        last_purchase_at: nowIso,
        last_event_id: transactionId,
        updated_at: nowIso,
      },
      { onConflict: 'store_id' }
    );

  if (error) {
    console.error('[Webhook] Failed to upsert live pulse:', error);
  }
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
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
      // SECURITY: Webhook signature verification is mandatory
      console.error("[Webhook] Missing STRIPE_WEBHOOK_SECRET or stripe-signature header");
      return new Response(
        JSON.stringify({ error: "Webhook signature verification required. Configure STRIPE_WEBHOOK_SECRET." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
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
            // Notify rider: payment confirmed
            if (metadata.rider_id || metadata.user_id || metadata.customer_id) {
              const uid = metadata.rider_id || metadata.user_id || metadata.customer_id;
              try {
                await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${supabaseServiceKey}` },
                  body: JSON.stringify({ user_id: uid, notification_type: "payment_confirmed", title: "Ride Payment Confirmed ✅", body: `Your ride payment of $${((session.amount_total || 0) / 100).toFixed(2)} was successful`, data: { type: "payment_confirmed", service: "ride", action_url: `/rides/tracking/${metadata.ride_request_id}` } }),
                });
              } catch {}
            }
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
            // Notify customer: order confirmed
            if (metadata.user_id || metadata.customer_id) {
              const uid = metadata.user_id || metadata.customer_id;
              try {
                await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${supabaseServiceKey}` },
                  body: JSON.stringify({ user_id: uid, notification_type: "payment_confirmed", title: "Order Confirmed 🍕", body: `Your order payment of $${((session.amount_total || 0) / 100).toFixed(2)} was successful`, data: { type: "payment_confirmed", service: "eats", action_url: `/eats/${metadata.order_id}` } }),
                });
              } catch {}
            }
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

          // Notify user: flight payment confirmed
          if (metadata.user_id) {
            try {
              await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${supabaseServiceKey}` },
                body: JSON.stringify({ user_id: metadata.user_id, notification_type: "payment_confirmed", title: "Flight Payment Confirmed ✈️", body: `Your flight payment of $${((session.amount_total || 0) / 100).toFixed(2)} was successful. Ticketing in progress.`, data: { type: "payment_confirmed", service: "flight", booking_id: metadata.booking_id, action_url: `/bookings/${metadata.booking_id}` } }),
              });
            } catch {}
          }
          try {
            await fetch(`${supabaseUrl}/functions/v1/send-flight-email`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({
                type: "payment_receipt",
                bookingId: metadata.booking_id,
              }),
            });
            console.log("[Webhook] Payment receipt email triggered");
          } catch (emailErr) {
            console.error("[Webhook] Payment email failed:", emailErr);
          }
          
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
        } else if (metadata.type === "travel") {
          // Handle travel bookings (hotels, activities, transfers)
          console.log("[Webhook] Travel checkout completed:", session.id, "Order:", metadata.orderId);

          // Update payment status
          await supabase
            .from("travel_payments")
            .update({ status: "succeeded" })
            .eq("stripe_checkout_session_id", session.id);

          // Trigger booking confirmation with Hotelbeds
          try {
            const confirmResponse = await fetch(`${supabaseUrl}/functions/v1/confirm-hotelbeds-booking`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({ orderId: metadata.orderId }),
            });

            if (!confirmResponse.ok) {
              const confirmError = await confirmResponse.json();
              console.error("[Webhook] Travel booking confirmation failed:", confirmError);

              // Update order status to failed
              await supabase
                .from("travel_orders")
                .update({ status: "failed" })
                .eq("id", metadata.orderId);

              // Log audit event
              await supabase.from("booking_audit_logs").insert({
                order_id: metadata.orderId,
                event: "booking_confirmation_failed",
                meta: { error: confirmError.error, checkout_session_id: session.id },
              });
            } else {
              console.log("[Webhook] Travel booking confirmed for order:", metadata.orderNumber);
            }
          } catch (confirmErr) {
            console.error("[Webhook] Error confirming travel booking:", confirmErr);

            await supabase
              .from("travel_orders")
              .update({ status: "failed" })
              .eq("id", metadata.orderId);

            await supabase.from("booking_audit_logs").insert({
              order_id: metadata.orderId,
              event: "booking_confirmation_error",
              meta: { 
                error: confirmErr instanceof Error ? confirmErr.message : "Unknown error",
                checkout_session_id: session.id,
              },
            });
          }
        }
        // ──── Record 2% platform fee ────
        const merchantId = metadata.merchant_id || metadata.restaurant_id || metadata.store_id || null;

        if (session.amount_total && session.amount_total > 0) {
          try {
            const grossCents = session.amount_total;
            const feePct = 2.00;

            // Check for active fee waiver
            let waived = false;
            let waiverId = null;
            if (merchantId) {
              const { data: waiver } = await supabase
                .from("merchant_fee_waivers")
                .select("id, waiver_pct")
                .eq("store_id", merchantId)
                .gte("expires_at", new Date().toISOString())
                .lte("starts_at", new Date().toISOString())
                .order("waiver_pct", { ascending: false })
                .limit(1)
                .maybeSingle();

              if (waiver && waiver.waiver_pct >= 100) {
                waived = true;
                waiverId = waiver.id;
              }
            }

            const feeAmountCents = waived ? 0 : Math.round(grossCents * feePct / 100);

            await supabase.from("platform_fee_ledger").insert({
              order_type: metadata.type || "general",
              order_id: session.id,
              merchant_id: merchantId,
              gross_amount_cents: grossCents,
              fee_pct: waived ? 0 : feePct,
              fee_amount_cents: feeAmountCents,
              waived,
              waiver_id: waiverId,
            });

            if (feeAmountCents > 0) {
              await supabase.from("admin_wallet_ledger").upsert(
                {
                  source_type: "platform_fee",
                  source_id: session.id,
                  transaction_id: session.id,
                  amount_cents: feeAmountCents,
                  currency: session.currency?.toUpperCase() || "USD",
                  metadata: {
                    order_type: metadata.type || "general",
                    merchant_id: merchantId,
                    gross_amount_cents: grossCents,
                    fee_pct: feePct,
                  },
                },
                { onConflict: "transaction_id,source_type,source_id" }
              );
            }

            console.log("[Webhook] Platform fee recorded:", feeAmountCents, "cents", waived ? "(WAIVED)" : "");
          } catch (feeErr) {
            console.error("[Webhook] Platform fee recording failed:", feeErr);
          }
        }

        if (session.amount_total && session.amount_total > 0) {
          const userId = metadata.user_id || metadata.customer_id || metadata.rider_id || null;
          await upsertPurchaseRecord(supabase, {
            userId,
            transactionId: session.id,
            sourceType: metadata.type || 'stripe_checkout',
            amountCents: session.amount_total,
            currency: session.currency?.toUpperCase() || 'USD',
            status: 'completed',
            metadata: {
              stripe_event_id: event.id,
              stripe_payment_intent_id: paymentIntentId,
              merchant_id: merchantId,
              checkout_session_id: session.id,
              meta_event_id: session.id,
            },
          });

          if (merchantId) {
            await upsertShopPulse(supabase, merchantId, session.id);
          }
        }

        // ──── Fire Meta CAPI Purchase event ────
        if (session.amount_total && session.amount_total > 0) {
          try {
            const capiUrl = `${supabaseUrl}/functions/v1/meta-capi-bridge`;
            const userId = metadata.user_id || metadata.customer_id || metadata.rider_id || null;
            const capiPayload: Record<string, unknown> = {
              table: "stripe_checkout",
              type: "INSERT",
              record: {
                id: session.id,
                user_id: userId,
                store_id: merchantId,
                total_amount: session.amount_total / 100,
                currency: session.currency?.toUpperCase() || "USD",
                created_at: new Date().toISOString(),
                service_type: metadata.type || "general",
                metadata: {
                  store_id: merchantId,
                },
              },
            };
            await fetch(capiUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify(capiPayload),
            });
            console.log("[Webhook] Meta CAPI Purchase event fired for:", session.id);
          } catch (capiErr) {
            console.error("[Webhook] Meta CAPI trigger failed:", capiErr);
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
        const failedUserId = paymentIntent.metadata?.user_id || paymentIntent.metadata?.customer_id || paymentIntent.metadata?.rider_id;

        // Update any orders with this payment intent ID
        await supabase
          .from("ride_requests")
          .update({ payment_status: "failed", status: "cancelled" })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        await supabase
          .from("food_orders")
          .update({ payment_status: "failed", status: "cancelled" })
          .eq("stripe_payment_id", paymentIntent.id);

        // Notify user: payment failed
        if (failedUserId) {
          try {
            await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${supabaseServiceKey}` },
              body: JSON.stringify({ user_id: failedUserId, notification_type: "payment_failed", title: "Payment Failed ❌", body: `Your payment of $${(paymentIntent.amount / 100).toFixed(2)} could not be processed. Please try again.`, data: { type: "payment_failed", action_url: "/wallet" } }),
            });
          } catch {}
        }

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

        // Notify user about refund
        const refundUserId = charge.metadata?.user_id || charge.metadata?.customer_id || charge.metadata?.rider_id;
        if (refundUserId) {
          try {
            await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${supabaseServiceKey}` },
              body: JSON.stringify({ user_id: refundUserId, notification_type: "refund_processed", title: "Refund Processed 💵", body: `$${refundAmount.toFixed(2)} has been refunded to your payment method`, data: { type: "refund_processed", amount: refundAmount, action_url: "/wallet" } }),
            });
          } catch {}
        }

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

      // ============ ZIVO+ MEMBERSHIP SUBSCRIPTION EVENTS ============
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const metadata = subscription.metadata || {};
        
        // Only handle membership subscriptions
        if (metadata.type === "membership" && metadata.user_id && metadata.plan_id) {
          console.log("[Webhook] Membership subscription event:", event.type, "Sub:", subscription.id);
          
          const subscriptionData = {
            user_id: metadata.user_id,
            plan_id: metadata.plan_id,
            status: subscription.status,
            stripe_subscription_id: subscription.id,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          };

          // Upsert subscription record
          const { error: upsertError } = await supabase
            .from("zivo_subscriptions")
            .upsert(subscriptionData, { onConflict: "user_id" });

          if (upsertError) {
            console.error("[Webhook] Error upserting membership:", upsertError);
          } else {
            console.log("[Webhook] Membership subscription synced:", metadata.user_id, "Status:", subscription.status);
            // Notify user: ZIVO+ activated
            if (subscription.status === "active") {
              try {
                await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${supabaseServiceKey}` },
                  body: JSON.stringify({ user_id: metadata.user_id, notification_type: "membership_activated", title: "Welcome to ZIVO+ ⭐", body: "Your premium membership is now active. Enjoy exclusive perks!", data: { type: "membership_activated", action_url: "/account" } }),
                });
              } catch {}
            }
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const metadata = subscription.metadata || {};
        
        if (metadata.type === "membership") {
          console.log("[Webhook] Membership subscription deleted:", subscription.id);
          
          const { error: updateError } = await supabase
            .from("zivo_subscriptions")
            .update({ 
              status: "cancelled",
              cancelled_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", subscription.id);

          if (updateError) {
            console.error("[Webhook] Error cancelling membership:", updateError);
          } else {
            console.log("[Webhook] Membership cancelled for subscription:", subscription.id);
            if (metadata.user_id) {
              try {
                await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", "Authorization": `Bearer ${supabaseServiceKey}` },
                  body: JSON.stringify({ user_id: metadata.user_id, notification_type: "membership_cancelled", title: "ZIVO+ Cancelled", body: "Your ZIVO+ membership has been cancelled. You can resubscribe anytime.", data: { type: "membership_cancelled", action_url: "/account" } }),
                });
              } catch {}
            }
          }
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = typeof invoice.subscription === 'string' 
          ? invoice.subscription 
          : invoice.subscription?.id;
        
        if (subscriptionId) {
          // Check if this is a membership subscription
          const { data: existingSub } = await supabase
            .from("zivo_subscriptions")
            .select("id")
            .eq("stripe_subscription_id", subscriptionId)
            .maybeSingle();

          if (existingSub) {
            console.log("[Webhook] Membership invoice paid, ensuring active status");
            await supabase
              .from("zivo_subscriptions")
              .update({ status: "active" })
              .eq("stripe_subscription_id", subscriptionId);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = typeof invoice.subscription === 'string' 
          ? invoice.subscription 
          : invoice.subscription?.id;
        
        if (subscriptionId) {
          // Check if this is a membership subscription
          const { data: existingSub } = await supabase
            .from("zivo_subscriptions")
            .select("id")
            .eq("stripe_subscription_id", subscriptionId)
            .maybeSingle();

          if (existingSub) {
            console.log("[Webhook] Membership invoice payment failed, setting past_due");
            await supabase
              .from("zivo_subscriptions")
              .update({ status: "past_due" })
              .eq("stripe_subscription_id", subscriptionId);
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
