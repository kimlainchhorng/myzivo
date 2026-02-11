/**
 * Process Order Notifications Edge Function
 * Processes queued SMS/email notifications in batches
 */
import { serve, createClient } from "../_shared/deps.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Initialize providers
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_FROM_NUMBER = Deno.env.get("TWILIO_FROM_NUMBER");

const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://hizovo.com";

async function sendEmail(to: string, subject: string, body: string, actionUrl?: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!RESEND_API_KEY) {
    return { success: false, error: "Resend API key not configured" };
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #0066FF 0%, #00D4AA 100%); padding: 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
    .content { padding: 32px; }
    .content h2 { color: #0066FF; font-size: 20px; margin-top: 0; }
    .button { display: inline-block; background: #0066FF; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0; }
    .footer { background: #f8f9fa; padding: 24px 32px; text-align: center; font-size: 12px; color: #666666; }
    .footer a { color: #0066FF; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ZIVO</h1>
    </div>
    <div class="content">
      <h2>${subject}</h2>
      <p>${body}</p>
      ${actionUrl ? `<a href="${APP_BASE_URL}${actionUrl}" class="button">Track Your Order</a>` : ''}
    </div>
    <div class="footer">
      <p>Need help? <a href="${APP_BASE_URL}/help">Contact Support</a></p>
      <p style="margin-top: 16px;">
        <a href="${APP_BASE_URL}/terms">Terms</a> · 
        <a href="${APP_BASE_URL}/privacy">Privacy</a>
      </p>
      <p style="margin-top: 16px; color: #999999;">
        © ${new Date().getFullYear()} ZIVO. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "ZIVO <noreply@hizivo.com>",
        to: [to],
        subject,
        html,
        text: body
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "Failed to send email" };
    }

    const result = await response.json();
    return { success: true, messageId: result.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function sendSms(to: string, body: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    return { success: false, error: "Twilio not configured" };
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          To: to,
          From: TWILIO_FROM_NUMBER,
          Body: body
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "SMS send failed" };
    }

    const result = await response.json();
    return { success: true, messageId: result.sid };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body for optional filters
    let limit = 20;
    let channel: string | null = null;
    
    try {
      const body = await req.json();
      if (body.limit) limit = Math.min(body.limit, 50);
      if (body.channel) channel = body.channel;
    } catch {
      // No body, use defaults
    }

    // Fetch queued notifications
    let query = supabase
      .from("notifications")
      .select("*")
      .eq("status", "queued")
      .in("channel", ["sms", "email"])
      .order("created_at", { ascending: true })
      .limit(limit);

    if (channel) {
      query = query.eq("channel", channel);
    }

    const { data: notifications, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Failed to fetch notifications: ${fetchError.message}`);
    }

    if (!notifications || notifications.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: "No queued notifications" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[]
    };

    for (const notification of notifications) {
      results.processed++;

      const toValue = notification.to_value;
      if (!toValue) {
        results.skipped++;
        await supabase
          .from("notifications")
          .update({ status: "failed", error_message: "No recipient address" })
          .eq("id", notification.id);
        continue;
      }

      let sendResult: { success: boolean; messageId?: string; error?: string };

      if (notification.channel === "sms") {
        sendResult = await sendSms(toValue, notification.body);
      } else if (notification.channel === "email") {
        sendResult = await sendEmail(
          toValue,
          notification.title,
          notification.body,
          notification.action_url
        );
      } else {
        results.skipped++;
        continue;
      }

      if (sendResult.success) {
        results.sent++;
        await supabase
          .from("notifications")
          .update({
            status: "sent",
            provider_message_id: sendResult.messageId,
            sent_at: new Date().toISOString()
          })
          .eq("id", notification.id);
      } else {
        results.failed++;
        results.errors.push(`${notification.id}: ${sendResult.error}`);
        await supabase
          .from("notifications")
          .update({
            status: "failed",
            error_message: sendResult.error
          })
          .eq("id", notification.id);
      }
    }

    console.log("Process notifications result:", results);

    return new Response(
      JSON.stringify({ success: true, ...results }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Process notifications error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
