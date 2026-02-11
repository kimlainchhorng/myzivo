/**
 * Verify OTP SMS Edge Function
 * Verifies a 6-digit code and marks phone as verified
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

    const { phone_e164, code, user_id }: VerifyOTPRequest = await req.json();

    // Validate inputs
    if (!phone_e164 || !code || !user_id) {
      return new Response(
        JSON.stringify({ success: false, error: "Phone, code, and user_id are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate code format
    if (!/^\d{6}$/.test(code)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid code format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Find the most recent valid OTP for this phone/user
    const { data: otpRecord, error: fetchError } = await supabase
      .from("sms_otp_codes")
      .select("*")
      .eq("phone_e164", phone_e164)
      .eq("user_id", user_id)
      .is("verified_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !otpRecord) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No valid verification code found. Please request a new code.",
          code: "NO_VALID_CODE",
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Brute force protection: Check attempts
    if (otpRecord.attempts >= 5) {
      // Invalidate this code
      await supabase
        .from("sms_otp_codes")
        .update({ verified_at: new Date().toISOString() })
        .eq("id", otpRecord.id);

      return new Response(
        JSON.stringify({
          success: false,
          error: "Too many failed attempts. Please request a new code.",
          code: "MAX_ATTEMPTS",
        }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if code matches
    if (otpRecord.code !== code) {
      // Increment attempts
      await supabase
        .from("sms_otp_codes")
        .update({ attempts: otpRecord.attempts + 1 })
        .eq("id", otpRecord.id);

      const remainingAttempts = 5 - (otpRecord.attempts + 1);

      return new Response(
        JSON.stringify({
          success: false,
          error: `Incorrect code. ${remainingAttempts} attempt${remainingAttempts !== 1 ? "s" : ""} remaining.`,
          code: "INVALID_CODE",
          remainingAttempts,
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Code is valid! Mark as verified
    await supabase
      .from("sms_otp_codes")
      .update({ verified_at: new Date().toISOString() })
      .eq("id", otpRecord.id);

    // Update notification_preferences
    const { error: prefsError } = await supabase
      .from("notification_preferences")
      .update({
        phone_number: phone_e164,
        phone_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user_id);

    if (prefsError) {
      // Try to insert if not exists
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
