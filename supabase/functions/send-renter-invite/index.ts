/**
 * Send Renter Invite Email
 * Sends an invitation email to a user from the beta waitlist
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { inviteId } = await req.json();
    
    if (!inviteId) {
      throw new Error("inviteId is required");
    }

    // Fetch invite details with waitlist info
    const { data: invite, error: fetchError } = await supabase
      .from("p2p_renter_invites")
      .select("*, p2p_renter_waitlist(full_name, city)")
      .eq("id", inviteId)
      .single();

    if (fetchError || !invite) {
      throw new Error("Invite not found");
    }

    // Get beta city for personalization
    const { data: citySetting } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "p2p_renter_beta_city")
      .single();

    const betaCity = citySetting?.value?.replace(/"/g, "") || "your city";
    const firstName = invite.p2p_renter_waitlist?.full_name?.split(" ")[0] || "there";
    const userCity = invite.p2p_renter_waitlist?.city || betaCity;
    
    // Build the invite link
    const baseUrl = "https://hizivo.com";
    const inviteLink = `${baseUrl}/verify/driver?invite=${invite.invite_code}`;

    // Send email via Resend
    if (!RESEND_API_KEY) {
      console.log("RESEND_API_KEY not set, skipping email send");
      console.log("Would send to:", invite.email);
      console.log("Invite link:", inviteLink);
      return new Response(
        JSON.stringify({ success: true, message: "Email skipped (no API key)" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited to ZIVO Car Rentals</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td>
        <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Logo -->
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 28px; font-weight: bold; color: #0ea5e9; margin: 0;">ZIVO</h1>
          </div>

          <!-- Content -->
          <h2 style="font-size: 24px; font-weight: 600; color: #111827; margin: 0 0 16px;">
            You're Invited! 🎉
          </h2>
          
          <p style="color: #4b5563; margin: 0 0 16px;">
            Hi ${firstName},
          </p>
          
          <p style="color: #4b5563; margin: 0 0 16px;">
            You've been selected to join the ZIVO car rental beta in ${userCity}. Book cars directly from local owners with insurance included.
          </p>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${inviteLink}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Get Started
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin: 0 0 16px;">
            <strong>Your invite code:</strong> <code style="background: #f3f4f6; padding: 2px 8px; border-radius: 4px;">${invite.invite_code}</code>
          </p>

          ${invite.expires_at ? `
          <p style="color: #9ca3af; font-size: 13px; margin: 0;">
            This invite expires on ${new Date(invite.expires_at).toLocaleDateString()}.
          </p>
          ` : ''}

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

          <p style="color: #9ca3af; font-size: 13px; margin: 0; text-align: center;">
            Questions? Reply to this email or visit our <a href="https://hizivo.com/help" style="color: #0ea5e9;">Help Center</a>.
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 24px; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0;">ZIVO Inc. • Los Angeles, CA</p>
          <p style="margin: 8px 0 0;">
            <a href="https://hizivo.com/privacy" style="color: #9ca3af;">Privacy</a> • 
            <a href="https://hizivo.com/terms" style="color: #9ca3af;">Terms</a>
          </p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ZIVO <noreply@hizivo.com>",
        to: invite.email,
        subject: "You're invited to try ZIVO Car Rentals 🚗",
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend error:", errorText);
      throw new Error("Failed to send email");
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
