import { createClient } from "../_shared/deps.ts";

// Security: Restrict CORS to known origins only
const allowedOrigins = new Set([
  "https://myzivo.lovable.app",
  "https://hizivo.com",
  "https://zivorestaurant.lovable.app",
  "https://zivodriver.lovable.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
]);

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
  };
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Security: Reject requests from unknown origins
  const origin = req.headers.get("origin") || "";
  if (origin && !allowedOrigins.has(origin)) {
    return new Response(
      JSON.stringify({ error: "Forbidden origin" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find and validate the token
    const { data: tokenData, error: fetchError } = await serviceClient
      .from("cross_app_tokens")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (fetchError || !tokenData) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark token as used
    await serviceClient
      .from("cross_app_tokens")
      .update({ used: true })
      .eq("id", tokenData.id);

    // Generate a magic link for the user
    const { data: linkData, error: linkError } = await serviceClient.auth.admin.generateLink({
      type: "magiclink",
      email: tokenData.user_id, // We need to get email from user
    });

    // Alternative: Get user and create session directly
    const { data: userData, error: userError } = await serviceClient.auth.admin.getUserById(
      tokenData.user_id
    );

    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate a magic link for seamless login
    const { data: magicLinkData, error: magicLinkError } = await serviceClient.auth.admin.generateLink({
      type: "magiclink",
      email: userData.user.email!,
      options: {
        redirectTo: `https://${tokenData.target_app}`,
      },
    });

    if (magicLinkError) {
      console.error("Magic link error:", magicLinkError);
      return new Response(
        JSON.stringify({ error: "Failed to generate session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract the token from the magic link
    const magicLinkUrl = new URL(magicLinkData.properties.action_link);
    const accessToken = magicLinkUrl.hash.replace("#access_token=", "").split("&")[0];

    return new Response(
      JSON.stringify({ 
        redirect_url: magicLinkData.properties.action_link,
        email: userData.user.email,
        user_id: userData.user.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
