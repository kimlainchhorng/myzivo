/**
 * Hizovo Travel Email Edge Function
 * 
 * Handles all email types: abandoned search, redirect confirmation, booking status, support auto-reply
 * Uses Resend for email delivery
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_API_URL = "https://api.resend.com/emails";

// Helper to send email via Resend API
async function sendEmail(options: {
  from: string;
  replyTo: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
}): Promise<{ data?: { id: string }; error?: { message: string } }> {
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
      return { error: { message: result.message || "Failed to send email" } };
    }
    
    return { data: { id: result.id } };
  } catch (err) {
    return { error: { message: err instanceof Error ? err.message : "Unknown error" } };
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Email template types
type EmailType = 'abandoned_search' | 'redirect_confirmation' | 'booking_status' | 'support_auto_reply' | 'price_alert' | 'trip_reminder' | 'booking_confirmation';

interface EmailRequest {
  type: EmailType;
  recipientEmail: string;
  data: Record<string, unknown>;
}

// Template generators
function generateAbandonedSearchEmail(data: Record<string, unknown>) {
  const { origin, destination, searchType, departureDate, returnDate, continueSearchUrl } = data;
  const searchTypeLabel = searchType === 'flights' ? 'flights' : searchType === 'hotels' ? 'hotels' : 'car rentals';
  
  return {
    subject: `Still looking for ${origin} → ${destination}?`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6366f1; font-size: 28px;">Hizovo</h1>
        </div>
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 12px; padding: 30px; text-align: center; color: white;">
          <h2 style="margin: 0;">Your ${searchTypeLabel} are waiting!</h2>
          <p style="font-size: 18px;">${origin} → ${destination}</p>
          ${departureDate ? `<p style="opacity: 0.8;">${departureDate}${returnDate ? ` - ${returnDate}` : ''}</p>` : ''}
        </div>
        <p style="margin: 24px 0;">Great options are still available! Continue your search and compare prices from trusted travel partners.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${continueSearchUrl}" style="background: #6366f1; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Continue Your Search →</a>
        </div>
        <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; font-size: 13px; color: #6b7280;">Final booking is completed with our travel partner.</p>
        </div>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
          <p>Hizovo LLC - Travel Search Platform</p>
          <p>All bookings are completed by licensed travel partners.</p>
        </div>
      </body>
      </html>
    `,
    text: `Still looking for ${origin} → ${destination}?\n\nGreat options are still available!\n\nContinue your search: ${continueSearchUrl}\n\nFinal booking is completed with our travel partner.`
  };
}

function generateRedirectConfirmationEmail(data: Record<string, unknown>) {
  const { partnerName, tripSummary, tripsUrl } = data;
  
  return {
    subject: `You're booking with ${partnerName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6366f1; font-size: 28px;">Hizovo</h1>
        </div>
        <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <p style="color: #065f46;">✈️ You're being redirected to <strong>${partnerName}</strong> to complete your booking</p>
        </div>
        <h2>Your Trip Summary</h2>
        <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="white-space: pre-line;">${tripSummary}</p>
        </div>
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <h3 style="color: #92400e;">⚠️ Important</h3>
          <ul style="color: #78350f;">
            <li>Your booking will be processed by <strong>${partnerName}</strong></li>
            <li>${partnerName} is the merchant of record</li>
            <li>For changes/cancellations/refunds, contact ${partnerName} directly</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${tripsUrl}" style="background: #1f2937; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">View Your Trips</a>
        </div>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
          <p>Hizovo LLC - Travel Search Platform</p>
        </div>
      </body>
      </html>
    `,
    text: `You're booking with ${partnerName}\n\n${tripSummary}\n\nIMPORTANT: Your booking will be processed by ${partnerName}. For changes/cancellations/refunds, contact ${partnerName} directly.\n\nView your trips: ${tripsUrl}`
  };
}

function generateBookingStatusEmail(data: Record<string, unknown>) {
  const { status, bookingRef, partnerName, tripSummary, tripsUrl } = data;
  const isSuccess = status === 'success' && bookingRef;
  
  return {
    subject: isSuccess ? `Booking received: Reference ${bookingRef}` : `Booking status pending`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6366f1; font-size: 28px;">Hizovo</h1>
        </div>
        ${isSuccess ? `
          <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
            <p style="color: #065f46;">✓ Booking Reference Received</p>
            <p style="font-size: 24px; font-weight: 700; color: #065f46;">${bookingRef}</p>
          </div>
          <p>Great news! Your booking with <strong>${partnerName}</strong> has been initiated.</p>
          <p>Check your email for confirmation directly from ${partnerName}.</p>
        ` : `
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
            <p style="color: #92400e;">⏳ Booking Status Pending</p>
          </div>
          <p>We noticed you returned from <strong>${partnerName}</strong>'s checkout.</p>
          <p>If you completed your booking, check your email for confirmation from ${partnerName}.</p>
        `}
        <h2>Trip Summary</h2>
        <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="white-space: pre-line;">${tripSummary}</p>
        </div>
        <div style="background: #f3f4f6; border-radius: 8px; padding: 16px;">
          <h3>Need Help?</h3>
          <ul>
            <li><strong>Booking issues:</strong> Contact ${partnerName} directly</li>
            <li><strong>Website issues:</strong> <a href="https://hizovo.com/contact">Contact Hizovo</a></li>
          </ul>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${tripsUrl}" style="background: #1f2937; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">View Your Trips</a>
        </div>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
          <p>Hizovo LLC - Travel Search Platform</p>
        </div>
      </body>
      </html>
    `,
    text: isSuccess 
      ? `Booking received: Reference ${bookingRef}\n\n${tripSummary}\n\nCheck your email for confirmation from ${partnerName}.`
      : `Booking status pending\n\n${tripSummary}\n\nIf you completed checkout, check your email for confirmation from ${partnerName}.`
  };
}

function generateSupportAutoReplyEmail(data: Record<string, unknown>) {
  const { ticketNumber, category, subject, responseWindowHours, isBookingRelated, partnerName } = data;
  
  return {
    subject: `[Ticket ${ticketNumber}] We received your message`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6366f1; font-size: 28px;">Hizovo Support</h1>
        </div>
        <div style="background: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
          <p style="color: #166534;">✓ Support ticket received</p>
          <p style="font-size: 18px; font-weight: 600; color: #166534;">${ticketNumber}</p>
        </div>
        <p>Thank you for contacting Hizovo Support. We'll get back to you within <strong>${responseWindowHours} hours</strong>.</p>
        <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="font-size: 12px; color: #6b7280; text-transform: uppercase;">Your Message</p>
          <p style="font-weight: 600;">${subject}</p>
          <p style="font-size: 12px; color: #6b7280;">Category: ${category}</p>
        </div>
        ${isBookingRelated ? `
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <h3 style="color: #92400e;">📋 Booking-Related Issue?</h3>
            <p style="color: #78350f;">For booking changes, cancellations, or refunds, please contact ${partnerName || 'your booking partner'} directly. They are the merchant of record.</p>
          </div>
        ` : ''}
        <div style="background: #f3f4f6; border-radius: 8px; padding: 16px;">
          <h3>Hizovo Can Help With:</h3>
          <ul><li>Website issues</li><li>Account questions</li><li>Technical problems</li></ul>
          <h3>Contact Your Partner For:</h3>
          <ul><li>Booking changes/cancellations</li><li>Refunds</li><li>Travel documents</li></ul>
        </div>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
          <p>Hizovo LLC - Travel Search Platform</p>
        </div>
      </body>
      </html>
    `,
    text: `[Ticket ${ticketNumber}] We received your message\n\nWe'll get back to you within ${responseWindowHours} hours.\n\nSubject: ${subject}\nCategory: ${category}\n\n${isBookingRelated ? `For booking changes/cancellations/refunds, contact ${partnerName || 'your booking partner'} directly.` : ''}`
  };
}

// PRICE ALERT EMAIL - High conversion, opt-in
function generatePriceAlertEmail(data: Record<string, unknown>) {
  const { origin, destination, oldPrice, newPrice, searchUrl, routeSlug } = data;
  const savings = oldPrice && newPrice ? Math.round(Number(oldPrice) - Number(newPrice)) : null;
  
  return {
    subject: `Price drop alert for your trip 👀`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0a0b; color: #fafafa;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="background: linear-gradient(135deg, #10b981, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px;">ZIVO</h1>
        </div>
        <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(99, 102, 241, 0.2)); border-radius: 12px; padding: 30px; text-align: center; border: 1px solid rgba(255,255,255,0.1);">
          <h2 style="margin: 0 0 8px 0; color: #10b981;">Price Drop Alert! 📉</h2>
          <p style="font-size: 18px; margin: 0; color: #fafafa;">${origin} → ${destination}</p>
          ${savings ? `<p style="font-size: 14px; color: #10b981; margin-top: 12px;">Prices may have dropped</p>` : ''}
        </div>
        <p style="margin: 24px 0; color: #a1a1aa;">Good news! Prices for your tracked route have changed. Check the latest options from our travel partners.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${searchUrl}" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Updated Prices →</a>
        </div>
        <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; font-size: 13px; color: #71717a;">Prices may change until booking is completed. Final price confirmed on partner site.</p>
        </div>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center; color: #71717a; font-size: 12px;">
          <p>ZIVO - Travel Search Platform</p>
          <p>You received this because you set a price alert. <a href="https://hizivo.com/account/notifications" style="color: #10b981;">Manage preferences</a></p>
        </div>
      </body>
      </html>
    `,
    text: `Price drop alert for ${origin} → ${destination}!\n\nGood news! Prices for your tracked route have changed.\n\nView updated prices: ${searchUrl}\n\nPrices may change until booking is completed.`
  };
}

// TRIP REMINDER EMAIL - 3-5 days before departure
function generateTripReminderEmail(data: Record<string, unknown>) {
  const { destination, departureDate, daysUntil, bookingRef, partnerName, manageUrl } = data;
  
  return {
    subject: `Your trip is coming up 🗓️`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0a0b; color: #fafafa;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="background: linear-gradient(135deg, #10b981, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px;">ZIVO</h1>
        </div>
        <div style="background: linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(99, 102, 241, 0.2)); border-radius: 12px; padding: 30px; text-align: center; border: 1px solid rgba(255,255,255,0.1);">
          <h2 style="margin: 0 0 8px 0; color: #0ea5e9;">Trip Reminder ✈️</h2>
          <p style="font-size: 20px; margin: 0; color: #fafafa;">Your trip to ${destination}</p>
          <p style="font-size: 16px; color: #a1a1aa; margin-top: 8px;">Departing ${departureDate} (${daysUntil} days away)</p>
        </div>
        <p style="margin: 24px 0; color: #a1a1aa;">Your trip is coming up. Check your booking details with your travel provider.</p>
        ${bookingRef ? `
          <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="font-size: 12px; color: #71717a; margin: 0;">Booking Reference</p>
            <p style="font-size: 18px; font-weight: bold; color: #fafafa; margin: 4px 0 0 0;">${bookingRef}</p>
            ${partnerName ? `<p style="font-size: 12px; color: #71717a; margin: 4px 0 0 0;">via ${partnerName}</p>` : ''}
          </div>
        ` : ''}
        <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 16px; margin: 24px 0;">
          <h3 style="color: #f59e0b; margin: 0 0 8px 0; font-size: 14px;">⚠️ Need to make changes?</h3>
          <p style="color: #a1a1aa; font-size: 13px; margin: 0;">For booking changes, cancellations, or refunds, contact ${partnerName || 'your travel partner'} directly. They processed your booking and can assist you.</p>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${manageUrl || 'https://hizivo.com/trips'}" style="background: linear-gradient(135deg, #0ea5e9, #6366f1); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Your Trips →</a>
        </div>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center; color: #71717a; font-size: 12px;">
          <p>ZIVO - Travel Search Platform</p>
          <p>You received this because you have an upcoming trip. <a href="https://hizivo.com/account/notifications" style="color: #10b981;">Manage preferences</a></p>
        </div>
      </body>
      </html>
    `,
    text: `Your trip to ${destination} is coming up!\n\nDeparting: ${departureDate} (${daysUntil} days away)\n${bookingRef ? `Booking Ref: ${bookingRef}\n` : ''}\nFor booking changes/cancellations, contact ${partnerName || 'your travel partner'} directly.\n\nView your trips: ${manageUrl || 'https://hizivo.com/trips'}`
  };
}

// BOOKING CONFIRMATION EMAIL - Sent when booking is initiated
function generateBookingConfirmationEmail(data: Record<string, unknown>) {
  const { partnerName, tripSummary, tripsUrl } = data;
  
  return {
    subject: `Your booking request has been received ✈️`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0a0b; color: #fafafa;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="background: linear-gradient(135deg, #10b981, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px;">ZIVO</h1>
        </div>
        <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(99, 102, 241, 0.2)); border-radius: 12px; padding: 30px; text-align: center; border: 1px solid rgba(255,255,255,0.1);">
          <h2 style="margin: 0 0 8px 0; color: #10b981;">Booking Received ✅</h2>
          <p style="font-size: 16px; margin: 0; color: #a1a1aa;">Processing with ${partnerName}</p>
        </div>
        <p style="margin: 24px 0; color: #a1a1aa;">Thank you for using ZIVO.</p>
        <p style="margin: 24px 0; color: #a1a1aa;">Your booking is being processed by our travel partner. You will receive confirmation once your ticket is issued.</p>
        ${tripSummary ? `
          <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="font-size: 12px; color: #71717a; margin: 0 0 8px 0;">Trip Summary</p>
            <p style="font-size: 14px; color: #fafafa; margin: 0; white-space: pre-line;">${tripSummary}</p>
          </div>
        ` : ''}
        <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="color: #a1a1aa; font-size: 13px; margin: 0;"><strong>Important:</strong> ZIVO does not issue tickets. Travel services are provided by licensed partners. Check your email for confirmation from ${partnerName}.</p>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${tripsUrl || 'https://hizivo.com/trips'}" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Your Trips →</a>
        </div>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center; color: #71717a; font-size: 12px;">
          <p>ZIVO - Travel Search Platform</p>
          <p>All bookings are completed by licensed travel partners.</p>
        </div>
      </body>
      </html>
    `,
    text: `Your booking request has been received!\n\nThank you for using ZIVO.\n\nYour booking is being processed by our travel partner (${partnerName}). You will receive confirmation once your ticket is issued.\n\nImportant: ZIVO does not issue tickets. Travel services are provided by licensed partners.\n\nView your trips: ${tripsUrl || 'https://hizivo.com/trips'}`
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { type, recipientEmail, data }: EmailRequest = await req.json();

    if (!type || !recipientEmail || !data) {
      throw new Error("Missing required fields: type, recipientEmail, data");
    }

    // Get email settings
    const { data: settings } = await supabase
      .from("email_settings")
      .select("setting_value")
      .eq("setting_key", type)
      .single();

    const emailSettings = settings?.setting_value as Record<string, unknown> || {
      enabled: true,
      from_name: "Hizovo Travel",
      reply_to: "support@hizovo.com"
    };

    if (!emailSettings.enabled) {
      return new Response(
        JSON.stringify({ success: false, message: "Email type is disabled" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate email content based on type
    let emailContent: { subject: string; html: string; text: string };
    
    switch (type) {
      case 'abandoned_search':
        emailContent = generateAbandonedSearchEmail(data);
        break;
      case 'redirect_confirmation':
        emailContent = generateRedirectConfirmationEmail(data);
        break;
      case 'booking_status':
        emailContent = generateBookingStatusEmail(data);
        break;
      case 'support_auto_reply':
        emailContent = generateSupportAutoReplyEmail(data);
        break;
      case 'price_alert':
        emailContent = generatePriceAlertEmail(data);
        break;
      case 'trip_reminder':
        emailContent = generateTripReminderEmail(data);
        break;
      case 'booking_confirmation':
        emailContent = generateBookingConfirmationEmail(data);
        break;
      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    // Send email via Resend API
    const emailResponse = await sendEmail({
      from: `${emailSettings.from_name || 'Hizovo Travel'} <noreply@hizovo.com>`,
      replyTo: emailSettings.reply_to as string || "support@hizovo.com",
      to: [recipientEmail],
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    // Log email
    await supabase.from("email_logs").insert({
      email_type: type,
      recipient_email: recipientEmail,
      subject: emailContent.subject,
      status: emailResponse.error ? 'failed' : 'sent',
      resend_id: emailResponse.data?.id,
      error_message: emailResponse.error?.message,
      search_session_id: data.searchSessionId as string,
      booking_ref: data.bookingRef as string,
      partner_name: data.partnerName as string,
      metadata: data,
      sent_at: emailResponse.error ? null : new Date().toISOString(),
    });

    if (emailResponse.error) {
      console.error("Resend error:", emailResponse.error);
      throw new Error(emailResponse.error.message);
    }

    return new Response(
      JSON.stringify({ success: true, id: emailResponse.data?.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Email send error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
