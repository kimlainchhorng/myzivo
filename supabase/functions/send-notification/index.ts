/**
 * Send Notification Edge Function
 * Handles email, in-app, and SMS notifications
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize Resend manually with fetch
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendEmail(to: string, subject: string, html: string, text: string) {
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
    throw new Error(error.message || "Failed to send email");
  }
  
  return response.json();
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};


interface NotificationRequest {
  user_id?: string;
  user_email?: string;
  order_id?: string;
  template: string;
  channel?: "email" | "in_app" | "sms";
  variables?: Record<string, string>;
  title?: string;
  body?: string;
  action_url?: string;
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
    .header img { height: 40px; }
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

// Replace template variables
function replaceVariables(text: string, variables: Record<string, string>): string {
  let result = text;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
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
      action_url
    } = request;

    // Validate required fields
    if (!template && (!customTitle || !customBody)) {
      throw new Error("Either template or custom title/body is required");
    }

    if (!user_id && !user_email) {
      throw new Error("Either user_id or user_email is required");
    }

    // Get user email if only user_id provided
    let recipientEmail = user_email;
    if (!recipientEmail && user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("user_id", user_id)
        .single();
      
      if (!profile?.email) {
        throw new Error("User email not found");
      }
      recipientEmail = profile.email;
    }

    // Check user preferences (except for transactional)
    let templateData: any = null;
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
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user_id)
        .single();

      if (prefs) {
        if (channel === 'email' && !prefs.email_enabled) {
          return new Response(
            JSON.stringify({ success: true, skipped: true, reason: "Email disabled by user" }),
            { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
        if (templateData.category === 'marketing' && !prefs.marketing_enabled) {
          return new Response(
            JSON.stringify({ success: true, skipped: true, reason: "Marketing disabled by user" }),
            { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      }
    }

    // Build notification content
    const title = customTitle || replaceVariables(templateData.subject, variables);
    const bodyHtml = customBody || replaceVariables(templateData.body_html, variables);
    const bodyText = replaceVariables(templateData?.body_text || bodyHtml.replace(/<[^>]*>/g, ''), variables);

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

    let providerMessageId: string | null = null;
    let error: string | null = null;

    // Send based on channel
    if (channel === 'email' && recipientEmail) {
      try {
        const supportUrl = `https://hizivo.com/support${order_id ? `?order=${order_id}` : ''}`;
        const emailHtml = wrapEmailHtml(bodyHtml, supportUrl);

        const emailResponse = await sendEmail(recipientEmail, title, emailHtml, bodyText);
        providerMessageId = emailResponse.id || null;
      } catch (emailError: any) {
        error = emailError.message;
        console.error("Email send error:", emailError);
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

    // For in-app, the notification is already created and visible
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

  } catch (error: any) {
    console.error("Notification error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
