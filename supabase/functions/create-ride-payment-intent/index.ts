/**
 * Create Ride Payment Intent
 * Creates a Stripe PaymentIntent for embedded checkout (Stripe Elements)
 * Uses unified DB-driven pricing with server-side calculation
 * 
 * IMPORTANT: Pricing logic must match client-side quoteRidePrice() in src/lib/pricing.ts
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ==================== RIDE TYPE MULTIPLIERS (must match client-side) ====================

const RIDE_TYPE_MULTIPLIERS: Record<string, number> = {
  wait_save: 0.92,
  standard: 1.00,
  green: 1.02,
  priority: 1.12,
  pet: 1.15,
  comfort: 1.45,
  xl: 1.45,
  black: 1.65,
  black_suv: 2.10,
  xxl: 2.10,
  premium: 1.65,
  elite: 2.10,
  lux: 3.50,
  sprinter: 2.50,
  secure: 4.00,
};

// ==================== ROUTE LIMITS (sanity checks) ====================

const ROUTE_LIMITS = {
  MAX_DISTANCE_MILES: 300,
  MAX_DURATION_MINUTES: 600,
};

// ==================== LONG-TRIP DISCOUNT ====================

function getLongTripMultiplier(distanceMiles: number): number {
  if (distanceMiles > 50) return 0.88;  // 12% discount
  if (distanceMiles > 25) return 0.92;  // 8% discount
  return 1.0;
}

// ==================== TYPES ====================

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
  surge_multiplier?: number;
}

interface PricingSettings {
  base_fare: number;
  per_mile: number;
  per_minute: number;
  minimum_fare: number;
  booking_fee: number;
}

interface CityPricing {
  city: string;
  ride_type: string;
  base_fare: number;
  per_mile: number;
  per_minute: number;
  booking_fee: number;
  minimum_fare: number;
  is_active: boolean;
}

interface PriceBreakdown {
  baseFare: number;
  distanceFee: number;
  timeFee: number;
  bookingFee: number;
  subtotal: number;
  total: number;
  minimumApplied: boolean;
  rideTypeMultiplier: number;
  longTripMultiplier: number;
  surgeMultiplier: number;
  city?: string;
}

// ==================== UTILITIES ====================

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

// Extract city from address
function extractCityFromAddress(address: string): string | null {
  if (!address) return null;
  const parts = address.split(',').map(p => p.trim());
  if (parts.length >= 2) {
    const potentialCity = parts[parts.length - 2];
    const cleaned = potentialCity.replace(/\d+/g, '').replace(/\b[A-Z]{2}\b/g, '').trim();
    return cleaned && cleaned.length > 1 ? cleaned : null;
  }
  return null;
}

// Normalize city name for lookup
function normalizeCityName(city: string | null): string | null {
  if (!city) return null;
  const variations: Record<string, string> = {
    'baton rouge': 'Baton Rouge',
    'new orleans': 'New Orleans',
    'metairie': 'New Orleans',
    'kenner': 'New Orleans',
    'denham springs': 'Baton Rouge',
    'gonzales': 'Baton Rouge',
    'prairieville': 'Baton Rouge',
  };
  const lowerCity = city.toLowerCase().trim();
  return variations[lowerCity] || city;
}

// ==================== PRICING FUNCTIONS ====================

/**
 * Calculate fare using city pricing (preferred)
 * Uses RIDE_TYPE_MULTIPLIERS for ride type adjustments
 */
