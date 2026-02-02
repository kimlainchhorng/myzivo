/**
 * Execute P2P Owner Payout via Stripe Transfer
 * Transfers funds from ZIVO to owner's connected Stripe account
 * Admin-only endpoint with eligibility validation
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[EXECUTE-P2P-PAYOUT] ${step}${detailsStr}`);
};

interface ExecutePayoutRequest {
  payout_id?: string;
  booking_id?: string;
  force?: boolean; // Skip eligibility checks (admin override)
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Unauthorized");

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) throw new Error("Admin access required");

    logStep("Admin verified", { userId: userData.user.id });

    const body: ExecutePayoutRequest = await req.json();
    const { payout_id, booking_id, force = false } = body;

    if (!payout_id && !booking_id) {
      throw new Error("Must provide payout_id or booking_id");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get payout record
    let payout: any;
    if (payout_id) {
      const { data, error } = await supabase
        .from("p2p_payouts")
        .select("*")
        .eq("id", payout_id)
        .single();
      if (error || !data) throw new Error("Payout not found");
      payout = data;
    } else if (booking_id) {
      // Find payout by booking ID
      const { data, error } = await supabase
        .from("p2p_payouts")
        .select("*")
        .contains("booking_ids", [booking_id])
        .single();
      if (error || !data) throw new Error("Payout not found for this booking");
      payout = data;
    }

    logStep("Payout found", { payoutId: payout.id, amount: payout.amount, status: payout.status });

    // Check if already processed
    if (payout.status === "completed" && payout.stripe_transfer_id) {
      throw new Error("Payout already completed");
    }

    // Check if held
    if (payout.is_held && !force) {
      throw new Error(`Payout is on hold: ${payout.held_reason || "No reason specified"}`);
    }

    // Get owner profile with Stripe account
    const { data: owner, error: ownerError } = await supabase
      .from("car_owner_profiles")
      .select("*")
      .eq("id", payout.owner_id)
      .single();

    if (ownerError || !owner) throw new Error("Owner not found");
    if (!owner.stripe_account_id) {
      throw new Error("Owner has not connected a Stripe account");
    }

    logStep("Owner found", {
      ownerId: owner.id,
      stripeAccountId: owner.stripe_account_id,
      payoutsEnabled: owner.stripe_payouts_enabled,
    });

    // Verify Stripe account status
    if (!owner.stripe_payouts_enabled && !force) {
      // Double-check with Stripe
      const account = await stripe.accounts.retrieve(owner.stripe_account_id);
      if (!account.payouts_enabled) {
        throw new Error("Owner's Stripe account is not enabled for payouts");
      }
    }

    // Check for active disputes on related bookings
    if (!force) {
      const bookingIds = payout.booking_ids || [];
      if (bookingIds.length > 0) {
        const { data: disputes } = await supabase
          .from("p2p_disputes")
          .select("id, status")
          .in("booking_id", bookingIds)
          .in("status", ["pending", "investigating", "escalated"]);

        if (disputes && disputes.length > 0) {
          throw new Error(
            `Cannot process payout: ${disputes.length} active dispute(s) on related bookings`
          );
        }
      }
    }

    // Calculate amount in cents
    const amountCents = Math.round(payout.amount * 100);

    logStep("Creating Stripe transfer", {
      amount: amountCents,
      destination: owner.stripe_account_id,
    });

    // Create the transfer
    const transfer = await stripe.transfers.create({
      amount: amountCents,
      currency: payout.currency || "usd",
      destination: owner.stripe_account_id,
      transfer_group: payout.id,
      metadata: {
        payout_id: payout.id,
        owner_id: owner.id,
        booking_ids: JSON.stringify(payout.booking_ids || []),
      },
    });

    logStep("Transfer created", { transferId: transfer.id });

    // Update payout record
    const { error: updateError } = await supabase
      .from("p2p_payouts")
      .update({
        status: "completed",
        stripe_transfer_id: transfer.id,
        processed_at: new Date().toISOString(),
        processed_by: userData.user.id,
        notes: payout.notes
          ? `${payout.notes}\n[${new Date().toISOString()}] Transfer completed: ${transfer.id}`
          : `Transfer completed: ${transfer.id}`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payout.id);

    if (updateError) {
      console.error("Failed to update payout record:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        payout_id: payout.id,
        transfer_id: transfer.id,
        amount: payout.amount,
        currency: payout.currency || "usd",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An error occurred";
    console.error("[EXECUTE-P2P-PAYOUT] Error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
