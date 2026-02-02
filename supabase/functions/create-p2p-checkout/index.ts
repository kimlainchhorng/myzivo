/**
 * Create P2P Car Rental Checkout Session
 * Creates a Stripe Checkout session for P2P vehicle booking payments
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface P2PCheckoutRequest {
  booking_id: string;
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

    const body: P2PCheckoutRequest = await req.json();
    const { booking_id } = body;

    if (!booking_id) {
      throw new Error("Missing booking_id");
    }

    // Fetch booking with vehicle and owner details
    const { data: booking, error: bookingError } = await supabase
      .from("p2p_bookings")
      .select(`
        *,
        vehicle:p2p_vehicles(id, make, model, year, owner_id),
        owner:car_owner_profiles!p2p_bookings_owner_id_fkey(id, full_name, email)
      `)
      .eq("id", booking_id)
      .eq("renter_id", userData.user.id)
      .single();

    if (bookingError || !booking) {
      console.error("Booking fetch error:", bookingError);
      throw new Error("Booking not found or unauthorized");
    }

    // Verify booking is in a payable state
    if (booking.payment_status === "paid") {
      throw new Error("Booking is already paid");
    }

    if (booking.status !== "confirmed" && booking.status !== "pending") {
      throw new Error("Booking cannot be paid in current status: " + booking.status);
    }

    const vehicle = booking.vehicle as { id: string; make: string; model: string; year: number; owner_id: string };
    
    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get or create Stripe customer for renter
    let customerId: string | undefined;
    const customers = await stripe.customers.list({ email: userData.user.email!, limit: 1 });
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Calculate line items breakdown
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
            description: `${booking.total_days} day${booking.total_days > 1 ? "s" : ""} rental • Pick-up: ${booking.pickup_date}`,
          },
          unit_amount: Math.round(booking.subtotal * 100),
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Service Fee",
            description: "ZIVO platform service fee",
          },
          unit_amount: Math.round(booking.service_fee * 100),
        },
        quantity: 1,
      },
    ];

    // Add insurance if accepted
    if (booking.insurance_fee > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Protection Plan",
            description: `${booking.total_days} day${booking.total_days > 1 ? "s" : ""} coverage`,
          },
          unit_amount: Math.round(booking.insurance_fee * 100),
        },
        quantity: 1,
      });
    }

    // Add taxes
    if (booking.taxes > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Taxes & Fees",
            description: "Local taxes",
          },
          unit_amount: Math.round(booking.taxes * 100),
        },
        quantity: 1,
      });
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer: customerId,
      customer_email: customerId ? undefined : userData.user.email!,
      line_items: lineItems,
      metadata: {
        type: "p2p",
        booking_id: booking.id,
        vehicle_id: vehicle.id,
        owner_id: booking.owner_id,
        renter_id: userData.user.id,
        owner_payout: booking.owner_payout.toString(),
        platform_fee: booking.platform_fee.toString(),
      },
      success_url: `${req.headers.get("origin")}/p2p/booking/${booking.id}/confirmation?payment=success`,
      cancel_url: `${req.headers.get("origin")}/p2p/booking/${booking.id}/confirmation?payment=cancelled`,
    });

    // Update booking with session ID
    await supabase
      .from("p2p_bookings")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", booking.id);

    console.log("P2P checkout session created:", session.id, "for booking:", booking.id);

    return new Response(
      JSON.stringify({ 
        url: session.url,
        session_id: session.id,
        booking_id: booking.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    console.error("P2P checkout error:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
