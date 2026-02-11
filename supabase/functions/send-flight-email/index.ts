/**
 * Send Flight Email - OTA-Grade Customer Communication
 * 
 * Handles all flight-related email notifications:
 * - Booking confirmation (with PNR & ticket numbers)
 * - Payment receipt
 * - Booking failed / auto-refund
 * - Schedule change
 * - Refund status updates
 */

import { serve, createClient } from "../_shared/deps.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_API_URL = "https://api.resend.com/emails";
const MAX_RETRIES = 3;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type FlightEmailType = 
  | 'booking_confirmation'
  | 'payment_receipt'
  | 'booking_failed'
  | 'schedule_change'
  | 'refund_requested'
  | 'refund_approved'
  | 'refund_completed';

interface FlightEmailRequest {
  type: FlightEmailType;
  bookingId: string;
  recipientEmail?: string;
  data?: Record<string, unknown>;
}

// Send email via Resend API with retry logic
async function sendEmailWithRetry(
  options: {
    from: string;
    replyTo: string;
    to: string[];
    subject: string;
    html: string;
    text: string;
  },
  retries = 0
): Promise<{ data?: { id: string }; error?: { message: string } }> {
  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: options.from,
        reply_to: options.replyTo,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      // Retry on transient errors
      if (response.status >= 500 && retries < MAX_RETRIES) {
        console.log(`[FlightEmail] Retry ${retries + 1}/${MAX_RETRIES} after server error`);
        await new Promise(r => setTimeout(r, 1000 * (retries + 1)));
        return sendEmailWithRetry(options, retries + 1);
      }
      return { error: { message: result.message || `HTTP ${response.status}` } };
    }
    
    return { data: { id: result.id } };
  } catch (err) {
    if (retries < MAX_RETRIES) {
      console.log(`[FlightEmail] Retry ${retries + 1}/${MAX_RETRIES} after network error`);
      await new Promise(r => setTimeout(r, 1000 * (retries + 1)));
      return sendEmailWithRetry(options, retries + 1);
    }
    return { error: { message: err instanceof Error ? err.message : "Network error" } };
  }
}

