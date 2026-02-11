/**
 * Process Refund
 * Admin-only endpoint to refund ride or eats payments
 */
import { serve, Stripe, createClient } from "../_shared/deps.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

interface RefundRequest {
  type: "ride" | "eats";
  id: string;
  reason?: string;
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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    // Create client with user token for auth check
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Unauthorized");

    // Check admin role
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) throw new Error("Admin access required");

    const body: RefundRequest = await req.json();
    const { type, id, reason } = body;

    if (!type || !id) {
      throw new Error("Missing type or id");
    }

    // Get the payment intent ID based on type
    let paymentIntentId: string | null = null;

    if (type === "ride") {
      const { data, error } = await supabaseAdmin
        .from("ride_requests")
        .select("stripe_payment_intent_id, payment_status")
        .eq("id", id)
        .single();

      if (error || !data) throw new Error("Ride request not found");
      if (data.payment_status !== "paid") throw new Error("Payment not completed");
      paymentIntentId = data.stripe_payment_intent_id;
    } else if (type === "eats") {
      const { data, error } = await supabaseAdmin
        .from("food_orders")
        .select("stripe_payment_id, payment_status")
        .eq("id", id)
        .single();

      if (error || !data) throw new Error("Food order not found");
      if (data.payment_status !== "paid") throw new Error("Payment not completed");
      paymentIntentId = data.stripe_payment_id;
    }

    if (!paymentIntentId) {
      throw new Error("No payment intent found");
    }

    // Process refund via Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: reason === "duplicate" ? "duplicate" : 
              reason === "fraudulent" ? "fraudulent" : "requested_by_customer",
    });

    console.log("Refund created:", refund.id);

    // Update database
    if (type === "ride") {
      await supabaseAdmin
        .from("ride_requests")
        .update({
          refund_status: "refunded",
          refunded_at: new Date().toISOString(),
          status: "cancelled",
          admin_notes: `Refunded by admin. Reason: ${reason || "Customer request"}`,
        })
        .eq("id", id);
    } else {
      await supabaseAdmin
        .from("food_orders")
        .update({
          refund_status: "refunded",
          refunded_at: new Date().toISOString(),
          status: "cancelled",
        })
        .eq("id", id);
    }

    return new Response(
      JSON.stringify({ success: true, refund_id: refund.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    console.error("Refund error:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
