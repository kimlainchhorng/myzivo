/**
 * Register Push Token Edge Function
 * Saves native iOS (APNs) and Android (FCM) push tokens for authenticated users
 * Called by the Capacitor push notification plugin after registration
 */

import { serve, createClient } from "../_shared/deps.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface TokenRequest {
  token: string;
  platform: "ios" | "android" | "web";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const jwt = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { token, platform }: TokenRequest = await req.json();

    if (!token || !platform) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: token, platform" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Upsert device token — one token per device, update if it already exists
    const { data, error } = await supabase
      .from("device_tokens")
      .upsert(
        {
          user_id: user.id,
          token,
          platform,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "token",
          ignoreDuplicates: false,
        }
      )
      .select("id")
      .single();

    if (error) {
      console.error("[register-push-token] DB error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to save token", details: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Deactivate old tokens for this user on the same platform (keep only latest)
    if (data?.id) {
      await supabase
        .from("device_tokens")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .eq("platform", platform)
        .neq("id", data.id);
    }

    console.log(`[register-push-token] Registered ${platform} token for user ${user.id}`);

    return new Response(
      JSON.stringify({ success: true, token_id: data?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[register-push-token] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
