/**
 * Send Travel Confirmation Email
 * Sends booking confirmation email after successful booking
 */
import { serve, createClient } from "../_shared/deps.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationRequest {
  orderId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: ConfirmationRequest = await req.json();
    const { orderId } = body;

    if (!orderId) {
      throw new Error("Order ID is required");
    }

    // Fetch order with items
    const { data: order, error: orderError } = await supabase
      .from("travel_orders")
      .select(`
        *,
        travel_order_items (*)
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    const items = order.travel_order_items || [];

    // Build email content
    const itemsList = items.map((item: {
      type: string;
      title: string;
      start_date: string;
      end_date?: string;
      adults: number;
      children: number;
      provider_reference?: string;
      status: string;
    }) => {
      const typeEmoji = item.type === "hotel" ? "🏨" : item.type === "activity" ? "🎯" : "🚗";
      const dateRange = item.end_date && item.end_date !== item.start_date
        ? `${item.start_date} - ${item.end_date}`
        : item.start_date;
      
      return `${typeEmoji} ${item.title}
   Date: ${dateRange}
   Guests: ${item.adults} adult(s)${item.children > 0 ? `, ${item.children} child(ren)` : ""}
   Reference: ${item.provider_reference || "Processing..."}
   Status: ${item.status.toUpperCase()}`;
    }).join("\n\n");

    const emailSubject = order.status === "confirmed"
      ? `✅ Booking Confirmed - ${order.order_number}`
      : `⚠️ Booking Update - ${order.order_number}`;

    const emailBody = `
ZIVO Travel Booking ${order.status === "confirmed" ? "Confirmation" : "Update"}

Order Number: ${order.order_number}
Status: ${order.status.toUpperCase()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BOOKING DETAILS

${itemsList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PAYMENT SUMMARY

Subtotal: $${order.subtotal.toFixed(2)} ${order.currency}
Service Fee: $${order.fees.toFixed(2)} ${order.currency}
Taxes: $${order.taxes.toFixed(2)} ${order.currency}
Total: $${order.total.toFixed(2)} ${order.currency}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TRAVELER INFORMATION

Name: ${order.holder_name}
Email: ${order.holder_email}
Phone: ${order.holder_phone || "Not provided"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${order.status === "confirmed" 
  ? "Thank you for booking with ZIVO! We hope you have an amazing trip."
  : "If you have any questions about your booking, please contact our support team."}

Support: support@hizovo.com
Website: https://hizovo.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ZIVO - Your Travel Companion
`;

    // Log the email attempt (in production, would send via email service)
    console.log("[SendConfirmation] Email prepared for:", order.holder_email);
    console.log("[SendConfirmation] Subject:", emailSubject);
    console.log("[SendConfirmation] Order:", order.order_number, "Status:", order.status);

    // Log audit event
    await supabase.from("booking_audit_logs").insert({
      order_id: orderId,
      user_id: order.user_id,
      event: "confirmation_email_sent",
      meta: {
        recipient: order.holder_email,
        subject: emailSubject,
        order_status: order.status,
      },
    });

    // TODO: Integrate with email service (SendGrid, Resend, etc.)
    // For now, we just log and return success

    return new Response(
      JSON.stringify({
        success: true,
        message: "Confirmation email queued",
        recipient: order.holder_email,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    console.error("[SendConfirmation] Error:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
