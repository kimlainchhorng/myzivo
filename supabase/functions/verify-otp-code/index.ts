import { serve, createClient } from "../_shared/deps.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

interface VerifyOTPRequest {
  email: string;
  code: string;
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code }: VerifyOTPRequest = await req.json();

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: "Email and code are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const normalizedEmail = email.toLowerCase();

    const resolveUserId = async () => {
      const { data: profileMatch, error: profileLookupError } = await supabase
        .from("profiles")
        .select("user_id, id")
        .eq("email", normalizedEmail)
        .limit(1)
        .maybeSingle();

      if (profileLookupError) {
        console.error("Failed to look up profile for OTP verification:", profileLookupError);
      }

      const profileUserId = profileMatch?.user_id ?? profileMatch?.id;
      if (profileUserId) {
        return profileUserId;
      }

      const { data: userList, error: usersError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

      if (usersError) {
        console.error("Failed to look up auth user for OTP verification:", usersError);
        return null;
      }

      return userList.users.find((user) => user.email?.toLowerCase() === normalizedEmail)?.id ?? null;
    };

    // Find the most recent valid OTP for this email
    const { data: otpRecord, error: fetchError } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("email", normalizedEmail)
      .is("verified_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !otpRecord) {
      return new Response(
        JSON.stringify({ 
          error: "No valid verification code found. Please request a new code.",
          code: "NO_VALID_CODE"
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Brute force protection: Check attempts
    if (otpRecord.attempts >= 5) {
      // Invalidate this code
      await supabase
        .from("otp_codes")
        .update({ verified_at: new Date().toISOString() })
        .eq("id", otpRecord.id);

      return new Response(
        JSON.stringify({ 
          error: "Too many failed attempts. Please request a new code.",
          code: "MAX_ATTEMPTS"
        }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if code matches
    if (otpRecord.code !== code) {
      // Increment attempts
      await supabase
        .from("otp_codes")
        .update({ attempts: otpRecord.attempts + 1 })
        .eq("id", otpRecord.id);

      const remainingAttempts = 5 - (otpRecord.attempts + 1);
      
      return new Response(
        JSON.stringify({ 
          error: `Incorrect code. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`,
          code: "INVALID_CODE",
          remainingAttempts
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Code is valid! Mark as verified
    await supabase
      .from("otp_codes")
      .update({ verified_at: new Date().toISOString() })
      .eq("id", otpRecord.id);

    const resolvedUserId = otpRecord.user_id ?? await resolveUserId();

    if (resolvedUserId && !otpRecord.user_id) {
      const { error: otpUpdateError } = await supabase
        .from("otp_codes")
        .update({ user_id: resolvedUserId })
        .eq("id", otpRecord.id);

      if (otpUpdateError) {
        console.error("Failed to backfill OTP user_id:", otpUpdateError);
      }
    }

    // If we have a user_id, update their email confirmation status
    if (resolvedUserId) {
      // Update auth.users email_confirmed_at
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        resolvedUserId,
        { email_confirm: true }
      );

      if (updateError) {
        console.error("Failed to confirm email in auth:", updateError);
      } else {
        console.log("Email confirmed in auth for user:", resolvedUserId);
      }

      // Also update profiles.email_verified flag
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ email_verified: true })
        .or(`user_id.eq.${resolvedUserId},id.eq.${resolvedUserId}`);

      if (profileError) {
        console.error("Failed to update profile email_verified:", profileError);
      } else {
        console.log("Profile email_verified updated for user:", resolvedUserId);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email verified successfully",
        userId: resolvedUserId
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in verify-otp-code function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
