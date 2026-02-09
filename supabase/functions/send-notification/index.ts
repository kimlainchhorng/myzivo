/**
 * Send Notification Edge Function
 * Multi-channel notification system with push → SMS → email fallback
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize providers
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_FROM_NUMBER = Deno.env.get("TWILIO_FROM_NUMBER");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotificationRequest {
  user_id?: string;
  user_email?: string;
  order_id?: string;
  template?: string;
  channel?: "email" | "in_app" | "sms" | "multi"; // multi = smart fallback
  variables?: Record<string, string>;
  title?: string;
  body?: string;
  action_url?: string;
  priority?: "critical" | "normal" | "low";
  event_type?: string;
}

async function sendEmail(to: string, subject: string, html: string, text: string): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "ZIVO Travel <noreply@hizivo.com>",
        to: [to],
        subject,
        html,
        text
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "Failed to send email" };
    }
    
    const data = await response.json();
    return { success: true, id: data.id };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Email send error";
    return { success: false, error: msg };
  }
}

async function sendSms(to: string, body: string): Promise<{ success: boolean; sid?: string; error?: string }> {
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
          Body: body,
          StatusCallback: `${Deno.env.get("SUPABASE_URL")}/functions/v1/twilio-sms-status`
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.message || "SMS send failed" };
    }

    return { success: true, sid: data.sid };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "SMS error";
    return { success: false, error: msg };
  }
}

async function sendPush(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  title: string,
  body: string,
  actionUrl?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Call the existing push notification function
    const response = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-push-notification`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: userId,
          title,
          body,
          url: actionUrl
        })
      }
    );

    const data = await response.json();
    return { success: data.success, error: data.error };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Push error";
    return { success: false, error: msg };
  }
}

// Email wrapper with ZIVO branding
function wrapEmailHtml(content: string, supportUrl: string): string {
  return `
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
    .content h1 { color: #0066FF; font-size: 24px; margin-top: 0; }
    .content a { color: #0066FF; }
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
      ${content}
    </div>
    <div class="footer">
      <p>Need help? <a href="${supportUrl}">Contact Support</a></p>
      <p style="margin-top: 16px;">
        <a href="https://hizivo.com/terms">Terms</a> · 
        <a href="https://hizivo.com/privacy">Privacy</a> · 
        <a href="https://hizivo.com/partner-disclosure">Partner Disclosure</a>
      </p>
      <p style="margin-top: 16px; color: #999999;">
        © ${new Date().getFullYear()} ZIVO Travel. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`;
}

function replaceVariables(text: string, variables: Record<string, string>): string {
  let result = text;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
}

async function checkSMSRateLimit(supabase: ReturnType<typeof createClient>, userId: string): Promise<boolean> {
  const { data } = await supabase.rpc("check_sms_rate_limit", { p_user_id: userId });
  return data === true;
}

async function incrementSMSCount(supabase: ReturnType<typeof createClient>, userId: string): Promise<void> {
  const today = new Date().toISOString().split("T")[0];
  await supabase.rpc("increment_sms_count", { p_user_id: userId, p_date: today });
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const request: NotificationRequest = await req.json();
    const { 
      user_id, 
      user_email, 
      order_id, 
      template, 
      channel = "email", 
      variables = {},
      title: customTitle,
      body: customBody,
      action_url,
      priority = "normal",
      event_type
    } = request;

    // Validate required fields
    if (!template && (!customTitle || !customBody)) {
      throw new Error("Either template or custom title/body is required");
    }

    if (!user_id && !user_email) {
      throw new Error("Either user_id or user_email is required");
    }

    // Get user profile
    let profile: { email: string; phone_e164: string | null; sms_opted_out: boolean } | null = null;
    if (user_id) {
      const { data } = await supabase
        .from("profiles")
        .select("email, phone_e164, sms_opted_out")
        .eq("user_id", user_id)
        .single();
      profile = data;
    }

    const recipientEmail = user_email || profile?.email;
    if (!recipientEmail) {
      throw new Error("User email not found");
    }

    // Get user notification preferences
    let prefs = { email_enabled: true, sms_enabled: false, in_app_enabled: true, phone_verified: false };
    if (user_id) {
      const { data: prefsData } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user_id)
        .single();
      if (prefsData) prefs = prefsData;
    }

    // Get template if provided
    let templateData: { subject: string; body_html: string; body_text: string; category: string } | null = null;
    if (template) {
      const { data: tpl } = await supabase
        .from("notification_templates")
        .select("*")
        .eq("template_key", template)
        .eq("is_active", true)
        .single();
      
      if (!tpl) {
        throw new Error(`Template '${template}' not found or inactive`);
      }
      templateData = tpl;
    }

    // Check preferences for non-transactional
    if (templateData && templateData.category !== 'transactional' && user_id) {
      if (channel === 'email' && !prefs.email_enabled) {
        return new Response(
          JSON.stringify({ success: true, skipped: true, reason: "Email disabled by user" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Build notification content
    const title = customTitle || replaceVariables(templateData?.subject || "", variables);
    const bodyHtml = customBody || replaceVariables(templateData?.body_html || "", variables);
    const bodyText = replaceVariables(templateData?.body_text || bodyHtml.replace(/<[^>]*>/g, ''), variables);

    const results: { channel: string; success: boolean; id?: string; error?: string }[] = [];

    // Multi-channel logic for critical events
    if (channel === "multi" || priority === "critical") {
      const isCriticalEvent = priority === "critical" || 
        ["out_for_delivery", "delivered", "cancelled", "support_reply", "refund"].includes(event_type || "");

      // 1. Try push first
      let pushSuccess = false;
      if (prefs.in_app_enabled && user_id) {
        const pushResult = await sendPush(supabase, user_id, title, bodyText, action_url);
        pushSuccess = pushResult.success;
        results.push({ channel: "push", ...pushResult });

        // Log push notification
        await supabase.from("notifications").insert({
          user_id,
          order_id,
          channel: "in_app",
          category: templateData?.category || "transactional",
          template: template || "custom",
          title,
          body: bodyText,
          action_url,
          status: pushResult.success ? "sent" : "failed",
          error_message: pushResult.error,
          sent_at: pushResult.success ? new Date().toISOString() : null
        });
      }

      // 2. Fallback to SMS if push failed AND event is critical
      if (!pushSuccess && isCriticalEvent && prefs.sms_enabled && prefs.phone_verified && user_id) {
        const phone = profile?.phone_e164;
        const optedOut = profile?.sms_opted_out;

        if (phone && !optedOut) {
          const withinLimit = await checkSMSRateLimit(supabase, user_id);
          if (withinLimit) {
            const smsResult = await sendSms(phone, bodyText);
            results.push({ channel: "sms", ...smsResult });

            if (smsResult.success) {
              await incrementSMSCount(supabase, user_id);
            }

            // Log SMS
            await supabase.from("notifications").insert({
              user_id,
              order_id,
              channel: "sms",
              category: templateData?.category || "transactional",
              template: template || "custom",
              title,
              body: bodyText,
              action_url,
              status: smsResult.success ? "queued" : "failed",
              provider_message_id: smsResult.sid,
              error_message: smsResult.error
            });
          } else {
            results.push({ channel: "sms", success: false, error: "Rate limited" });
          }
        }
      }

      // 3. Send email for receipts, refunds, support updates
      const emailEvents = ["order_confirmed", "delivered", "cancelled", "support_reply", "refund", "receipt"];
      if (prefs.email_enabled && (emailEvents.includes(event_type || "") || priority === "critical")) {
        const supportUrl = `https://hizivo.com/support${order_id ? `?order=${order_id}` : ''}`;
        const emailHtml = wrapEmailHtml(bodyHtml, supportUrl);
        
        const emailResult = await sendEmail(recipientEmail, title, emailHtml, bodyText);
        results.push({ channel: "email", ...emailResult });

        // Log email
        await supabase.from("notifications").insert({
          user_id,
          order_id,
          channel: "email",
          category: templateData?.category || "transactional",
          template: template || "custom",
          title,
          body: bodyText,
          action_url,
          status: emailResult.success ? "sent" : "failed",
          provider_message_id: emailResult.id,
          error_message: emailResult.error,
          sent_at: emailResult.success ? new Date().toISOString() : null
        });
      }

      return new Response(
        JSON.stringify({
          success: results.some(r => r.success),
          results
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Single channel mode (backwards compatible)
    let providerMessageId: string | null = null;
    let error: string | null = null;

    // Create notification record
    const { data: notification, error: insertError } = await supabase
      .from("notifications")
      .insert({
        user_id,
        order_id,
        channel,
        category: templateData?.category || 'transactional',
        template: template || 'custom',
        title,
        body: bodyText,
        action_url,
        status: 'queued',
        metadata: { variables }
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create notification: ${insertError.message}`);
    }

    // Send based on channel
    if (channel === 'email' && recipientEmail) {
      const supportUrl = `https://hizivo.com/support${order_id ? `?order=${order_id}` : ''}`;
      const emailHtml = wrapEmailHtml(bodyHtml, supportUrl);
      const emailResult = await sendEmail(recipientEmail, title, emailHtml, bodyText);
      
      if (emailResult.success) {
        providerMessageId = emailResult.id || null;
      } else {
        error = emailResult.error || null;
      }
    }

    if (channel === 'sms' && user_id) {
      const phone = profile?.phone_e164;
      if (phone && prefs.phone_verified) {
        const smsResult = await sendSms(phone, bodyText);
        if (smsResult.success) {
          providerMessageId = smsResult.sid || null;
          await incrementSMSCount(supabase, user_id);
        } else {
          error = smsResult.error || null;
        }
      } else {
        error = "Phone not verified or not available";
      }
    }

    // Update notification status
    await supabase
      .from("notifications")
      .update({
        status: error ? 'failed' : 'sent',
        provider_message_id: providerMessageId,
        error_message: error,
        sent_at: error ? null : new Date().toISOString()
      })
      .eq("id", notification.id);

    // For in-app, mark as sent
    if (channel === 'in_app') {
      await supabase
        .from("notifications")
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq("id", notification.id);
    }

    return new Response(
      JSON.stringify({
        success: !error,
        notification_id: notification.id,
        provider_message_id: providerMessageId,
        error
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    console.error("Notification error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
