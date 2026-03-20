import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  template: string;
  data: Record<string, unknown>;
}

// Brand-consistent email templates
function renderTemplate(
  template: string,
  data: Record<string, unknown>
): { subject: string; html: string } {
  const brandColor = "hsl(142, 71%, 45%)";
  const bgColor = "#ffffff";
  const textColor = "#1a1a1a";
  const mutedColor = "#6b7280";
  const fontFamily =
    "'Inter', 'Work Sans', -apple-system, BlinkMacSystemFont, sans-serif";

  const wrapper = (subject: string, body: string) => ({
    subject,
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:${fontFamily};">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:${bgColor};border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
<!-- Header -->
<tr><td style="background:${brandColor};padding:24px 32px;text-align:center;">
<span style="color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">ZIVO</span>
</td></tr>
<!-- Body -->
<tr><td style="padding:32px;">${body}</td></tr>
<!-- Footer -->
<tr><td style="padding:24px 32px;border-top:1px solid #e5e7eb;text-align:center;">
<p style="color:${mutedColor};font-size:12px;margin:0;">© ${new Date().getFullYear()} ZIVO. All rights reserved.</p>
<p style="color:${mutedColor};font-size:12px;margin:8px 0 0;">
<a href="https://hizivo.com/privacy" style="color:${mutedColor};text-decoration:underline;">Privacy</a> · 
<a href="https://hizivo.com/terms" style="color:${mutedColor};text-decoration:underline;">Terms</a>
</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`,
  });

  switch (template) {
    case "booking-confirmation": {
      const { booking_id, booking_reference, origin, destination, departure_date, return_date, cabin_class, passengers, airline, flight_number, total_price, currency, ticket_numbers, pnr } =
        data as Record<string, unknown>;
      const ticketHtml = Array.isArray(ticket_numbers) && ticket_numbers.length > 0
        ? `<tr><td style="padding:8px 16px;"><strong style="color:${mutedColor};font-size:13px;">E-Ticket(s)</strong><br><span style="color:${textColor};font-size:14px;font-family:monospace;">${(ticket_numbers as string[]).join(", ")}</span></td></tr>` : "";
      const pnrHtml = pnr ? `<tr><td style="padding:8px 16px;"><strong style="color:${mutedColor};font-size:13px;">PNR</strong><br><span style="color:${textColor};font-size:15px;font-family:monospace;letter-spacing:1px;">${pnr}</span></td></tr>` : "";
      const returnHtml = return_date ? `<tr><td style="padding:8px 16px;"><strong style="color:${mutedColor};font-size:13px;">Return</strong><br><span style="color:${textColor};font-size:15px;">${return_date}</span></td></tr>` : "";
      return wrapper(
        `Booking Confirmed — ${(origin as string) || ""} to ${(destination as string) || "your destination"}`,
        `<h1 style="color:${textColor};font-size:22px;margin:0 0 8px;">Your flight is confirmed! ✈️</h1>
<p style="color:${mutedColor};font-size:14px;margin:0 0 20px;">Reference: <strong style="color:${textColor};font-family:monospace;letter-spacing:1px;">${(booking_reference as string) || (booking_id as string) || "—"}</strong></p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;overflow:hidden;margin:0 0 20px;">
<tr><td style="padding:20px 16px;text-align:center;border-bottom:2px dashed #e5e7eb;">
  <span style="font-size:28px;font-weight:700;color:${textColor};">${(origin as string) || "—"}</span>
  <span style="font-size:18px;color:${mutedColor};margin:0 12px;">✈</span>
  <span style="font-size:28px;font-weight:700;color:${textColor};">${(destination as string) || "—"}</span>
</td></tr>
${(airline as string) ? `<tr><td style="padding:8px 16px;"><strong style="color:${mutedColor};font-size:13px;">Airline</strong><br><span style="color:${textColor};font-size:15px;">${airline}${(flight_number as string) ? " · " + flight_number : ""}</span></td></tr>` : ""}
<tr><td style="padding:8px 16px;"><strong style="color:${mutedColor};font-size:13px;">Departure</strong><br><span style="color:${textColor};font-size:15px;">${(departure_date as string) || "—"}</span></td></tr>
${returnHtml}
<tr><td style="padding:8px 16px;"><strong style="color:${mutedColor};font-size:13px;">Class</strong><br><span style="color:${textColor};font-size:15px;text-transform:capitalize;">${((cabin_class as string) || "economy").replace("_", " ")}</span></td></tr>
<tr><td style="padding:8px 16px;"><strong style="color:${mutedColor};font-size:13px;">Travelers</strong><br><span style="color:${textColor};font-size:15px;">${(passengers as string) || "1"}</span></td></tr>
${pnrHtml}${ticketHtml}
<tr><td style="padding:12px 16px;border-top:1px solid #e5e7eb;"><strong style="color:${mutedColor};font-size:13px;">Total Paid</strong><br><span style="color:${brandColor};font-size:22px;font-weight:700;">${(currency as string) || "$"}${(total_price as string) || "—"}</span></td></tr>
</table>
<div style="text-align:center;margin:24px 0;">
<a href="https://hizovo.com/flights/bookings" style="background:${brandColor};color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">View Booking</a>
</div>
<p style="color:${mutedColor};font-size:13px;line-height:1.6;">For changes, cancellations, or refund requests, contact the travel partner listed in your booking details.</p>`
      );
    }

    case "booking-cancellation": {
      const { booking_id: bid, refund_amount, refund_currency } = data as Record<string, string>;
      return wrapper(
        "Booking Cancelled",
        `<h1 style="color:${textColor};font-size:22px;margin:0 0 16px;">Booking cancelled</h1>
<p style="color:${textColor};font-size:15px;line-height:1.6;">Your booking <strong>${bid || ""}</strong> has been cancelled.</p>
${refund_amount ? `<p style="color:${textColor};font-size:15px;">A refund of <strong>${refund_currency || "$"}${refund_amount}</strong> will be processed within 5-10 business days.</p>` : ""}
<p style="color:${mutedColor};font-size:14px;">Questions? Contact our <a href="https://hizivo.com/help" style="color:${brandColor};text-decoration:none;font-weight:500;">support team</a>.</p>`
      );
    }

    case "price-alert": {
      const { route, old_price, new_price, alert_currency, search_url } = data as Record<string, string>;
      return wrapper(
        `Price Drop Alert: ${route || "Your saved route"}`,
        `<h1 style="color:${textColor};font-size:22px;margin:0 0 16px;">Price dropped! 🎉</h1>
<p style="color:${textColor};font-size:15px;line-height:1.6;">Good news — the price for <strong>${route}</strong> just dropped.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
<tr>
<td style="text-align:center;padding:16px;background:#fef2f2;border-radius:8px 0 0 8px;">
<span style="color:${mutedColor};font-size:12px;display:block;">Was</span>
<span style="color:#ef4444;font-size:20px;font-weight:600;text-decoration:line-through;">${alert_currency || "$"}${old_price}</span>
</td>
<td style="text-align:center;padding:16px;background:#f0fdf4;border-radius:0 8px 8px 0;">
<span style="color:${mutedColor};font-size:12px;display:block;">Now</span>
<span style="color:${brandColor};font-size:20px;font-weight:700;">${alert_currency || "$"}${new_price}</span>
</td>
</tr>
</table>
<div style="text-align:center;margin:24px 0;">
<a href="${search_url || "https://hizivo.com/flights"}" style="background:${brandColor};color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">Book Now</a>
</div>`
      );
    }

    case "order-receipt": {
      const { order_id, items, order_total, order_currency, delivery_address } = data as Record<string, unknown>;
      const itemsList = Array.isArray(items)
        ? (items as Array<{ name: string; qty: number; price: string }>)
            .map((i) => `<tr><td style="padding:8px 0;color:${textColor};font-size:14px;">${i.name} × ${i.qty}</td><td style="padding:8px 0;text-align:right;color:${textColor};font-size:14px;">${i.price}</td></tr>`)
            .join("")
        : "";
      return wrapper(
        `Order Receipt — #${(order_id as string)?.slice(0, 8) || ""}`,
        `<h1 style="color:${textColor};font-size:22px;margin:0 0 16px;">Order confirmed 🛍️</h1>
<p style="color:${textColor};font-size:15px;">Your order is on its way${delivery_address ? ` to <strong>${delivery_address}</strong>` : ""}.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-top:1px solid #e5e7eb;">
${itemsList}
<tr style="border-top:2px solid #e5e7eb;"><td style="padding:12px 0;font-weight:700;color:${textColor};">Total</td><td style="padding:12px 0;text-align:right;font-weight:700;color:${textColor};font-size:16px;">${(order_currency as string) || "$"}${order_total as string}</td></tr>
</table>`
      );
    }

    case "welcome": {
      const { name } = data as Record<string, string>;
      return wrapper(
        "Welcome to ZIVO!",
        `<h1 style="color:${textColor};font-size:22px;margin:0 0 16px;">Welcome aboard, ${name || "traveler"}! 🌍</h1>
<p style="color:${textColor};font-size:15px;line-height:1.6;">We're glad you joined ZIVO — your one app for flights, hotels, cars, rides, and more.</p>
<div style="text-align:center;margin:28px 0;">
<a href="https://hizivo.com/flights" style="background:${brandColor};color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">Start Exploring</a>
</div>
<p style="color:${mutedColor};font-size:14px;">Questions? Our <a href="https://hizivo.com/help" style="color:${brandColor};text-decoration:none;">Help Center</a> is always here.</p>`
      );
    }

    default:
      return wrapper(
        "ZIVO Notification",
        `<p style="color:${textColor};font-size:15px;">${(data.message as string) || "You have a new notification from ZIVO."}</p>`
      );
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Verify caller is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { to, template, data: templateData } = (await req.json()) as EmailRequest;

    if (!to || !template) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, template" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { subject, html } = renderTemplate(template, templateData || {});

    // Log the email send attempt
    const messageId = crypto.randomUUID();
    await supabase.from("analytics_events").insert({
      event_name: "transactional_email_sent",
      session_id: messageId,
      page: template,
      user_id: user.id,
      meta: { to, template, subject },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message_id: messageId,
        subject,
        template,
        recipient: to,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
