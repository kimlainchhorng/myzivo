/**
 * Create Ride Checkout Session
 * Creates a Stripe Checkout session for ride payments
 */
import { serve, createClient, Stripe } from "../_shared/deps.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

// Allowed origins for success/cancel URLs
const ALLOWED_ORIGINS = [
  "https://myzivo.lovable.app",
  "https://hizovo.com",
  "https://www.hizovo.com",
];
const DEFAULT_ORIGIN = "https://myzivo.lovable.app";

interface RideCheckoutRequest {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  pickup_address: string;
  pickup_lat?: number;
  pickup_lng?: number;
  dropoff_address: string;
  dropoff_lat?: number;
  dropoff_lng?: number;
  ride_type: "standard" | "xl" | "premium";
  scheduled_at?: string;
  notes?: string;
  estimated_fare: number;
  distance_miles?: number;
  duration_minutes?: number;
}

/**
 * Resolves a safe, absolute origin for Stripe redirect URLs.
 * Ensures we always return an https:// URL that Stripe will accept.
 */
function resolveOrigin(req: Request): string {
  const rawOrigin = req.headers.get("origin");
  const rawReferer = req.headers.get("referer");
  
  console.log("[create-ride-checkout] Raw headers - origin:", rawOrigin, "referer:", rawReferer);
  
  // Try Origin header first
  if (rawOrigin && rawOrigin.startsWith("http")) {
    // Check if it's in our allowlist
    if (ALLOWED_ORIGINS.some(allowed => rawOrigin.startsWith(allowed))) {
      console.log("[create-ride-checkout] Using allowed origin:", rawOrigin);
      return rawOrigin;
    }
    // Even if not in allowlist, if it's a valid https URL, use it (for localhost/preview)
    if (rawOrigin.startsWith("https://") || rawOrigin.startsWith("http://localhost")) {
      console.log("[create-ride-checkout] Using origin (not in allowlist but valid):", rawOrigin);
      return rawOrigin;
    }
  }
  
  // Try Referer header - extract origin from it
  if (rawReferer && rawReferer.startsWith("http")) {
    try {
      const refererUrl = new URL(rawReferer);
      const refererOrigin = refererUrl.origin;
      if (ALLOWED_ORIGINS.some(allowed => refererOrigin.startsWith(allowed))) {
        console.log("[create-ride-checkout] Using allowed referer origin:", refererOrigin);
        return refererOrigin;
      }
      if (refererOrigin.startsWith("https://") || refererOrigin.startsWith("http://localhost")) {
        console.log("[create-ride-checkout] Using referer origin (not in allowlist but valid):", refererOrigin);
        return refererOrigin;
      }
    } catch (e) {
      console.log("[create-ride-checkout] Failed to parse referer:", e);
    }
  }
  
  // Fallback to default
  console.log("[create-ride-checkout] Falling back to default origin:", DEFAULT_ORIGIN);
  return DEFAULT_ORIGIN;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: RideCheckoutRequest = await req.json();
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
      estimated_fare,
      distance_miles,
      duration_minutes,
    } = body;

    // Check if rides service is in maintenance
    const { data: serviceStatus } = await supabase
      .from("service_health_status")
      .select("status, is_paused")
      .eq("service_name", "rides")
      .maybeSingle();

    if (serviceStatus?.status === "maintenance" || serviceStatus?.status === "outage" || serviceStatus?.is_paused) {
      return new Response(
        JSON.stringify({ 
          error: "Service temporarily unavailable",
          maintenance: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 503 }
      );
    }

    // Validate required fields
    if (!customer_name || !customer_phone || !pickup_address || !dropoff_address || !estimated_fare) {
      throw new Error("Missing required fields");
    }

    // Create ride request in pending state
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
        payment_amount: estimated_fare,
        payment_currency: "usd",
        estimated_fare_min: estimated_fare * 0.9,
        estimated_fare_max: estimated_fare * 1.1,
        distance_miles: distance_miles || null,
        duration_minutes: duration_minutes || null,
      })
      .select()
      .single();

    if (rideError) {
      console.error("Error creating ride request:", rideError);
      throw new Error("Failed to create ride request");
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get safe, absolute origin
    const origin = resolveOrigin(req);
    
    // Build URLs with guaranteed absolute paths
    const successUrl = `${origin}/rides/success?session_id={CHECKOUT_SESSION_ID}&request_id=${rideRequest.id}`;
    const cancelUrl = `${origin}/rides?cancelled=true`;
    
    // Log final URLs for debugging
    console.log("[create-ride-checkout] Final origin:", origin);
    console.log("[create-ride-checkout] success_url:", successUrl);
    console.log("[create-ride-checkout] cancel_url:", cancelUrl);

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customer_email || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `ZIVO Ride - ${ride_type.charAt(0).toUpperCase() + ride_type.slice(1)}`,
              description: `From: ${pickup_address}\nTo: ${dropoff_address}`,
            },
            unit_amount: Math.round(estimated_fare * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "ride",
        ride_request_id: rideRequest.id,
        customer_name,
        customer_phone,
        ride_type,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    console.log("[create-ride-checkout] Stripe session created:", session.id);

    // Update ride request with session ID
    await supabase
      .from("ride_requests")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", rideRequest.id);

    return new Response(
      JSON.stringify({ 
        url: session.url,
        session_id: session.id,
        request_id: rideRequest.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    console.error("[create-ride-checkout] Error:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
