/**
 * Send OTP SMS Edge Function
 * Sends a 6-digit verification code via Twilio
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SendOTPRequest {
  phone_e164: string;
  user_id: string;
}

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_FROM_NUMBER = Deno.env.get("TWILIO_FROM_NUMBER");

async function sendSMS(to: string, body: string): Promise<{ success: boolean; sid?: string; error?: string }> {
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
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: to,
          From: TWILIO_FROM_NUMBER,
          Body: body,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || "SMS send failed" };
    }

    return { success: true, sid: data.sid };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { phone_e164, user_id }: SendOTPRequest = await req.json();

    // Validate inputs
    if (!phone_e164) {
      return new Response(
        JSON.stringify({ success: false, error: "Phone number is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!user_id) {
      return new Response(
        JSON.stringify({ success: false, error: "User ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate E.164 format
    if (!/^\+[1-9]\d{6,14}$/.test(phone_e164)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid phone number format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Rate limit: max 5 OTP requests per phone per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentCount } = await supabase
      .from("sms_otp_codes")
      .select("*", { count: "exact", head: true })
      .eq("phone_e164", phone_e164)
      .gte("created_at", oneHourAgo);

    if (recentCount && recentCount >= 5) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Too many verification attempts. Please try again in an hour.",
          code: "RATE_LIMITED",
        }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Invalidate previous codes for this phone/user
    await supabase
      .from("sms_otp_codes")
      .update({ verified_at: new Date().toISOString() })
      .eq("phone_e164", phone_e164)
      .eq("user_id", user_id)
      .is("verified_at", null);

    // Generate new OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    const { error: insertError } = await supabase.from("sms_otp_codes").insert({
      user_id,
      phone_e164,
      code,
      expires_at: expiresAt.toISOString(),
    });

    if (insertError) {
      console.error("Failed to store OTP:", insertError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to create verification code" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send SMS via Twilio
    const smsBody = `Your ZIVO verification code is ${code}. Expires in 10 minutes. Reply STOP to opt out.`;
    const smsResult = await sendSMS(phone_e164, smsBody);

    // Log to notification_audit
    const maskedPhone = "***-***-" + phone_e164.slice(-4);
    await supabase.from("notification_audit").insert({
      user_id,
      channel: "sms",
      event_type: "otp",
      destination_masked: maskedPhone,
      provider_id: smsResult.sid || null,
      status: smsResult.success ? "sent" : "failed",
      error: smsResult.error || null,
    });

    if (!smsResult.success) {
      console.error("SMS send failed:", smsResult.error);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to send verification code" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`OTP sent to ${maskedPhone} for user ${user_id}, SMS SID: ${smsResult.sid}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Verification code sent",
        expires_in: 600, // 10 minutes in seconds
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in send-otp-sms:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
