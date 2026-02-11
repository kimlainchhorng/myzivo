/**
 * Issue Flight Ticket
 * Called after payment success to create order with ticketing partner
 * Returns PNR and e-ticket numbers
 */

import { serve, createClient } from "../_shared/deps.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const DUFFEL_API_URL = "https://api.duffel.com";

interface IssueTicketRequest {
  bookingId: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth: require service role key or authenticated user
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Authentication required" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const token = authHeader.replace("Bearer ", "");
  if (token !== supabaseServiceKey) {
    const authClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { bookingId }: IssueTicketRequest = await req.json();

    if (!bookingId) {
      throw new Error("bookingId is required");
    }

    // Environment checks for LIVE safety
    const DUFFEL_ENV = Deno.env.get("DUFFEL_ENV") || "sandbox";
    const isLiveMode = DUFFEL_ENV === "live";
    const duffelApiKey = Deno.env.get("DUFFEL_API_KEY");

    console.log("[IssueTicket] Environment:", DUFFEL_ENV, "Live mode:", isLiveMode);
    console.log("[IssueTicket] Processing booking:", bookingId);

    // In live mode, API key is mandatory - no mock tickets allowed
    if (isLiveMode && !duffelApiKey) {
      throw new Error("DUFFEL_API_KEY is required in live mode - cannot issue mock tickets");
    }

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

    // duffelApiKey already checked at start of function
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
        
        const errorMessage = duffelError instanceof Error ? duffelError.message : 'Unknown error';
        
        // Create admin alert for ticketing failure
        console.log("[IssueTicket] Creating admin alert for ticketing failure");
        try {
          await supabase
            .from('flight_admin_alerts')
            .insert({
              booking_id: bookingId,
              alert_type: 'ticketing_failed',
              message: `Ticketing failed for booking ${bookingId}: ${errorMessage}`,
              severity: 'high',
            });
          console.log("[IssueTicket] Admin alert created");
        } catch (alertErr) {
          console.error("[IssueTicket] Failed to create admin alert:", alertErr);
        }
        
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
              reason: `Ticketing failed: ${errorMessage}`,
              action: 'auto',
            }),
          });
          console.log("[IssueTicket] Auto-refund triggered successfully");
          
          // Send booking failed email
          try {
            await fetch(`${supabaseUrl}/functions/v1/send-flight-email`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                type: 'booking_failed',
                bookingId,
                data: { reason: errorMessage },
              }),
            });
            console.log("[IssueTicket] Failure email sent");
          } catch (emailErr) {
            console.error("[IssueTicket] Failure email failed:", emailErr);
          }
        } catch (refundErr) {
          console.error("[IssueTicket] Auto-refund failed:", refundErr);
          
          // Create alert for refund failure too
          await supabase
            .from('flight_admin_alerts')
            .insert({
              booking_id: bookingId,
              alert_type: 'refund_failed',
              message: `Auto-refund failed for booking ${bookingId}: ${refundErr instanceof Error ? refundErr.message : 'Unknown error'}`,
              severity: 'critical',
            });
        }
        
        // Trigger health check for auto-pause evaluation
        console.log("[IssueTicket] Triggering health check after failure");
        try {
          await fetch(`${supabaseUrl}/functions/v1/check-flight-health`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (healthErr) {
          console.error("[IssueTicket] Health check trigger failed:", healthErr);
        }
        
        throw duffelError;
      }
    } else if (!isLiveMode) {
      // Demo mode (sandbox only) - generate mock PNR and tickets
      console.log("[IssueTicket] Sandbox mode - generating mock ticket");
      pnr = `ZV${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      orderId = `ord_demo_${Date.now()}`;
      ticketNumbers = (booking.flight_passengers || []).map((_: any, i: number) => 
        `098${Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')}`
      );
    } else {
      // This should not be reached due to earlier check, but safety fallback
      throw new Error("Cannot issue tickets without Duffel API key in live mode");
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

    // Track first ticket issued if LIVE mode
    const { data: launchSettings } = await supabase
      .from("flights_launch_settings")
      .select("status, first_ticket_issued_at")
      .limit(1)
      .single();

    if (launchSettings?.status === 'live' && !launchSettings?.first_ticket_issued_at) {
      await supabase
        .from("flights_launch_settings")
        .update({ first_ticket_issued_at: new Date().toISOString() })
        .is("first_ticket_issued_at", null);
      
      // Create admin alert for first ticket
      await supabase
        .from("flight_admin_alerts")
        .insert({
          booking_id: bookingId,
          alert_type: "first_ticket_issued",
          severity: "low",
          message: `🎉 First LIVE ticket issued! PNR: ${pnr}`,
        });
      console.log("[IssueTicket] First LIVE ticket recorded!");
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

    // Send booking confirmation email
    console.log("[IssueTicket] Sending booking confirmation email");
    try {
      await fetch(`${supabaseUrl}/functions/v1/send-flight-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          type: "booking_confirmation",
          bookingId,
        }),
      });
      console.log("[IssueTicket] Confirmation email triggered");
    } catch (emailErr) {
      console.error("[IssueTicket] Email trigger failed:", emailErr);
      // Don't fail the ticketing if email fails
    }

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
