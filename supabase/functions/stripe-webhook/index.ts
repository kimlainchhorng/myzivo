/**
 * Stripe Webhook Handler
 * Handles payment_intent.succeeded, payment_intent.payment_failed, checkout.session.completed
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

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

    console.log("Processing webhook event:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};
        const paymentIntentId = typeof session.payment_intent === 'string' 
          ? session.payment_intent 
          : session.payment_intent?.id;

        console.log("Checkout completed:", session.id, "Type:", metadata.type);

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
              status: "pending", // Awaiting restaurant confirmation
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
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment succeeded:", paymentIntent.id);
        
        // Update any orders with this payment intent ID
        await supabase
          .from("ride_requests")
          .update({ payment_status: "paid" })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        await supabase
          .from("food_orders")
          .update({ payment_status: "paid" })
          .eq("stripe_payment_id", paymentIntent.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment failed:", paymentIntent.id);

        // Update any orders with this payment intent ID
        await supabase
          .from("ride_requests")
          .update({ payment_status: "failed", status: "cancelled" })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        await supabase
          .from("food_orders")
          .update({ payment_status: "failed", status: "cancelled" })
          .eq("stripe_payment_id", paymentIntent.id);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = typeof charge.payment_intent === 'string' 
          ? charge.payment_intent 
          : charge.payment_intent?.id;

        console.log("Charge refunded:", charge.id, "Payment Intent:", paymentIntentId);

        if (paymentIntentId) {
          await supabase
            .from("ride_requests")
            .update({ 
              refund_status: "refunded",
              refunded_at: new Date().toISOString(),
            })
            .eq("stripe_payment_intent_id", paymentIntentId);

          await supabase
            .from("food_orders")
            .update({ 
              refund_status: "refunded",
              refunded_at: new Date().toISOString(),
            })
            .eq("stripe_payment_id", paymentIntentId);
        }
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
