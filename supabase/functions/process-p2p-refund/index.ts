/**
 * Process P2P Booking Refund
 * Admin or owner-initiated refund for P2P bookings
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface P2PRefundRequest {
  booking_id: string;
  reason?: string;
  refund_type?: "full" | "partial";
  partial_amount?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Unauthorized");

    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .single();

    const isAdmin = !!roleData;

    const body: P2PRefundRequest = await req.json();
    const { booking_id, reason, refund_type = "full", partial_amount } = body;

    if (!booking_id) {
      throw new Error("Missing booking_id");
    }

    // Fetch booking
    const { data: booking, error: bookingError } = await supabase
      .from("p2p_bookings")
      .select("*, owner:car_owner_profiles!p2p_bookings_owner_id_fkey(id, user_id)")
      .eq("id", booking_id)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found");
    }

    // Authorization: must be admin or the owner of the booking
    const owner = booking.owner as { id: string; user_id: string };
    if (!isAdmin && owner.user_id !== userData.user.id) {
      throw new Error("Unauthorized to refund this booking");
    }

    // Verify booking is refundable
    if (booking.payment_status !== "paid") {
      throw new Error("Booking has not been paid");
    }

    if (booking.refund_status === "refunded") {
      throw new Error("Booking has already been refunded");
    }

    // Get payment intent from checkout session
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    if (!booking.stripe_checkout_session_id) {
      throw new Error("No checkout session found for this booking");
    }

    const session = await stripe.checkout.sessions.retrieve(booking.stripe_checkout_session_id);
    const paymentIntentId = typeof session.payment_intent === 'string' 
      ? session.payment_intent 
      : session.payment_intent?.id;

    if (!paymentIntentId) {
      throw new Error("No payment intent found");
    }

    // Calculate refund amount
    let refundAmount: number | undefined;
    if (refund_type === "partial" && partial_amount) {
      if (partial_amount > booking.total_amount) {
        throw new Error("Partial amount exceeds booking total");
      }
      refundAmount = Math.round(partial_amount * 100); // Convert to cents
    }

    // Process refund
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: refundAmount, // undefined = full refund
      reason: reason === "duplicate" ? "duplicate" : 
              reason === "fraudulent" ? "fraudulent" : "requested_by_customer",
    });

    console.log("P2P refund created:", refund.id, "for booking:", booking_id);

    // Calculate actual refund amount
    const actualRefundAmount = refund.amount / 100;

    // Update booking
    const { error: updateError } = await supabase
      .from("p2p_bookings")
      .update({
        refund_status: refund_type === "full" ? "refunded" : "partial_refund",
        refunded_at: new Date().toISOString(),
        refund_amount: actualRefundAmount,
        status: refund_type === "full" ? "cancelled" : booking.status,
        stripe_refund_id: refund.id,
        cancellation_reason: reason || "Refund processed",
        cancelled_by: userData.user.id,
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", booking_id);

    if (updateError) {
      console.error("Failed to update booking after refund:", updateError);
    }

    // If there was a payout record, update it
    if (booking.payout_id) {
      await supabase
        .from("p2p_payouts")
        .update({ 
          status: "cancelled",
          notes: `Refund processed: ${refund.id}`,
        })
        .eq("id", booking.payout_id);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        refund_id: refund.id,
        refund_amount: actualRefundAmount,
        booking_id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    console.error("P2P refund error:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
