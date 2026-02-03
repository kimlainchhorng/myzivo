/**
 * Send Incident Notification
 * Notifies affected customers when an incident occurs
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IncidentNotificationRequest {
  incidentId: string;
  notificationType: 'incident_started' | 'incident_resolved';
  affectedBookingIds?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { incidentId, notificationType, affectedBookingIds }: IncidentNotificationRequest = await req.json();

    console.log(`[IncidentNotification] Processing ${notificationType} for incident ${incidentId}`);

    if (!resendApiKey) {
      console.log("[IncidentNotification] RESEND_API_KEY not configured, skipping email");
      return new Response(
        JSON.stringify({ success: false, message: "Email not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(resendApiKey);

    // Get booking IDs to notify - either from params or from incident log
    let bookingIds = affectedBookingIds || [];
    
    if (!bookingIds.length && incidentId) {
      const { data: incident } = await supabase
        .from("flight_incident_logs")
        .select("affected_booking_ids")
        .eq("id", incidentId)
        .single();
      
      if (incident?.affected_booking_ids) {
        bookingIds = incident.affected_booking_ids as string[];
      }
    }

    if (!bookingIds.length) {
      // If no specific bookings, notify bookings in processing/pending state
      const { data: pendingBookings } = await supabase
        .from("flight_bookings")
        .select("id")
        .in("ticketing_status", ["pending", "processing"])
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      
      bookingIds = pendingBookings?.map(b => b.id) || [];
    }

    console.log(`[IncidentNotification] Found ${bookingIds.length} bookings to notify`);

    if (!bookingIds.length) {
      return new Response(
        JSON.stringify({ success: true, notified: 0, message: "No bookings to notify" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get booking details with passenger emails
    const { data: bookings } = await supabase
      .from("flight_bookings")
      .select(`
        id,
        booking_reference,
        pnr,
        flight_passengers (email, given_name, family_name)
      `)
      .in("id", bookingIds);

    let notifiedCount = 0;
    const errors: string[] = [];

    for (const booking of bookings || []) {
      const passengers = booking.flight_passengers || [];
      const primaryPassenger = passengers[0];
      
      if (!primaryPassenger?.email) {
        continue;
      }

      const bookingRef = booking.pnr || booking.booking_reference;
      const passengerName = primaryPassenger.given_name || 'Valued Customer';

      try {
        if (notificationType === 'incident_started') {
          await resend.emails.send({
            from: "ZIVO Flights <flights@hizovo.com>",
            to: [primaryPassenger.email],
            subject: "Update on Your ZIVO Flight Booking",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1a1a1a;">Update on Your Booking</h2>
                <p>Dear ${passengerName},</p>
                <p>We're reviewing an issue with your booking reference: <strong>${bookingRef}</strong></p>
                <p>Our support team is on it and will update you shortly. You don't need to take any action at this time.</p>
                <p>Your booking is safe and we'll ensure everything is resolved promptly.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                <p style="color: #666; font-size: 14px;">
                  Need help? Contact us at <a href="mailto:support@hizovo.com">support@hizovo.com</a>
                </p>
                <p style="color: #666; font-size: 12px;">ZIVO Travel, Inc.</p>
              </div>
            `,
          });
        } else {
          await resend.emails.send({
            from: "ZIVO Flights <flights@hizovo.com>",
            to: [primaryPassenger.email],
            subject: "Issue Resolved - Your ZIVO Flight Booking",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1a1a1a;">Issue Resolved ✓</h2>
                <p>Dear ${passengerName},</p>
                <p>The issue affecting your booking reference <strong>${bookingRef}</strong> has been resolved.</p>
                <p>Your booking is confirmed and everything is in order. Thank you for your patience.</p>
                <p><a href="https://hizovo.com/dashboard/trips" style="color: #0066cc;">View your booking</a></p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                <p style="color: #666; font-size: 14px;">
                  Questions? Contact us at <a href="mailto:support@hizovo.com">support@hizovo.com</a>
                </p>
                <p style="color: #666; font-size: 12px;">ZIVO Travel, Inc.</p>
              </div>
            `,
          });
        }
        notifiedCount++;
      } catch (emailError) {
        console.error(`[IncidentNotification] Email error for ${booking.id}:`, emailError);
        errors.push(booking.id);
      }
    }

    // Update incident log with notification count
    if (incidentId) {
      const updateField = notificationType === 'incident_started' 
        ? { customers_notified: notifiedCount }
        : { customers_resolved: notifiedCount };
      
      await supabase
        .from("flight_incident_logs")
        .update({
          ...updateField,
          updated_at: new Date().toISOString(),
        })
        .eq("id", incidentId);
    }

    console.log(`[IncidentNotification] Notified ${notifiedCount} customers`);

    return new Response(
      JSON.stringify({
        success: true,
        notified: notifiedCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[IncidentNotification] Error:", error);
    
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Notification failed" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
