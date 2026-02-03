/**
 * Issue Flight Ticket
 * Called after payment success to create order with ticketing partner
 * Returns PNR and e-ticket numbers
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DUFFEL_API_URL = "https://api.duffel.com";

interface IssueTicketRequest {
  bookingId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { bookingId }: IssueTicketRequest = await req.json();

    if (!bookingId) {
      throw new Error("bookingId is required");
    }

    console.log("[IssueTicket] Processing booking:", bookingId);

    // Fetch booking with passengers
    const { data: booking, error: bookingError } = await supabase
      .from("flight_bookings")
      .select(`
        *,
        flight_passengers (*)
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error("Booking not found");
    }

    // Check if already issued
    if (booking.ticketing_status === "issued") {
      return new Response(
        JSON.stringify({
          success: true,
          pnr: booking.pnr,
          ticketNumbers: booking.ticket_numbers,
          message: "Ticket already issued",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update status to processing
    await supabase
      .from("flight_bookings")
      .update({ ticketing_status: "processing" })
      .eq("id", bookingId);

    // Log the ticketing attempt
    const { data: logEntry } = await supabase
      .from("flight_ticketing_logs")
      .insert({
        booking_id: bookingId,
        action: "create_order",
        partner: "duffel",
        status: "pending",
        request_payload: {
          offer_id: booking.offer_id,
          passengers: booking.flight_passengers?.length,
        },
      })
      .select()
      .single();

    // Check for Duffel API key
    const duffelApiKey = Deno.env.get("DUFFEL_API_KEY");
    
    let pnr: string;
    let orderId: string;
    let ticketNumbers: string[];

    if (duffelApiKey && booking.offer_id) {
      // Real Duffel integration
      try {
        // Format passengers for Duffel
        const duffelPassengers = booking.flight_passengers?.map((p: any) => ({
          type: "adult",
          id: `pas_${p.passenger_index}`,
          title: p.title,
          gender: p.gender,
          given_name: p.given_name,
          family_name: p.family_name,
          born_on: p.born_on,
          email: p.email,
          phone_number: p.phone_number || "+1000000000",
        })) || [];

        // Create order with Duffel
        const orderResponse = await fetch(`${DUFFEL_API_URL}/air/orders`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${duffelApiKey}`,
            "Duffel-Version": "v2",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              type: "instant",
              selected_offers: [booking.offer_id],
              passengers: duffelPassengers,
              payments: [
                {
                  type: "balance",
                  amount: String(booking.total_amount),
                  currency: booking.currency,
                },
              ],
              metadata: {
                zivo_booking_id: bookingId,
              },
            },
          }),
        });

        const orderData = await orderResponse.json();

        if (!orderResponse.ok) {
          throw new Error(orderData.errors?.[0]?.message || "Duffel order creation failed");
        }

        pnr = orderData.data.booking_reference;
        orderId = orderData.data.id;
        
        // Extract ticket numbers from order
        ticketNumbers = orderData.data.passengers?.map((p: any) => 
          p.ticket_number || `TKT${Date.now()}${p.id.slice(-4)}`
        ) || [];

        console.log("[IssueTicket] Duffel order created:", orderId, "PNR:", pnr);
      } catch (duffelError) {
        console.error("[IssueTicket] Duffel error:", duffelError);
        
        // Auto-refund on ticketing failure
        console.log("[IssueTicket] Triggering auto-refund for booking:", bookingId);
        try {
          await fetch(`${supabaseUrl}/functions/v1/process-flight-refund`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              bookingId,
              reason: `Ticketing failed: ${duffelError instanceof Error ? duffelError.message : 'Unknown error'}`,
              action: 'auto',
            }),
          });
          console.log("[IssueTicket] Auto-refund triggered successfully");
        } catch (refundErr) {
          console.error("[IssueTicket] Auto-refund failed:", refundErr);
        }
        
        throw duffelError;
      }
    } else {
      // Demo mode - generate mock PNR and tickets
      console.log("[IssueTicket] Demo mode - generating mock ticket");
      pnr = `ZV${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      orderId = `ord_demo_${Date.now()}`;
      ticketNumbers = (booking.flight_passengers || []).map((_: any, i: number) => 
        `098${Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')}`
      );
    }

    // Update booking with PNR and ticket numbers
    const { error: updateError } = await supabase
      .from("flight_bookings")
      .update({
        pnr,
        ticketing_partner_order_id: orderId,
        ticket_numbers: ticketNumbers,
        ticketing_status: "issued",
        ticketed_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (updateError) {
      throw updateError;
    }

    // Update passenger ticket numbers
    for (let i = 0; i < ticketNumbers.length; i++) {
      await supabase
        .from("flight_passengers")
        .update({ ticket_number: ticketNumbers[i] })
        .eq("booking_id", bookingId)
        .eq("passenger_index", i);
    }

    // Update log with success
    if (logEntry) {
      await supabase
        .from("flight_ticketing_logs")
        .update({
          status: "success",
          response_payload: { pnr, orderId, ticketNumbers },
        })
        .eq("id", logEntry.id);
    }

    console.log("[IssueTicket] Ticket issued successfully:", pnr);

    return new Response(
      JSON.stringify({
        success: true,
        pnr,
        orderId,
        ticketNumbers,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[IssueTicket] Error:", error);
    
    const message = error instanceof Error ? error.message : "Ticketing failed";

    // Update booking with error
    try {
      const { bookingId } = await req.clone().json();
      if (bookingId) {
        await supabase
          .from("flight_bookings")
          .update({
            ticketing_status: "failed",
            ticketing_error: message,
          })
          .eq("id", bookingId);

        // Log the error
        await supabase
          .from("flight_ticketing_logs")
          .insert({
            booking_id: bookingId,
            action: "create_order",
            partner: "duffel",
            status: "error",
            error_message: message,
          });
      }
    } catch {
      // Ignore logging errors
    }

    return new Response(
      JSON.stringify({ error: message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
