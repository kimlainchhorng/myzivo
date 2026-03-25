/**
 * Verify OTP SMS Edge Function
 * Uses Twilio Verify API to check the verification code
 */

import { serve, createClient } from "../_shared/deps.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

interface VerifyOTPRequest {
  phone_e164: string;
  code: string;
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

    const { phone_e164, code, user_id }: VerifyOTPRequest = await req.json();

    if (!phone_e164 || !code || !user_id) {
      return new Response(
        JSON.stringify({ success: false, error: "Phone, code, and user_id are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!/^\d{6}$/.test(code)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid code format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify code via Twilio Verify API
    const checkResponse = await fetch(
      `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}/VerificationCheck`,
      {
        method: "POST",
        headers: {
          "Authorization": "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: phone_e164,
          Code: code,
        }),
      }
    );

    const checkData = await checkResponse.json();

    if (!checkResponse.ok) {
      console.error("Twilio Verify check error:", checkData);

      // Twilio returns 404 when no pending verification exists
      if (checkResponse.status === 404) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "No valid verification code found. Please request a new code.",
            code: "NO_VALID_CODE",
          }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Twilio returns 429 for too many attempts
      if (checkResponse.status === 429) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Too many failed attempts. Please request a new code.",
            code: "MAX_ATTEMPTS",
          }),
          { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ success: false, error: checkData.message || "Verification failed" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check verification status
    if (checkData.status !== "approved") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Incorrect code. Please try again.",
          code: "INVALID_CODE",
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Code is valid! Update notification_preferences
    const { error: prefsError } = await supabase
      .from("notification_preferences")
      .update({
        phone_number: phone_e164,
        phone_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user_id);

    if (prefsError) {
      await supabase.from("notification_preferences").upsert({
        user_id,
        phone_number: phone_e164,
        phone_verified: true,
        email_enabled: true,
        sms_enabled: true,
        in_app_enabled: true,
      });
    }

    // Update profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        phone_e164,
        phone_verified: true,
        phone_verified_at: new Date().toISOString(),
        sms_consent: true,
      })
      .eq("user_id", user_id);

    if (profileError) {
      console.error("Failed to update profile:", profileError);
    } else {
      console.log("Phone verified for user:", user_id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Phone number verified successfully",
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in verify-otp-sms:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