// Email template: Booking Confirmation
function generateBookingConfirmationEmail(booking: any) {
  const passengerNames = booking.flight_passengers
    ?.map((p: any) => `${p.given_name} ${p.family_name}`)
    .join(', ') || 'Passenger';
    
  const ticketNumbersList = booking.ticket_numbers?.length
    ? booking.ticket_numbers.map((t: string, i: number) => `<li>Passenger ${i + 1}: ${t}</li>`).join('')
    : '<li>E-ticket will be sent separately</li>';

  return {
    subject: `Your ZIVO flight is confirmed ✈️ ${booking.booking_reference}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">✈️ Flight Confirmed!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your booking is complete</p>
          </div>
          
          <div style="padding: 30px;">
            <div style="background: #f0fdf4; border: 1px solid #22c55e; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <p style="color: #166534; margin: 0 0 8px 0; font-size: 14px;">Booking Reference</p>
              <p style="font-size: 32px; font-weight: 700; color: #166534; margin: 0; letter-spacing: 2px;">${booking.booking_reference}</p>
              ${booking.pnr ? `<p style="color: #166534; margin: 12px 0 0 0; font-size: 14px;">Airline PNR: <strong>${booking.pnr}</strong></p>` : ''}
            </div>

            <h2 style="margin: 0 0 16px 0; font-size: 18px;">Flight Details</h2>
            <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="margin: 0 0 8px 0;"><strong>Route:</strong> ${booking.origin} → ${booking.destination}</p>
              <p style="margin: 0 0 8px 0;"><strong>Departure:</strong> ${new Date(booking.departure_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              ${booking.return_date ? `<p style="margin: 0 0 8px 0;"><strong>Return:</strong> ${new Date(booking.return_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>` : ''}
              <p style="margin: 0 0 8px 0;"><strong>Passengers:</strong> ${passengerNames}</p>
              <p style="margin: 0;"><strong>Class:</strong> ${booking.cabin_class || 'Economy'}</p>
            </div>

            <h2 style="margin: 0 0 16px 0; font-size: 18px;">E-Ticket Numbers</h2>
            <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <ul style="margin: 0; padding-left: 20px;">
                ${ticketNumbersList}
              </ul>
            </div>

            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <h3 style="color: #92400e; margin: 0 0 8px 0; font-size: 14px;">⚠️ Important</h3>
              <ul style="color: #78350f; margin: 0; padding-left: 20px; font-size: 14px;">
                <li>Arrive at the airport at least 2 hours before departure</li>
                <li>Bring valid ID/passport matching your booking</li>
                <li>Check airline website for baggage allowance</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <a href="https://hizovo.com/trips/flights/${booking.id}" style="background: #6366f1; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">View Your Booking</a>
            </div>
          </div>

          <div style="background: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px;">Need Help?</h3>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              For changes, cancellations, or refunds, contact us at 
              <a href="mailto:support@hizovo.com" style="color: #6366f1;">support@hizovo.com</a>
            </p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0;">ZIVO Travel • Your flight, your way</p>
          <p style="margin: 4px 0 0 0;">This is an automated message. Please do not reply directly.</p>
        </div>
      </body>
      </html>
    `,
    text: `Your ZIVO flight is confirmed!\n\nBooking Reference: ${booking.booking_reference}\n${booking.pnr ? `Airline PNR: ${booking.pnr}\n` : ''}\nRoute: ${booking.origin} → ${booking.destination}\nDeparture: ${booking.departure_date}\nPassengers: ${passengerNames}\n\nView your booking: https://hizovo.com/trips/flights/${booking.id}\n\nNeed help? Contact support@hizovo.com`,
  };
}

// Email template: Payment Receipt
function generatePaymentReceiptEmail(booking: any) {
  return {
    subject: `Payment received for your ZIVO flight`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">💳 Payment Received</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your payment</p>
          </div>
          
          <div style="padding: 30px;">
            <div style="background: #f0fdf4; border: 1px solid #22c55e; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <p style="color: #166534; margin: 0 0 8px 0; font-size: 14px;">Amount Paid</p>
              <p style="font-size: 32px; font-weight: 700; color: #166534; margin: 0;">$${booking.total_amount?.toFixed(2)} ${booking.currency}</p>
            </div>

            <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="margin: 0 0 8px 0;"><strong>Booking Reference:</strong> ${booking.booking_reference}</p>
              <p style="margin: 0 0 8px 0;"><strong>Route:</strong> ${booking.origin} → ${booking.destination}</p>
              <p style="margin: 0;"><strong>Payment Method:</strong> Card ending in ****</p>
            </div>

            <p style="color: #6b7280; font-size: 14px;">Your ticket is being issued. You'll receive a confirmation email with your e-ticket shortly.</p>
          </div>

          <div style="background: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Questions? Contact <a href="mailto:support@hizovo.com" style="color: #6366f1;">support@hizovo.com</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Payment received for your ZIVO flight.\n\nAmount: $${booking.total_amount?.toFixed(2)} ${booking.currency}\nBooking Reference: ${booking.booking_reference}\nRoute: ${booking.origin} → ${booking.destination}\n\nYour ticket is being issued. You'll receive a confirmation email shortly.`,
  };
}

// Email template: Booking Failed / Auto-Refund
function generateBookingFailedEmail(booking: any, reason?: string) {
  return {
    subject: `Your ZIVO flight booking could not be completed`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">❌ Booking Could Not Be Completed</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">We apologize for the inconvenience</p>
          </div>
          
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
              We're sorry, but your flight booking from <strong>${booking.origin}</strong> to <strong>${booking.destination}</strong> could not be completed.
            </p>

            ${reason ? `<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 24px;"><p style="margin: 0; color: #991b1b;">${reason}</p></div>` : ''}

            <div style="background: #f0fdf4; border: 1px solid #22c55e; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <h3 style="color: #166534; margin: 0 0 12px 0; font-size: 16px;">✓ Your Refund</h3>
              <p style="margin: 0 0 8px 0; color: #166534;">A full refund of <strong>$${booking.total_amount?.toFixed(2)} ${booking.currency}</strong> has been initiated.</p>
              <p style="margin: 0; color: #166534; font-size: 14px;">Expect to see it in your account within <strong>3–10 business days</strong>.</p>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <a href="https://hizovo.com/flights" style="background: #6366f1; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Search New Flights</a>
            </div>
          </div>

          <div style="background: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Need assistance? Contact us at <a href="mailto:support@hizovo.com" style="color: #6366f1;">support@hizovo.com</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Your ZIVO flight booking could not be completed.\n\nWe're sorry, but your flight from ${booking.origin} to ${booking.destination} could not be completed.\n\n${reason || ''}\n\nA full refund of $${booking.total_amount?.toFixed(2)} ${booking.currency} has been initiated. Expect it within 3–10 business days.\n\nSearch new flights: https://hizovo.com/flights\n\nNeed help? Contact support@hizovo.com`,
  };
}

// Email template: Schedule Change
function generateScheduleChangeEmail(booking: any, changes: any) {
  return {
    subject: `Important update to your ZIVO flight`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">⚠️ Flight Schedule Update</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Action may be required</p>
          </div>
          
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
              The airline has made changes to your flight. Please review the updates below.
            </p>

            <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="margin: 0 0 8px 0;"><strong>Booking Reference:</strong> ${booking.booking_reference}</p>
              <p style="margin: 0;"><strong>Route:</strong> ${booking.origin} → ${booking.destination}</p>
            </div>

            <h3 style="margin: 0 0 12px 0;">What Changed</h3>
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="margin: 0; color: #92400e;">${changes?.description || 'Flight schedule has been updated by the airline.'}</p>
            </div>

            <h3 style="margin: 0 0 12px 0;">Your Options</h3>
            <div style="display: grid; gap: 12px;">
              <a href="https://hizovo.com/trips/flights/${booking.id}?action=accept" style="display: block; background: #22c55e; color: white; padding: 14px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; text-align: center;">Accept Changes</a>
              <a href="https://hizovo.com/trips/flights/${booking.id}?action=refund" style="display: block; background: #ef4444; color: white; padding: 14px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; text-align: center;">Request Refund</a>
              <a href="mailto:support@hizovo.com?subject=Schedule Change - ${booking.booking_reference}" style="display: block; background: white; border: 2px solid #6366f1; color: #6366f1; padding: 14px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; text-align: center;">Contact Support</a>
            </div>
          </div>

          <div style="background: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Questions? Email <a href="mailto:support@hizovo.com" style="color: #6366f1;">support@hizovo.com</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Important update to your ZIVO flight.\n\nBooking: ${booking.booking_reference}\nRoute: ${booking.origin} → ${booking.destination}\n\nWhat changed: ${changes?.description || 'Flight schedule has been updated.'}\n\nYour options:\n1. Accept changes\n2. Request refund\n3. Contact support\n\nVisit: https://hizovo.com/trips/flights/${booking.id}\n\nNeed help? Contact support@hizovo.com`,
  };
}

// Email template: Refund Requested
function generateRefundRequestedEmail(booking: any) {
  return {
    subject: `Refund request received - ${booking.booking_reference}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">📋 Refund Request Received</h1>
          </div>
          
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
              We've received your refund request for booking <strong>${booking.booking_reference}</strong>.
            </p>

            <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="margin: 0 0 8px 0;"><strong>Route:</strong> ${booking.origin} → ${booking.destination}</p>
              <p style="margin: 0 0 8px 0;"><strong>Amount:</strong> $${booking.total_amount?.toFixed(2)} ${booking.currency}</p>
              <p style="margin: 0;"><strong>Status:</strong> Under Review</p>
            </div>

            <p style="color: #6b7280; font-size: 14px;">Our team will review your request and get back to you within 2-3 business days.</p>
          </div>

          <div style="background: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Track your request at <a href="https://hizovo.com/trips/flights/${booking.id}" style="color: #6366f1;">hizovo.com/trips</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Refund request received for booking ${booking.booking_reference}.\n\nRoute: ${booking.origin} → ${booking.destination}\nAmount: $${booking.total_amount?.toFixed(2)} ${booking.currency}\nStatus: Under Review\n\nOur team will review your request within 2-3 business days.`,
  };
}

// Email template: Refund Approved
function generateRefundApprovedEmail(booking: any) {
  return {
    subject: `Refund approved - ${booking.booking_reference}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">✓ Refund Approved</h1>
          </div>
          
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
              Great news! Your refund request for booking <strong>${booking.booking_reference}</strong> has been approved.
            </p>

            <div style="background: #f0fdf4; border: 1px solid #22c55e; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <p style="color: #166534; margin: 0 0 8px 0; font-size: 14px;">Refund Amount</p>
              <p style="font-size: 32px; font-weight: 700; color: #166534; margin: 0;">$${(booking.refund_amount || booking.total_amount)?.toFixed(2)}</p>
            </div>

            <p style="color: #6b7280; font-size: 14px;">The refund is being processed and will be credited to your original payment method within 3-10 business days.</p>
          </div>

          <div style="background: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Questions? Contact <a href="mailto:support@hizovo.com" style="color: #6366f1;">support@hizovo.com</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Refund approved for booking ${booking.booking_reference}.\n\nAmount: $${(booking.refund_amount || booking.total_amount)?.toFixed(2)}\n\nThe refund will be credited within 3-10 business days.`,
  };
}

// Email template: Refund Completed
function generateRefundCompletedEmail(booking: any) {
  return {
    subject: `Refund completed - ${booking.booking_reference}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">💰 Refund Completed</h1>
          </div>
          
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
              Your refund for booking <strong>${booking.booking_reference}</strong> has been processed.
            </p>

            <div style="background: #f0fdf4; border: 1px solid #22c55e; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <p style="color: #166534; margin: 0 0 8px 0; font-size: 14px;">Amount Refunded</p>
              <p style="font-size: 32px; font-weight: 700; color: #166534; margin: 0;">$${(booking.refund_amount || booking.total_amount)?.toFixed(2)}</p>
              <p style="color: #166534; margin: 12px 0 0 0; font-size: 14px;">Processed on ${new Date().toLocaleDateString()}</p>
            </div>

            <p style="color: #6b7280; font-size: 14px;">The funds should appear in your account shortly. Bank processing times may vary.</p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="https://hizovo.com/flights" style="background: #6366f1; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Book Another Flight</a>
            </div>
          </div>

          <div style="background: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Thank you for choosing ZIVO. We hope to see you again soon!
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Refund completed for booking ${booking.booking_reference}.\n\nAmount refunded: $${(booking.refund_amount || booking.total_amount)?.toFixed(2)}\nProcessed on: ${new Date().toLocaleDateString()}\n\nThe funds should appear in your account shortly.\n\nBook another flight: https://hizovo.com/flights`,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { type, bookingId, recipientEmail, data }: FlightEmailRequest = await req.json();

    if (!type || !bookingId) {
      throw new Error("type and bookingId are required");
    }

    if (!RESEND_API_KEY) {
      console.warn("[FlightEmail] RESEND_API_KEY not set, skipping email");
      return new Response(
        JSON.stringify({ success: false, message: "Email service not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[FlightEmail] Sending", type, "for booking:", bookingId);

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
      throw new Error(`Booking not found: ${bookingId}`);
    }

    // Determine recipient
    const email = recipientEmail || booking.contact_email || booking.flight_passengers?.[0]?.email;
    if (!email) {
      throw new Error("No recipient email found");
    }

    // Generate email content based on type
    let emailContent: { subject: string; html: string; text: string };
    
    switch (type) {
      case 'booking_confirmation':
        emailContent = generateBookingConfirmationEmail(booking);
        break;
      case 'payment_receipt':
        emailContent = generatePaymentReceiptEmail(booking);
        break;
      case 'booking_failed':
        emailContent = generateBookingFailedEmail(booking, data?.reason as string);
        break;
      case 'schedule_change':
        emailContent = generateScheduleChangeEmail(booking, data?.changes);
        break;
      case 'refund_requested':
        emailContent = generateRefundRequestedEmail(booking);
        break;
      case 'refund_approved':
        emailContent = generateRefundApprovedEmail(booking);
        break;
      case 'refund_completed':
        emailContent = generateRefundCompletedEmail(booking);
        break;
      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    // Create log entry first
    const { data: logEntry } = await supabase
      .from("flight_email_logs")
      .insert({
        booking_id: bookingId,
        email_type: type,
        recipient_email: email,
        subject: emailContent.subject,
        status: 'pending',
        metadata: { ...data },
      })
      .select()
      .single();

    // Send email with retry
    const emailResponse = await sendEmailWithRetry({
      from: "ZIVO Flights <noreply@hizovo.com>",
      replyTo: "support@hizovo.com",
      to: [email],
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    // Update log with result
    if (logEntry) {
      await supabase
        .from("flight_email_logs")
        .update({
          status: emailResponse.error ? 'failed' : 'sent',
          resend_id: emailResponse.data?.id,
          error_message: emailResponse.error?.message,
          sent_at: emailResponse.error ? null : new Date().toISOString(),
        })
        .eq("id", logEntry.id);
    }

    if (emailResponse.error) {
      console.error("[FlightEmail] Send failed:", emailResponse.error);
      throw new Error(emailResponse.error.message);
    }

    console.log("[FlightEmail] Sent successfully:", emailResponse.data?.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: emailResponse.data?.id,
        logId: logEntry?.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[FlightEmail] Error:", errorMessage);
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
