/**
 * Create Flight Checkout
 * Creates a Stripe Checkout session for flight booking
 * ZIVO is the Merchant of Record
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FlightPassenger {
  title: string;
  given_name: string;
  family_name: string;
  gender: 'm' | 'f';
  born_on: string;
  email: string;
  phone_number?: string;
  passport_number?: string;
  passport_expiry?: string;
  passport_country?: string;
  nationality?: string;
}

interface CheckoutRequest {
  userId: string;
  offerId: string;
  passengers: FlightPassenger[];
  totalAmount: number;
  baseFare: number;
  taxesFees: number;
  currency: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  cabinClass: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const body: CheckoutRequest = await req.json();
    const {
      userId,
      offerId,
      passengers,
      totalAmount,
      baseFare,
      taxesFees,
      currency,
      origin,
      destination,
      departureDate,
      returnDate,
      cabinClass,
    } = body;

    // Validate required fields
    if (!userId || !offerId || !passengers?.length || !totalAmount) {
      throw new Error("Missing required fields");
    }

    console.log("[FlightCheckout] Creating booking for user:", userId, "offer:", offerId);

    // Get user email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError) throw userError;
    const userEmail = userData.user?.email;

    // Create flight_bookings record with pending_payment status
    const { data: booking, error: bookingError } = await supabase
      .from("flight_bookings")
      .insert({
        customer_id: userId,
        origin,
        destination,
        departure_date: departureDate,
        return_date: returnDate || null,
        passengers: passengers.length,
        cabin_class: cabinClass,
        total_amount: totalAmount,
        base_fare: baseFare,
        taxes_fees: taxesFees,
        currency: currency.toUpperCase(),
        offer_id: offerId,
        payment_status: "pending",
        ticketing_status: "pending",
        ticketing_partner: "duffel",
        booking_reference: `ZV${Date.now().toString(36).toUpperCase()}`,
      })
      .select()
      .single();

    if (bookingError) {
      console.error("[FlightCheckout] Booking creation error:", bookingError);
      throw bookingError;
    }

    console.log("[FlightCheckout] Created booking:", booking.id);

    // Insert passengers
    const passengerInserts = passengers.map((p, index) => ({
      booking_id: booking.id,
      passenger_index: index,
      title: p.title,
      given_name: p.given_name,
      family_name: p.family_name,
      gender: p.gender,
      born_on: p.born_on,
      email: p.email,
      phone_number: p.phone_number || null,
      passport_number: p.passport_number || null,
      passport_expiry: p.passport_expiry || null,
      passport_country: p.passport_country || null,
      nationality: p.nationality || null,
    }));

    const { error: passengersError } = await supabase
      .from("flight_passengers")
      .insert(passengerInserts);

    if (passengersError) {
      console.error("[FlightCheckout] Passengers insert error:", passengersError);
      // Don't fail the whole checkout, continue
    }

    // Build line items for Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: `Flight: ${origin} → ${destination}`,
            description: `${passengers.length} passenger(s), ${cabinClass} class, ${departureDate}`,
          },
          unit_amount: Math.round(baseFare * 100), // Convert to cents
        },
        quantity: passengers.length,
      },
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: "Taxes & Fees",
            description: "Airport taxes and carrier fees",
          },
          unit_amount: Math.round(taxesFees * 100),
        },
        quantity: passengers.length,
      },
    ];

    // Get the base URL for redirects
    const origin_url = req.headers.get("origin") || "https://hizivo.com";

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: userEmail,
      line_items: lineItems,
      metadata: {
        type: "flight",
        booking_id: booking.id,
        offer_id: offerId,
        user_id: userId,
        passengers: String(passengers.length),
      },
      success_url: `${origin_url}/flights/confirmation/${booking.id}?success=true`,
      cancel_url: `${origin_url}/flights/checkout?offer=${offerId}&cancelled=true`,
      payment_intent_data: {
        metadata: {
          type: "flight",
          booking_id: booking.id,
        },
      },
    });

    console.log("[FlightCheckout] Stripe session created:", session.id);

    // Update booking with Stripe session ID
    await supabase
      .from("flight_bookings")
      .update({
        stripe_checkout_session_id: session.id,
      })
      .eq("id", booking.id);

    return new Response(
      JSON.stringify({
        url: session.url,
        bookingId: booking.id,
        sessionId: session.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("[FlightCheckout] Error:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ error: message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