function calculateCityFare(
  cityPricing: CityPricing,
  distanceMiles: number,
  durationMinutes: number,
  rideType: string,
  surgeMultiplier: number
): PriceBreakdown {
  const baseFare = cityPricing.base_fare;
  const distanceFee = distanceMiles * cityPricing.per_mile;
  const timeFee = durationMinutes * cityPricing.per_minute;
  const bookingFee = cityPricing.booking_fee;
  
  const rideTypeMultiplier = RIDE_TYPE_MULTIPLIERS[rideType] ?? 1.0;
  const longTripMultiplier = getLongTripMultiplier(distanceMiles);
  
  let subtotal = baseFare + distanceFee + timeFee;
  subtotal *= rideTypeMultiplier;
  subtotal *= surgeMultiplier;
  subtotal *= longTripMultiplier;
  
  const minimumApplied = subtotal < cityPricing.minimum_fare;
  if (minimumApplied) {
    subtotal = cityPricing.minimum_fare;
  }
  
  const total = round(subtotal + bookingFee);
  
  return {
    baseFare: round(baseFare),
    distanceFee: round(distanceFee),
    timeFee: round(timeFee),
    bookingFee: round(bookingFee),
    subtotal: round(subtotal),
    total,
    minimumApplied,
    rideTypeMultiplier,
    longTripMultiplier,
    surgeMultiplier,
    city: cityPricing.city,
  };
}

/**
 * Server-side fare calculation using global settings (fallback)
 * Uses RIDE_TYPE_MULTIPLIERS for ride type adjustments
 */
