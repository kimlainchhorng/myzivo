/**
 * Process P2P Owner Payout
 * Creates payout records for completed P2P bookings
 * Admin-only endpoint for processing owner payouts
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ProcessPayoutRequest {
  booking_id?: string;
  owner_id?: string;
  process_all_pending?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) throw new Error("Admin access required");

    const body: ProcessPayoutRequest = await req.json();
    const { booking_id, owner_id, process_all_pending } = body;

    let bookingsToProcess: any[] = [];

    if (booking_id) {
      // Process single booking
      const { data, error } = await supabase
        .from("p2p_bookings")
        .select("*")
        .eq("id", booking_id)
        .eq("status", "completed")
        .eq("payment_status", "paid")
        .is("payout_id", null)
        .single();

      if (error || !data) throw new Error("Booking not found or not eligible for payout");
      bookingsToProcess = [data];
    } else if (owner_id) {
      // Process all pending payouts for an owner
      const { data, error } = await supabase
        .from("p2p_bookings")
        .select("*")
        .eq("owner_id", owner_id)
        .eq("status", "completed")
        .eq("payment_status", "paid")
        .is("payout_id", null);

      if (error) throw new Error("Failed to fetch bookings");
      bookingsToProcess = data || [];
    } else if (process_all_pending) {
      // Process all pending payouts globally
      const { data, error } = await supabase
        .from("p2p_bookings")
        .select("*")
        .eq("status", "completed")
        .eq("payment_status", "paid")
        .is("payout_id", null)
        .limit(50);

      if (error) throw new Error("Failed to fetch bookings");
      bookingsToProcess = data || [];
    } else {
      throw new Error("Must provide booking_id, owner_id, or process_all_pending");
    }

    if (bookingsToProcess.length === 0) {
      return new Response(
        JSON.stringify({ message: "No bookings to process", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Group bookings by owner for batch payouts
    const ownerPayouts: Record<string, { bookings: any[]; totalAmount: number }> = {};
    
    for (const booking of bookingsToProcess) {
      if (!ownerPayouts[booking.owner_id]) {
        ownerPayouts[booking.owner_id] = { bookings: [], totalAmount: 0 };
      }
      ownerPayouts[booking.owner_id].bookings.push(booking);
      ownerPayouts[booking.owner_id].totalAmount += booking.owner_payout;
    }

    const createdPayouts: any[] = [];

    // Create payout records for each owner
    for (const [ownerId, data] of Object.entries(ownerPayouts)) {
      const bookingIds = data.bookings.map(b => b.id);
      
      // Create payout record
      const { data: payout, error: payoutError } = await supabase
        .from("p2p_payouts")
        .insert({
          owner_id: ownerId,
          amount: data.totalAmount,
          currency: "usd",
          status: "pending",
          booking_ids: bookingIds,
          processed_by: userData.user.id,
        })
        .select()
        .single();

      if (payoutError) {
        console.error("Failed to create payout for owner:", ownerId, payoutError);
        continue;
      }

      // Update bookings with payout_id
      await supabase
        .from("p2p_bookings")
        .update({ payout_id: payout.id })
        .in("id", bookingIds);

      createdPayouts.push(payout);
      console.log("Created payout:", payout.id, "for owner:", ownerId, "amount:", data.totalAmount);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: createdPayouts.length,
        payouts: createdPayouts,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    console.error("Payout processing error:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
