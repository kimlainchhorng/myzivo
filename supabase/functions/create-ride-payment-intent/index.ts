/**
 * Create Ride Payment Intent
 * Creates a Stripe PaymentIntent for embedded checkout (Stripe Elements)
 * Uses unified DB-driven pricing with server-side calculation
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface RidePaymentRequest {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  pickup_address: string;
  pickup_lat?: number;
  pickup_lng?: number;
  dropoff_address: string;
  dropoff_lat?: number;
  dropoff_lng?: number;
  ride_type: string;
  scheduled_at?: string;
  notes?: string;
  estimated_fare: number; // Client estimate for comparison
  distance_miles?: number;
  duration_minutes?: number;
  ride_type_multiplier?: number;
  surge_multiplier?: number;
}

interface PricingSettings {
  base_fare: number;
  per_mile: number;
  per_minute: number;
  minimum_fare: number;
  booking_fee: number;
}

interface PriceBreakdown {
  baseFare: number;
  distanceFee: number;
  timeFee: number;
  bookingFee: number;
  subtotal: number;
  total: number;
  minimumApplied: boolean;
}

// Server-side fare calculation (source of truth)
function calculateServerFare(
  settings: PricingSettings,
  distanceMiles: number,
  durationMinutes: number,
  rideTypeMultiplier: number,
  surgeMultiplier: number
): PriceBreakdown {
  const baseFare = settings.base_fare;
  const distanceFee = distanceMiles * settings.per_mile;
  const timeFee = durationMinutes * settings.per_minute;
  const bookingFee = settings.booking_fee;
  
  let subtotal = baseFare + distanceFee + timeFee;
  subtotal *= rideTypeMultiplier;
  subtotal *= surgeMultiplier;
  
  const minimumApplied = subtotal < settings.minimum_fare;
  if (minimumApplied) {
    subtotal = settings.minimum_fare;
  }
  
  const total = subtotal + bookingFee;
  
  return {
    baseFare: Math.round(baseFare * 100) / 100,
    distanceFee: Math.round(distanceFee * 100) / 100,
    timeFee: Math.round(timeFee * 100) / 100,
    bookingFee: Math.round(bookingFee * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    total: Math.round(total * 100) / 100,
    minimumApplied,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: RidePaymentRequest = await req.json();
    const {
      customer_name,
      customer_phone,
      customer_email,
      pickup_address,
      pickup_lat,
      pickup_lng,
      dropoff_address,
      dropoff_lat,
      dropoff_lng,
      ride_type,
      scheduled_at,
      notes,
      distance_miles = 5,
      duration_minutes = 15,
      ride_type_multiplier = 1.0,
      surge_multiplier = 1.0,
    } = body;

    // Validate required fields
    if (!customer_name || !customer_phone || !pickup_address || !dropoff_address) {
      throw new Error("Missing required fields");
    }

    console.log("[create-ride-payment-intent] Fetching pricing settings...");

    // 1. Fetch pricing_settings from DB
    const { data: settingsData, error: settingsError } = await supabase
      .from("pricing_settings")
      .select("setting_key, setting_value")
      .eq("service_type", "rides")
      .eq("is_active", true);

    if (settingsError) {
      console.error("[create-ride-payment-intent] Error fetching settings:", settingsError);
    }

    // Convert to settings object with defaults
    const settingsMap: Record<string, number> = {};
    if (settingsData) {
      settingsData.forEach((row: { setting_key: string; setting_value: unknown }) => {
        settingsMap[row.setting_key] = parseFloat(String(row.setting_value)) || 0;
      });
    }

    const pricingSettings: PricingSettings = {
      base_fare: settingsMap.base_fare ?? 3.50,
      per_mile: settingsMap.per_mile ?? 1.75,
      per_minute: settingsMap.per_minute ?? 0.35,
      minimum_fare: settingsMap.minimum_fare ?? 7.00,
      booking_fee: settingsMap.booking_fee ?? 2.50,
    };

    console.log("[create-ride-payment-intent] Using pricing settings:", pricingSettings);

    // 2. Calculate fare server-side (source of truth)
    const breakdown = calculateServerFare(
      pricingSettings,
      distance_miles,
      duration_minutes,
      ride_type_multiplier,
      surge_multiplier
    );

    console.log("[create-ride-payment-intent] Calculated breakdown:", breakdown);

    // 3. Fetch commission rate from commission_settings
    const { data: commissionData } = await supabase
      .from("commission_settings")
      .select("commission_percentage")
      .eq("service_type", "rides")
      .eq("is_active", true)
      .limit(1)
      .single();

    const commissionPercent = commissionData?.commission_percentage ?? 25;
    const commissionAmount = Math.round(breakdown.total * (commissionPercent / 100) * 100) / 100;
    const driverEarning = Math.round((breakdown.total - commissionAmount) * 100) / 100;

    console.log("[create-ride-payment-intent] Commission:", { commissionPercent, commissionAmount, driverEarning });

    // 4. Create ride request with all breakdown fields
    const { data: rideRequest, error: rideError } = await supabase
      .from("ride_requests")
      .insert({
        customer_name,
        customer_phone,
        customer_email: customer_email || null,
        pickup_address,
        pickup_lat: pickup_lat || null,
        pickup_lng: pickup_lng || null,
        dropoff_address,
        dropoff_lat: dropoff_lat || null,
        dropoff_lng: dropoff_lng || null,
        ride_type,
        scheduled_at: scheduled_at || null,
        notes: notes || null,
        status: "pending_payment",
        payment_status: "pending",
        payment_amount: breakdown.total,
        payment_currency: "usd",
        estimated_fare_min: Math.floor(breakdown.total * 0.9),
        estimated_fare_max: Math.ceil(breakdown.total * 1.1),
        distance_miles: distance_miles || null,
        duration_minutes: duration_minutes || null,
        // New breakdown fields
        quoted_base_fare: breakdown.baseFare,
        quoted_distance_fee: breakdown.distanceFee,
        quoted_time_fee: breakdown.timeFee,
        quoted_booking_fee: breakdown.bookingFee,
        quoted_surge_multiplier: surge_multiplier,
        ride_type_multiplier: ride_type_multiplier,
        commission_amount: commissionAmount,
        driver_earning: driverEarning,
      })
      .select()
      .single();

    if (rideError) {
      console.error("[create-ride-payment-intent] Error creating ride request:", rideError);
      throw new Error("Failed to create ride request");
    }

    console.log("[create-ride-payment-intent] Ride request created:", rideRequest.id);

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Create PaymentIntent
    const amountInCents = Math.round(breakdown.total * 100);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        type: "ride",
        ride_request_id: rideRequest.id,
        customer_name,
        customer_phone,
        ride_type,
        pickup_address,
        dropoff_address,
        base_fare: breakdown.baseFare.toString(),
        distance_fee: breakdown.distanceFee.toString(),
        time_fee: breakdown.timeFee.toString(),
        booking_fee: breakdown.bookingFee.toString(),
        commission_amount: commissionAmount.toString(),
        driver_earning: driverEarning.toString(),
      },
      description: `ZIVO Ride - ${ride_type}: ${pickup_address} → ${dropoff_address}`,
      receipt_email: customer_email || undefined,
    });

    console.log("[create-ride-payment-intent] PaymentIntent created:", paymentIntent.id);

    // Update ride request with payment intent ID
    await supabase
      .from("ride_requests")
      .update({ 
        stripe_payment_intent_id: paymentIntent.id,
      })
      .eq("id", rideRequest.id);

    return new Response(
      JSON.stringify({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        requestId: rideRequest.id,
        amount: breakdown.total,
        breakdown: {
          baseFare: breakdown.baseFare,
          distanceFee: breakdown.distanceFee,
          timeFee: breakdown.timeFee,
          bookingFee: breakdown.bookingFee,
          total: breakdown.total,
          minimumApplied: breakdown.minimumApplied,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    console.error("[create-ride-payment-intent] Error:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