function calculateServerFare(
  settings: PricingSettings,
  distanceMiles: number,
  durationMinutes: number,
  rideType: string,
  surgeMultiplier: number
): PriceBreakdown {
  const baseFare = settings.base_fare;
  const distanceFee = distanceMiles * settings.per_mile;
  const timeFee = durationMinutes * settings.per_minute;
  const bookingFee = settings.booking_fee;
  
  const rideTypeMultiplier = RIDE_TYPE_MULTIPLIERS[rideType] ?? 1.0;
  const longTripMultiplier = getLongTripMultiplier(distanceMiles);
  
  let subtotal = baseFare + distanceFee + timeFee;
  subtotal *= rideTypeMultiplier;
  subtotal *= surgeMultiplier;
  subtotal *= longTripMultiplier;
  
  const minimumApplied = subtotal < settings.minimum_fare;
  if (minimumApplied) {
    subtotal = settings.minimum_fare;
  }
  
  const total = round(subtotal + bookingFee);
  
  return {
    baseFare: round(baseFare),
    distanceFee: round(distanceFee),
    timeFee: round(timeFee),
    bookingFee: round(bookingFee),
    subtotal: round(subtotal),
    total,
    minimumApplied,
    rideTypeMultiplier,
    longTripMultiplier,
    surgeMultiplier,
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
      surge_multiplier = 1.0,
    } = body;

    // Validate required fields
    if (!customer_name || !customer_phone || !pickup_address || !dropoff_address) {
      throw new Error("Missing required fields");
    }

    // SANITY CHECK: Validate route data
    if (distance_miles > ROUTE_LIMITS.MAX_DISTANCE_MILES) {
      throw new Error(`Invalid route data: distance ${distance_miles} miles exceeds maximum of ${ROUTE_LIMITS.MAX_DISTANCE_MILES}`);
    }
    if (duration_minutes > ROUTE_LIMITS.MAX_DURATION_MINUTES) {
      throw new Error(`Invalid route data: duration ${duration_minutes} min exceeds maximum of ${ROUTE_LIMITS.MAX_DURATION_MINUTES}`);
    }
    if (distance_miles < 0 || duration_minutes < 0) {
      throw new Error("Invalid route data: negative values");
    }

    console.log("[create-ride-payment-intent] Processing ride for:", pickup_address);
    console.log("[create-ride-payment-intent] Route data:", { distance_miles, duration_minutes, ride_type, surge_multiplier });

    // 1. Extract city from pickup address for city-specific pricing
    const rawCity = extractCityFromAddress(pickup_address);
    const pickupCity = normalizeCityName(rawCity);
    console.log("[create-ride-payment-intent] Detected city:", pickupCity);

    // 2. Try to fetch city-specific pricing first
    let breakdown: PriceBreakdown;
    let usedCityPricing = false;

    if (pickupCity) {
      // First try exact city + standard ride type (base pricing)
      const { data: cityPricingData, error: cityError } = await supabase
        .from("city_pricing")
        .select("*")
        .eq("city", pickupCity)
        .eq("ride_type", "standard")  // Always use standard as base, multipliers handle the rest
        .eq("is_active", true)
        .single();

      if (cityPricingData && !cityError) {
        console.log("[create-ride-payment-intent] Using city pricing:", cityPricingData);
        breakdown = calculateCityFare(
          cityPricingData as CityPricing,
          distance_miles,
          duration_minutes,
          ride_type,
          surge_multiplier
        );
        usedCityPricing = true;
      } else {
        // Try default city pricing
        const { data: defaultCityPricing } = await supabase
          .from("city_pricing")
          .select("*")
          .eq("city", "default")
          .eq("ride_type", "standard")
          .eq("is_active", true)
          .single();

        if (defaultCityPricing) {
          console.log("[create-ride-payment-intent] Using default city pricing:", defaultCityPricing);
          breakdown = calculateCityFare(
            defaultCityPricing as CityPricing,
            distance_miles,
            duration_minutes,
            ride_type,
            surge_multiplier
          );
          usedCityPricing = true;
        }
      }
    }

    // 3. Fall back to global pricing_settings if no city pricing found
    if (!usedCityPricing) {
      console.log("[create-ride-payment-intent] Fetching global pricing settings...");
      const { data: settingsData, error: settingsError } = await supabase
        .from("pricing_settings")
        .select("setting_key, setting_value")
        .eq("service_type", "rides")
        .eq("is_active", true);

      if (settingsError) {
        console.error("[create-ride-payment-intent] Error fetching settings:", settingsError);
      }

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

      console.log("[create-ride-payment-intent] Using global pricing:", pricingSettings);
      breakdown = calculateServerFare(
        pricingSettings,
        distance_miles,
        duration_minutes,
        ride_type,
        surge_multiplier
      );
    }

    console.log("[create-ride-payment-intent] Final breakdown:", {
      ...breakdown!,
      rideTypeMultiplier: breakdown!.rideTypeMultiplier,
      longTripMultiplier: breakdown!.longTripMultiplier,
    });

    // 4. Fetch commission rate from commission_settings
    const { data: commissionData } = await supabase
      .from("commission_settings")
      .select("commission_percentage")
      .eq("service_type", "rides")
      .eq("is_active", true)
      .limit(1)
      .single();

    const commissionPercent = commissionData?.commission_percentage ?? 25;
    const commissionAmount = Math.round(breakdown!.total * (commissionPercent / 100) * 100) / 100;
    const driverEarning = Math.round((breakdown!.total - commissionAmount) * 100) / 100;

    console.log("[create-ride-payment-intent] Commission:", { commissionPercent, commissionAmount, driverEarning });

    // 5. Create ride request with all breakdown fields
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
        payment_amount: breakdown!.total,
        payment_currency: "usd",
        estimated_fare_min: Math.floor(breakdown!.total * 0.9),
        estimated_fare_max: Math.ceil(breakdown!.total * 1.1),
        distance_miles: distance_miles || null,
        duration_minutes: duration_minutes || null,
        // New breakdown fields
        quoted_base_fare: breakdown!.baseFare,
        quoted_distance_fee: breakdown!.distanceFee,
        quoted_time_fee: breakdown!.timeFee,
        quoted_booking_fee: breakdown!.bookingFee,
        quoted_surge_multiplier: breakdown!.surgeMultiplier,
        ride_type_multiplier: breakdown!.rideTypeMultiplier,
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
    const amountInCents = Math.round(breakdown!.total * 100);
    
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
        base_fare: breakdown!.baseFare.toString(),
        distance_fee: breakdown!.distanceFee.toString(),
        time_fee: breakdown!.timeFee.toString(),
        booking_fee: breakdown!.bookingFee.toString(),
        commission_amount: commissionAmount.toString(),
        driver_earning: driverEarning.toString(),
        city: breakdown!.city || "default",
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
        amount: breakdown!.total,
        breakdown: {
          baseFare: breakdown!.baseFare,
          distanceFee: breakdown!.distanceFee,
          timeFee: breakdown!.timeFee,
          bookingFee: breakdown!.bookingFee,
          total: breakdown!.total,
          minimumApplied: breakdown!.minimumApplied,
          city: breakdown!.city,
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
