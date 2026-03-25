/**
 * Send OTP SMS Edge Function
 * Uses Twilio Verify API to send a verification code
 */

import { serve, createClient } from "../_shared/deps.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

interface SendOTPRequest {
  phone_e164: string;
  user_id: string;
}

serve(async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_VERIFY_SERVICE_SID = Deno.env.get("TWILIO_VERIFY_SERVICE_SID");

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
      return new Response(
        JSON.stringify({ success: false, error: "Twilio Verify not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { phone_e164, user_id }: SendOTPRequest = await req.json();

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

    // Rate limit: max 5 OTP requests per phone per hour (app-level)
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

    // Send verification via Twilio Verify API
    const verifyResponse = await fetch(
      `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}/Verifications`,
      {
        method: "POST",
        headers: {
          "Authorization": "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: phone_e164,
          Channel: "sms",
        }),
      }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok) {
      console.error("Twilio Verify error:", verifyData);
      return new Response(
        JSON.stringify({ success: false, error: verifyData.message || "Failed to send verification code" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Log to sms_otp_codes for rate limiting tracking
    await supabase.from("sms_otp_codes").insert({
      user_id,
      phone_e164,
      code: "VERIFY_API", // Twilio manages the actual code
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

    // Log to notification_audit
    const maskedPhone = "***-***-" + phone_e164.slice(-4);
    await supabase.from("notification_audit").insert({
      user_id,
      channel: "sms",
      event_type: "otp",
      destination_masked: maskedPhone,
      provider_id: verifyData.sid || null,
      status: "sent",
      error: null,
    });

    console.log(`Twilio Verify sent to ${maskedPhone} for user ${user_id}, SID: ${verifyData.sid}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Verification code sent",
        expires_in: 600,
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
